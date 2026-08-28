import type { ServerRuntime } from '../domain/ServerRuntime';
import type { GqlSMutationResult, GqlSSession, GqlSSessionMutation, GqlSWatchState } from '../graphql/generated';
import { toGqlWatchState } from '../mappers/toGqlWatch';
import {
    DEFAULT_SCENARIO_ID,
    scenarioDefinitionGet,
    scenarioPlayerAcknowledgeAlert,
    scenarioPlayerEnsure,
    scenarioPlayerGet,
    scenarioPlayerReset,
    scenarioPlayerSelectVessel,
} from '../maritime/scenarioRuntime';
import { scenarioTickDriverIsRunning, scenarioTickDriverStart } from '../maritime/scenarioTickDriver';
import { vesselIntelligenceRunDetached } from './vesselIntelligenceRun';

/** Ensures the default scenario is running and the tick driver is attached. */
export function scenarioEnsureLive(sessionId: string, serverRuntime: ServerRuntime): GqlSWatchState {
    const existing = scenarioPlayerGet(sessionId);
    const wasRunning = existing?.status === 'running';
    const state = scenarioPlayerEnsure(sessionId, DEFAULT_SCENARIO_ID);
    const scenario = scenarioDefinitionGet(state.scenarioId);
    if (!scenario) throw new Error(`Unknown scenario: ${state.scenarioId}`);

    if (!scenarioTickDriverIsRunning(sessionId)) {
        scenarioTickDriverStart(sessionId, serverRuntime, {
            // Re-attach after a lost timer without wiping an in-progress brief.
            clearIntelligence: !wasRunning,
        });
    }

    return toGqlWatchState(state, scenario);
}

export async function vesselSelect(
    parent: GqlSSessionMutation,
    args: { mmsi: string | null },
    requestingSession: GqlSSession,
    serverRuntime: ServerRuntime,
): Promise<GqlSWatchState | null> {
    try {
        scenarioEnsureLive(parent.sessionId, serverRuntime);
        const state = scenarioPlayerSelectVessel(parent.sessionId, args.mmsi);
        if (!state) return null;
        const scenario = scenarioDefinitionGet(state.scenarioId);
        if (!scenario) return null;
        await serverRuntime.publish.sessionUpdates({
            sessionId: parent.sessionId,
            payload: { kind: 'watchSnapshot' },
        });
        return toGqlWatchState(state, scenario);
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
        const state = scenarioPlayerAcknowledgeAlert(parent.sessionId, args.incidentId);
        if (!state) return null;
        const scenario = scenarioDefinitionGet(state.scenarioId);
        if (!scenario) return null;
        await serverRuntime.publish.sessionUpdates({
            sessionId: parent.sessionId,
            payload: { kind: 'watchSnapshot' },
        });
        return toGqlWatchState(state, scenario);
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
        const state = scenarioPlayerReset(parent.sessionId, DEFAULT_SCENARIO_ID);
        const scenario = scenarioDefinitionGet(state.scenarioId);
        if (!scenario) return null;
        scenarioTickDriverStart(parent.sessionId, serverRuntime, { clearIntelligence: true });
        await serverRuntime.publish.sessionUpdates({
            sessionId: parent.sessionId,
            payload: { kind: 'watchSnapshot' },
        });
        return toGqlWatchState(state, scenario);
    } catch (error) {
        serverRuntime.log.error(error, requestingSession);
        return null;
    }
}
