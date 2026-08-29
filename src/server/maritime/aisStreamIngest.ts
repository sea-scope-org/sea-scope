import WebSocket from 'ws';

import { aisVesselPositionPersist } from '../commands/aisVesselPositionPersist';
import type { ServerRuntime } from '../domain/ServerRuntime';
import type { EnvironmentVariables } from '../env/EnvironmentVariables';
import { aisStreamMessageParse } from './aisStreamMessageParse';
import { aisViewportRegistryActiveBoxes, aisViewportRegistryCount, aisViewportRegistryPrune } from './aisViewportRegistry';
import type { AisViewportBbox } from './aisViewportRegistry';
import {
    vesselTrackStoreCountBySource,
    vesselTrackStoreMarkPersisted,
    vesselTrackStoreUpsertIdentity,
    vesselTrackStoreUpsertPosition,
} from './vesselTrackStore';

const AISSTREAM_URL = 'wss://stream.aisstream.io/v0/stream';
const HISTORY_PERSIST_MIN_MS = 60_000;
const RECONNECT_BASE_MS = 1_000;
const RECONNECT_MAX_MS = 60_000;
const HEARTBEAT_MS = 15_000;
/** AISStream closes the connection if subscription updates exceed 1/s. */
const RESUBSCRIBE_MIN_INTERVAL_MS = 1_000;

let started = false;
let socket: WebSocket | null = null;
let reconnectAttempt = 0;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let resubscribeTimer: ReturnType<typeof setTimeout> | null = null;
let stopped = false;
let status: 'connected' | 'connecting' | 'disconnected' | 'disabled' | 'error' = 'disabled';
let firstPositionLogged = false;
let messagesReceived = 0;
let positionsAccepted = 0;
let messagesIgnored = 0;
let activeEnv: EnvironmentVariables | null = null;
let lastSubscribeAtMs = 0;
let pendingResubscribe = false;

export function aisStreamIngestStatus(): typeof status {
    return status;
}

/** Human-readable status for WatchState.dataSources (also logged on heartbeat). */
export function aisStreamIngestStatusDetail(): string {
    if (status === 'disabled') return 'disabled';
    if (status === 'connecting') return 'connecting';
    if (status === 'disconnected') return 'disconnected';
    if (status === 'error') return 'error';
    const vessels = vesselTrackStoreCountBySource('aisstream');
    const viewports = aisViewportRegistryCount();
    const viewportSuffix = viewports > 0 ? ` · ${viewports} viewport${viewports === 1 ? '' : 's'}` : '';
    if (positionsAccepted === 0) {
        return `connected · waiting for traffic (${messagesReceived} msgs)${viewportSuffix}`;
    }
    return `connected · ${vessels} vessels · ${positionsAccepted} fixes${viewportSuffix}`;
}

/** AISStream corner pairs: NW then SE. Env box first, then active viewports. */
export function aisStreamBoundingBoxesAssemble(
    envBbox: EnvironmentVariables['aisStreamBoundingBox'],
    viewports: ReadonlyArray<AisViewportBbox> = aisViewportRegistryActiveBoxes(),
): number[][][] {
    const toCorners = (bbox: AisViewportBbox): number[][] => [
        [bbox.northLat, bbox.westLon],
        [bbox.southLat, bbox.eastLon],
    ];
    return [toCorners(envBbox), ...viewports.map(toCorners)];
}

function subscriptionPayload(env: EnvironmentVariables): string {
    aisViewportRegistryPrune();
    return JSON.stringify({
        APIKey: env.aisStreamApiKey,
        BoundingBoxes: aisStreamBoundingBoxesAssemble(env.aisStreamBoundingBox),
        FilterMessageTypes: ['PositionReport', 'StandardClassBPositionReport', 'ExtendedClassBPositionReport', 'ShipStaticData'],
    });
}

function sendSubscription(env: EnvironmentVariables): void {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(subscriptionPayload(env));
    lastSubscribeAtMs = Date.now();
    const boxes = aisStreamBoundingBoxesAssemble(env.aisStreamBoundingBox);
    console.info(`[aisstream] subscription sent (${boxes.length} box${boxes.length === 1 ? '' : 'es'})`);
}

/**
 * Replace the AISStream subscription with env bbox + union of watch viewports.
 * Coalesces to ≤1 update/sec (AISStream hard limit).
 */
export function aisStreamIngestResubscribe(): void {
    if (!started || !activeEnv?.aisStreamApiKey) return;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    const now = Date.now();
    const elapsed = lastSubscribeAtMs === 0 ? RESUBSCRIBE_MIN_INTERVAL_MS : now - lastSubscribeAtMs;
    if (elapsed >= RESUBSCRIBE_MIN_INTERVAL_MS) {
        pendingResubscribe = false;
        if (resubscribeTimer) {
            clearTimeout(resubscribeTimer);
            resubscribeTimer = null;
        }
        sendSubscription(activeEnv);
        return;
    }

    pendingResubscribe = true;
    if (resubscribeTimer) return;
    resubscribeTimer = setTimeout(() => {
        resubscribeTimer = null;
        if (!pendingResubscribe || !activeEnv) return;
        pendingResubscribe = false;
        sendSubscription(activeEnv);
    }, RESUBSCRIBE_MIN_INTERVAL_MS - elapsed);
}

function clearHeartbeat(): void {
    if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
    }
}

function startHeartbeat(): void {
    clearHeartbeat();
    heartbeatTimer = setInterval(() => {
        const pruned = aisViewportRegistryPrune();
        if (pruned) aisStreamIngestResubscribe();
        console.info(
            `[aisstream] heartbeat status=${status} msgs=${messagesReceived} positions=${positionsAccepted} ignored=${messagesIgnored} vessels=${vesselTrackStoreCountBySource('aisstream')} viewports=${aisViewportRegistryCount()}`,
        );
    }, HEARTBEAT_MS);
}

function scheduleReconnect(serverRuntime: ServerRuntime, env: EnvironmentVariables): void {
    if (stopped || reconnectTimer) return;
    const delay = Math.min(RECONNECT_MAX_MS, RECONNECT_BASE_MS * 2 ** reconnectAttempt);
    reconnectAttempt += 1;
    reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connect(serverRuntime, env);
    }, delay);
    console.info(`[aisstream] reconnect in ${delay}ms`);
    serverRuntime.log.info(`AISStream reconnect scheduled in ${delay}ms`);
}

function connect(serverRuntime: ServerRuntime, env: EnvironmentVariables): void {
    if (stopped) return;
    const apiKey = env.aisStreamApiKey;
    if (!apiKey) return;

    status = 'connecting';
    console.info('[aisstream] connecting…');
    socket = new WebSocket(AISSTREAM_URL, { perMessageDeflate: true });

    socket.on('open', () => {
        reconnectAttempt = 0;
        sendSubscription(env);
        status = 'connected';
        const bbox = env.aisStreamBoundingBox;
        const viewports = aisViewportRegistryCount();
        const bboxMsg =
            `env ${bbox.southLat},${bbox.westLon} → ${bbox.northLat},${bbox.eastLon}` +
            (viewports > 0 ? ` + ${viewports} viewport(s)` : '');
        console.info(`[aisstream] WebSocket connected (${bboxMsg})`);
        console.info(
            '[aisstream] note: free AISStream is coastal terrestrial only — quiet bboxes (e.g. open Red Sea) may get zero traffic',
        );
        serverRuntime.log.info(`AISStream WebSocket connected (${bboxMsg})`);
        startHeartbeat();
    });

    socket.on('message', (data) => {
        void (async () => {
            try {
                const text = typeof data === 'string' ? data : Buffer.from(data as ArrayBuffer).toString('utf8');
                const json = JSON.parse(text) as { MessageType?: string };
                messagesReceived += 1;

                if (messagesReceived === 1) {
                    console.info(`[aisstream] first frame MessageType=${json.MessageType ?? 'unknown'}`);
                }

                if (json.MessageType === 'SubscriptionConfirmation') {
                    console.info('[aisstream] subscription confirmed');
                    serverRuntime.log.info('AISStream subscription confirmed');
                }

                const parsed = aisStreamMessageParse(json);
                if (parsed.kind === 'ignored') {
                    messagesIgnored += 1;
                    return;
                }

                if (parsed.kind === 'static') {
                    vesselTrackStoreUpsertIdentity('aisstream', parsed.identity);
                    return;
                }

                const live = vesselTrackStoreUpsertPosition('aisstream', parsed.identity, parsed.position);
                if (!live) return;

                positionsAccepted += 1;
                if (!firstPositionLogged) {
                    firstPositionLogged = true;
                    console.info(
                        `[aisstream] first position MMSI ${live.identity.mmsi} @ ${live.position.lat.toFixed(3)},${live.position.lon.toFixed(3)}`,
                    );
                    serverRuntime.log.info(`AISStream first position for MMSI ${live.identity.mmsi}`);
                }

                const now = Date.now();
                const persistHistory = now - live.lastPersistedAtMs >= HISTORY_PERSIST_MIN_MS;
                const ok = await aisVesselPositionPersist(serverRuntime, {
                    source: 'aisstream',
                    identity: live.identity,
                    position: live.position,
                    persistHistory,
                });
                if (ok && persistHistory) {
                    vesselTrackStoreMarkPersisted(live.identity.mmsi, now);
                }
            } catch (error) {
                status = 'error';
                console.error('[aisstream] message handler error', error);
                serverRuntime.log.error(error);
            }
        })();
    });

    socket.on('close', () => {
        socket = null;
        status = 'disconnected';
        clearHeartbeat();
        console.info('[aisstream] WebSocket closed');
        serverRuntime.log.info('AISStream WebSocket closed');
        scheduleReconnect(serverRuntime, env);
    });

    socket.on('error', (error) => {
        status = 'error';
        console.error('[aisstream] WebSocket error', error);
        serverRuntime.log.error(error);
    });
}

/** Start the process-global AISStream ingest when an API key is configured. Idempotent. */
export function aisStreamIngestEnsureStarted(serverRuntime: ServerRuntime, env: EnvironmentVariables): void {
    activeEnv = env;
    if (!env.aisStreamApiKey) {
        status = 'disabled';
        console.info('[aisstream] ingest skipped (AISSTREAM_API_KEY unset)');
        serverRuntime.log.info('AISStream ingest skipped (AISSTREAM_API_KEY unset)');
        return;
    }
    if (started) return;
    started = true;
    stopped = false;
    firstPositionLogged = false;
    messagesReceived = 0;
    positionsAccepted = 0;
    messagesIgnored = 0;
    connect(serverRuntime, env);
}

export function aisStreamIngestIsStarted(): boolean {
    return started;
}
