import type { ServerRuntime } from '../domain/ServerRuntime';
import type { GqlSMutationResult, GqlSSession, GqlSSessionMutation, GqlSWatchState } from '../graphql/generated';
import { toGqlWatchState } from '../mappers/toGqlWatch';
import { mockScenarioSourceSetEnabled } from '../maritime/sources/mockScenarioSource';
import {
    watchBoardClearStickyState,
    watchBoardDataSources,
    watchBoardOverlayScenario,
    watchBoardSessionAcknowledgeAlert,
    watchBoardSessionEnsure,
    watchBoardSessionList,
    watchBoardSessionReset,
    watchBoardSessionSelectVessel,
    watchBoardSnapshot,
} from '../maritime/watchBoardRuntime';
import { watchBoardTickDriverIsRunning, watchBoardTickDriverStart } from '../maritime/watchBoardTickDriver';
import { vesselIntelligenceRunDetached } from './vesselIntelligenceRun';

function fusedWatchState(sessionId: string): GqlSWatchState {
    const scenario = watchBoardOverlayScenario();
    const state = watchBoardSnapshot(sessionId, scenario);
    return toGqlWatchState(state, scenario, watchBoardDataSources());
}

/** Ensures the fused watch board (mock + live) is running for this session. */
export function scenarioEnsureLive(sessionId: string, serverRuntime: ServerRuntime): GqlSWatchState {
    if (!watchBoardTickDriverIsRunning()) {
        watchBoardTickDriverStart(serverRuntime);
    }
    watchBoardSessionEnsure(sessionId);
    return fusedWatchState(sessionId);
}

export function watchStateForSession(sessionId: string): GqlSWatchState | null {
    watchBoardSessionEnsure(sessionId);
    return fusedWatchState(sessionId);
}

export function watchAnomalyForSession(sessionId: string, anomalyId: string) {
    const scenario = watchBoardOverlayScenario();
    const state = watchBoardSnapshot(sessionId, scenario);
    return state.anomalies.find((a) => a.anomalyId === anomalyId) ?? null;
}

export async function vesselSelect(
    parent: GqlSSessionMutation,
    args: { mmsi: string | null },
    requestingSession: GqlSSession,
    serverRuntime: ServerRuntime,
): Promise<GqlSWatchState | null> {
    try {
        scenarioEnsureLive(parent.sessionId, serverRuntime);
        watchBoardSessionSelectVessel(parent.sessionId, args.mmsi);
        const next = watchStateForSession(parent.sessionId);
        void serverRuntime.publish.sessionUpdates({
            sessionId: parent.sessionId,
            payload: { kind: 'watchSnapshot' },
        });
        return next;
    } catch (error) {
        serverRuntime.log.error(error, requestingSession);
        return null;
    }
}

export async function vesselIntelligenceRequest(
    parent: GqlSSessionMutation,
    args: { mmsi: string },
    requestingSession: GqlSSession,
    serverRuntime: ServerRuntime,
): Promise<GqlSMutationResult> {
    try {
        scenarioEnsureLive(parent.sessionId, serverRuntime);
        vesselIntelligenceRunDetached({
            sessionId: parent.sessionId,
            mmsi: args.mmsi,
            requestingSession,
            serverRuntime,
        });
        return { success: true, referenceId: args.mmsi };
    } catch (error) {
        serverRuntime.log.error(error, requestingSession);
        return { success: false, referenceId: null };
    }
}

export async function alertAcknowledge(
    parent: GqlSSessionMutation,
    args: { incidentId: string },
    requestingSession: GqlSSession,
    serverRuntime: ServerRuntime,
): Promise<GqlSWatchState | null> {
    try {
        scenarioEnsureLive(parent.sessionId, serverRuntime);
        const ok = watchBoardSessionAcknowledgeAlert(parent.sessionId, args.incidentId);
        if (!ok) return null;
        await serverRuntime.publish.sessionUpdates({
            sessionId: parent.sessionId,
            payload: { kind: 'watchSnapshot' },
        });
        return watchStateForSession(parent.sessionId);
    } catch (error) {
        serverRuntime.log.error(error, requestingSession);
        return null;
    }
}

export async function scenarioReset(
    parent: GqlSSessionMutation,
    _args: Record<string, never>,
    requestingSession: GqlSSession,
    serverRuntime: ServerRuntime,
): Promise<GqlSWatchState | null> {
    try {
        watchBoardSessionReset(parent.sessionId);
        if (!watchBoardTickDriverIsRunning()) {
            watchBoardTickDriverStart(serverRuntime);
        }
        await serverRuntime.publish.sessionUpdates({
            sessionId: parent.sessionId,
            payload: { kind: 'watchSnapshot' },
        });
        return watchStateForSession(parent.sessionId);
    } catch (error) {
        serverRuntime.log.error(error, requestingSession);
        return null;
    }
}

export async function mockAisSetEnabled(
    parent: GqlSSessionMutation,
    args: { enabled: boolean },
    requestingSession: GqlSSession,
    serverRuntime: ServerRuntime,
): Promise<GqlSWatchState | null> {
    try {
        scenarioEnsureLive(parent.sessionId, serverRuntime);

        const before = watchBoardSnapshot(parent.sessionId, watchBoardOverlayScenario());
        const selectedWasMock =
            before.selectedMmsi != null && before.vessels.some((v) => v.mmsi === before.selectedMmsi && v.dataSource === 'mock');

        mockScenarioSourceSetEnabled(serverRuntime, args.enabled);

        // Clear sticky risk when Demo flips either way so live AIS-dark noise from
        // before Demo cannot flood Needs attention, and demo scores do not linger after.
        watchBoardClearStickyState();
        if (!args.enabled && selectedWasMock) {
            watchBoardSessionSelectVessel(parent.sessionId, null);
        }

        // Build the response first so the toggle mutation is not blocked on
        // fan-out NOTIFY. Peer sessions still get a snapshot; the caller applies
        // the returned WatchState immediately.
        const next = watchStateForSession(parent.sessionId);
        void Promise.all(
            watchBoardSessionList().map((sessionId) =>
                serverRuntime.publish.sessionUpdates({
                    sessionId,
                    payload: { kind: 'watchSnapshot' },
                }),
            ),
        );
        return next;
    } catch (error) {
        serverRuntime.log.error(error, requestingSession);
        return null;
    }
}
