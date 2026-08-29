import type { ServerRuntime } from '../domain/ServerRuntime';
import type { GqlSMutationResult, GqlSSession, GqlSSessionMutation } from '../graphql/generated';
import { aisStreamIngestResubscribe } from '../maritime/aisStreamIngest';
import { aisViewportRegistryClear, aisViewportRegistryUpsert } from '../maritime/aisViewportRegistry';

export async function aisViewportReport(
    parent: GqlSSessionMutation,
    args: { southLat: number; westLon: number; northLat: number; eastLon: number },
    requestingSession: GqlSSession,
    serverRuntime: ServerRuntime,
): Promise<GqlSMutationResult> {
    try {
        const result = aisViewportRegistryUpsert(parent.sessionId, {
            southLat: args.southLat,
            westLon: args.westLon,
            northLat: args.northLat,
            eastLon: args.eastLon,
        });
        if (!result.ok) {
            return { success: false, referenceId: null };
        }
        if (result.changed) {
            aisStreamIngestResubscribe();
        }
        return { success: true, referenceId: parent.sessionId };
    } catch (error) {
        serverRuntime.log.error(error, requestingSession);
        return { success: false, referenceId: null };
    }
}

export async function aisViewportClear(
    parent: GqlSSessionMutation,
    _args: Record<string, never>,
    requestingSession: GqlSSession,
    serverRuntime: ServerRuntime,
): Promise<GqlSMutationResult> {
    try {
        const { changed } = aisViewportRegistryClear(parent.sessionId);
        if (changed) {
            aisStreamIngestResubscribe();
        }
        return { success: true, referenceId: parent.sessionId };
    } catch (error) {
        serverRuntime.log.error(error, requestingSession);
        return { success: false, referenceId: null };
    }
}
