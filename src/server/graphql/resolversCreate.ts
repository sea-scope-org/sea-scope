import { eq } from 'drizzle-orm';
import { DateResolver, DateTimeResolver, JSONResolver } from 'graphql-scalars';
import { chatInputCollectionRespond } from '../commands/chatInputCollectionRespond';
import { chatMessageCreate } from '../commands/chatMessageCreate';
import { chatToolApprovalRespond } from '../commands/chatToolApprovalRespond';
import {
    alertAcknowledge,
    mockAisSetEnabled,
    scenarioEnsureLive,
    scenarioReset,
    vesselIntelligenceRequest,
    vesselSelect,
    watchAnomalyForSession,
    watchStateForSession,
} from '../commands/scenarioControl';
import { userSessionTerminateMany } from '../commands/userSessionTerminateMany';
import { userUpdate } from '../commands/userUpdate';
import { users } from '../db/schema';
import type { ServerRuntime } from '../domain/ServerRuntime';
import { guardAdminMutation } from '../guards/guardAdminMutation';
import { guardUserMutation } from '../guards/guardUserMutation';
import { guardUserSubscription } from '../guards/guardUserSubscription';
import { sessionOperatorEnsure } from '../guards/sessionOperatorEnsure';
import { toGqlChatAssistantBodyBlock, toGqlChatMessage } from '../mappers/toGqlChatMessage';
import { toGqlAnomaly, toGqlScenarioSummary, toGqlVesselIntelligence } from '../mappers/toGqlWatch';
import { scenarioCatalogList } from '../maritime/scenarioRuntime';
import { vesselIntelligenceGet } from '../maritime/vesselIntelligenceStore';
import { chatFindOne } from '../queries/chatFindOne';
import { chatMessageRowLoad } from '../queries/chatMessageRowLoad';
import { sessionUserFindOne } from '../queries/sessionUserFindOne';
import { chatAssistantLiveBlocksGet } from './chatAssistantLiveBlocks';
import type { ChatUpdateWirePayload } from './chatUpdateWirePayload';
import type {
    GqlSAdmin,
    GqlSChatAssistantBodyBlock,
    GqlSChatAssistantInput,
    GqlSChatAssistantInputValue,
    GqlSChatMessage,
    GqlSChatUpdate,
    GqlSResolvers,
    GqlSSession,
    GqlSSessionChatArgs,
    GqlSSessionMutation,
    GqlSSessionMutationAlertAcknowledgeArgs,
    GqlSSessionMutationChatInputCollectionRespondArgs,
    GqlSSessionMutationChatMessageCreateArgs,
    GqlSSessionMutationChatToolApprovalRespondArgs,
    GqlSSessionMutationMockAisSetEnabledArgs,
    GqlSSessionMutationVesselIntelligenceRequestArgs,
    GqlSSessionMutationVesselSelectArgs,
    GqlSSessionUpdate,
    GqlSSubscriptionChatUpdatesArgs,
    GqlSUser,
    GqlSUserMutation,
    GqlSUserMutationChatInputCollectionRespondArgs,
    GqlSUserMutationChatMessageCreateArgs,
    GqlSUserMutationChatToolApprovalRespondArgs,
    GqlSUserMutationTerminateSessionsArgs,
    GqlSUserMutationUserUpdateArgs,
    GqlSWatchState,
} from './generated';
import type { SessionUpdateWirePayload } from './sessionUpdateWirePayload';

export function resolversCreate(serverRuntime: ServerRuntime): GqlSResolvers {
    return {
        DateTime: DateTimeResolver,
        Date: DateResolver,
        JSON: JSONResolver,
        ChatMessage: {
            __resolveType(obj: GqlSChatMessage) {
                return obj.gqlTypeName;
            },
        },
        ChatAssistantInput: {
            __resolveType(obj: GqlSChatAssistantInput) {
                return obj.gqlTypeName;
            },
        },
        ChatAssistantInputValue: {
            __resolveType(obj: GqlSChatAssistantInputValue) {
                return obj.gqlTypeName;
            },
        },
        ChatAssistantBodyBlock: {
            __resolveType(obj: GqlSChatAssistantBodyBlock) {
                return obj.gqlTypeName;
            },
        },
        ChatUpdate: {
            __resolveType(obj: GqlSChatUpdate) {
                return obj.gqlTypeName;
            },
        },
        SessionUpdate: {
            __resolveType(obj: GqlSSessionUpdate) {
                return obj.gqlTypeName;
            },
        },
        Session: {
            user(_session: GqlSSession, __: any, requestingSession: GqlSSession) {
                return sessionUserFindOne(requestingSession, serverRuntime);
            },
            chat(_session: GqlSSession, args: GqlSSessionChatArgs, requestingSession: GqlSSession) {
                return chatFindOne(args, requestingSession, serverRuntime);
            },
            watch(_session: GqlSSession, __: any, requestingSession: GqlSSession): GqlSWatchState {
                return scenarioEnsureLive(requestingSession.sessionId, serverRuntime);
            },
            scenarios() {
                return scenarioCatalogList().map(toGqlScenarioSummary);
            },
        },
        User: {
            async admin(parentUser: GqlSUser, _: any, requestingSession: GqlSSession): Promise<GqlSAdmin | null> {
                if (!requestingSession.userId || requestingSession.userId !== parentUser.userId) {
                    return null;
                }
                const [row] = await serverRuntime.db
                    .select({ isAdmin: users.isAdmin })
                    .from(users)
                    .where(eq(users.userId, parentUser.userId))
                    .limit(1);
                return row?.isAdmin ? ({} as GqlSAdmin) : null;
            },
        },
        Admin: {
            ok() {
                return true;
            },
        },
        AdminMutation: {
            ok() {
                return true;
            },
        },
        SessionMutation: {
            vesselSelect(parent: GqlSSessionMutation, args: GqlSSessionMutationVesselSelectArgs, requestingSession: GqlSSession) {
                return vesselSelect(parent, { mmsi: args.mmsi ?? null }, requestingSession, serverRuntime);
            },
            vesselIntelligenceRequest(
                parent: GqlSSessionMutation,
                args: GqlSSessionMutationVesselIntelligenceRequestArgs,
                requestingSession: GqlSSession,
            ) {
                return vesselIntelligenceRequest(parent, args, requestingSession, serverRuntime);
            },
            alertAcknowledge(parent: GqlSSessionMutation, args: GqlSSessionMutationAlertAcknowledgeArgs, requestingSession: GqlSSession) {
                return alertAcknowledge(parent, args, requestingSession, serverRuntime);
            },
            scenarioReset(parent: GqlSSessionMutation, _args: Record<string, never>, requestingSession: GqlSSession) {
                return scenarioReset(parent, {}, requestingSession, serverRuntime);
            },
            mockAisSetEnabled(parent: GqlSSessionMutation, args: GqlSSessionMutationMockAisSetEnabledArgs, requestingSession: GqlSSession) {
                return mockAisSetEnabled(parent, args, requestingSession, serverRuntime);
            },
            chatMessageCreate(parent: GqlSSessionMutation, args: GqlSSessionMutationChatMessageCreateArgs, requestingSession: GqlSSession) {
                return chatMessageCreate(
                    { userId: (parent as { userId: string }).userId } as GqlSUserMutation,
                    args,
                    requestingSession,
                    serverRuntime,
                );
            },
            chatInputCollectionRespond(
                parent: GqlSSessionMutation,
                args: GqlSSessionMutationChatInputCollectionRespondArgs,
                requestingSession: GqlSSession,
            ) {
                return chatInputCollectionRespond(
                    { userId: (parent as { userId: string }).userId } as GqlSUserMutation,
                    args,
                    requestingSession,
                    serverRuntime,
                );
            },
            chatToolApprovalRespond(
                parent: GqlSSessionMutation,
                args: GqlSSessionMutationChatToolApprovalRespondArgs,
                requestingSession: GqlSSession,
            ) {
                return chatToolApprovalRespond(
                    { userId: (parent as { userId: string }).userId } as GqlSUserMutation,
                    args,
                    requestingSession,
                    serverRuntime,
                );
            },
        },
        UserMutation: {
            userUpdate({ userId }: GqlSUserMutation, args: GqlSUserMutationUserUpdateArgs, requestingSession: GqlSSession) {
                return userUpdate(userId, args, requestingSession, serverRuntime);
            },
            terminateSessions({ userId }: GqlSUserMutation, args: GqlSUserMutationTerminateSessionsArgs, requestingSession: GqlSSession) {
                return userSessionTerminateMany(userId, args, requestingSession, serverRuntime);
            },
            chatMessageCreate(parent: GqlSUserMutation, args: GqlSUserMutationChatMessageCreateArgs, requestingSession: GqlSSession) {
                return chatMessageCreate(parent, args, requestingSession, serverRuntime);
            },
            chatInputCollectionRespond(
                parent: GqlSUserMutation,
                args: GqlSUserMutationChatInputCollectionRespondArgs,
                requestingSession: GqlSSession,
            ) {
                return chatInputCollectionRespond(parent, args, requestingSession, serverRuntime);
            },
            chatToolApprovalRespond(
                parent: GqlSUserMutation,
                args: GqlSUserMutationChatToolApprovalRespondArgs,
                requestingSession: GqlSSession,
            ) {
                return chatToolApprovalRespond(parent, args, requestingSession, serverRuntime);
            },
        },
        Query: {
            currentSession(_: any, __: any, requestingSession: GqlSSession) {
                return requestingSession;
            },
        },
        Mutation: {
            userCreate(_parent: unknown, __: any, _requestingSession: GqlSSession) {
                return { success: false, referenceId: null };
            },
            user(_parent: unknown, __: any, requestingSession: GqlSSession) {
                return guardUserMutation(requestingSession);
            },
            session(_parent: unknown, __: any, requestingSession: GqlSSession) {
                return sessionOperatorEnsure(requestingSession, serverRuntime);
            },
            admin(_parent: unknown, __: any, requestingSession: GqlSSession) {
                return guardAdminMutation(requestingSession, serverRuntime);
            },
        },
        Subscription: {
            userUpdates: {
                subscribe(_: any, __: any, requestingSession: GqlSSession) {
                    return guardUserSubscription(requestingSession, serverRuntime);
                },
                resolve(_: any, __: any, requestingSession: GqlSSession) {
                    return sessionUserFindOne(requestingSession, serverRuntime) as Promise<GqlSUser>;
                },
            },
            chatUpdates: {
                subscribe(_: any, { generationId }: GqlSSubscriptionChatUpdatesArgs) {
                    return serverRuntime.subscribe.to(`chat-updates:${generationId}`);
                },
                async resolve(payload: ChatUpdateWirePayload): Promise<GqlSChatUpdate> {
                    switch (payload.kind) {
                        case 'messageAppended': {
                            const joined = await chatMessageRowLoad(serverRuntime.db, payload.chatMessageId);
                            if (!joined) throw new Error(`chatUpdates: row ${payload.chatMessageId} not found on re-load`);
                            return { gqlTypeName: 'ChatUpdateMessageAppended', message: toGqlChatMessage(joined) };
                        }
                        case 'assistantTextChunk':
                            return {
                                gqlTypeName: 'ChatUpdateAssistantTextChunk',
                                chatMessageId: payload.chatMessageId,
                                delta: payload.delta,
                            };
                        case 'assistantTextClear':
                            return {
                                gqlTypeName: 'ChatUpdateAssistantTextClear',
                                chatMessageId: payload.chatMessageId,
                            };
                        case 'assistantReasoningChunk':
                            return {
                                gqlTypeName: 'ChatUpdateAssistantReasoningChunk',
                                chatMessageId: payload.chatMessageId,
                                delta: payload.delta,
                            };
                        case 'assistantBlocksClear':
                            return {
                                gqlTypeName: 'ChatUpdateAssistantBlocksClear',
                                chatMessageId: payload.chatMessageId,
                            };
                        case 'assistantBlocksReplace': {
                            const blocks = chatAssistantLiveBlocksGet(payload.chatMessageId) ?? [];
                            return {
                                gqlTypeName: 'ChatUpdateAssistantBlocksReplace',
                                chatMessageId: payload.chatMessageId,
                                blocks: blocks.map(toGqlChatAssistantBodyBlock),
                            };
                        }
                        case 'turnEnded':
                            return { gqlTypeName: 'ChatUpdateTurnEnded', generationId: payload.generationId };
                    }
                },
            },
            sessionUpdates: {
                subscribe(_: any, __: any, requestingSession: GqlSSession) {
                    return serverRuntime.subscribe.to(`session-updates:${requestingSession.sessionId}`);
                },
                async resolve(payload: SessionUpdateWirePayload, _: unknown, requestingSession: GqlSSession): Promise<GqlSSessionUpdate> {
                    switch (payload.kind) {
                        case 'watchSnapshot': {
                            const watch = watchStateForSession(requestingSession.sessionId);
                            if (!watch) throw new Error('sessionUpdates: watch state missing');
                            return {
                                gqlTypeName: 'SessionUpdateWatchSnapshot',
                                watch,
                            };
                        }
                        case 'anomalyAppended': {
                            const anomaly = watchAnomalyForSession(requestingSession.sessionId, payload.anomalyId);
                            if (!anomaly) throw new Error(`sessionUpdates: anomaly ${payload.anomalyId} not found`);
                            return {
                                gqlTypeName: 'SessionUpdateAnomalyAppended',
                                anomaly: toGqlAnomaly(anomaly),
                            };
                        }
                        case 'intelligence': {
                            const intelligence = vesselIntelligenceGet(requestingSession.sessionId, payload.mmsi);
                            if (!intelligence) throw new Error(`sessionUpdates: intelligence for ${payload.mmsi} not found`);
                            return {
                                gqlTypeName: 'SessionUpdateIntelligence',
                                intelligence: toGqlVesselIntelligence(intelligence),
                            };
                        }
                    }
                },
            },
        },
    };
}
