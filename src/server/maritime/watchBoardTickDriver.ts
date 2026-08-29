import type { ServerRuntime } from '../domain/ServerRuntime';
import { watchBoardLastTickAnomalies, watchBoardOverlayScenario, watchBoardSessionList, watchBoardTick } from './watchBoardRuntime';

const REAL_TICK_MS = 1_000;
let tickTimer: ReturnType<typeof setInterval> | null = null;
let overlayScenario = watchBoardOverlayScenario();

export function watchBoardTickDriverIsRunning(): boolean {
    return tickTimer !== null;
}

export function watchBoardTickDriverStart(serverRuntime: ServerRuntime): void {
    if (tickTimer) return;
    overlayScenario = watchBoardOverlayScenario();

    tickTimer = setInterval(() => {
        void (async () => {
            const changed = watchBoardTick(overlayScenario);
            if (!changed && watchBoardSessionList().length === 0) return;

            const anomalies = watchBoardLastTickAnomalies();
            for (const sessionId of watchBoardSessionList()) {
                await serverRuntime.publish.sessionUpdates({
                    sessionId,
                    payload: { kind: 'watchSnapshot' },
                });
                for (const anomaly of anomalies) {
                    await serverRuntime.publish.sessionUpdates({
                        sessionId,
                        payload: { kind: 'anomalyAppended', anomalyId: anomaly.anomalyId },
                    });
                }
            }
        })();
    }, REAL_TICK_MS);
}
