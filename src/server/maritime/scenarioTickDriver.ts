import type { ServerRuntime } from '../domain/ServerRuntime';
import { scenarioPlayerLastTickAnomalies, scenarioPlayerStart, scenarioPlayerTick } from './scenarioRuntime';
import { vesselIntelligenceClearSession } from './vesselIntelligenceStore';

const REAL_TICK_MS = 500;
const tickTimers = new Map<string, ReturnType<typeof setInterval>>();

export function scenarioTickDriverIsRunning(sessionId: string): boolean {
    return tickTimers.has(sessionId);
}

function scenarioTickDriverStop(sessionId: string): void {
    const timer = tickTimers.get(sessionId);
    if (timer) {
        clearInterval(timer);
        tickTimers.delete(sessionId);
    }
}

export function scenarioTickDriverStart(sessionId: string, serverRuntime: ServerRuntime, options?: { clearIntelligence?: boolean }): void {
    scenarioTickDriverStop(sessionId);
    if (options?.clearIntelligence !== false) {
        vesselIntelligenceClearSession(sessionId);
    }

    const timer = setInterval(() => {
        void (async () => {
            let state = scenarioPlayerTick(sessionId);
            if (!state) {
                scenarioTickDriverStop(sessionId);
                return;
            }

            if (state.status === 'completed') {
                vesselIntelligenceClearSession(sessionId);
                state = scenarioPlayerStart(sessionId, state.scenarioId);
            }

            await serverRuntime.publish.sessionUpdates({
                sessionId,
                payload: { kind: 'watchSnapshot' },
            });

            for (const anomaly of scenarioPlayerLastTickAnomalies(sessionId)) {
                await serverRuntime.publish.sessionUpdates({
                    sessionId,
                    payload: { kind: 'anomalyAppended', anomalyId: anomaly.anomalyId },
                });
            }
        })();
    }, REAL_TICK_MS);

    tickTimers.set(sessionId, timer);
}
