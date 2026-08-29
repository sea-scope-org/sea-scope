import type { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import * as z from 'zod';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
    ID: { input: string; output: string };
    String: { input: string; output: string };
    Boolean: { input: boolean; output: boolean };
    Int: { input: number; output: number };
    Float: { input: number; output: number };
    Date: { input: string; output: string };
    DateTime: { input: Date; output: Date };
    JSON: { input: unknown; output: unknown };
};

export interface GqlSAdmin {
    __typename?: 'Admin';
    ok: Scalars['Boolean']['output'];
}

export interface GqlSAdminMutation {
    __typename?: 'AdminMutation';
    ok: Scalars['Boolean']['output'];
}

export interface GqlSAnomaly {
    __typename?: 'Anomaly';
    anomalyId: Scalars['ID']['output'];
    detectedAtSimMs: Scalars['Float']['output'];
    evidence: Scalars['JSON']['output'];
    kind: GqlSAnomalyKind;
    mmsi: Scalars['ID']['output'];
    severity: GqlSAnomalySeverity;
    summary: Scalars['String']['output'];
    title: Scalars['String']['output'];
}

export type GqlSAnomalyKind = 'aisDark' | 'headingZigZag' | 'impossibleJump' | 'loitering' | 'speedDrop';

export type GqlSAnomalySeverity = 'critical' | 'high' | 'low' | 'medium';

export interface GqlSChat {
    __typename?: 'Chat';
    chatId: Scalars['ID']['output'];
    lastModifiedAt: Scalars['DateTime']['output'];
    messages: Array<GqlSChatMessage>;
    title: Scalars['String']['output'];
}

export interface GqlSChatAssistantArtifactCard {
    __typename?: 'ChatAssistantArtifactCard';
    buttonTitle?: Maybe<Scalars['String']['output']>;
    description: Scalars['String']['output'];
    href?: Maybe<Scalars['String']['output']>;
    imageUrl?: Maybe<Scalars['String']['output']>;
    price?: Maybe<Scalars['String']['output']>;
    title: Scalars['String']['output'];
}

export type GqlSChatAssistantBodyBlock = GqlSChatAssistantBodyBlockCardList | GqlSChatAssistantBodyBlockMarkdown;

export interface GqlSChatAssistantBodyBlockCardList {
    __typename?: 'ChatAssistantBodyBlockCardList';
    cards: Array<GqlSChatAssistantArtifactCard>;
}

export interface GqlSChatAssistantBodyBlockMarkdown {
    __typename?: 'ChatAssistantBodyBlockMarkdown';
    text: Scalars['String']['output'];
}

export type GqlSChatAssistantInput =
    | GqlSChatAssistantInputBoolean
    | GqlSChatAssistantInputDate
    | GqlSChatAssistantInputDateRange
    | GqlSChatAssistantInputDateTime
    | GqlSChatAssistantInputMultiSelect
    | GqlSChatAssistantInputSingleSelect
    | GqlSChatAssistantInputText
    | GqlSChatAssistantInputTime;

export interface GqlSChatAssistantInputBoolean {
    __typename?: 'ChatAssistantInputBoolean';
    inputId: Scalars['ID']['output'];
    prompt: Scalars['String']['output'];
}

export interface GqlSChatAssistantInputDate {
    __typename?: 'ChatAssistantInputDate';
    inputId: Scalars['ID']['output'];
    prompt: Scalars['String']['output'];
}

export interface GqlSChatAssistantInputDateRange {
    __typename?: 'ChatAssistantInputDateRange';
    inputId: Scalars['ID']['output'];
    prompt: Scalars['String']['output'];
}

export interface GqlSChatAssistantInputDateTime {
    __typename?: 'ChatAssistantInputDateTime';
    inputId: Scalars['ID']['output'];
    prompt: Scalars['String']['output'];
}

export interface GqlSChatAssistantInputMultiSelect {
    __typename?: 'ChatAssistantInputMultiSelect';
    inputId: Scalars['ID']['output'];
    options: Array<Scalars['String']['output']>;
    prompt: Scalars['String']['output'];
}

export interface GqlSChatAssistantInputSingleSelect {
    __typename?: 'ChatAssistantInputSingleSelect';
    inputId: Scalars['ID']['output'];
    options: Array<Scalars['String']['output']>;
    prompt: Scalars['String']['output'];
}

export interface GqlSChatAssistantInputText {
    __typename?: 'ChatAssistantInputText';
    inputId: Scalars['ID']['output'];
    prompt: Scalars['String']['output'];
}

export interface GqlSChatAssistantInputTime {
    __typename?: 'ChatAssistantInputTime';
    inputId: Scalars['ID']['output'];
    prompt: Scalars['String']['output'];
}

export type GqlSChatAssistantInputValue =
    | GqlSChatAssistantInputValueBoolean
    | GqlSChatAssistantInputValueDate
    | GqlSChatAssistantInputValueDateRange
    | GqlSChatAssistantInputValueDateTime
    | GqlSChatAssistantInputValueString
    | GqlSChatAssistantInputValueStringList
    | GqlSChatAssistantInputValueTime;

export interface GqlSChatAssistantInputValueBoolean {
    __typename?: 'ChatAssistantInputValueBoolean';
    boolean: Scalars['Boolean']['output'];
}

export interface GqlSChatAssistantInputValueDate {
    __typename?: 'ChatAssistantInputValueDate';
    date: Scalars['Date']['output'];
}

export interface GqlSChatAssistantInputValueDateRange {
    __typename?: 'ChatAssistantInputValueDateRange';
    from: Scalars['Date']['output'];
    to: Scalars['Date']['output'];
}

export interface GqlSChatAssistantInputValueDateTime {
    __typename?: 'ChatAssistantInputValueDateTime';
    dateTime: Scalars['DateTime']['output'];
}

export type GqlSChatAssistantInputValueKind = 'Boolean' | 'Date' | 'DateRange' | 'DateTime' | 'String' | 'StringList' | 'Time';

export interface GqlSChatAssistantInputValueString {
    __typename?: 'ChatAssistantInputValueString';
    value: Scalars['String']['output'];
}

export interface GqlSChatAssistantInputValueStringList {
    __typename?: 'ChatAssistantInputValueStringList';
    values: Array<Scalars['String']['output']>;
}

export interface GqlSChatAssistantInputValueTime {
    __typename?: 'ChatAssistantInputValueTime';
    time: Scalars['String']['output'];
}

export type GqlSChatAssistantOptions = {
    generationId?: InputMaybe<Scalars['ID']['input']>;
    requireToolCallApprovals: Scalars['Boolean']['input'];
};

export type GqlSChatMessage =
    | GqlSChatMessageAssistantInputCollection
    | GqlSChatMessageAssistantText
    | GqlSChatMessageToolApprovalRequest
    | GqlSChatMessageToolApprovalResponse
    | GqlSChatMessageToolCall
    | GqlSChatMessageUser
    | GqlSChatMessageUserInput;

export interface GqlSChatMessageAssistantInputCollection {
    __typename?: 'ChatMessageAssistantInputCollection';
    chatMessageId: Scalars['ID']['output'];
    createdAt: Scalars['DateTime']['output'];
    generation?: Maybe<GqlSChatMessageGeneration>;
    inputs: Array<GqlSChatAssistantInput>;
    mode: Scalars['String']['output'];
    prompt: Scalars['String']['output'];
    reasoning?: Maybe<Scalars['String']['output']>;
}

export interface GqlSChatMessageAssistantText {
    __typename?: 'ChatMessageAssistantText';
    blocks: Array<GqlSChatAssistantBodyBlock>;
    body: Scalars['String']['output'];
    chatMessageId: Scalars['ID']['output'];
    createdAt: Scalars['DateTime']['output'];
    generation?: Maybe<GqlSChatMessageGeneration>;
    reasoning?: Maybe<Scalars['String']['output']>;
    sources: Array<GqlSChatMessageSource>;
}

export interface GqlSChatMessageCreateResult {
    __typename?: 'ChatMessageCreateResult';
    chatId: Scalars['ID']['output'];
    chatMessageId: Scalars['ID']['output'];
}

export interface GqlSChatMessageGeneration {
    __typename?: 'ChatMessageGeneration';
    cachedInputTokens?: Maybe<Scalars['Int']['output']>;
    inputTokens?: Maybe<Scalars['Int']['output']>;
    modelId: Scalars['String']['output'];
    outputTokens?: Maybe<Scalars['Int']['output']>;
    reasoningTokens?: Maybe<Scalars['Int']['output']>;
    totalTokens?: Maybe<Scalars['Int']['output']>;
}

export interface GqlSChatMessageSource {
    __typename?: 'ChatMessageSource';
    title: Scalars['String']['output'];
    url: Scalars['String']['output'];
}

export interface GqlSChatMessageToolApprovalRequest {
    __typename?: 'ChatMessageToolApprovalRequest';
    approvalId: Scalars['String']['output'];
    args: Scalars['JSON']['output'];
    chatMessageId: Scalars['ID']['output'];
    createdAt: Scalars['DateTime']['output'];
    generation?: Maybe<GqlSChatMessageGeneration>;
    reasoning?: Maybe<Scalars['String']['output']>;
    toolName: Scalars['String']['output'];
}

export interface GqlSChatMessageToolApprovalResponse {
    __typename?: 'ChatMessageToolApprovalResponse';
    approvalId: Scalars['String']['output'];
    approved: Scalars['Boolean']['output'];
    chatMessageId: Scalars['ID']['output'];
    createdAt: Scalars['DateTime']['output'];
    reason?: Maybe<Scalars['String']['output']>;
}

export interface GqlSChatMessageToolCall {
    __typename?: 'ChatMessageToolCall';
    args: Scalars['JSON']['output'];
    chatMessageId: Scalars['ID']['output'];
    createdAt: Scalars['DateTime']['output'];
    generation?: Maybe<GqlSChatMessageGeneration>;
    parentChatMessageId?: Maybe<Scalars['ID']['output']>;
    reasoning?: Maybe<Scalars['String']['output']>;
    toolName: Scalars['String']['output'];
    toolResult?: Maybe<Scalars['JSON']['output']>;
}

export interface GqlSChatMessageUser {
    __typename?: 'ChatMessageUser';
    attachments: Array<GqlSFileUpload>;
    author: GqlSUser;
    body: Scalars['String']['output'];
    chatMessageId: Scalars['ID']['output'];
    createdAt: Scalars['DateTime']['output'];
}

export interface GqlSChatMessageUserInput {
    __typename?: 'ChatMessageUserInput';
    answers: Array<GqlSChatMessageUserInputAnswer>;
    author: GqlSUser;
    chatMessageId: Scalars['ID']['output'];
    collectionMessageId: Scalars['ID']['output'];
    createdAt: Scalars['DateTime']['output'];
}

export interface GqlSChatMessageUserInputAnswer {
    __typename?: 'ChatMessageUserInputAnswer';
    inputId: Scalars['ID']['output'];
    value: GqlSChatAssistantInputValue;
}

export type GqlSChatMessageUserInputAnswerCreate = {
    boolean?: InputMaybe<Scalars['Boolean']['input']>;
    date?: InputMaybe<Scalars['Date']['input']>;
    dateRangeFrom?: InputMaybe<Scalars['Date']['input']>;
    dateRangeTo?: InputMaybe<Scalars['Date']['input']>;
    dateTime?: InputMaybe<Scalars['DateTime']['input']>;
    inputId: Scalars['ID']['input'];
    kind: GqlSChatAssistantInputValueKind;
    string?: InputMaybe<Scalars['String']['input']>;
    stringList?: InputMaybe<Array<Scalars['String']['input']>>;
    time?: InputMaybe<Scalars['String']['input']>;
};

export type GqlSChatUpdate =
    | GqlSChatUpdateAssistantBlocksClear
    | GqlSChatUpdateAssistantBlocksReplace
    | GqlSChatUpdateAssistantReasoningChunk
    | GqlSChatUpdateAssistantTextChunk
    | GqlSChatUpdateAssistantTextClear
    | GqlSChatUpdateMessageAppended
    | GqlSChatUpdateTurnEnded;

export interface GqlSChatUpdateAssistantBlocksClear {
    __typename?: 'ChatUpdateAssistantBlocksClear';
    chatMessageId: Scalars['ID']['output'];
}

export interface GqlSChatUpdateAssistantBlocksReplace {
    __typename?: 'ChatUpdateAssistantBlocksReplace';
    blocks: Array<GqlSChatAssistantBodyBlock>;
    chatMessageId: Scalars['ID']['output'];
}

export interface GqlSChatUpdateAssistantReasoningChunk {
    __typename?: 'ChatUpdateAssistantReasoningChunk';
    chatMessageId: Scalars['ID']['output'];
    delta: Scalars['String']['output'];
}

export interface GqlSChatUpdateAssistantTextChunk {
    __typename?: 'ChatUpdateAssistantTextChunk';
    chatMessageId: Scalars['ID']['output'];
    delta: Scalars['String']['output'];
}

export interface GqlSChatUpdateAssistantTextClear {
    __typename?: 'ChatUpdateAssistantTextClear';
    chatMessageId: Scalars['ID']['output'];
}

export interface GqlSChatUpdateMessageAppended {
    __typename?: 'ChatUpdateMessageAppended';
    message: GqlSChatMessage;
}

export interface GqlSChatUpdateTurnEnded {
    __typename?: 'ChatUpdateTurnEnded';
    generationId: Scalars['ID']['output'];
}

export interface GqlSFileUpload {
    __typename?: 'FileUpload';
    fileUploadId: Scalars['ID']['output'];
    filename: Scalars['String']['output'];
    mediaType: Scalars['String']['output'];
    size: Scalars['Int']['output'];
    url: Scalars['String']['output'];
}

export interface GqlSHighRiskZone {
    __typename?: 'HighRiskZone';
    name: Scalars['String']['output'];
    ring: Array<GqlSLatLon>;
    zoneId: Scalars['ID']['output'];
}

export interface GqlSIncident {
    __typename?: 'Incident';
    closedAtSimMs?: Maybe<Scalars['Float']['output']>;
    incidentId: Scalars['ID']['output'];
    maxRiskScore: Scalars['Int']['output'];
    mmsi: Scalars['ID']['output'];
    openedAtSimMs: Scalars['Float']['output'];
    status: GqlSIncidentStatus;
    timeline: Array<GqlSIncidentTimelineEvent>;
}

export type GqlSIncidentStatus = 'acknowledged' | 'closed' | 'open';

export interface GqlSIncidentTimelineEvent {
    __typename?: 'IncidentTimelineEvent';
    detectedAtSimMs: Scalars['Float']['output'];
    eventId: Scalars['ID']['output'];
    eventType: Scalars['String']['output'];
    explanation: Scalars['String']['output'];
    riskChange?: Maybe<Scalars['Int']['output']>;
    source: Scalars['String']['output'];
}

export interface GqlSLatLon {
    __typename?: 'LatLon';
    lat: Scalars['Float']['output'];
    lon: Scalars['Float']['output'];
}

export interface GqlSMutation {
    __typename?: 'Mutation';
    admin: GqlSAdminMutation;
    session: GqlSSessionMutation;
    user: GqlSUserMutation;
    userCreate: GqlSMutationResult;
}

export type GqlSMutationUserCreateArgs = {
    user: GqlSUserCreate;
};

export interface GqlSMutationResult {
    __typename?: 'MutationResult';
    referenceId?: Maybe<Scalars['ID']['output']>;
    success: Scalars['Boolean']['output'];
}

export interface GqlSOsintAlert {
    __typename?: 'OsintAlert';
    alertId: Scalars['ID']['output'];
    body: Scalars['String']['output'];
    issuedAt: Scalars['DateTime']['output'];
    region: Scalars['String']['output'];
    relevanceTags: Array<Scalars['String']['output']>;
    source: Scalars['String']['output'];
    title: Scalars['String']['output'];
}

export interface GqlSProtectedAsset {
    __typename?: 'ProtectedAsset';
    assetId: Scalars['ID']['output'];
    name: Scalars['String']['output'];
    path: Array<GqlSLatLon>;
    riskRadiusNm: Scalars['Float']['output'];
    type: GqlSProtectedAssetType;
}

export type GqlSProtectedAssetType = 'cable' | 'harbor' | 'pipeline' | 'restrictedZone' | 'windFarm';

export interface GqlSQuery {
    __typename?: 'Query';
    currentSession: GqlSSession;
}

export interface GqlSRiskEvent {
    __typename?: 'RiskEvent';
    detectedAtSimMs: Scalars['Float']['output'];
    explanation: Scalars['String']['output'];
    mmsi: Scalars['ID']['output'];
    newScore: Scalars['Int']['output'];
    previousScore: Scalars['Int']['output'];
    riskEventId: Scalars['ID']['output'];
    rule: GqlSRiskRule;
    scoreDelta: Scalars['Int']['output'];
    source: Scalars['String']['output'];
}

export interface GqlSRiskFactor {
    __typename?: 'RiskFactor';
    explanation: Scalars['String']['output'];
    rule: GqlSRiskRule;
    scoreDelta: Scalars['Int']['output'];
    source: Scalars['String']['output'];
}

export type GqlSRiskLevel = 'green' | 'orange' | 'red' | 'yellow';

export type GqlSRiskRule =
    | 'aisDark'
    | 'aisRadarMismatch'
    | 'baseline'
    | 'headingZigZag'
    | 'impossibleJump'
    | 'loitering'
    | 'nearProtectedAsset'
    | 'speedDrop'
    | 'zoneEntry';

export type GqlSRiskTrend = 'falling' | 'rising' | 'stable';

export interface GqlSScenarioSummary {
    __typename?: 'ScenarioSummary';
    description: Scalars['String']['output'];
    scenarioId: Scalars['ID']['output'];
    title: Scalars['String']['output'];
}

export interface GqlSSession {
    __typename?: 'Session';
    chat: GqlSChat;
    scenarios: Array<GqlSScenarioSummary>;
    sessionId: Scalars['ID']['output'];
    user?: Maybe<GqlSUser>;
    watch: GqlSWatchState;
}

export type GqlSSessionChatArgs = {
    chatId: Scalars['ID']['input'];
};

export interface GqlSSessionMutation {
    __typename?: 'SessionMutation';
    /** Drop this session’s viewport contribution from the AISStream union. */
    aisViewportClear: GqlSMutationResult;
    /**
     * Report the watch chart viewport so AISStream can union it into the live
     * subscription (alongside AISSTREAM_BBOX). Spans over 5° are hard-skipped.
     */
    aisViewportReport: GqlSMutationResult;
    alertAcknowledge?: Maybe<GqlSWatchState>;
    chatInputCollectionRespond?: Maybe<GqlSChatMessageCreateResult>;
    chatMessageCreate?: Maybe<GqlSChatMessageCreateResult>;
    chatToolApprovalRespond?: Maybe<GqlSChatMessageCreateResult>;
    /** Enable or disable the Galaxy Leader mock AIS feeder (off by default). */
    mockAisSetEnabled?: Maybe<GqlSWatchState>;
    scenarioReset?: Maybe<GqlSWatchState>;
    vesselIntelligenceRequest: GqlSMutationResult;
    vesselSelect?: Maybe<GqlSWatchState>;
}

export type GqlSSessionMutationAisViewportReportArgs = {
    eastLon: Scalars['Float']['input'];
    northLat: Scalars['Float']['input'];
    southLat: Scalars['Float']['input'];
    westLon: Scalars['Float']['input'];
};

export type GqlSSessionMutationAlertAcknowledgeArgs = {
    incidentId: Scalars['ID']['input'];
};

export type GqlSSessionMutationChatInputCollectionRespondArgs = {
    answers: Array<GqlSChatMessageUserInputAnswerCreate>;
    assistantOptions: GqlSChatAssistantOptions;
    collectionMessageId: Scalars['ID']['input'];
};

export type GqlSSessionMutationChatMessageCreateArgs = {
    assistantOptions: GqlSChatAssistantOptions;
    chatId?: InputMaybe<Scalars['ID']['input']>;
    fileUploadIds?: InputMaybe<Array<Scalars['ID']['input']>>;
    message: Scalars['String']['input'];
};

export type GqlSSessionMutationChatToolApprovalRespondArgs = {
    approvalId: Scalars['String']['input'];
    approved: Scalars['Boolean']['input'];
    assistantOptions: GqlSChatAssistantOptions;
    reason?: InputMaybe<Scalars['String']['input']>;
};

export type GqlSSessionMutationMockAisSetEnabledArgs = {
    enabled: Scalars['Boolean']['input'];
};

export type GqlSSessionMutationVesselIntelligenceRequestArgs = {
    mmsi: Scalars['ID']['input'];
};

export type GqlSSessionMutationVesselSelectArgs = {
    mmsi?: InputMaybe<Scalars['ID']['input']>;
};

export type GqlSSessionUpdate = GqlSSessionUpdateAnomalyAppended | GqlSSessionUpdateIntelligence | GqlSSessionUpdateWatchSnapshot;

export interface GqlSSessionUpdateAnomalyAppended {
    __typename?: 'SessionUpdateAnomalyAppended';
    anomaly: GqlSAnomaly;
}

export interface GqlSSessionUpdateIntelligence {
    __typename?: 'SessionUpdateIntelligence';
    intelligence: GqlSVesselIntelligence;
}

export interface GqlSSessionUpdateWatchSnapshot {
    __typename?: 'SessionUpdateWatchSnapshot';
    watch: GqlSWatchState;
}

export interface GqlSSubscription {
    __typename?: 'Subscription';
    chatUpdates: GqlSChatUpdate;
    sessionUpdates: GqlSSessionUpdate;
    userUpdates: GqlSUser;
}

export type GqlSSubscriptionChatUpdatesArgs = {
    generationId: Scalars['ID']['input'];
};

export interface GqlSUser {
    __typename?: 'User';
    admin?: Maybe<GqlSAdmin>;
    name: Scalars['String']['output'];
    userId: Scalars['ID']['output'];
}

export type GqlSUserCreate = {
    name: Scalars['String']['input'];
};

export interface GqlSUserMutation {
    __typename?: 'UserMutation';
    chatInputCollectionRespond?: Maybe<GqlSChatMessageCreateResult>;
    chatMessageCreate?: Maybe<GqlSChatMessageCreateResult>;
    chatToolApprovalRespond?: Maybe<GqlSChatMessageCreateResult>;
    terminateSessions: GqlSMutationResult;
    userUpdate: GqlSMutationResult;
}

export type GqlSUserMutationChatInputCollectionRespondArgs = {
    answers: Array<GqlSChatMessageUserInputAnswerCreate>;
    assistantOptions: GqlSChatAssistantOptions;
    collectionMessageId: Scalars['ID']['input'];
};

export type GqlSUserMutationChatMessageCreateArgs = {
    assistantOptions: GqlSChatAssistantOptions;
    chatId?: InputMaybe<Scalars['ID']['input']>;
    fileUploadIds?: InputMaybe<Array<Scalars['ID']['input']>>;
    message: Scalars['String']['input'];
};

export type GqlSUserMutationChatToolApprovalRespondArgs = {
    approvalId: Scalars['String']['input'];
    approved: Scalars['Boolean']['input'];
    assistantOptions: GqlSChatAssistantOptions;
    reason?: InputMaybe<Scalars['String']['input']>;
};

export type GqlSUserMutationTerminateSessionsArgs = {
    sessionIds: Array<Scalars['ID']['input']>;
};

export type GqlSUserMutationUserUpdateArgs = {
    user: GqlSUserUpdate;
};

export type GqlSUserUpdate = {
    name: Scalars['String']['input'];
};

export interface GqlSVessel {
    __typename?: 'Vessel';
    activeFactors: Array<GqlSRiskFactor>;
    aisDark: Scalars['Boolean']['output'];
    callSign?: Maybe<Scalars['String']['output']>;
    dataSource: GqlSVesselDataSource;
    flag: Scalars['String']['output'];
    imo?: Maybe<Scalars['String']['output']>;
    mmsi: Scalars['ID']['output'];
    name: Scalars['String']['output'];
    nearestAssetDistanceNm?: Maybe<Scalars['Float']['output']>;
    nearestAssetId?: Maybe<Scalars['ID']['output']>;
    position?: Maybe<GqlSVesselPosition>;
    radarPosition?: Maybe<GqlSLatLon>;
    riskLevel: GqlSRiskLevel;
    riskScore: Scalars['Int']['output'];
    riskTrend: GqlSRiskTrend;
    shipType: Scalars['String']['output'];
    trackTail: Array<GqlSLatLon>;
}

export type GqlSVesselDataSource = 'aisstream' | 'mock';

export interface GqlSVesselIntelligence {
    __typename?: 'VesselIntelligence';
    citations: Array<GqlSVesselIntelligenceCitation>;
    /** False while structured fields are still streaming in; true when the brief is final. */
    complete: Scalars['Boolean']['output'];
    generatedAt: Scalars['DateTime']['output'];
    mmsi: Scalars['ID']['output'];
    playbookSteps: Array<Scalars['String']['output']>;
    status: Scalars['String']['output'];
    summary: Scalars['String']['output'];
    vesselName: Scalars['String']['output'];
    whyFlagged: Scalars['String']['output'];
}

export interface GqlSVesselIntelligenceCitation {
    __typename?: 'VesselIntelligenceCitation';
    label: Scalars['String']['output'];
    source: Scalars['String']['output'];
}

export interface GqlSVesselPosition {
    __typename?: 'VesselPosition';
    cog: Scalars['Float']['output'];
    heading: Scalars['Float']['output'];
    lat: Scalars['Float']['output'];
    lon: Scalars['Float']['output'];
    mmsi: Scalars['ID']['output'];
    navStatus?: Maybe<Scalars['String']['output']>;
    sog: Scalars['Float']['output'];
    timestamp: Scalars['DateTime']['output'];
}

export interface GqlSWatchDataSourceStatus {
    __typename?: 'WatchDataSourceStatus';
    enabled: Scalars['Boolean']['output'];
    id: GqlSVesselDataSource;
    status: Scalars['String']['output'];
    vesselCount: Scalars['Int']['output'];
}

export interface GqlSWatchState {
    __typename?: 'WatchState';
    anomalies: Array<GqlSAnomaly>;
    centerLat: Scalars['Float']['output'];
    centerLon: Scalars['Float']['output'];
    dataSources: Array<GqlSWatchDataSourceStatus>;
    description: Scalars['String']['output'];
    highRiskZones: Array<GqlSHighRiskZone>;
    incidents: Array<GqlSIncident>;
    osintAlerts: Array<GqlSOsintAlert>;
    protectedAssets: Array<GqlSProtectedAsset>;
    riskEvents: Array<GqlSRiskEvent>;
    scenarioId: Scalars['ID']['output'];
    selectedMmsi?: Maybe<Scalars['ID']['output']>;
    simMs: Scalars['Float']['output'];
    status: GqlSWatchStatus;
    title: Scalars['String']['output'];
    vessels: Array<GqlSVessel>;
    zoom: Scalars['Float']['output'];
}

export type GqlSWatchStatus = 'completed' | 'running';

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
    resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<
    TResult,
    TParent = Record<PropertyKey, never>,
    TContext = Record<PropertyKey, never>,
    TArgs = Record<PropertyKey, never>,
> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
    parent: TParent,
    args: TArgs,
    context: TContext,
    info: GraphQLResolveInfo,
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
    parent: TParent,
    args: TArgs,
    context: TContext,
    info: GraphQLResolveInfo,
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
    parent: TParent,
    args: TArgs,
    context: TContext,
    info: GraphQLResolveInfo,
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
    subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
    resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
    subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
    resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
    SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs> | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<
    TResult,
    TKey extends string,
    TParent = Record<PropertyKey, never>,
    TContext = Record<PropertyKey, never>,
    TArgs = Record<PropertyKey, never>,
> =
    | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
    | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
    parent: TParent,
    context: TContext,
    info: GraphQLResolveInfo,
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
    obj: T,
    context: TContext,
    info: GraphQLResolveInfo,
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<
    TResult = Record<PropertyKey, never>,
    TParent = Record<PropertyKey, never>,
    TContext = Record<PropertyKey, never>,
    TArgs = Record<PropertyKey, never>,
> = (
    next: NextResolverFn<TResult>,
    parent: TParent,
    args: TArgs,
    context: TContext,
    info: GraphQLResolveInfo,
) => TResult | Promise<TResult>;

/** Mapping of union types */
export type GqlSResolversUnionTypes<_RefType extends Record<string, unknown>> = ResolversObject<{
    ChatAssistantBodyBlock: GqlSChatAssistantBodyBlockCardList | GqlSChatAssistantBodyBlockMarkdown;
    ChatAssistantInput:
        | GqlSChatAssistantInputBoolean
        | GqlSChatAssistantInputDate
        | GqlSChatAssistantInputDateRange
        | GqlSChatAssistantInputDateTime
        | GqlSChatAssistantInputMultiSelect
        | GqlSChatAssistantInputSingleSelect
        | GqlSChatAssistantInputText
        | GqlSChatAssistantInputTime;
    ChatAssistantInputValue:
        | GqlSChatAssistantInputValueBoolean
        | GqlSChatAssistantInputValueDate
        | GqlSChatAssistantInputValueDateRange
        | GqlSChatAssistantInputValueDateTime
        | GqlSChatAssistantInputValueString
        | GqlSChatAssistantInputValueStringList
        | GqlSChatAssistantInputValueTime;
    ChatMessage:
        | (Omit<GqlSChatMessageAssistantInputCollection, 'inputs'> & { inputs: Array<_RefType['ChatAssistantInput']> })
        | (Omit<GqlSChatMessageAssistantText, 'blocks'> & { blocks: Array<_RefType['ChatAssistantBodyBlock']> })
        | GqlSChatMessageToolApprovalRequest
        | GqlSChatMessageToolApprovalResponse
        | GqlSChatMessageToolCall
        | GqlSChatMessageUser
        | (Omit<GqlSChatMessageUserInput, 'answers'> & { answers: Array<_RefType['ChatMessageUserInputAnswer']> });
    ChatUpdate:
        | GqlSChatUpdateAssistantBlocksClear
        | (Omit<GqlSChatUpdateAssistantBlocksReplace, 'blocks'> & { blocks: Array<_RefType['ChatAssistantBodyBlock']> })
        | GqlSChatUpdateAssistantReasoningChunk
        | GqlSChatUpdateAssistantTextChunk
        | GqlSChatUpdateAssistantTextClear
        | (Omit<GqlSChatUpdateMessageAppended, 'message'> & { message: _RefType['ChatMessage'] })
        | GqlSChatUpdateTurnEnded;
    SessionUpdate: GqlSSessionUpdateAnomalyAppended | GqlSSessionUpdateIntelligence | GqlSSessionUpdateWatchSnapshot;
}>;

/** Mapping between all available schema types and the resolvers types */
export type GqlSResolversTypes = ResolversObject<{
    Admin: ResolverTypeWrapper<GqlSAdmin>;
    AdminMutation: ResolverTypeWrapper<GqlSAdminMutation>;
    Anomaly: ResolverTypeWrapper<GqlSAnomaly>;
    AnomalyKind: GqlSAnomalyKind;
    AnomalySeverity: GqlSAnomalySeverity;
    Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
    Chat: ResolverTypeWrapper<Omit<GqlSChat, 'messages'> & { messages: Array<GqlSResolversTypes['ChatMessage']> }>;
    ChatAssistantArtifactCard: ResolverTypeWrapper<GqlSChatAssistantArtifactCard>;
    ChatAssistantBodyBlock: ResolverTypeWrapper<GqlSResolversUnionTypes<GqlSResolversTypes>['ChatAssistantBodyBlock']>;
    ChatAssistantBodyBlockCardList: ResolverTypeWrapper<GqlSChatAssistantBodyBlockCardList>;
    ChatAssistantBodyBlockMarkdown: ResolverTypeWrapper<GqlSChatAssistantBodyBlockMarkdown>;
    ChatAssistantInput: ResolverTypeWrapper<GqlSResolversUnionTypes<GqlSResolversTypes>['ChatAssistantInput']>;
    ChatAssistantInputBoolean: ResolverTypeWrapper<GqlSChatAssistantInputBoolean>;
    ChatAssistantInputDate: ResolverTypeWrapper<GqlSChatAssistantInputDate>;
    ChatAssistantInputDateRange: ResolverTypeWrapper<GqlSChatAssistantInputDateRange>;
    ChatAssistantInputDateTime: ResolverTypeWrapper<GqlSChatAssistantInputDateTime>;
    ChatAssistantInputMultiSelect: ResolverTypeWrapper<GqlSChatAssistantInputMultiSelect>;
    ChatAssistantInputSingleSelect: ResolverTypeWrapper<GqlSChatAssistantInputSingleSelect>;
    ChatAssistantInputText: ResolverTypeWrapper<GqlSChatAssistantInputText>;
    ChatAssistantInputTime: ResolverTypeWrapper<GqlSChatAssistantInputTime>;
    ChatAssistantInputValue: ResolverTypeWrapper<GqlSResolversUnionTypes<GqlSResolversTypes>['ChatAssistantInputValue']>;
    ChatAssistantInputValueBoolean: ResolverTypeWrapper<GqlSChatAssistantInputValueBoolean>;
    ChatAssistantInputValueDate: ResolverTypeWrapper<GqlSChatAssistantInputValueDate>;
    ChatAssistantInputValueDateRange: ResolverTypeWrapper<GqlSChatAssistantInputValueDateRange>;
    ChatAssistantInputValueDateTime: ResolverTypeWrapper<GqlSChatAssistantInputValueDateTime>;
    ChatAssistantInputValueKind: GqlSChatAssistantInputValueKind;
    ChatAssistantInputValueString: ResolverTypeWrapper<GqlSChatAssistantInputValueString>;
    ChatAssistantInputValueStringList: ResolverTypeWrapper<GqlSChatAssistantInputValueStringList>;
    ChatAssistantInputValueTime: ResolverTypeWrapper<GqlSChatAssistantInputValueTime>;
    ChatAssistantOptions: GqlSChatAssistantOptions;
    ChatMessage: ResolverTypeWrapper<GqlSResolversUnionTypes<GqlSResolversTypes>['ChatMessage']>;
    ChatMessageAssistantInputCollection: ResolverTypeWrapper<
        Omit<GqlSChatMessageAssistantInputCollection, 'inputs'> & { inputs: Array<GqlSResolversTypes['ChatAssistantInput']> }
    >;
    ChatMessageAssistantText: ResolverTypeWrapper<
        Omit<GqlSChatMessageAssistantText, 'blocks'> & { blocks: Array<GqlSResolversTypes['ChatAssistantBodyBlock']> }
    >;
    ChatMessageCreateResult: ResolverTypeWrapper<GqlSChatMessageCreateResult>;
    ChatMessageGeneration: ResolverTypeWrapper<GqlSChatMessageGeneration>;
    ChatMessageSource: ResolverTypeWrapper<GqlSChatMessageSource>;
    ChatMessageToolApprovalRequest: ResolverTypeWrapper<GqlSChatMessageToolApprovalRequest>;
    ChatMessageToolApprovalResponse: ResolverTypeWrapper<GqlSChatMessageToolApprovalResponse>;
    ChatMessageToolCall: ResolverTypeWrapper<GqlSChatMessageToolCall>;
    ChatMessageUser: ResolverTypeWrapper<GqlSChatMessageUser>;
    ChatMessageUserInput: ResolverTypeWrapper<
        Omit<GqlSChatMessageUserInput, 'answers'> & { answers: Array<GqlSResolversTypes['ChatMessageUserInputAnswer']> }
    >;
    ChatMessageUserInputAnswer: ResolverTypeWrapper<
        Omit<GqlSChatMessageUserInputAnswer, 'value'> & { value: GqlSResolversTypes['ChatAssistantInputValue'] }
    >;
    ChatMessageUserInputAnswerCreate: GqlSChatMessageUserInputAnswerCreate;
    ChatUpdate: ResolverTypeWrapper<GqlSResolversUnionTypes<GqlSResolversTypes>['ChatUpdate']>;
    ChatUpdateAssistantBlocksClear: ResolverTypeWrapper<GqlSChatUpdateAssistantBlocksClear>;
    ChatUpdateAssistantBlocksReplace: ResolverTypeWrapper<
        Omit<GqlSChatUpdateAssistantBlocksReplace, 'blocks'> & { blocks: Array<GqlSResolversTypes['ChatAssistantBodyBlock']> }
    >;
    ChatUpdateAssistantReasoningChunk: ResolverTypeWrapper<GqlSChatUpdateAssistantReasoningChunk>;
    ChatUpdateAssistantTextChunk: ResolverTypeWrapper<GqlSChatUpdateAssistantTextChunk>;
    ChatUpdateAssistantTextClear: ResolverTypeWrapper<GqlSChatUpdateAssistantTextClear>;
    ChatUpdateMessageAppended: ResolverTypeWrapper<
        Omit<GqlSChatUpdateMessageAppended, 'message'> & { message: GqlSResolversTypes['ChatMessage'] }
    >;
    ChatUpdateTurnEnded: ResolverTypeWrapper<GqlSChatUpdateTurnEnded>;
    Date: ResolverTypeWrapper<Scalars['Date']['output']>;
    DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
    FileUpload: ResolverTypeWrapper<GqlSFileUpload>;
    Float: ResolverTypeWrapper<Scalars['Float']['output']>;
    HighRiskZone: ResolverTypeWrapper<GqlSHighRiskZone>;
    ID: ResolverTypeWrapper<Scalars['ID']['output']>;
    Incident: ResolverTypeWrapper<GqlSIncident>;
    IncidentStatus: GqlSIncidentStatus;
    IncidentTimelineEvent: ResolverTypeWrapper<GqlSIncidentTimelineEvent>;
    Int: ResolverTypeWrapper<Scalars['Int']['output']>;
    JSON: ResolverTypeWrapper<Scalars['JSON']['output']>;
    LatLon: ResolverTypeWrapper<GqlSLatLon>;
    Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
    MutationResult: ResolverTypeWrapper<GqlSMutationResult>;
    OsintAlert: ResolverTypeWrapper<GqlSOsintAlert>;
    ProtectedAsset: ResolverTypeWrapper<GqlSProtectedAsset>;
    ProtectedAssetType: GqlSProtectedAssetType;
    Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
    RiskEvent: ResolverTypeWrapper<GqlSRiskEvent>;
    RiskFactor: ResolverTypeWrapper<GqlSRiskFactor>;
    RiskLevel: GqlSRiskLevel;
    RiskRule: GqlSRiskRule;
    RiskTrend: GqlSRiskTrend;
    ScenarioSummary: ResolverTypeWrapper<GqlSScenarioSummary>;
    Session: ResolverTypeWrapper<Omit<GqlSSession, 'chat'> & { chat: GqlSResolversTypes['Chat'] }>;
    SessionMutation: ResolverTypeWrapper<GqlSSessionMutation>;
    SessionUpdate: ResolverTypeWrapper<GqlSResolversUnionTypes<GqlSResolversTypes>['SessionUpdate']>;
    SessionUpdateAnomalyAppended: ResolverTypeWrapper<GqlSSessionUpdateAnomalyAppended>;
    SessionUpdateIntelligence: ResolverTypeWrapper<GqlSSessionUpdateIntelligence>;
    SessionUpdateWatchSnapshot: ResolverTypeWrapper<GqlSSessionUpdateWatchSnapshot>;
    String: ResolverTypeWrapper<Scalars['String']['output']>;
    Subscription: ResolverTypeWrapper<Record<PropertyKey, never>>;
    User: ResolverTypeWrapper<GqlSUser>;
    UserCreate: GqlSUserCreate;
    UserMutation: ResolverTypeWrapper<GqlSUserMutation>;
    UserUpdate: GqlSUserUpdate;
    Vessel: ResolverTypeWrapper<GqlSVessel>;
    VesselDataSource: GqlSVesselDataSource;
    VesselIntelligence: ResolverTypeWrapper<GqlSVesselIntelligence>;
    VesselIntelligenceCitation: ResolverTypeWrapper<GqlSVesselIntelligenceCitation>;
    VesselPosition: ResolverTypeWrapper<GqlSVesselPosition>;
    WatchDataSourceStatus: ResolverTypeWrapper<GqlSWatchDataSourceStatus>;
    WatchState: ResolverTypeWrapper<GqlSWatchState>;
    WatchStatus: GqlSWatchStatus;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type GqlSResolversParentTypes = ResolversObject<{
    Admin: GqlSAdmin;
    AdminMutation: GqlSAdminMutation;
    Anomaly: GqlSAnomaly;
    Boolean: Scalars['Boolean']['output'];
    Chat: Omit<GqlSChat, 'messages'> & { messages: Array<GqlSResolversParentTypes['ChatMessage']> };
    ChatAssistantArtifactCard: GqlSChatAssistantArtifactCard;
    ChatAssistantBodyBlock: GqlSResolversUnionTypes<GqlSResolversParentTypes>['ChatAssistantBodyBlock'];
    ChatAssistantBodyBlockCardList: GqlSChatAssistantBodyBlockCardList;
    ChatAssistantBodyBlockMarkdown: GqlSChatAssistantBodyBlockMarkdown;
    ChatAssistantInput: GqlSResolversUnionTypes<GqlSResolversParentTypes>['ChatAssistantInput'];
    ChatAssistantInputBoolean: GqlSChatAssistantInputBoolean;
    ChatAssistantInputDate: GqlSChatAssistantInputDate;
    ChatAssistantInputDateRange: GqlSChatAssistantInputDateRange;
    ChatAssistantInputDateTime: GqlSChatAssistantInputDateTime;
    ChatAssistantInputMultiSelect: GqlSChatAssistantInputMultiSelect;
    ChatAssistantInputSingleSelect: GqlSChatAssistantInputSingleSelect;
    ChatAssistantInputText: GqlSChatAssistantInputText;
    ChatAssistantInputTime: GqlSChatAssistantInputTime;
    ChatAssistantInputValue: GqlSResolversUnionTypes<GqlSResolversParentTypes>['ChatAssistantInputValue'];
    ChatAssistantInputValueBoolean: GqlSChatAssistantInputValueBoolean;
    ChatAssistantInputValueDate: GqlSChatAssistantInputValueDate;
    ChatAssistantInputValueDateRange: GqlSChatAssistantInputValueDateRange;
    ChatAssistantInputValueDateTime: GqlSChatAssistantInputValueDateTime;
    ChatAssistantInputValueString: GqlSChatAssistantInputValueString;
    ChatAssistantInputValueStringList: GqlSChatAssistantInputValueStringList;
    ChatAssistantInputValueTime: GqlSChatAssistantInputValueTime;
    ChatAssistantOptions: GqlSChatAssistantOptions;
    ChatMessage: GqlSResolversUnionTypes<GqlSResolversParentTypes>['ChatMessage'];
    ChatMessageAssistantInputCollection: Omit<GqlSChatMessageAssistantInputCollection, 'inputs'> & {
        inputs: Array<GqlSResolversParentTypes['ChatAssistantInput']>;
    };
    ChatMessageAssistantText: Omit<GqlSChatMessageAssistantText, 'blocks'> & {
        blocks: Array<GqlSResolversParentTypes['ChatAssistantBodyBlock']>;
    };
    ChatMessageCreateResult: GqlSChatMessageCreateResult;
    ChatMessageGeneration: GqlSChatMessageGeneration;
    ChatMessageSource: GqlSChatMessageSource;
    ChatMessageToolApprovalRequest: GqlSChatMessageToolApprovalRequest;
    ChatMessageToolApprovalResponse: GqlSChatMessageToolApprovalResponse;
    ChatMessageToolCall: GqlSChatMessageToolCall;
    ChatMessageUser: GqlSChatMessageUser;
    ChatMessageUserInput: Omit<GqlSChatMessageUserInput, 'answers'> & {
        answers: Array<GqlSResolversParentTypes['ChatMessageUserInputAnswer']>;
    };
    ChatMessageUserInputAnswer: Omit<GqlSChatMessageUserInputAnswer, 'value'> & {
        value: GqlSResolversParentTypes['ChatAssistantInputValue'];
    };
    ChatMessageUserInputAnswerCreate: GqlSChatMessageUserInputAnswerCreate;
    ChatUpdate: GqlSResolversUnionTypes<GqlSResolversParentTypes>['ChatUpdate'];
    ChatUpdateAssistantBlocksClear: GqlSChatUpdateAssistantBlocksClear;
    ChatUpdateAssistantBlocksReplace: Omit<GqlSChatUpdateAssistantBlocksReplace, 'blocks'> & {
        blocks: Array<GqlSResolversParentTypes['ChatAssistantBodyBlock']>;
    };
    ChatUpdateAssistantReasoningChunk: GqlSChatUpdateAssistantReasoningChunk;
    ChatUpdateAssistantTextChunk: GqlSChatUpdateAssistantTextChunk;
    ChatUpdateAssistantTextClear: GqlSChatUpdateAssistantTextClear;
    ChatUpdateMessageAppended: Omit<GqlSChatUpdateMessageAppended, 'message'> & { message: GqlSResolversParentTypes['ChatMessage'] };
    ChatUpdateTurnEnded: GqlSChatUpdateTurnEnded;
    Date: Scalars['Date']['output'];
    DateTime: Scalars['DateTime']['output'];
    FileUpload: GqlSFileUpload;
    Float: Scalars['Float']['output'];
    HighRiskZone: GqlSHighRiskZone;
    ID: Scalars['ID']['output'];
    Incident: GqlSIncident;
    IncidentTimelineEvent: GqlSIncidentTimelineEvent;
    Int: Scalars['Int']['output'];
    JSON: Scalars['JSON']['output'];
    LatLon: GqlSLatLon;
    Mutation: Record<PropertyKey, never>;
    MutationResult: GqlSMutationResult;
    OsintAlert: GqlSOsintAlert;
    ProtectedAsset: GqlSProtectedAsset;
    Query: Record<PropertyKey, never>;
    RiskEvent: GqlSRiskEvent;
    RiskFactor: GqlSRiskFactor;
    ScenarioSummary: GqlSScenarioSummary;
    Session: Omit<GqlSSession, 'chat'> & { chat: GqlSResolversParentTypes['Chat'] };
    SessionMutation: GqlSSessionMutation;
    SessionUpdate: GqlSResolversUnionTypes<GqlSResolversParentTypes>['SessionUpdate'];
    SessionUpdateAnomalyAppended: GqlSSessionUpdateAnomalyAppended;
    SessionUpdateIntelligence: GqlSSessionUpdateIntelligence;
    SessionUpdateWatchSnapshot: GqlSSessionUpdateWatchSnapshot;
    String: Scalars['String']['output'];
    Subscription: Record<PropertyKey, never>;
    User: GqlSUser;
    UserCreate: GqlSUserCreate;
    UserMutation: GqlSUserMutation;
    UserUpdate: GqlSUserUpdate;
    Vessel: GqlSVessel;
    VesselIntelligence: GqlSVesselIntelligence;
    VesselIntelligenceCitation: GqlSVesselIntelligenceCitation;
    VesselPosition: GqlSVesselPosition;
    WatchDataSourceStatus: GqlSWatchDataSourceStatus;
    WatchState: GqlSWatchState;
}>;

export type GqlSAdminResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['Admin'] = GqlSResolversParentTypes['Admin'],
> = ResolversObject<{
    ok?: Resolver<GqlSResolversTypes['Boolean'], ParentType, ContextType>;
}>;

export type GqlSAdminMutationResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['AdminMutation'] = GqlSResolversParentTypes['AdminMutation'],
> = ResolversObject<{
    ok?: Resolver<GqlSResolversTypes['Boolean'], ParentType, ContextType>;
}>;

export type GqlSAnomalyResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['Anomaly'] = GqlSResolversParentTypes['Anomaly'],
> = ResolversObject<{
    anomalyId?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
    detectedAtSimMs?: Resolver<GqlSResolversTypes['Float'], ParentType, ContextType>;
    evidence?: Resolver<GqlSResolversTypes['JSON'], ParentType, ContextType>;
    kind?: Resolver<GqlSResolversTypes['AnomalyKind'], ParentType, ContextType>;
    mmsi?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
    severity?: Resolver<GqlSResolversTypes['AnomalySeverity'], ParentType, ContextType>;
    summary?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    title?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
}>;

export type GqlSChatResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['Chat'] = GqlSResolversParentTypes['Chat'],
> = ResolversObject<{
    chatId?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
    lastModifiedAt?: Resolver<GqlSResolversTypes['DateTime'], ParentType, ContextType>;
    messages?: Resolver<Array<GqlSResolversTypes['ChatMessage']>, ParentType, ContextType>;
    title?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
}>;

export type GqlSChatAssistantArtifactCardResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ChatAssistantArtifactCard'] = GqlSResolversParentTypes['ChatAssistantArtifactCard'],
> = ResolversObject<{
    buttonTitle?: Resolver<Maybe<GqlSResolversTypes['String']>, ParentType, ContextType>;
    description?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    href?: Resolver<Maybe<GqlSResolversTypes['String']>, ParentType, ContextType>;
    imageUrl?: Resolver<Maybe<GqlSResolversTypes['String']>, ParentType, ContextType>;
    price?: Resolver<Maybe<GqlSResolversTypes['String']>, ParentType, ContextType>;
    title?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
}>;

export type GqlSChatAssistantBodyBlockResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ChatAssistantBodyBlock'] = GqlSResolversParentTypes['ChatAssistantBodyBlock'],
> = ResolversObject<{
    __resolveType: TypeResolveFn<'ChatAssistantBodyBlockCardList' | 'ChatAssistantBodyBlockMarkdown', ParentType, ContextType>;
}>;

export type GqlSChatAssistantBodyBlockCardListResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ChatAssistantBodyBlockCardList'] =
        GqlSResolversParentTypes['ChatAssistantBodyBlockCardList'],
> = ResolversObject<{
    cards?: Resolver<Array<GqlSResolversTypes['ChatAssistantArtifactCard']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSChatAssistantBodyBlockMarkdownResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ChatAssistantBodyBlockMarkdown'] =
        GqlSResolversParentTypes['ChatAssistantBodyBlockMarkdown'],
> = ResolversObject<{
    text?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSChatAssistantInputResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ChatAssistantInput'] = GqlSResolversParentTypes['ChatAssistantInput'],
> = ResolversObject<{
    __resolveType: TypeResolveFn<
        | 'ChatAssistantInputBoolean'
        | 'ChatAssistantInputDate'
        | 'ChatAssistantInputDateRange'
        | 'ChatAssistantInputDateTime'
        | 'ChatAssistantInputMultiSelect'
        | 'ChatAssistantInputSingleSelect'
        | 'ChatAssistantInputText'
        | 'ChatAssistantInputTime',
        ParentType,
        ContextType
    >;
}>;

export type GqlSChatAssistantInputBooleanResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ChatAssistantInputBoolean'] = GqlSResolversParentTypes['ChatAssistantInputBoolean'],
> = ResolversObject<{
    inputId?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
    prompt?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSChatAssistantInputDateResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ChatAssistantInputDate'] = GqlSResolversParentTypes['ChatAssistantInputDate'],
> = ResolversObject<{
    inputId?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
    prompt?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSChatAssistantInputDateRangeResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ChatAssistantInputDateRange'] = GqlSResolversParentTypes['ChatAssistantInputDateRange'],
> = ResolversObject<{
    inputId?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
    prompt?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSChatAssistantInputDateTimeResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ChatAssistantInputDateTime'] = GqlSResolversParentTypes['ChatAssistantInputDateTime'],
> = ResolversObject<{
    inputId?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
    prompt?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSChatAssistantInputMultiSelectResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ChatAssistantInputMultiSelect'] =
        GqlSResolversParentTypes['ChatAssistantInputMultiSelect'],
> = ResolversObject<{
    inputId?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
    options?: Resolver<Array<GqlSResolversTypes['String']>, ParentType, ContextType>;
    prompt?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSChatAssistantInputSingleSelectResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ChatAssistantInputSingleSelect'] =
        GqlSResolversParentTypes['ChatAssistantInputSingleSelect'],
> = ResolversObject<{
    inputId?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
    options?: Resolver<Array<GqlSResolversTypes['String']>, ParentType, ContextType>;
    prompt?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSChatAssistantInputTextResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ChatAssistantInputText'] = GqlSResolversParentTypes['ChatAssistantInputText'],
> = ResolversObject<{
    inputId?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
    prompt?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSChatAssistantInputTimeResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ChatAssistantInputTime'] = GqlSResolversParentTypes['ChatAssistantInputTime'],
> = ResolversObject<{
    inputId?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
    prompt?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSChatAssistantInputValueResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ChatAssistantInputValue'] = GqlSResolversParentTypes['ChatAssistantInputValue'],
> = ResolversObject<{
    __resolveType: TypeResolveFn<
        | 'ChatAssistantInputValueBoolean'
        | 'ChatAssistantInputValueDate'
        | 'ChatAssistantInputValueDateRange'
        | 'ChatAssistantInputValueDateTime'
        | 'ChatAssistantInputValueString'
        | 'ChatAssistantInputValueStringList'
        | 'ChatAssistantInputValueTime',
        ParentType,
        ContextType
    >;
}>;

export type GqlSChatAssistantInputValueBooleanResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ChatAssistantInputValueBoolean'] =
        GqlSResolversParentTypes['ChatAssistantInputValueBoolean'],
> = ResolversObject<{
    boolean?: Resolver<GqlSResolversTypes['Boolean'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSChatAssistantInputValueDateResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ChatAssistantInputValueDate'] = GqlSResolversParentTypes['ChatAssistantInputValueDate'],
> = ResolversObject<{
    date?: Resolver<GqlSResolversTypes['Date'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSChatAssistantInputValueDateRangeResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ChatAssistantInputValueDateRange'] =
        GqlSResolversParentTypes['ChatAssistantInputValueDateRange'],
> = ResolversObject<{
    from?: Resolver<GqlSResolversTypes['Date'], ParentType, ContextType>;
    to?: Resolver<GqlSResolversTypes['Date'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSChatAssistantInputValueDateTimeResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ChatAssistantInputValueDateTime'] =
        GqlSResolversParentTypes['ChatAssistantInputValueDateTime'],
> = ResolversObject<{
    dateTime?: Resolver<GqlSResolversTypes['DateTime'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSChatAssistantInputValueStringResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ChatAssistantInputValueString'] =
        GqlSResolversParentTypes['ChatAssistantInputValueString'],
> = ResolversObject<{
    value?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSChatAssistantInputValueStringListResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ChatAssistantInputValueStringList'] =
        GqlSResolversParentTypes['ChatAssistantInputValueStringList'],
> = ResolversObject<{
    values?: Resolver<Array<GqlSResolversTypes['String']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSChatAssistantInputValueTimeResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ChatAssistantInputValueTime'] = GqlSResolversParentTypes['ChatAssistantInputValueTime'],
> = ResolversObject<{
    time?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSChatMessageResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ChatMessage'] = GqlSResolversParentTypes['ChatMessage'],
> = ResolversObject<{
    __resolveType: TypeResolveFn<
        | 'ChatMessageAssistantInputCollection'
        | 'ChatMessageAssistantText'
        | 'ChatMessageToolApprovalRequest'
        | 'ChatMessageToolApprovalResponse'
        | 'ChatMessageToolCall'
        | 'ChatMessageUser'
        | 'ChatMessageUserInput',
        ParentType,
        ContextType
    >;
}>;

export type GqlSChatMessageAssistantInputCollectionResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ChatMessageAssistantInputCollection'] =
        GqlSResolversParentTypes['ChatMessageAssistantInputCollection'],
> = ResolversObject<{
    chatMessageId?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
    createdAt?: Resolver<GqlSResolversTypes['DateTime'], ParentType, ContextType>;
    generation?: Resolver<Maybe<GqlSResolversTypes['ChatMessageGeneration']>, ParentType, ContextType>;
    inputs?: Resolver<Array<GqlSResolversTypes['ChatAssistantInput']>, ParentType, ContextType>;
    mode?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    prompt?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    reasoning?: Resolver<Maybe<GqlSResolversTypes['String']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSChatMessageAssistantTextResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ChatMessageAssistantText'] = GqlSResolversParentTypes['ChatMessageAssistantText'],
> = ResolversObject<{
    blocks?: Resolver<Array<GqlSResolversTypes['ChatAssistantBodyBlock']>, ParentType, ContextType>;
    body?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    chatMessageId?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
    createdAt?: Resolver<GqlSResolversTypes['DateTime'], ParentType, ContextType>;
    generation?: Resolver<Maybe<GqlSResolversTypes['ChatMessageGeneration']>, ParentType, ContextType>;
    reasoning?: Resolver<Maybe<GqlSResolversTypes['String']>, ParentType, ContextType>;
    sources?: Resolver<Array<GqlSResolversTypes['ChatMessageSource']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSChatMessageCreateResultResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ChatMessageCreateResult'] = GqlSResolversParentTypes['ChatMessageCreateResult'],
> = ResolversObject<{
    chatId?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
    chatMessageId?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
}>;

export type GqlSChatMessageGenerationResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ChatMessageGeneration'] = GqlSResolversParentTypes['ChatMessageGeneration'],
> = ResolversObject<{
    cachedInputTokens?: Resolver<Maybe<GqlSResolversTypes['Int']>, ParentType, ContextType>;
    inputTokens?: Resolver<Maybe<GqlSResolversTypes['Int']>, ParentType, ContextType>;
    modelId?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    outputTokens?: Resolver<Maybe<GqlSResolversTypes['Int']>, ParentType, ContextType>;
    reasoningTokens?: Resolver<Maybe<GqlSResolversTypes['Int']>, ParentType, ContextType>;
    totalTokens?: Resolver<Maybe<GqlSResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type GqlSChatMessageSourceResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ChatMessageSource'] = GqlSResolversParentTypes['ChatMessageSource'],
> = ResolversObject<{
    title?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    url?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
}>;

export type GqlSChatMessageToolApprovalRequestResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ChatMessageToolApprovalRequest'] =
        GqlSResolversParentTypes['ChatMessageToolApprovalRequest'],
> = ResolversObject<{
    approvalId?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    args?: Resolver<GqlSResolversTypes['JSON'], ParentType, ContextType>;
    chatMessageId?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
    createdAt?: Resolver<GqlSResolversTypes['DateTime'], ParentType, ContextType>;
    generation?: Resolver<Maybe<GqlSResolversTypes['ChatMessageGeneration']>, ParentType, ContextType>;
    reasoning?: Resolver<Maybe<GqlSResolversTypes['String']>, ParentType, ContextType>;
    toolName?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSChatMessageToolApprovalResponseResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ChatMessageToolApprovalResponse'] =
        GqlSResolversParentTypes['ChatMessageToolApprovalResponse'],
> = ResolversObject<{
    approvalId?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    approved?: Resolver<GqlSResolversTypes['Boolean'], ParentType, ContextType>;
    chatMessageId?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
    createdAt?: Resolver<GqlSResolversTypes['DateTime'], ParentType, ContextType>;
    reason?: Resolver<Maybe<GqlSResolversTypes['String']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSChatMessageToolCallResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ChatMessageToolCall'] = GqlSResolversParentTypes['ChatMessageToolCall'],
> = ResolversObject<{
    args?: Resolver<GqlSResolversTypes['JSON'], ParentType, ContextType>;
    chatMessageId?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
    createdAt?: Resolver<GqlSResolversTypes['DateTime'], ParentType, ContextType>;
    generation?: Resolver<Maybe<GqlSResolversTypes['ChatMessageGeneration']>, ParentType, ContextType>;
    parentChatMessageId?: Resolver<Maybe<GqlSResolversTypes['ID']>, ParentType, ContextType>;
    reasoning?: Resolver<Maybe<GqlSResolversTypes['String']>, ParentType, ContextType>;
    toolName?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    toolResult?: Resolver<Maybe<GqlSResolversTypes['JSON']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSChatMessageUserResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ChatMessageUser'] = GqlSResolversParentTypes['ChatMessageUser'],
> = ResolversObject<{
    attachments?: Resolver<Array<GqlSResolversTypes['FileUpload']>, ParentType, ContextType>;
    author?: Resolver<GqlSResolversTypes['User'], ParentType, ContextType>;
    body?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    chatMessageId?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
    createdAt?: Resolver<GqlSResolversTypes['DateTime'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSChatMessageUserInputResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ChatMessageUserInput'] = GqlSResolversParentTypes['ChatMessageUserInput'],
> = ResolversObject<{
    answers?: Resolver<Array<GqlSResolversTypes['ChatMessageUserInputAnswer']>, ParentType, ContextType>;
    author?: Resolver<GqlSResolversTypes['User'], ParentType, ContextType>;
    chatMessageId?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
    collectionMessageId?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
    createdAt?: Resolver<GqlSResolversTypes['DateTime'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSChatMessageUserInputAnswerResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ChatMessageUserInputAnswer'] = GqlSResolversParentTypes['ChatMessageUserInputAnswer'],
> = ResolversObject<{
    inputId?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
    value?: Resolver<GqlSResolversTypes['ChatAssistantInputValue'], ParentType, ContextType>;
}>;

export type GqlSChatUpdateResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ChatUpdate'] = GqlSResolversParentTypes['ChatUpdate'],
> = ResolversObject<{
    __resolveType: TypeResolveFn<
        | 'ChatUpdateAssistantBlocksClear'
        | 'ChatUpdateAssistantBlocksReplace'
        | 'ChatUpdateAssistantReasoningChunk'
        | 'ChatUpdateAssistantTextChunk'
        | 'ChatUpdateAssistantTextClear'
        | 'ChatUpdateMessageAppended'
        | 'ChatUpdateTurnEnded',
        ParentType,
        ContextType
    >;
}>;

export type GqlSChatUpdateAssistantBlocksClearResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ChatUpdateAssistantBlocksClear'] =
        GqlSResolversParentTypes['ChatUpdateAssistantBlocksClear'],
> = ResolversObject<{
    chatMessageId?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSChatUpdateAssistantBlocksReplaceResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ChatUpdateAssistantBlocksReplace'] =
        GqlSResolversParentTypes['ChatUpdateAssistantBlocksReplace'],
> = ResolversObject<{
    blocks?: Resolver<Array<GqlSResolversTypes['ChatAssistantBodyBlock']>, ParentType, ContextType>;
    chatMessageId?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSChatUpdateAssistantReasoningChunkResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ChatUpdateAssistantReasoningChunk'] =
        GqlSResolversParentTypes['ChatUpdateAssistantReasoningChunk'],
> = ResolversObject<{
    chatMessageId?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
    delta?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSChatUpdateAssistantTextChunkResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ChatUpdateAssistantTextChunk'] = GqlSResolversParentTypes['ChatUpdateAssistantTextChunk'],
> = ResolversObject<{
    chatMessageId?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
    delta?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSChatUpdateAssistantTextClearResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ChatUpdateAssistantTextClear'] = GqlSResolversParentTypes['ChatUpdateAssistantTextClear'],
> = ResolversObject<{
    chatMessageId?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSChatUpdateMessageAppendedResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ChatUpdateMessageAppended'] = GqlSResolversParentTypes['ChatUpdateMessageAppended'],
> = ResolversObject<{
    message?: Resolver<GqlSResolversTypes['ChatMessage'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSChatUpdateTurnEndedResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ChatUpdateTurnEnded'] = GqlSResolversParentTypes['ChatUpdateTurnEnded'],
> = ResolversObject<{
    generationId?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface GqlSDateScalarConfig extends GraphQLScalarTypeConfig<GqlSResolversTypes['Date'], any> {
    name: 'Date';
}

export interface GqlSDateTimeScalarConfig extends GraphQLScalarTypeConfig<GqlSResolversTypes['DateTime'], any> {
    name: 'DateTime';
}

export type GqlSFileUploadResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['FileUpload'] = GqlSResolversParentTypes['FileUpload'],
> = ResolversObject<{
    fileUploadId?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
    filename?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    mediaType?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    size?: Resolver<GqlSResolversTypes['Int'], ParentType, ContextType>;
    url?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
}>;

export type GqlSHighRiskZoneResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['HighRiskZone'] = GqlSResolversParentTypes['HighRiskZone'],
> = ResolversObject<{
    name?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    ring?: Resolver<Array<GqlSResolversTypes['LatLon']>, ParentType, ContextType>;
    zoneId?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
}>;

export type GqlSIncidentResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['Incident'] = GqlSResolversParentTypes['Incident'],
> = ResolversObject<{
    closedAtSimMs?: Resolver<Maybe<GqlSResolversTypes['Float']>, ParentType, ContextType>;
    incidentId?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
    maxRiskScore?: Resolver<GqlSResolversTypes['Int'], ParentType, ContextType>;
    mmsi?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
    openedAtSimMs?: Resolver<GqlSResolversTypes['Float'], ParentType, ContextType>;
    status?: Resolver<GqlSResolversTypes['IncidentStatus'], ParentType, ContextType>;
    timeline?: Resolver<Array<GqlSResolversTypes['IncidentTimelineEvent']>, ParentType, ContextType>;
}>;

export type GqlSIncidentTimelineEventResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['IncidentTimelineEvent'] = GqlSResolversParentTypes['IncidentTimelineEvent'],
> = ResolversObject<{
    detectedAtSimMs?: Resolver<GqlSResolversTypes['Float'], ParentType, ContextType>;
    eventId?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
    eventType?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    explanation?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    riskChange?: Resolver<Maybe<GqlSResolversTypes['Int']>, ParentType, ContextType>;
    source?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
}>;

export interface GqlSJsonScalarConfig extends GraphQLScalarTypeConfig<GqlSResolversTypes['JSON'], any> {
    name: 'JSON';
}

export type GqlSLatLonResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['LatLon'] = GqlSResolversParentTypes['LatLon'],
> = ResolversObject<{
    lat?: Resolver<GqlSResolversTypes['Float'], ParentType, ContextType>;
    lon?: Resolver<GqlSResolversTypes['Float'], ParentType, ContextType>;
}>;

export type GqlSMutationResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['Mutation'] = GqlSResolversParentTypes['Mutation'],
> = ResolversObject<{
    admin?: Resolver<GqlSResolversTypes['AdminMutation'], ParentType, ContextType>;
    session?: Resolver<GqlSResolversTypes['SessionMutation'], ParentType, ContextType>;
    user?: Resolver<GqlSResolversTypes['UserMutation'], ParentType, ContextType>;
    userCreate?: Resolver<GqlSResolversTypes['MutationResult'], ParentType, ContextType, RequireFields<GqlSMutationUserCreateArgs, 'user'>>;
}>;

export type GqlSMutationResultResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['MutationResult'] = GqlSResolversParentTypes['MutationResult'],
> = ResolversObject<{
    referenceId?: Resolver<Maybe<GqlSResolversTypes['ID']>, ParentType, ContextType>;
    success?: Resolver<GqlSResolversTypes['Boolean'], ParentType, ContextType>;
}>;

export type GqlSOsintAlertResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['OsintAlert'] = GqlSResolversParentTypes['OsintAlert'],
> = ResolversObject<{
    alertId?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
    body?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    issuedAt?: Resolver<GqlSResolversTypes['DateTime'], ParentType, ContextType>;
    region?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    relevanceTags?: Resolver<Array<GqlSResolversTypes['String']>, ParentType, ContextType>;
    source?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    title?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
}>;

export type GqlSProtectedAssetResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ProtectedAsset'] = GqlSResolversParentTypes['ProtectedAsset'],
> = ResolversObject<{
    assetId?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
    name?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    path?: Resolver<Array<GqlSResolversTypes['LatLon']>, ParentType, ContextType>;
    riskRadiusNm?: Resolver<GqlSResolversTypes['Float'], ParentType, ContextType>;
    type?: Resolver<GqlSResolversTypes['ProtectedAssetType'], ParentType, ContextType>;
}>;

export type GqlSQueryResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['Query'] = GqlSResolversParentTypes['Query'],
> = ResolversObject<{
    currentSession?: Resolver<GqlSResolversTypes['Session'], ParentType, ContextType>;
}>;

export type GqlSRiskEventResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['RiskEvent'] = GqlSResolversParentTypes['RiskEvent'],
> = ResolversObject<{
    detectedAtSimMs?: Resolver<GqlSResolversTypes['Float'], ParentType, ContextType>;
    explanation?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    mmsi?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
    newScore?: Resolver<GqlSResolversTypes['Int'], ParentType, ContextType>;
    previousScore?: Resolver<GqlSResolversTypes['Int'], ParentType, ContextType>;
    riskEventId?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
    rule?: Resolver<GqlSResolversTypes['RiskRule'], ParentType, ContextType>;
    scoreDelta?: Resolver<GqlSResolversTypes['Int'], ParentType, ContextType>;
    source?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
}>;

export type GqlSRiskFactorResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['RiskFactor'] = GqlSResolversParentTypes['RiskFactor'],
> = ResolversObject<{
    explanation?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    rule?: Resolver<GqlSResolversTypes['RiskRule'], ParentType, ContextType>;
    scoreDelta?: Resolver<GqlSResolversTypes['Int'], ParentType, ContextType>;
    source?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
}>;

export type GqlSScenarioSummaryResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['ScenarioSummary'] = GqlSResolversParentTypes['ScenarioSummary'],
> = ResolversObject<{
    description?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    scenarioId?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
    title?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
}>;

export type GqlSSessionResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['Session'] = GqlSResolversParentTypes['Session'],
> = ResolversObject<{
    chat?: Resolver<GqlSResolversTypes['Chat'], ParentType, ContextType, RequireFields<GqlSSessionChatArgs, 'chatId'>>;
    scenarios?: Resolver<Array<GqlSResolversTypes['ScenarioSummary']>, ParentType, ContextType>;
    sessionId?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
    user?: Resolver<Maybe<GqlSResolversTypes['User']>, ParentType, ContextType>;
    watch?: Resolver<GqlSResolversTypes['WatchState'], ParentType, ContextType>;
}>;

export type GqlSSessionMutationResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['SessionMutation'] = GqlSResolversParentTypes['SessionMutation'],
> = ResolversObject<{
    aisViewportClear?: Resolver<GqlSResolversTypes['MutationResult'], ParentType, ContextType>;
    aisViewportReport?: Resolver<
        GqlSResolversTypes['MutationResult'],
        ParentType,
        ContextType,
        RequireFields<GqlSSessionMutationAisViewportReportArgs, 'eastLon' | 'northLat' | 'southLat' | 'westLon'>
    >;
    alertAcknowledge?: Resolver<
        Maybe<GqlSResolversTypes['WatchState']>,
        ParentType,
        ContextType,
        RequireFields<GqlSSessionMutationAlertAcknowledgeArgs, 'incidentId'>
    >;
    chatInputCollectionRespond?: Resolver<
        Maybe<GqlSResolversTypes['ChatMessageCreateResult']>,
        ParentType,
        ContextType,
        RequireFields<GqlSSessionMutationChatInputCollectionRespondArgs, 'answers' | 'assistantOptions' | 'collectionMessageId'>
    >;
    chatMessageCreate?: Resolver<
        Maybe<GqlSResolversTypes['ChatMessageCreateResult']>,
        ParentType,
        ContextType,
        RequireFields<GqlSSessionMutationChatMessageCreateArgs, 'assistantOptions' | 'message'>
    >;
    chatToolApprovalRespond?: Resolver<
        Maybe<GqlSResolversTypes['ChatMessageCreateResult']>,
        ParentType,
        ContextType,
        RequireFields<GqlSSessionMutationChatToolApprovalRespondArgs, 'approvalId' | 'approved' | 'assistantOptions'>
    >;
    mockAisSetEnabled?: Resolver<
        Maybe<GqlSResolversTypes['WatchState']>,
        ParentType,
        ContextType,
        RequireFields<GqlSSessionMutationMockAisSetEnabledArgs, 'enabled'>
    >;
    scenarioReset?: Resolver<Maybe<GqlSResolversTypes['WatchState']>, ParentType, ContextType>;
    vesselIntelligenceRequest?: Resolver<
        GqlSResolversTypes['MutationResult'],
        ParentType,
        ContextType,
        RequireFields<GqlSSessionMutationVesselIntelligenceRequestArgs, 'mmsi'>
    >;
    vesselSelect?: Resolver<Maybe<GqlSResolversTypes['WatchState']>, ParentType, ContextType, Partial<GqlSSessionMutationVesselSelectArgs>>;
}>;

export type GqlSSessionUpdateResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['SessionUpdate'] = GqlSResolversParentTypes['SessionUpdate'],
> = ResolversObject<{
    __resolveType: TypeResolveFn<
        'SessionUpdateAnomalyAppended' | 'SessionUpdateIntelligence' | 'SessionUpdateWatchSnapshot',
        ParentType,
        ContextType
    >;
}>;

export type GqlSSessionUpdateAnomalyAppendedResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['SessionUpdateAnomalyAppended'] = GqlSResolversParentTypes['SessionUpdateAnomalyAppended'],
> = ResolversObject<{
    anomaly?: Resolver<GqlSResolversTypes['Anomaly'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSSessionUpdateIntelligenceResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['SessionUpdateIntelligence'] = GqlSResolversParentTypes['SessionUpdateIntelligence'],
> = ResolversObject<{
    intelligence?: Resolver<GqlSResolversTypes['VesselIntelligence'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSSessionUpdateWatchSnapshotResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['SessionUpdateWatchSnapshot'] = GqlSResolversParentTypes['SessionUpdateWatchSnapshot'],
> = ResolversObject<{
    watch?: Resolver<GqlSResolversTypes['WatchState'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSSubscriptionResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['Subscription'] = GqlSResolversParentTypes['Subscription'],
> = ResolversObject<{
    chatUpdates?: SubscriptionResolver<
        GqlSResolversTypes['ChatUpdate'],
        'chatUpdates',
        ParentType,
        ContextType,
        RequireFields<GqlSSubscriptionChatUpdatesArgs, 'generationId'>
    >;
    sessionUpdates?: SubscriptionResolver<GqlSResolversTypes['SessionUpdate'], 'sessionUpdates', ParentType, ContextType>;
    userUpdates?: SubscriptionResolver<GqlSResolversTypes['User'], 'userUpdates', ParentType, ContextType>;
}>;

export type GqlSUserResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['User'] = GqlSResolversParentTypes['User'],
> = ResolversObject<{
    admin?: Resolver<Maybe<GqlSResolversTypes['Admin']>, ParentType, ContextType>;
    name?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    userId?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
}>;

export type GqlSUserMutationResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['UserMutation'] = GqlSResolversParentTypes['UserMutation'],
> = ResolversObject<{
    chatInputCollectionRespond?: Resolver<
        Maybe<GqlSResolversTypes['ChatMessageCreateResult']>,
        ParentType,
        ContextType,
        RequireFields<GqlSUserMutationChatInputCollectionRespondArgs, 'answers' | 'assistantOptions' | 'collectionMessageId'>
    >;
    chatMessageCreate?: Resolver<
        Maybe<GqlSResolversTypes['ChatMessageCreateResult']>,
        ParentType,
        ContextType,
        RequireFields<GqlSUserMutationChatMessageCreateArgs, 'assistantOptions' | 'message'>
    >;
    chatToolApprovalRespond?: Resolver<
        Maybe<GqlSResolversTypes['ChatMessageCreateResult']>,
        ParentType,
        ContextType,
        RequireFields<GqlSUserMutationChatToolApprovalRespondArgs, 'approvalId' | 'approved' | 'assistantOptions'>
    >;
    terminateSessions?: Resolver<
        GqlSResolversTypes['MutationResult'],
        ParentType,
        ContextType,
        RequireFields<GqlSUserMutationTerminateSessionsArgs, 'sessionIds'>
    >;
    userUpdate?: Resolver<
        GqlSResolversTypes['MutationResult'],
        ParentType,
        ContextType,
        RequireFields<GqlSUserMutationUserUpdateArgs, 'user'>
    >;
}>;

export type GqlSVesselResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['Vessel'] = GqlSResolversParentTypes['Vessel'],
> = ResolversObject<{
    activeFactors?: Resolver<Array<GqlSResolversTypes['RiskFactor']>, ParentType, ContextType>;
    aisDark?: Resolver<GqlSResolversTypes['Boolean'], ParentType, ContextType>;
    callSign?: Resolver<Maybe<GqlSResolversTypes['String']>, ParentType, ContextType>;
    dataSource?: Resolver<GqlSResolversTypes['VesselDataSource'], ParentType, ContextType>;
    flag?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    imo?: Resolver<Maybe<GqlSResolversTypes['String']>, ParentType, ContextType>;
    mmsi?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
    name?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    nearestAssetDistanceNm?: Resolver<Maybe<GqlSResolversTypes['Float']>, ParentType, ContextType>;
    nearestAssetId?: Resolver<Maybe<GqlSResolversTypes['ID']>, ParentType, ContextType>;
    position?: Resolver<Maybe<GqlSResolversTypes['VesselPosition']>, ParentType, ContextType>;
    radarPosition?: Resolver<Maybe<GqlSResolversTypes['LatLon']>, ParentType, ContextType>;
    riskLevel?: Resolver<GqlSResolversTypes['RiskLevel'], ParentType, ContextType>;
    riskScore?: Resolver<GqlSResolversTypes['Int'], ParentType, ContextType>;
    riskTrend?: Resolver<GqlSResolversTypes['RiskTrend'], ParentType, ContextType>;
    shipType?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    trackTail?: Resolver<Array<GqlSResolversTypes['LatLon']>, ParentType, ContextType>;
}>;

export type GqlSVesselIntelligenceResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['VesselIntelligence'] = GqlSResolversParentTypes['VesselIntelligence'],
> = ResolversObject<{
    citations?: Resolver<Array<GqlSResolversTypes['VesselIntelligenceCitation']>, ParentType, ContextType>;
    complete?: Resolver<GqlSResolversTypes['Boolean'], ParentType, ContextType>;
    generatedAt?: Resolver<GqlSResolversTypes['DateTime'], ParentType, ContextType>;
    mmsi?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
    playbookSteps?: Resolver<Array<GqlSResolversTypes['String']>, ParentType, ContextType>;
    status?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    summary?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    vesselName?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    whyFlagged?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
}>;

export type GqlSVesselIntelligenceCitationResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['VesselIntelligenceCitation'] = GqlSResolversParentTypes['VesselIntelligenceCitation'],
> = ResolversObject<{
    label?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    source?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
}>;

export type GqlSVesselPositionResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['VesselPosition'] = GqlSResolversParentTypes['VesselPosition'],
> = ResolversObject<{
    cog?: Resolver<GqlSResolversTypes['Float'], ParentType, ContextType>;
    heading?: Resolver<GqlSResolversTypes['Float'], ParentType, ContextType>;
    lat?: Resolver<GqlSResolversTypes['Float'], ParentType, ContextType>;
    lon?: Resolver<GqlSResolversTypes['Float'], ParentType, ContextType>;
    mmsi?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
    navStatus?: Resolver<Maybe<GqlSResolversTypes['String']>, ParentType, ContextType>;
    sog?: Resolver<GqlSResolversTypes['Float'], ParentType, ContextType>;
    timestamp?: Resolver<GqlSResolversTypes['DateTime'], ParentType, ContextType>;
}>;

export type GqlSWatchDataSourceStatusResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['WatchDataSourceStatus'] = GqlSResolversParentTypes['WatchDataSourceStatus'],
> = ResolversObject<{
    enabled?: Resolver<GqlSResolversTypes['Boolean'], ParentType, ContextType>;
    id?: Resolver<GqlSResolversTypes['VesselDataSource'], ParentType, ContextType>;
    status?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    vesselCount?: Resolver<GqlSResolversTypes['Int'], ParentType, ContextType>;
}>;

export type GqlSWatchStateResolvers<
    ContextType = any,
    ParentType extends GqlSResolversParentTypes['WatchState'] = GqlSResolversParentTypes['WatchState'],
> = ResolversObject<{
    anomalies?: Resolver<Array<GqlSResolversTypes['Anomaly']>, ParentType, ContextType>;
    centerLat?: Resolver<GqlSResolversTypes['Float'], ParentType, ContextType>;
    centerLon?: Resolver<GqlSResolversTypes['Float'], ParentType, ContextType>;
    dataSources?: Resolver<Array<GqlSResolversTypes['WatchDataSourceStatus']>, ParentType, ContextType>;
    description?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    highRiskZones?: Resolver<Array<GqlSResolversTypes['HighRiskZone']>, ParentType, ContextType>;
    incidents?: Resolver<Array<GqlSResolversTypes['Incident']>, ParentType, ContextType>;
    osintAlerts?: Resolver<Array<GqlSResolversTypes['OsintAlert']>, ParentType, ContextType>;
    protectedAssets?: Resolver<Array<GqlSResolversTypes['ProtectedAsset']>, ParentType, ContextType>;
    riskEvents?: Resolver<Array<GqlSResolversTypes['RiskEvent']>, ParentType, ContextType>;
    scenarioId?: Resolver<GqlSResolversTypes['ID'], ParentType, ContextType>;
    selectedMmsi?: Resolver<Maybe<GqlSResolversTypes['ID']>, ParentType, ContextType>;
    simMs?: Resolver<GqlSResolversTypes['Float'], ParentType, ContextType>;
    status?: Resolver<GqlSResolversTypes['WatchStatus'], ParentType, ContextType>;
    title?: Resolver<GqlSResolversTypes['String'], ParentType, ContextType>;
    vessels?: Resolver<Array<GqlSResolversTypes['Vessel']>, ParentType, ContextType>;
    zoom?: Resolver<GqlSResolversTypes['Float'], ParentType, ContextType>;
}>;

export type GqlSResolvers<ContextType = any> = ResolversObject<{
    Admin?: GqlSAdminResolvers<ContextType>;
    AdminMutation?: GqlSAdminMutationResolvers<ContextType>;
    Anomaly?: GqlSAnomalyResolvers<ContextType>;
    Chat?: GqlSChatResolvers<ContextType>;
    ChatAssistantArtifactCard?: GqlSChatAssistantArtifactCardResolvers<ContextType>;
    ChatAssistantBodyBlock?: GqlSChatAssistantBodyBlockResolvers<ContextType>;
    ChatAssistantBodyBlockCardList?: GqlSChatAssistantBodyBlockCardListResolvers<ContextType>;
    ChatAssistantBodyBlockMarkdown?: GqlSChatAssistantBodyBlockMarkdownResolvers<ContextType>;
    ChatAssistantInput?: GqlSChatAssistantInputResolvers<ContextType>;
    ChatAssistantInputBoolean?: GqlSChatAssistantInputBooleanResolvers<ContextType>;
    ChatAssistantInputDate?: GqlSChatAssistantInputDateResolvers<ContextType>;
    ChatAssistantInputDateRange?: GqlSChatAssistantInputDateRangeResolvers<ContextType>;
    ChatAssistantInputDateTime?: GqlSChatAssistantInputDateTimeResolvers<ContextType>;
    ChatAssistantInputMultiSelect?: GqlSChatAssistantInputMultiSelectResolvers<ContextType>;
    ChatAssistantInputSingleSelect?: GqlSChatAssistantInputSingleSelectResolvers<ContextType>;
    ChatAssistantInputText?: GqlSChatAssistantInputTextResolvers<ContextType>;
    ChatAssistantInputTime?: GqlSChatAssistantInputTimeResolvers<ContextType>;
    ChatAssistantInputValue?: GqlSChatAssistantInputValueResolvers<ContextType>;
    ChatAssistantInputValueBoolean?: GqlSChatAssistantInputValueBooleanResolvers<ContextType>;
    ChatAssistantInputValueDate?: GqlSChatAssistantInputValueDateResolvers<ContextType>;
    ChatAssistantInputValueDateRange?: GqlSChatAssistantInputValueDateRangeResolvers<ContextType>;
    ChatAssistantInputValueDateTime?: GqlSChatAssistantInputValueDateTimeResolvers<ContextType>;
    ChatAssistantInputValueString?: GqlSChatAssistantInputValueStringResolvers<ContextType>;
    ChatAssistantInputValueStringList?: GqlSChatAssistantInputValueStringListResolvers<ContextType>;
    ChatAssistantInputValueTime?: GqlSChatAssistantInputValueTimeResolvers<ContextType>;
    ChatMessage?: GqlSChatMessageResolvers<ContextType>;
    ChatMessageAssistantInputCollection?: GqlSChatMessageAssistantInputCollectionResolvers<ContextType>;
    ChatMessageAssistantText?: GqlSChatMessageAssistantTextResolvers<ContextType>;
    ChatMessageCreateResult?: GqlSChatMessageCreateResultResolvers<ContextType>;
    ChatMessageGeneration?: GqlSChatMessageGenerationResolvers<ContextType>;
    ChatMessageSource?: GqlSChatMessageSourceResolvers<ContextType>;
    ChatMessageToolApprovalRequest?: GqlSChatMessageToolApprovalRequestResolvers<ContextType>;
    ChatMessageToolApprovalResponse?: GqlSChatMessageToolApprovalResponseResolvers<ContextType>;
    ChatMessageToolCall?: GqlSChatMessageToolCallResolvers<ContextType>;
    ChatMessageUser?: GqlSChatMessageUserResolvers<ContextType>;
    ChatMessageUserInput?: GqlSChatMessageUserInputResolvers<ContextType>;
    ChatMessageUserInputAnswer?: GqlSChatMessageUserInputAnswerResolvers<ContextType>;
    ChatUpdate?: GqlSChatUpdateResolvers<ContextType>;
    ChatUpdateAssistantBlocksClear?: GqlSChatUpdateAssistantBlocksClearResolvers<ContextType>;
    ChatUpdateAssistantBlocksReplace?: GqlSChatUpdateAssistantBlocksReplaceResolvers<ContextType>;
    ChatUpdateAssistantReasoningChunk?: GqlSChatUpdateAssistantReasoningChunkResolvers<ContextType>;
    ChatUpdateAssistantTextChunk?: GqlSChatUpdateAssistantTextChunkResolvers<ContextType>;
    ChatUpdateAssistantTextClear?: GqlSChatUpdateAssistantTextClearResolvers<ContextType>;
    ChatUpdateMessageAppended?: GqlSChatUpdateMessageAppendedResolvers<ContextType>;
    ChatUpdateTurnEnded?: GqlSChatUpdateTurnEndedResolvers<ContextType>;
    Date?: GraphQLScalarType;
    DateTime?: GraphQLScalarType;
    FileUpload?: GqlSFileUploadResolvers<ContextType>;
    HighRiskZone?: GqlSHighRiskZoneResolvers<ContextType>;
    Incident?: GqlSIncidentResolvers<ContextType>;
    IncidentTimelineEvent?: GqlSIncidentTimelineEventResolvers<ContextType>;
    JSON?: GraphQLScalarType;
    LatLon?: GqlSLatLonResolvers<ContextType>;
    Mutation?: GqlSMutationResolvers<ContextType>;
    MutationResult?: GqlSMutationResultResolvers<ContextType>;
    OsintAlert?: GqlSOsintAlertResolvers<ContextType>;
    ProtectedAsset?: GqlSProtectedAssetResolvers<ContextType>;
    Query?: GqlSQueryResolvers<ContextType>;
    RiskEvent?: GqlSRiskEventResolvers<ContextType>;
    RiskFactor?: GqlSRiskFactorResolvers<ContextType>;
    ScenarioSummary?: GqlSScenarioSummaryResolvers<ContextType>;
    Session?: GqlSSessionResolvers<ContextType>;
    SessionMutation?: GqlSSessionMutationResolvers<ContextType>;
    SessionUpdate?: GqlSSessionUpdateResolvers<ContextType>;
    SessionUpdateAnomalyAppended?: GqlSSessionUpdateAnomalyAppendedResolvers<ContextType>;
    SessionUpdateIntelligence?: GqlSSessionUpdateIntelligenceResolvers<ContextType>;
    SessionUpdateWatchSnapshot?: GqlSSessionUpdateWatchSnapshotResolvers<ContextType>;
    Subscription?: GqlSSubscriptionResolvers<ContextType>;
    User?: GqlSUserResolvers<ContextType>;
    UserMutation?: GqlSUserMutationResolvers<ContextType>;
    Vessel?: GqlSVesselResolvers<ContextType>;
    VesselIntelligence?: GqlSVesselIntelligenceResolvers<ContextType>;
    VesselIntelligenceCitation?: GqlSVesselIntelligenceCitationResolvers<ContextType>;
    VesselPosition?: GqlSVesselPositionResolvers<ContextType>;
    WatchDataSourceStatus?: GqlSWatchDataSourceStatusResolvers<ContextType>;
    WatchState?: GqlSWatchStateResolvers<ContextType>;
}>;

type Properties<T> = {
    [K in keyof T]: z.ZodType<T[K], T[K] | undefined>;
};

type definedNonNullAny = {};

export const isDefinedNonNullAny = (v: any): v is definedNonNullAny => v !== undefined && v !== null;

export const definedNonNullAnySchema = z.any().refine((v) => isDefinedNonNullAny(v));

export const GqlSAnomalyKindSchema: z.ZodType<
    'aisDark' | 'headingZigZag' | 'impossibleJump' | 'loitering' | 'speedDrop',
    'aisDark' | 'headingZigZag' | 'impossibleJump' | 'loitering' | 'speedDrop'
> = z.enum(['aisDark', 'headingZigZag', 'impossibleJump', 'loitering', 'speedDrop']);

export const GqlSAnomalySeveritySchema: z.ZodType<'critical' | 'high' | 'low' | 'medium', 'critical' | 'high' | 'low' | 'medium'> = z.enum([
    'critical',
    'high',
    'low',
    'medium',
]);

export const GqlSChatAssistantInputValueKindSchema: z.ZodType<
    'Boolean' | 'Date' | 'DateRange' | 'DateTime' | 'String' | 'StringList' | 'Time',
    'Boolean' | 'Date' | 'DateRange' | 'DateTime' | 'String' | 'StringList' | 'Time'
> = z.enum(['Boolean', 'Date', 'DateRange', 'DateTime', 'String', 'StringList', 'Time']);

export const GqlSIncidentStatusSchema: z.ZodType<'acknowledged' | 'closed' | 'open', 'acknowledged' | 'closed' | 'open'> = z.enum([
    'acknowledged',
    'closed',
    'open',
]);

export const GqlSProtectedAssetTypeSchema: z.ZodType<
    'cable' | 'harbor' | 'pipeline' | 'restrictedZone' | 'windFarm',
    'cable' | 'harbor' | 'pipeline' | 'restrictedZone' | 'windFarm'
> = z.enum(['cable', 'harbor', 'pipeline', 'restrictedZone', 'windFarm']);

export const GqlSRiskLevelSchema: z.ZodType<'green' | 'orange' | 'red' | 'yellow', 'green' | 'orange' | 'red' | 'yellow'> = z.enum([
    'green',
    'orange',
    'red',
    'yellow',
]);

export const GqlSRiskRuleSchema: z.ZodType<
    | 'aisDark'
    | 'aisRadarMismatch'
    | 'baseline'
    | 'headingZigZag'
    | 'impossibleJump'
    | 'loitering'
    | 'nearProtectedAsset'
    | 'speedDrop'
    | 'zoneEntry',
    | 'aisDark'
    | 'aisRadarMismatch'
    | 'baseline'
    | 'headingZigZag'
    | 'impossibleJump'
    | 'loitering'
    | 'nearProtectedAsset'
    | 'speedDrop'
    | 'zoneEntry'
> = z.enum([
    'aisDark',
    'aisRadarMismatch',
    'baseline',
    'headingZigZag',
    'impossibleJump',
    'loitering',
    'nearProtectedAsset',
    'speedDrop',
    'zoneEntry',
]);

export const GqlSRiskTrendSchema: z.ZodType<'falling' | 'rising' | 'stable', 'falling' | 'rising' | 'stable'> = z.enum([
    'falling',
    'rising',
    'stable',
]);

export const GqlSVesselDataSourceSchema: z.ZodType<'aisstream' | 'mock', 'aisstream' | 'mock'> = z.enum(['aisstream', 'mock']);

export const GqlSWatchStatusSchema: z.ZodType<'completed' | 'running', 'completed' | 'running'> = z.enum(['completed', 'running']);

export function GqlSChatAssistantOptionsSchema(): z.ZodObject<Properties<GqlSChatAssistantOptions>> {
    return z.object({
        generationId: z.string().nullish(),
        requireToolCallApprovals: z.boolean(),
    });
}

export function GqlSChatMessageUserInputAnswerCreateSchema(): z.ZodObject<Properties<GqlSChatMessageUserInputAnswerCreate>> {
    return z.object({
        boolean: z.boolean().nullish(),
        date: z.string().nullish(),
        dateRangeFrom: z.string().nullish(),
        dateRangeTo: z.string().nullish(),
        dateTime: z.date().nullish(),
        inputId: z.string(),
        kind: GqlSChatAssistantInputValueKindSchema,
        string: z.string().nullish(),
        stringList: z.array(z.string()).nullish(),
        time: z.string().nullish(),
    });
}

export function GqlSUserCreateSchema(): z.ZodObject<Properties<GqlSUserCreate>> {
    return z.object({
        name: z.string(),
    });
}

export function GqlSUserUpdateSchema(): z.ZodObject<Properties<GqlSUserUpdate>> {
    return z.object({
        name: z.string(),
    });
}
