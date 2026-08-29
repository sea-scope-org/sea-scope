import { aisVesselPositionPersist } from '../../commands/aisVesselPositionPersist';
import type { ServerRuntime } from '../../domain/ServerRuntime';
import { environmentVariables } from '../../env/environmentVariablesCreate';
import { aisTheaterMapPoint } from '../aisTheater';
import { DEFAULT_SCENARIO_ID, scenarioDefinitionGet, scenarioPositionSample } from '../scenarioRuntime';
import {
    vesselTrackStoreMarkPersisted,
    vesselTrackStoreRemoveBySource,
    vesselTrackStoreRemoveMockExcept,
    vesselTrackStoreUpsertPosition,
} from '../vesselTrackStore';

const REAL_TICK_MS = 500;
const HISTORY_PERSIST_MIN_MS = 60_000;

let timer: ReturnType<typeof setInterval> | null = null;
let simMs = 0;
let status: 'running' | 'idle' | 'disabled' = 'disabled';
let boundRuntime: ServerRuntime | null = null;
/** Bumped on every start/stop so in-flight async ticks cannot resurrect mock vessels after Demo is turned off. */
let runGeneration = 0;

export function mockScenarioSourceStatus(): 'running' | 'idle' | 'disabled' {
    return status;
}

export function mockScenarioSourceIsStarted(): boolean {
    return status === 'running';
}

export function mockScenarioSourceSimMs(): number {
    return simMs;
}

function stopTimer(): void {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}

function mockFeederStillCurrent(generation: number): boolean {
    return generation === runGeneration && status === 'running';
}

/** Stop the mock feeder and remove mock vessels from the track store. */
function mockScenarioSourceStop(): number {
    runGeneration += 1;
    stopTimer();
    const removed = vesselTrackStoreRemoveBySource('mock');
    status = 'disabled';
    simMs = 0;
    console.info(`[mock-ais] feeder stopped (removed ${removed} vessels)`);
    return removed;
}

/** Start the Galaxy Leader mock feeder. Idempotent while already running. */
function mockScenarioSourceStart(serverRuntime: ServerRuntime): void {
    if (status === 'running') return;

    const scenario = scenarioDefinitionGet(DEFAULT_SCENARIO_ID);
    if (!scenario) {
        status = 'idle';
        console.error('[mock-ais] Galaxy Leader scenario missing');
        return;
    }

    runGeneration += 1;
    const generation = runGeneration;
    boundRuntime = serverRuntime;
    status = 'running';
    simMs = 0;

    const bbox = environmentVariables.aisStreamBoundingBox;
    const sampleMapped = aisTheaterMapPoint({ lat: 14.5, lon: 42.5 }, bbox);
    console.info(
        `[mock-ais] feeder started (${scenario.title}, ${scenario.vessels.length} vessels) — mapped into live water corridor near ${sampleMapped.lat.toFixed(3)},${sampleMapped.lon.toFixed(3)}`,
    );
    serverRuntime.log.info(`Mock AIS feeder started (${scenario.scenarioId})`);

    const upsertMock = (vessel: (typeof scenario.vessels)[number], position: NonNullable<ReturnType<typeof scenarioPositionSample>>) => {
        const mapped = aisTheaterMapPoint({ lat: position.lat, lon: position.lon }, bbox);
        return vesselTrackStoreUpsertPosition('mock', vessel, {
            ...position,
            lat: mapped.lat,
            lon: mapped.lon,
        });
    };

    const allowed = new Set(scenario.vessels.map((v) => v.mmsi));
    vesselTrackStoreRemoveMockExcept(allowed);
    for (const vessel of scenario.vessels) {
        const position = scenarioPositionSample(scenario, vessel.mmsi, simMs);
        if (!position) continue;
        upsertMock(vessel, position);
    }

    timer = setInterval(() => {
        void (async () => {
            if (!mockFeederStillCurrent(generation)) return;

            const runtime = boundRuntime;
            if (!runtime) return;

            // Re-read catalog each tick so HMR / scenario trims take effect without a full restart.
            const active = scenarioDefinitionGet(DEFAULT_SCENARIO_ID);
            if (!active) return;

            const nextSimMs = simMs + active.tickIntervalMs;
            if (nextSimMs > active.endSimMs) {
                simMs = active.startSimMs;
                console.info('[mock-ais] scenario loop restart');
            } else {
                simMs = nextSimMs;
            }

            const keep = new Set(active.vessels.map((v) => v.mmsi));
            vesselTrackStoreRemoveMockExcept(keep);

            for (const vessel of active.vessels) {
                if (!mockFeederStillCurrent(generation)) return;

                const position = scenarioPositionSample(active, vessel.mmsi, simMs);
                if (!position) continue;
                const tracked = upsertMock(vessel, position);
                if (!tracked) continue;

                const now = Date.now();
                const persistHistory = now - tracked.lastPersistedAtMs >= HISTORY_PERSIST_MIN_MS;
                const ok = await aisVesselPositionPersist(runtime, {
                    source: 'mock',
                    identity: tracked.identity,
                    position: tracked.position,
                    persistHistory,
                });

                // Persist yields — Demo may have been disabled while we awaited.
                if (!mockFeederStillCurrent(generation)) return;

                if (ok && persistHistory) {
                    vesselTrackStoreMarkPersisted(tracked.identity.mmsi, now);
                }
            }
        })();
    }, REAL_TICK_MS);
}

/**
 * Boot hook — mock stays off unless `AIS_MOCK_ENABLED=true` (operators can still
 * toggle via `mockAisSetEnabled` at runtime).
 *
 * Do not clobber a feeder that was enabled at runtime if this re-enters after
 * HMR / soft restart while `AIS_MOCK_ENABLED` remains false.
 */
export function mockScenarioSourceEnsureStarted(serverRuntime: ServerRuntime): void {
    if (!environmentVariables.aisMockEnabled) {
        if (status === 'running') return;
        status = 'disabled';
        console.info('[mock-ais] feeder off by default (enable from the watch toolbar or AIS_MOCK_ENABLED=true)');
        return;
    }
    mockScenarioSourceStart(serverRuntime);
}

export function mockScenarioSourceSetEnabled(serverRuntime: ServerRuntime, enabled: boolean): void {
    if (enabled) {
        mockScenarioSourceStart(serverRuntime);
        return;
    }
    mockScenarioSourceStop();
}
