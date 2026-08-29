import WebSocket from 'ws';

import { aisVesselPositionPersist } from '../commands/aisVesselPositionPersist';
import type { ServerRuntime } from '../domain/ServerRuntime';
import type { EnvironmentVariables } from '../env/EnvironmentVariables';
import { aisStreamMessageParse } from './aisStreamMessageParse';
import { vesselTrackStoreMarkPersisted, vesselTrackStoreUpsertIdentity, vesselTrackStoreUpsertPosition } from './vesselTrackStore';

const AISSTREAM_URL = 'wss://stream.aisstream.io/v0/stream';
const HISTORY_PERSIST_MIN_MS = 60_000;
const RECONNECT_BASE_MS = 1_000;
const RECONNECT_MAX_MS = 60_000;

let started = false;
let socket: WebSocket | null = null;
let reconnectAttempt = 0;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let stopped = false;
let status: 'connected' | 'connecting' | 'disconnected' | 'disabled' | 'error' = 'disabled';
let firstPositionLogged = false;

export function aisStreamIngestStatus(): typeof status {
    return status;
}

function boundingBoxesFromEnv(bbox: EnvironmentVariables['aisStreamBoundingBox']): number[][][] {
    return [
        [
            [bbox.northLat, bbox.westLon],
            [bbox.southLat, bbox.eastLon],
        ],
    ];
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
        const subscription = {
            APIKey: apiKey,
            BoundingBoxes: boundingBoxesFromEnv(env.aisStreamBoundingBox),
            FilterMessageTypes: ['PositionReport', 'StandardClassBPositionReport', 'ExtendedClassBPositionReport', 'ShipStaticData'],
        };
        socket?.send(JSON.stringify(subscription));
        status = 'connected';
        const bboxMsg = `bbox ${env.aisStreamBoundingBox.southLat},${env.aisStreamBoundingBox.westLon} → ${env.aisStreamBoundingBox.northLat},${env.aisStreamBoundingBox.eastLon}`;
        console.info(`[aisstream] WebSocket connected (${bboxMsg})`);
        serverRuntime.log.info(`AISStream WebSocket connected (${bboxMsg})`);
    });

    socket.on('message', (data) => {
        void (async () => {
            try {
                const text = typeof data === 'string' ? data : Buffer.from(data as ArrayBuffer).toString('utf8');
                const json = JSON.parse(text) as { MessageType?: string };
                if (json.MessageType === 'SubscriptionConfirmation') {
                    console.info('[aisstream] subscription confirmed');
                    serverRuntime.log.info('AISStream subscription confirmed');
                }

                const parsed = aisStreamMessageParse(json);
                if (parsed.kind === 'ignored') return;

                if (parsed.kind === 'static') {
                    vesselTrackStoreUpsertIdentity('aisstream', parsed.identity);
                    return;
                }

                const live = vesselTrackStoreUpsertPosition('aisstream', parsed.identity, parsed.position);
                if (!live) return;

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
    connect(serverRuntime, env);
}

export function aisStreamIngestIsStarted(): boolean {
    return started;
}
