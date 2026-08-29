import { aisVesselPositionPersist } from '../../commands/aisVesselPositionPersist';
import type { ServerRuntime } from '../../domain/ServerRuntime';
import type { EnvironmentVariables } from '../../env/EnvironmentVariables';
import { DEFAULT_SCENARIO_ID, scenarioDefinitionGet, scenarioPositionSample } from '../scenarioRuntime';
import { vesselTrackStoreMarkPersisted, vesselTrackStoreUpsertPosition } from '../vesselTrackStore';

const REAL_TICK_MS = 500;
const HISTORY_PERSIST_MIN_MS = 60_000;

let started = false;
let simMs = 0;
let status: 'running' | 'idle' | 'disabled' = 'disabled';

export function mockScenarioSourceStatus(): 'running' | 'idle' | 'disabled' {
    return status;
}

export function mockScenarioSourceIsStarted(): boolean {
    return started;
}

export function mockScenarioSourceSimMs(): number {
    return simMs;
}

/** Feed Galaxy Leader tracks into the shared vessel track store. Idempotent. */
export function mockScenarioSourceEnsureStarted(serverRuntime: ServerRuntime, env: EnvironmentVariables): void {
    if (!env.aisMockEnabled) {
        status = 'disabled';
        console.info('[mock-ais] feeder disabled (AIS_MOCK_ENABLED=false)');
        serverRuntime.log.info('Mock AIS feeder disabled (AIS_MOCK_ENABLED=false)');
        return;
    }
    if (started) return;
    started = true;
    status = 'running';
    simMs = 0;

    const scenario = scenarioDefinitionGet(DEFAULT_SCENARIO_ID);
    if (!scenario) {
        status = 'idle';
        console.error('[mock-ais] Galaxy Leader scenario missing');
        return;
    }

    console.info(`[mock-ais] feeder started (${scenario.title})`);
    serverRuntime.log.info(`Mock AIS feeder started (${scenario.scenarioId})`);

    for (const vessel of scenario.vessels) {
        const position = scenarioPositionSample(scenario, vessel.mmsi, simMs);
        if (!position) continue;
        vesselTrackStoreUpsertPosition('mock', vessel, position);
    }

    setInterval(() => {
        void (async () => {
            const nextSimMs = simMs + scenario.tickIntervalMs;
            if (nextSimMs > scenario.endSimMs) {
                simMs = scenario.startSimMs;
                console.info('[mock-ais] scenario loop restart');
            } else {
                simMs = nextSimMs;
            }

            for (const vessel of scenario.vessels) {
                const position = scenarioPositionSample(scenario, vessel.mmsi, simMs);
                if (!position) continue;
                const tracked = vesselTrackStoreUpsertPosition('mock', vessel, position);
                if (!tracked) continue;

                const now = Date.now();
                const persistHistory = now - tracked.lastPersistedAtMs >= HISTORY_PERSIST_MIN_MS;
                const ok = await aisVesselPositionPersist(serverRuntime, {
                    source: 'mock',
                    identity: tracked.identity,
                    position: tracked.position,
                    persistHistory,
                });
                if (ok && persistHistory) {
                    vesselTrackStoreMarkPersisted(tracked.identity.mmsi, now);
                }
            }
        })();
    }, REAL_TICK_MS);
}
