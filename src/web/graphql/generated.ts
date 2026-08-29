/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type * as Schema from './generated';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
    ID: { input: string; output: string };
    String: { input: string; output: string };
    Boolean: { input: boolean; output: boolean };
    Int: { input: number; output: number };
    Float: { input: number; output: number };
    Date: { input: string; output: string };
    DateTime: { input: string; output: string };
    JSON: { input: unknown; output: unknown };
};

export interface GqlCAdmin {
    __typename?: 'Admin';
    ok: Scalars['Boolean']['output'];
}

export interface GqlCAdminMutation {
    __typename?: 'AdminMutation';
    ok: Scalars['Boolean']['output'];
}

export interface GqlCAnomaly {
    __typename?: 'Anomaly';
    anomalyId: Scalars['ID']['output'];
    detectedAtSimMs: Scalars['Float']['output'];
    evidence: Scalars['JSON']['output'];
    kind: GqlCAnomalyKind;
    mmsi: Scalars['ID']['output'];
    severity: GqlCAnomalySeverity;
    summary: Scalars['String']['output'];
    title: Scalars['String']['output'];
}

export type GqlCAnomalyKind = 'aisDark' | 'headingZigZag' | 'impossibleJump' | 'loitering' | 'speedDrop';

export type GqlCAnomalySeverity = 'critical' | 'high' | 'low' | 'medium';

export interface GqlCChat {
    __typename?: 'Chat';
    chatId: Scalars['ID']['output'];
    lastModifiedAt: Scalars['DateTime']['output'];
    messages: Array<GqlCChatMessage>;
    title: Scalars['String']['output'];
}

export interface GqlCChatAssistantArtifactCard {
    __typename?: 'ChatAssistantArtifactCard';
    buttonTitle?: Maybe<Scalars['String']['output']>;
    description: Scalars['String']['output'];
    href?: Maybe<Scalars['String']['output']>;
    imageUrl?: Maybe<Scalars['String']['output']>;
    price?: Maybe<Scalars['String']['output']>;
    title: Scalars['String']['output'];
}

export type GqlCChatAssistantBodyBlock = GqlCChatAssistantBodyBlockCardList | GqlCChatAssistantBodyBlockMarkdown;

export interface GqlCChatAssistantBodyBlockCardList {
    __typename?: 'ChatAssistantBodyBlockCardList';
    cards: Array<GqlCChatAssistantArtifactCard>;
}

export interface GqlCChatAssistantBodyBlockMarkdown {
    __typename?: 'ChatAssistantBodyBlockMarkdown';
    text: Scalars['String']['output'];
}

export type GqlCChatAssistantInput =
    | GqlCChatAssistantInputBoolean
    | GqlCChatAssistantInputDate
    | GqlCChatAssistantInputDateRange
    | GqlCChatAssistantInputDateTime
    | GqlCChatAssistantInputMultiSelect
    | GqlCChatAssistantInputSingleSelect
    | GqlCChatAssistantInputText
    | GqlCChatAssistantInputTime;

export interface GqlCChatAssistantInputBoolean {
    __typename?: 'ChatAssistantInputBoolean';
    inputId: Scalars['ID']['output'];
    prompt: Scalars['String']['output'];
}

export interface GqlCChatAssistantInputDate {
    __typename?: 'ChatAssistantInputDate';
    inputId: Scalars['ID']['output'];
    prompt: Scalars['String']['output'];
}

export interface GqlCChatAssistantInputDateRange {
    __typename?: 'ChatAssistantInputDateRange';
    inputId: Scalars['ID']['output'];
    prompt: Scalars['String']['output'];
}

export interface GqlCChatAssistantInputDateTime {
    __typename?: 'ChatAssistantInputDateTime';
    inputId: Scalars['ID']['output'];
    prompt: Scalars['String']['output'];
}

export interface GqlCChatAssistantInputMultiSelect {
    __typename?: 'ChatAssistantInputMultiSelect';
    inputId: Scalars['ID']['output'];
    options: Array<Scalars['String']['output']>;
    prompt: Scalars['String']['output'];
}

export interface GqlCChatAssistantInputSingleSelect {
    __typename?: 'ChatAssistantInputSingleSelect';
    inputId: Scalars['ID']['output'];
    options: Array<Scalars['String']['output']>;
    prompt: Scalars['String']['output'];
}

export interface GqlCChatAssistantInputText {
    __typename?: 'ChatAssistantInputText';
    inputId: Scalars['ID']['output'];
    prompt: Scalars['String']['output'];
}

export interface GqlCChatAssistantInputTime {
    __typename?: 'ChatAssistantInputTime';
    inputId: Scalars['ID']['output'];
    prompt: Scalars['String']['output'];
}

export type GqlCChatAssistantInputValue =
    | GqlCChatAssistantInputValueBoolean
    | GqlCChatAssistantInputValueDate
    | GqlCChatAssistantInputValueDateRange
    | GqlCChatAssistantInputValueDateTime
    | GqlCChatAssistantInputValueString
    | GqlCChatAssistantInputValueStringList
    | GqlCChatAssistantInputValueTime;

export interface GqlCChatAssistantInputValueBoolean {
    __typename?: 'ChatAssistantInputValueBoolean';
    boolean: Scalars['Boolean']['output'];
}

export interface GqlCChatAssistantInputValueDate {
    __typename?: 'ChatAssistantInputValueDate';
    date: Scalars['Date']['output'];
}

export interface GqlCChatAssistantInputValueDateRange {
    __typename?: 'ChatAssistantInputValueDateRange';
    from: Scalars['Date']['output'];
    to: Scalars['Date']['output'];
}

export interface GqlCChatAssistantInputValueDateTime {
    __typename?: 'ChatAssistantInputValueDateTime';
    dateTime: Scalars['DateTime']['output'];
}

export type GqlCChatAssistantInputValueKind = 'Boolean' | 'Date' | 'DateRange' | 'DateTime' | 'String' | 'StringList' | 'Time';

export interface GqlCChatAssistantInputValueString {
    __typename?: 'ChatAssistantInputValueString';
    value: Scalars['String']['output'];
}

export interface GqlCChatAssistantInputValueStringList {
    __typename?: 'ChatAssistantInputValueStringList';
    values: Array<Scalars['String']['output']>;
}

export interface GqlCChatAssistantInputValueTime {
    __typename?: 'ChatAssistantInputValueTime';
    time: Scalars['String']['output'];
}

export type GqlCChatAssistantOptions = {
    generationId?: InputMaybe<Scalars['ID']['input']>;
    requireToolCallApprovals: Scalars['Boolean']['input'];
};

export type GqlCChatMessage =
    | GqlCChatMessageAssistantInputCollection
    | GqlCChatMessageAssistantText
    | GqlCChatMessageToolApprovalRequest
    | GqlCChatMessageToolApprovalResponse
    | GqlCChatMessageToolCall
    | GqlCChatMessageUser
    | GqlCChatMessageUserInput;

export interface GqlCChatMessageAssistantInputCollection {
    __typename?: 'ChatMessageAssistantInputCollection';
    chatMessageId: Scalars['ID']['output'];
    createdAt: Scalars['DateTime']['output'];
    generation?: Maybe<GqlCChatMessageGeneration>;
    inputs: Array<GqlCChatAssistantInput>;
    mode: Scalars['String']['output'];
    prompt: Scalars['String']['output'];
    reasoning?: Maybe<Scalars['String']['output']>;
}

export interface GqlCChatMessageAssistantText {
    __typename?: 'ChatMessageAssistantText';
    blocks: Array<GqlCChatAssistantBodyBlock>;
    body: Scalars['String']['output'];
    chatMessageId: Scalars['ID']['output'];
    createdAt: Scalars['DateTime']['output'];
    generation?: Maybe<GqlCChatMessageGeneration>;
    reasoning?: Maybe<Scalars['String']['output']>;
    sources: Array<GqlCChatMessageSource>;
}

export interface GqlCChatMessageCreateResult {
    __typename?: 'ChatMessageCreateResult';
    chatId: Scalars['ID']['output'];
    chatMessageId: Scalars['ID']['output'];
}

export interface GqlCChatMessageGeneration {
    __typename?: 'ChatMessageGeneration';
    cachedInputTokens?: Maybe<Scalars['Int']['output']>;
    inputTokens?: Maybe<Scalars['Int']['output']>;
    modelId: Scalars['String']['output'];
    outputTokens?: Maybe<Scalars['Int']['output']>;
    reasoningTokens?: Maybe<Scalars['Int']['output']>;
    totalTokens?: Maybe<Scalars['Int']['output']>;
}

export interface GqlCChatMessageSource {
    __typename?: 'ChatMessageSource';
    title: Scalars['String']['output'];
    url: Scalars['String']['output'];
}

export interface GqlCChatMessageToolApprovalRequest {
    __typename?: 'ChatMessageToolApprovalRequest';
    approvalId: Scalars['String']['output'];
    args: Scalars['JSON']['output'];
    chatMessageId: Scalars['ID']['output'];
    createdAt: Scalars['DateTime']['output'];
    generation?: Maybe<GqlCChatMessageGeneration>;
    reasoning?: Maybe<Scalars['String']['output']>;
    toolName: Scalars['String']['output'];
}

export interface GqlCChatMessageToolApprovalResponse {
    __typename?: 'ChatMessageToolApprovalResponse';
    approvalId: Scalars['String']['output'];
    approved: Scalars['Boolean']['output'];
    chatMessageId: Scalars['ID']['output'];
    createdAt: Scalars['DateTime']['output'];
    reason?: Maybe<Scalars['String']['output']>;
}

export interface GqlCChatMessageToolCall {
    __typename?: 'ChatMessageToolCall';
    args: Scalars['JSON']['output'];
    chatMessageId: Scalars['ID']['output'];
    createdAt: Scalars['DateTime']['output'];
    generation?: Maybe<GqlCChatMessageGeneration>;
    parentChatMessageId?: Maybe<Scalars['ID']['output']>;
    reasoning?: Maybe<Scalars['String']['output']>;
    toolName: Scalars['String']['output'];
    toolResult?: Maybe<Scalars['JSON']['output']>;
}

export interface GqlCChatMessageUser {
    __typename?: 'ChatMessageUser';
    attachments: Array<GqlCFileUpload>;
    author: GqlCUser;
    body: Scalars['String']['output'];
    chatMessageId: Scalars['ID']['output'];
    createdAt: Scalars['DateTime']['output'];
}

export interface GqlCChatMessageUserInput {
    __typename?: 'ChatMessageUserInput';
    answers: Array<GqlCChatMessageUserInputAnswer>;
    author: GqlCUser;
    chatMessageId: Scalars['ID']['output'];
    collectionMessageId: Scalars['ID']['output'];
    createdAt: Scalars['DateTime']['output'];
}

export interface GqlCChatMessageUserInputAnswer {
    __typename?: 'ChatMessageUserInputAnswer';
    inputId: Scalars['ID']['output'];
    value: GqlCChatAssistantInputValue;
}

export type GqlCChatMessageUserInputAnswerCreate = {
    boolean?: InputMaybe<Scalars['Boolean']['input']>;
    date?: InputMaybe<Scalars['Date']['input']>;
    dateRangeFrom?: InputMaybe<Scalars['Date']['input']>;
    dateRangeTo?: InputMaybe<Scalars['Date']['input']>;
    dateTime?: InputMaybe<Scalars['DateTime']['input']>;
    inputId: Scalars['ID']['input'];
    kind: GqlCChatAssistantInputValueKind;
    string?: InputMaybe<Scalars['String']['input']>;
    stringList?: InputMaybe<Array<Scalars['String']['input']>>;
    time?: InputMaybe<Scalars['String']['input']>;
};

export type GqlCChatUpdate =
    | GqlCChatUpdateAssistantBlocksClear
    | GqlCChatUpdateAssistantBlocksReplace
    | GqlCChatUpdateAssistantReasoningChunk
    | GqlCChatUpdateAssistantTextChunk
    | GqlCChatUpdateAssistantTextClear
    | GqlCChatUpdateMessageAppended
    | GqlCChatUpdateTurnEnded;

export interface GqlCChatUpdateAssistantBlocksClear {
    __typename?: 'ChatUpdateAssistantBlocksClear';
    chatMessageId: Scalars['ID']['output'];
}

export interface GqlCChatUpdateAssistantBlocksReplace {
    __typename?: 'ChatUpdateAssistantBlocksReplace';
    blocks: Array<GqlCChatAssistantBodyBlock>;
    chatMessageId: Scalars['ID']['output'];
}

export interface GqlCChatUpdateAssistantReasoningChunk {
    __typename?: 'ChatUpdateAssistantReasoningChunk';
    chatMessageId: Scalars['ID']['output'];
    delta: Scalars['String']['output'];
}

export interface GqlCChatUpdateAssistantTextChunk {
    __typename?: 'ChatUpdateAssistantTextChunk';
    chatMessageId: Scalars['ID']['output'];
    delta: Scalars['String']['output'];
}

export interface GqlCChatUpdateAssistantTextClear {
    __typename?: 'ChatUpdateAssistantTextClear';
    chatMessageId: Scalars['ID']['output'];
}

export interface GqlCChatUpdateMessageAppended {
    __typename?: 'ChatUpdateMessageAppended';
    message: GqlCChatMessage;
}

export interface GqlCChatUpdateTurnEnded {
    __typename?: 'ChatUpdateTurnEnded';
    generationId: Scalars['ID']['output'];
}

export interface GqlCFileUpload {
    __typename?: 'FileUpload';
    fileUploadId: Scalars['ID']['output'];
    filename: Scalars['String']['output'];
    mediaType: Scalars['String']['output'];
    size: Scalars['Int']['output'];
    url: Scalars['String']['output'];
}

export interface GqlCHighRiskZone {
    __typename?: 'HighRiskZone';
    name: Scalars['String']['output'];
    ring: Array<GqlCLatLon>;
    zoneId: Scalars['ID']['output'];
}

export interface GqlCIncident {
    __typename?: 'Incident';
    closedAtSimMs?: Maybe<Scalars['Float']['output']>;
    incidentId: Scalars['ID']['output'];
    maxRiskScore: Scalars['Int']['output'];
    mmsi: Scalars['ID']['output'];
    openedAtSimMs: Scalars['Float']['output'];
    status: GqlCIncidentStatus;
    timeline: Array<GqlCIncidentTimelineEvent>;
}

export type GqlCIncidentStatus = 'acknowledged' | 'closed' | 'open';

export interface GqlCIncidentTimelineEvent {
    __typename?: 'IncidentTimelineEvent';
    detectedAtSimMs: Scalars['Float']['output'];
    eventId: Scalars['ID']['output'];
    eventType: Scalars['String']['output'];
    explanation: Scalars['String']['output'];
    riskChange?: Maybe<Scalars['Int']['output']>;
    source: Scalars['String']['output'];
}

export interface GqlCLatLon {
    __typename?: 'LatLon';
    lat: Scalars['Float']['output'];
    lon: Scalars['Float']['output'];
}

export interface GqlCMutation {
    __typename?: 'Mutation';
    admin: GqlCAdminMutation;
    session: GqlCSessionMutation;
    user: GqlCUserMutation;
    userCreate: GqlCMutationResult;
}

export type GqlCMutationUserCreateArgs = {
    user: GqlCUserCreate;
};

export interface GqlCMutationResult {
    __typename?: 'MutationResult';
    referenceId?: Maybe<Scalars['ID']['output']>;
    success: Scalars['Boolean']['output'];
}

export interface GqlCOsintAlert {
    __typename?: 'OsintAlert';
    alertId: Scalars['ID']['output'];
    body: Scalars['String']['output'];
    issuedAt: Scalars['DateTime']['output'];
    region: Scalars['String']['output'];
    relevanceTags: Array<Scalars['String']['output']>;
    source: Scalars['String']['output'];
    title: Scalars['String']['output'];
}

export interface GqlCProtectedAsset {
    __typename?: 'ProtectedAsset';
    assetId: Scalars['ID']['output'];
    name: Scalars['String']['output'];
    path: Array<GqlCLatLon>;
    riskRadiusNm: Scalars['Float']['output'];
    type: GqlCProtectedAssetType;
}

export type GqlCProtectedAssetType = 'cable' | 'harbor' | 'pipeline' | 'restrictedZone' | 'windFarm';

export interface GqlCQuery {
    __typename?: 'Query';
    currentSession: GqlCSession;
}

export interface GqlCRiskEvent {
    __typename?: 'RiskEvent';
    detectedAtSimMs: Scalars['Float']['output'];
    explanation: Scalars['String']['output'];
    mmsi: Scalars['ID']['output'];
    newScore: Scalars['Int']['output'];
    previousScore: Scalars['Int']['output'];
    riskEventId: Scalars['ID']['output'];
    rule: GqlCRiskRule;
    scoreDelta: Scalars['Int']['output'];
    source: Scalars['String']['output'];
}

export interface GqlCRiskFactor {
    __typename?: 'RiskFactor';
    explanation: Scalars['String']['output'];
    rule: GqlCRiskRule;
    scoreDelta: Scalars['Int']['output'];
    source: Scalars['String']['output'];
}

export type GqlCRiskLevel = 'green' | 'orange' | 'red' | 'yellow';

export type GqlCRiskRule =
    | 'aisDark'
    | 'aisRadarMismatch'
    | 'baseline'
    | 'headingZigZag'
    | 'impossibleJump'
    | 'loitering'
    | 'nearProtectedAsset'
    | 'speedDrop'
    | 'zoneEntry';

export type GqlCRiskTrend = 'falling' | 'rising' | 'stable';

export interface GqlCScenarioSummary {
    __typename?: 'ScenarioSummary';
    description: Scalars['String']['output'];
    scenarioId: Scalars['ID']['output'];
    title: Scalars['String']['output'];
}

export interface GqlCSession {
    __typename?: 'Session';
    chat: GqlCChat;
    scenarios: Array<GqlCScenarioSummary>;
    sessionId: Scalars['ID']['output'];
    user?: Maybe<GqlCUser>;
    watch: GqlCWatchState;
}

export type GqlCSessionChatArgs = {
    chatId: Scalars['ID']['input'];
};

export interface GqlCSessionMutation {
    __typename?: 'SessionMutation';
    alertAcknowledge?: Maybe<GqlCWatchState>;
    chatInputCollectionRespond?: Maybe<GqlCChatMessageCreateResult>;
    chatMessageCreate?: Maybe<GqlCChatMessageCreateResult>;
    chatToolApprovalRespond?: Maybe<GqlCChatMessageCreateResult>;
    /** Enable or disable the Galaxy Leader mock AIS feeder (off by default). */
    mockAisSetEnabled?: Maybe<GqlCWatchState>;
    scenarioReset?: Maybe<GqlCWatchState>;
    vesselIntelligenceRequest: GqlCMutationResult;
    vesselSelect?: Maybe<GqlCWatchState>;
}

export type GqlCSessionMutationAlertAcknowledgeArgs = {
    incidentId: Scalars['ID']['input'];
};

export type GqlCSessionMutationChatInputCollectionRespondArgs = {
    answers: Array<GqlCChatMessageUserInputAnswerCreate>;
    assistantOptions: GqlCChatAssistantOptions;
    collectionMessageId: Scalars['ID']['input'];
};

export type GqlCSessionMutationChatMessageCreateArgs = {
    assistantOptions: GqlCChatAssistantOptions;
    chatId?: InputMaybe<Scalars['ID']['input']>;
    fileUploadIds?: InputMaybe<Array<Scalars['ID']['input']>>;
    message: Scalars['String']['input'];
};

export type GqlCSessionMutationChatToolApprovalRespondArgs = {
    approvalId: Scalars['String']['input'];
    approved: Scalars['Boolean']['input'];
    assistantOptions: GqlCChatAssistantOptions;
    reason?: InputMaybe<Scalars['String']['input']>;
};

export type GqlCSessionMutationMockAisSetEnabledArgs = {
    enabled: Scalars['Boolean']['input'];
};

export type GqlCSessionMutationVesselIntelligenceRequestArgs = {
    mmsi: Scalars['ID']['input'];
};

export type GqlCSessionMutationVesselSelectArgs = {
    mmsi?: InputMaybe<Scalars['ID']['input']>;
};

export type GqlCSessionUpdate = GqlCSessionUpdateAnomalyAppended | GqlCSessionUpdateIntelligence | GqlCSessionUpdateWatchSnapshot;

export interface GqlCSessionUpdateAnomalyAppended {
    __typename?: 'SessionUpdateAnomalyAppended';
    anomaly: GqlCAnomaly;
}

export interface GqlCSessionUpdateIntelligence {
    __typename?: 'SessionUpdateIntelligence';
    intelligence: GqlCVesselIntelligence;
}

export interface GqlCSessionUpdateWatchSnapshot {
    __typename?: 'SessionUpdateWatchSnapshot';
    watch: GqlCWatchState;
}

export interface GqlCSubscription {
    __typename?: 'Subscription';
    chatUpdates: GqlCChatUpdate;
    sessionUpdates: GqlCSessionUpdate;
    userUpdates: GqlCUser;
}

export type GqlCSubscriptionChatUpdatesArgs = {
    generationId: Scalars['ID']['input'];
};

export interface GqlCUser {
    __typename?: 'User';
    admin?: Maybe<GqlCAdmin>;
    name: Scalars['String']['output'];
    userId: Scalars['ID']['output'];
}

export type GqlCUserCreate = {
    name: Scalars['String']['input'];
};

export interface GqlCUserMutation {
    __typename?: 'UserMutation';
    chatInputCollectionRespond?: Maybe<GqlCChatMessageCreateResult>;
    chatMessageCreate?: Maybe<GqlCChatMessageCreateResult>;
    chatToolApprovalRespond?: Maybe<GqlCChatMessageCreateResult>;
    terminateSessions: GqlCMutationResult;
    userUpdate: GqlCMutationResult;
}

export type GqlCUserMutationChatInputCollectionRespondArgs = {
    answers: Array<GqlCChatMessageUserInputAnswerCreate>;
    assistantOptions: GqlCChatAssistantOptions;
    collectionMessageId: Scalars['ID']['input'];
};

export type GqlCUserMutationChatMessageCreateArgs = {
    assistantOptions: GqlCChatAssistantOptions;
    chatId?: InputMaybe<Scalars['ID']['input']>;
    fileUploadIds?: InputMaybe<Array<Scalars['ID']['input']>>;
    message: Scalars['String']['input'];
};

export type GqlCUserMutationChatToolApprovalRespondArgs = {
    approvalId: Scalars['String']['input'];
    approved: Scalars['Boolean']['input'];
    assistantOptions: GqlCChatAssistantOptions;
    reason?: InputMaybe<Scalars['String']['input']>;
};

export type GqlCUserMutationTerminateSessionsArgs = {
    sessionIds: Array<Scalars['ID']['input']>;
};

export type GqlCUserMutationUserUpdateArgs = {
    user: GqlCUserUpdate;
};

export type GqlCUserUpdate = {
    name: Scalars['String']['input'];
};

export interface GqlCVessel {
    __typename?: 'Vessel';
    activeFactors: Array<GqlCRiskFactor>;
    aisDark: Scalars['Boolean']['output'];
    callSign?: Maybe<Scalars['String']['output']>;
    dataSource: GqlCVesselDataSource;
    flag: Scalars['String']['output'];
    imo?: Maybe<Scalars['String']['output']>;
    mmsi: Scalars['ID']['output'];
    name: Scalars['String']['output'];
    nearestAssetDistanceNm?: Maybe<Scalars['Float']['output']>;
    nearestAssetId?: Maybe<Scalars['ID']['output']>;
    position?: Maybe<GqlCVesselPosition>;
    radarPosition?: Maybe<GqlCLatLon>;
    riskLevel: GqlCRiskLevel;
    riskScore: Scalars['Int']['output'];
    riskTrend: GqlCRiskTrend;
    shipType: Scalars['String']['output'];
    trackTail: Array<GqlCLatLon>;
}

export type GqlCVesselDataSource = 'aisstream' | 'mock';

export interface GqlCVesselIntelligence {
    __typename?: 'VesselIntelligence';
    citations: Array<GqlCVesselIntelligenceCitation>;
    generatedAt: Scalars['DateTime']['output'];
    mmsi: Scalars['ID']['output'];
    playbookSteps: Array<Scalars['String']['output']>;
    status: Scalars['String']['output'];
    summary: Scalars['String']['output'];
    vesselName: Scalars['String']['output'];
    whyFlagged: Scalars['String']['output'];
}

export interface GqlCVesselIntelligenceCitation {
    __typename?: 'VesselIntelligenceCitation';
    label: Scalars['String']['output'];
    source: Scalars['String']['output'];
}

export interface GqlCVesselPosition {
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

export interface GqlCWatchDataSourceStatus {
    __typename?: 'WatchDataSourceStatus';
    enabled: Scalars['Boolean']['output'];
    id: GqlCVesselDataSource;
    status: Scalars['String']['output'];
    vesselCount: Scalars['Int']['output'];
}

export interface GqlCWatchState {
    __typename?: 'WatchState';
    anomalies: Array<GqlCAnomaly>;
    centerLat: Scalars['Float']['output'];
    centerLon: Scalars['Float']['output'];
    dataSources: Array<GqlCWatchDataSourceStatus>;
    description: Scalars['String']['output'];
    highRiskZones: Array<GqlCHighRiskZone>;
    incidents: Array<GqlCIncident>;
    osintAlerts: Array<GqlCOsintAlert>;
    protectedAssets: Array<GqlCProtectedAsset>;
    riskEvents: Array<GqlCRiskEvent>;
    scenarioId: Scalars['ID']['output'];
    selectedMmsi?: Maybe<Scalars['ID']['output']>;
    simMs: Scalars['Float']['output'];
    status: GqlCWatchStatus;
    title: Scalars['String']['output'];
    vessels: Array<GqlCVessel>;
    zoom: Scalars['Float']['output'];
}

export type GqlCWatchStatus = 'completed' | 'running';

export type GqlCChatMessageGenerationFragment = {
    modelId: string;
    inputTokens: number | null;
    outputTokens: number | null;
    totalTokens: number | null;
    reasoningTokens: number | null;
    cachedInputTokens: number | null;
};

type GqlCChatAssistantBodyBlockFields_ChatAssistantBodyBlockCardList_Fragment = {
    __typename: 'ChatAssistantBodyBlockCardList';
    cards: Array<{
        imageUrl: string | null;
        title: string;
        description: string;
        price: string | null;
        href: string | null;
        buttonTitle: string | null;
    }>;
};

type GqlCChatAssistantBodyBlockFields_ChatAssistantBodyBlockMarkdown_Fragment = {
    __typename: 'ChatAssistantBodyBlockMarkdown';
    text: string;
};

export type GqlCChatAssistantBodyBlockFieldsFragment =
    | GqlCChatAssistantBodyBlockFields_ChatAssistantBodyBlockCardList_Fragment
    | GqlCChatAssistantBodyBlockFields_ChatAssistantBodyBlockMarkdown_Fragment;

type GqlCChatMessageFields_ChatMessageAssistantInputCollection_Fragment = {
    __typename: 'ChatMessageAssistantInputCollection';
    chatMessageId: string;
    prompt: string;
    mode: string;
    reasoning: string | null;
    createdAt: string;
    generation: {
        modelId: string;
        inputTokens: number | null;
        outputTokens: number | null;
        totalTokens: number | null;
        reasoningTokens: number | null;
        cachedInputTokens: number | null;
    } | null;
    inputs: Array<
        | { __typename: 'ChatAssistantInputBoolean'; inputId: string; prompt: string }
        | { __typename: 'ChatAssistantInputDate'; inputId: string; prompt: string }
        | { __typename: 'ChatAssistantInputDateRange'; inputId: string; prompt: string }
        | { __typename: 'ChatAssistantInputDateTime'; inputId: string; prompt: string }
        | { __typename: 'ChatAssistantInputMultiSelect'; inputId: string; prompt: string; options: Array<string> }
        | { __typename: 'ChatAssistantInputSingleSelect'; inputId: string; prompt: string; options: Array<string> }
        | { __typename: 'ChatAssistantInputText'; inputId: string; prompt: string }
        | { __typename: 'ChatAssistantInputTime'; inputId: string; prompt: string }
    >;
};

type GqlCChatMessageFields_ChatMessageAssistantText_Fragment = {
    __typename: 'ChatMessageAssistantText';
    chatMessageId: string;
    body: string;
    reasoning: string | null;
    createdAt: string;
    blocks: Array<
        | {
              __typename: 'ChatAssistantBodyBlockCardList';
              cards: Array<{
                  imageUrl: string | null;
                  title: string;
                  description: string;
                  price: string | null;
                  href: string | null;
                  buttonTitle: string | null;
              }>;
          }
        | { __typename: 'ChatAssistantBodyBlockMarkdown'; text: string }
    >;
    sources: Array<{ title: string; url: string }>;
    generation: {
        modelId: string;
        inputTokens: number | null;
        outputTokens: number | null;
        totalTokens: number | null;
        reasoningTokens: number | null;
        cachedInputTokens: number | null;
    } | null;
};

type GqlCChatMessageFields_ChatMessageToolApprovalRequest_Fragment = {
    __typename: 'ChatMessageToolApprovalRequest';
    chatMessageId: string;
    approvalId: string;
    toolName: string;
    args: unknown;
    reasoning: string | null;
    createdAt: string;
    generation: {
        modelId: string;
        inputTokens: number | null;
        outputTokens: number | null;
        totalTokens: number | null;
        reasoningTokens: number | null;
        cachedInputTokens: number | null;
    } | null;
};

type GqlCChatMessageFields_ChatMessageToolApprovalResponse_Fragment = {
    __typename: 'ChatMessageToolApprovalResponse';
    chatMessageId: string;
    approvalId: string;
    approved: boolean;
    reason: string | null;
    createdAt: string;
};

type GqlCChatMessageFields_ChatMessageToolCall_Fragment = {
    __typename: 'ChatMessageToolCall';
    chatMessageId: string;
    toolName: string;
    args: unknown;
    toolResult: unknown;
    parentChatMessageId: string | null;
    reasoning: string | null;
    createdAt: string;
    generation: {
        modelId: string;
        inputTokens: number | null;
        outputTokens: number | null;
        totalTokens: number | null;
        reasoningTokens: number | null;
        cachedInputTokens: number | null;
    } | null;
};

type GqlCChatMessageFields_ChatMessageUser_Fragment = {
    __typename: 'ChatMessageUser';
    chatMessageId: string;
    body: string;
    createdAt: string;
    author: { userId: string; name: string };
    attachments: Array<{ fileUploadId: string; filename: string; mediaType: string; size: number; url: string }>;
};

type GqlCChatMessageFields_ChatMessageUserInput_Fragment = {
    __typename: 'ChatMessageUserInput';
    chatMessageId: string;
    collectionMessageId: string;
    createdAt: string;
    author: { userId: string; name: string };
    answers: Array<{
        inputId: string;
        value:
            | { __typename: 'ChatAssistantInputValueBoolean'; boolean: boolean }
            | { __typename: 'ChatAssistantInputValueDate'; date: string }
            | { __typename: 'ChatAssistantInputValueDateRange'; from: string; to: string }
            | { __typename: 'ChatAssistantInputValueDateTime'; dateTime: string }
            | { __typename: 'ChatAssistantInputValueString'; value: string }
            | { __typename: 'ChatAssistantInputValueStringList'; values: Array<string> }
            | { __typename: 'ChatAssistantInputValueTime'; time: string };
    }>;
};

export type GqlCChatMessageFieldsFragment =
    | GqlCChatMessageFields_ChatMessageAssistantInputCollection_Fragment
    | GqlCChatMessageFields_ChatMessageAssistantText_Fragment
    | GqlCChatMessageFields_ChatMessageToolApprovalRequest_Fragment
    | GqlCChatMessageFields_ChatMessageToolApprovalResponse_Fragment
    | GqlCChatMessageFields_ChatMessageToolCall_Fragment
    | GqlCChatMessageFields_ChatMessageUser_Fragment
    | GqlCChatMessageFields_ChatMessageUserInput_Fragment;

export type GqlCChatPageQueryVariables = Exact<{
    chatId: string;
}>;

export type GqlCChatPageQuery = {
    currentSession: {
        sessionId: string;
        user: { userId: string; name: string } | null;
        chat: {
            chatId: string;
            title: string;
            lastModifiedAt: string;
            messages: Array<
                | {
                      __typename: 'ChatMessageAssistantInputCollection';
                      chatMessageId: string;
                      prompt: string;
                      mode: string;
                      reasoning: string | null;
                      createdAt: string;
                      generation: {
                          modelId: string;
                          inputTokens: number | null;
                          outputTokens: number | null;
                          totalTokens: number | null;
                          reasoningTokens: number | null;
                          cachedInputTokens: number | null;
                      } | null;
                      inputs: Array<
                          | { __typename: 'ChatAssistantInputBoolean'; inputId: string; prompt: string }
                          | { __typename: 'ChatAssistantInputDate'; inputId: string; prompt: string }
                          | { __typename: 'ChatAssistantInputDateRange'; inputId: string; prompt: string }
                          | { __typename: 'ChatAssistantInputDateTime'; inputId: string; prompt: string }
                          | { __typename: 'ChatAssistantInputMultiSelect'; inputId: string; prompt: string; options: Array<string> }
                          | { __typename: 'ChatAssistantInputSingleSelect'; inputId: string; prompt: string; options: Array<string> }
                          | { __typename: 'ChatAssistantInputText'; inputId: string; prompt: string }
                          | { __typename: 'ChatAssistantInputTime'; inputId: string; prompt: string }
                      >;
                  }
                | {
                      __typename: 'ChatMessageAssistantText';
                      chatMessageId: string;
                      body: string;
                      reasoning: string | null;
                      createdAt: string;
                      blocks: Array<
                          | {
                                __typename: 'ChatAssistantBodyBlockCardList';
                                cards: Array<{
                                    imageUrl: string | null;
                                    title: string;
                                    description: string;
                                    price: string | null;
                                    href: string | null;
                                    buttonTitle: string | null;
                                }>;
                            }
                          | { __typename: 'ChatAssistantBodyBlockMarkdown'; text: string }
                      >;
                      sources: Array<{ title: string; url: string }>;
                      generation: {
                          modelId: string;
                          inputTokens: number | null;
                          outputTokens: number | null;
                          totalTokens: number | null;
                          reasoningTokens: number | null;
                          cachedInputTokens: number | null;
                      } | null;
                  }
                | {
                      __typename: 'ChatMessageToolApprovalRequest';
                      chatMessageId: string;
                      approvalId: string;
                      toolName: string;
                      args: unknown;
                      reasoning: string | null;
                      createdAt: string;
                      generation: {
                          modelId: string;
                          inputTokens: number | null;
                          outputTokens: number | null;
                          totalTokens: number | null;
                          reasoningTokens: number | null;
                          cachedInputTokens: number | null;
                      } | null;
                  }
                | {
                      __typename: 'ChatMessageToolApprovalResponse';
                      chatMessageId: string;
                      approvalId: string;
                      approved: boolean;
                      reason: string | null;
                      createdAt: string;
                  }
                | {
                      __typename: 'ChatMessageToolCall';
                      chatMessageId: string;
                      toolName: string;
                      args: unknown;
                      toolResult: unknown;
                      parentChatMessageId: string | null;
                      reasoning: string | null;
                      createdAt: string;
                      generation: {
                          modelId: string;
                          inputTokens: number | null;
                          outputTokens: number | null;
                          totalTokens: number | null;
                          reasoningTokens: number | null;
                          cachedInputTokens: number | null;
                      } | null;
                  }
                | {
                      __typename: 'ChatMessageUser';
                      chatMessageId: string;
                      body: string;
                      createdAt: string;
                      author: { userId: string; name: string };
                      attachments: Array<{ fileUploadId: string; filename: string; mediaType: string; size: number; url: string }>;
                  }
                | {
                      __typename: 'ChatMessageUserInput';
                      chatMessageId: string;
                      collectionMessageId: string;
                      createdAt: string;
                      author: { userId: string; name: string };
                      answers: Array<{
                          inputId: string;
                          value:
                              | { __typename: 'ChatAssistantInputValueBoolean'; boolean: boolean }
                              | { __typename: 'ChatAssistantInputValueDate'; date: string }
                              | { __typename: 'ChatAssistantInputValueDateRange'; from: string; to: string }
                              | { __typename: 'ChatAssistantInputValueDateTime'; dateTime: string }
                              | { __typename: 'ChatAssistantInputValueString'; value: string }
                              | { __typename: 'ChatAssistantInputValueStringList'; values: Array<string> }
                              | { __typename: 'ChatAssistantInputValueTime'; time: string };
                      }>;
                  }
            >;
        };
    };
};

export type GqlCChatMessageCreateMutationVariables = Exact<{
    chatId?: string | null | undefined;
    message: string;
    fileUploadIds?: Array<string> | string | null | undefined;
    generationId?: string | null | undefined;
    requireToolCallApprovals: boolean;
}>;

export type GqlCChatMessageCreateMutation = { session: { chatMessageCreate: { chatId: string; chatMessageId: string } | null } };

export type GqlCChatInputCollectionRespondMutationVariables = Exact<{
    collectionMessageId: string;
    answers: Array<Schema.GqlCChatMessageUserInputAnswerCreate> | Schema.GqlCChatMessageUserInputAnswerCreate;
    generationId?: string | null | undefined;
    requireToolCallApprovals: boolean;
}>;

export type GqlCChatInputCollectionRespondMutation = {
    session: { chatInputCollectionRespond: { chatId: string; chatMessageId: string } | null };
};

export type GqlCChatToolApprovalRespondMutationVariables = Exact<{
    approvalId: string;
    approved: boolean;
    reason?: string | null | undefined;
    generationId?: string | null | undefined;
    requireToolCallApprovals: boolean;
}>;

export type GqlCChatToolApprovalRespondMutation = {
    session: { chatToolApprovalRespond: { chatId: string; chatMessageId: string } | null };
};

export type GqlCChatUpdatesSubscriptionVariables = Exact<{
    generationId: string;
}>;

export type GqlCChatUpdatesSubscription = {
    chatUpdates:
        | { __typename: 'ChatUpdateAssistantBlocksClear'; chatMessageId: string }
        | {
              __typename: 'ChatUpdateAssistantBlocksReplace';
              chatMessageId: string;
              blocks: Array<
                  | {
                        __typename: 'ChatAssistantBodyBlockCardList';
                        cards: Array<{
                            imageUrl: string | null;
                            title: string;
                            description: string;
                            price: string | null;
                            href: string | null;
                            buttonTitle: string | null;
                        }>;
                    }
                  | { __typename: 'ChatAssistantBodyBlockMarkdown'; text: string }
              >;
          }
        | { __typename: 'ChatUpdateAssistantReasoningChunk'; chatMessageId: string; delta: string }
        | { __typename: 'ChatUpdateAssistantTextChunk'; chatMessageId: string; delta: string }
        | { __typename: 'ChatUpdateAssistantTextClear'; chatMessageId: string }
        | {
              __typename: 'ChatUpdateMessageAppended';
              message:
                  | {
                        __typename: 'ChatMessageAssistantInputCollection';
                        chatMessageId: string;
                        prompt: string;
                        mode: string;
                        reasoning: string | null;
                        createdAt: string;
                        generation: {
                            modelId: string;
                            inputTokens: number | null;
                            outputTokens: number | null;
                            totalTokens: number | null;
                            reasoningTokens: number | null;
                            cachedInputTokens: number | null;
                        } | null;
                        inputs: Array<
                            | { __typename: 'ChatAssistantInputBoolean'; inputId: string; prompt: string }
                            | { __typename: 'ChatAssistantInputDate'; inputId: string; prompt: string }
                            | { __typename: 'ChatAssistantInputDateRange'; inputId: string; prompt: string }
                            | { __typename: 'ChatAssistantInputDateTime'; inputId: string; prompt: string }
                            | { __typename: 'ChatAssistantInputMultiSelect'; inputId: string; prompt: string; options: Array<string> }
                            | { __typename: 'ChatAssistantInputSingleSelect'; inputId: string; prompt: string; options: Array<string> }
                            | { __typename: 'ChatAssistantInputText'; inputId: string; prompt: string }
                            | { __typename: 'ChatAssistantInputTime'; inputId: string; prompt: string }
                        >;
                    }
                  | {
                        __typename: 'ChatMessageAssistantText';
                        chatMessageId: string;
                        body: string;
                        reasoning: string | null;
                        createdAt: string;
                        blocks: Array<
                            | {
                                  __typename: 'ChatAssistantBodyBlockCardList';
                                  cards: Array<{
                                      imageUrl: string | null;
                                      title: string;
                                      description: string;
                                      price: string | null;
                                      href: string | null;
                                      buttonTitle: string | null;
                                  }>;
                              }
                            | { __typename: 'ChatAssistantBodyBlockMarkdown'; text: string }
                        >;
                        sources: Array<{ title: string; url: string }>;
                        generation: {
                            modelId: string;
                            inputTokens: number | null;
                            outputTokens: number | null;
                            totalTokens: number | null;
                            reasoningTokens: number | null;
                            cachedInputTokens: number | null;
                        } | null;
                    }
                  | {
                        __typename: 'ChatMessageToolApprovalRequest';
                        chatMessageId: string;
                        approvalId: string;
                        toolName: string;
                        args: unknown;
                        reasoning: string | null;
                        createdAt: string;
                        generation: {
                            modelId: string;
                            inputTokens: number | null;
                            outputTokens: number | null;
                            totalTokens: number | null;
                            reasoningTokens: number | null;
                            cachedInputTokens: number | null;
                        } | null;
                    }
                  | {
                        __typename: 'ChatMessageToolApprovalResponse';
                        chatMessageId: string;
                        approvalId: string;
                        approved: boolean;
                        reason: string | null;
                        createdAt: string;
                    }
                  | {
                        __typename: 'ChatMessageToolCall';
                        chatMessageId: string;
                        toolName: string;
                        args: unknown;
                        toolResult: unknown;
                        parentChatMessageId: string | null;
                        reasoning: string | null;
                        createdAt: string;
                        generation: {
                            modelId: string;
                            inputTokens: number | null;
                            outputTokens: number | null;
                            totalTokens: number | null;
                            reasoningTokens: number | null;
                            cachedInputTokens: number | null;
                        } | null;
                    }
                  | {
                        __typename: 'ChatMessageUser';
                        chatMessageId: string;
                        body: string;
                        createdAt: string;
                        author: { userId: string; name: string };
                        attachments: Array<{ fileUploadId: string; filename: string; mediaType: string; size: number; url: string }>;
                    }
                  | {
                        __typename: 'ChatMessageUserInput';
                        chatMessageId: string;
                        collectionMessageId: string;
                        createdAt: string;
                        author: { userId: string; name: string };
                        answers: Array<{
                            inputId: string;
                            value:
                                | { __typename: 'ChatAssistantInputValueBoolean'; boolean: boolean }
                                | { __typename: 'ChatAssistantInputValueDate'; date: string }
                                | { __typename: 'ChatAssistantInputValueDateRange'; from: string; to: string }
                                | { __typename: 'ChatAssistantInputValueDateTime'; dateTime: string }
                                | { __typename: 'ChatAssistantInputValueString'; value: string }
                                | { __typename: 'ChatAssistantInputValueStringList'; values: Array<string> }
                                | { __typename: 'ChatAssistantInputValueTime'; time: string };
                        }>;
                    };
          }
        | { __typename: 'ChatUpdateTurnEnded'; generationId: string };
};

export type GqlCHomePageQueryVariables = Exact<{ [key: string]: never }>;

export type GqlCHomePageQuery = { currentSession: { sessionId: string } };

export type GqlCWatchFieldsFragment = {
    scenarioId: string;
    title: string;
    description: string;
    status: Schema.GqlCWatchStatus;
    simMs: number;
    centerLat: number;
    centerLon: number;
    zoom: number;
    selectedMmsi: string | null;
    dataSources: Array<{ id: Schema.GqlCVesselDataSource; enabled: boolean; status: string; vesselCount: number }>;
    vessels: Array<{
        mmsi: string;
        name: string;
        imo: string | null;
        shipType: string;
        flag: string;
        aisDark: boolean;
        dataSource: Schema.GqlCVesselDataSource;
        riskScore: number;
        riskLevel: Schema.GqlCRiskLevel;
        riskTrend: Schema.GqlCRiskTrend;
        nearestAssetId: string | null;
        nearestAssetDistanceNm: number | null;
        activeFactors: Array<{ rule: Schema.GqlCRiskRule; scoreDelta: number; explanation: string; source: string }>;
        trackTail: Array<{ lat: number; lon: number }>;
        radarPosition: { lat: number; lon: number } | null;
        position: { lat: number; lon: number; sog: number; cog: number; heading: number; timestamp: string } | null;
    }>;
    anomalies: Array<{
        anomalyId: string;
        mmsi: string;
        kind: Schema.GqlCAnomalyKind;
        severity: Schema.GqlCAnomalySeverity;
        title: string;
        summary: string;
        detectedAtSimMs: number;
        evidence: unknown;
    }>;
    riskEvents: Array<{
        riskEventId: string;
        mmsi: string;
        detectedAtSimMs: number;
        rule: Schema.GqlCRiskRule;
        scoreDelta: number;
        previousScore: number;
        newScore: number;
        explanation: string;
        source: string;
    }>;
    incidents: Array<{
        incidentId: string;
        mmsi: string;
        openedAtSimMs: number;
        closedAtSimMs: number | null;
        maxRiskScore: number;
        status: Schema.GqlCIncidentStatus;
        timeline: Array<{
            eventId: string;
            detectedAtSimMs: number;
            eventType: string;
            source: string;
            explanation: string;
            riskChange: number | null;
        }>;
    }>;
    osintAlerts: Array<{ alertId: string; source: string; title: string; body: string; region: string }>;
    highRiskZones: Array<{ zoneId: string; name: string; ring: Array<{ lat: number; lon: number }> }>;
    protectedAssets: Array<{
        assetId: string;
        name: string;
        type: Schema.GqlCProtectedAssetType;
        riskRadiusNm: number;
        path: Array<{ lat: number; lon: number }>;
    }>;
};

export type GqlCWatchPageQueryVariables = Exact<{ [key: string]: never }>;

export type GqlCWatchPageQuery = {
    currentSession: {
        sessionId: string;
        watch: {
            scenarioId: string;
            title: string;
            description: string;
            status: Schema.GqlCWatchStatus;
            simMs: number;
            centerLat: number;
            centerLon: number;
            zoom: number;
            selectedMmsi: string | null;
            dataSources: Array<{ id: Schema.GqlCVesselDataSource; enabled: boolean; status: string; vesselCount: number }>;
            vessels: Array<{
                mmsi: string;
                name: string;
                imo: string | null;
                shipType: string;
                flag: string;
                aisDark: boolean;
                dataSource: Schema.GqlCVesselDataSource;
                riskScore: number;
                riskLevel: Schema.GqlCRiskLevel;
                riskTrend: Schema.GqlCRiskTrend;
                nearestAssetId: string | null;
                nearestAssetDistanceNm: number | null;
                activeFactors: Array<{ rule: Schema.GqlCRiskRule; scoreDelta: number; explanation: string; source: string }>;
                trackTail: Array<{ lat: number; lon: number }>;
                radarPosition: { lat: number; lon: number } | null;
                position: { lat: number; lon: number; sog: number; cog: number; heading: number; timestamp: string } | null;
            }>;
            anomalies: Array<{
                anomalyId: string;
                mmsi: string;
                kind: Schema.GqlCAnomalyKind;
                severity: Schema.GqlCAnomalySeverity;
                title: string;
                summary: string;
                detectedAtSimMs: number;
                evidence: unknown;
            }>;
            riskEvents: Array<{
                riskEventId: string;
                mmsi: string;
                detectedAtSimMs: number;
                rule: Schema.GqlCRiskRule;
                scoreDelta: number;
                previousScore: number;
                newScore: number;
                explanation: string;
                source: string;
            }>;
            incidents: Array<{
                incidentId: string;
                mmsi: string;
                openedAtSimMs: number;
                closedAtSimMs: number | null;
                maxRiskScore: number;
                status: Schema.GqlCIncidentStatus;
                timeline: Array<{
                    eventId: string;
                    detectedAtSimMs: number;
                    eventType: string;
                    source: string;
                    explanation: string;
                    riskChange: number | null;
                }>;
            }>;
            osintAlerts: Array<{ alertId: string; source: string; title: string; body: string; region: string }>;
            highRiskZones: Array<{ zoneId: string; name: string; ring: Array<{ lat: number; lon: number }> }>;
            protectedAssets: Array<{
                assetId: string;
                name: string;
                type: Schema.GqlCProtectedAssetType;
                riskRadiusNm: number;
                path: Array<{ lat: number; lon: number }>;
            }>;
        };
        scenarios: Array<{ scenarioId: string; title: string; description: string }>;
    };
};

export type GqlCVesselSelectMutationVariables = Exact<{
    mmsi?: string | null | undefined;
}>;

export type GqlCVesselSelectMutation = {
    session: {
        vesselSelect: {
            scenarioId: string;
            title: string;
            description: string;
            status: Schema.GqlCWatchStatus;
            simMs: number;
            centerLat: number;
            centerLon: number;
            zoom: number;
            selectedMmsi: string | null;
            dataSources: Array<{ id: Schema.GqlCVesselDataSource; enabled: boolean; status: string; vesselCount: number }>;
            vessels: Array<{
                mmsi: string;
                name: string;
                imo: string | null;
                shipType: string;
                flag: string;
                aisDark: boolean;
                dataSource: Schema.GqlCVesselDataSource;
                riskScore: number;
                riskLevel: Schema.GqlCRiskLevel;
                riskTrend: Schema.GqlCRiskTrend;
                nearestAssetId: string | null;
                nearestAssetDistanceNm: number | null;
                activeFactors: Array<{ rule: Schema.GqlCRiskRule; scoreDelta: number; explanation: string; source: string }>;
                trackTail: Array<{ lat: number; lon: number }>;
                radarPosition: { lat: number; lon: number } | null;
                position: { lat: number; lon: number; sog: number; cog: number; heading: number; timestamp: string } | null;
            }>;
            anomalies: Array<{
                anomalyId: string;
                mmsi: string;
                kind: Schema.GqlCAnomalyKind;
                severity: Schema.GqlCAnomalySeverity;
                title: string;
                summary: string;
                detectedAtSimMs: number;
                evidence: unknown;
            }>;
            riskEvents: Array<{
                riskEventId: string;
                mmsi: string;
                detectedAtSimMs: number;
                rule: Schema.GqlCRiskRule;
                scoreDelta: number;
                previousScore: number;
                newScore: number;
                explanation: string;
                source: string;
            }>;
            incidents: Array<{
                incidentId: string;
                mmsi: string;
                openedAtSimMs: number;
                closedAtSimMs: number | null;
                maxRiskScore: number;
                status: Schema.GqlCIncidentStatus;
                timeline: Array<{
                    eventId: string;
                    detectedAtSimMs: number;
                    eventType: string;
                    source: string;
                    explanation: string;
                    riskChange: number | null;
                }>;
            }>;
            osintAlerts: Array<{ alertId: string; source: string; title: string; body: string; region: string }>;
            highRiskZones: Array<{ zoneId: string; name: string; ring: Array<{ lat: number; lon: number }> }>;
            protectedAssets: Array<{
                assetId: string;
                name: string;
                type: Schema.GqlCProtectedAssetType;
                riskRadiusNm: number;
                path: Array<{ lat: number; lon: number }>;
            }>;
        } | null;
    };
};

export type GqlCVesselIntelligenceRequestMutationVariables = Exact<{
    mmsi: string;
}>;

export type GqlCVesselIntelligenceRequestMutation = {
    session: { vesselIntelligenceRequest: { success: boolean; referenceId: string | null } };
};

export type GqlCAlertAcknowledgeMutationVariables = Exact<{
    incidentId: string;
}>;

export type GqlCAlertAcknowledgeMutation = {
    session: {
        alertAcknowledge: {
            scenarioId: string;
            title: string;
            description: string;
            status: Schema.GqlCWatchStatus;
            simMs: number;
            centerLat: number;
            centerLon: number;
            zoom: number;
            selectedMmsi: string | null;
            dataSources: Array<{ id: Schema.GqlCVesselDataSource; enabled: boolean; status: string; vesselCount: number }>;
            vessels: Array<{
                mmsi: string;
                name: string;
                imo: string | null;
                shipType: string;
                flag: string;
                aisDark: boolean;
                dataSource: Schema.GqlCVesselDataSource;
                riskScore: number;
                riskLevel: Schema.GqlCRiskLevel;
                riskTrend: Schema.GqlCRiskTrend;
                nearestAssetId: string | null;
                nearestAssetDistanceNm: number | null;
                activeFactors: Array<{ rule: Schema.GqlCRiskRule; scoreDelta: number; explanation: string; source: string }>;
                trackTail: Array<{ lat: number; lon: number }>;
                radarPosition: { lat: number; lon: number } | null;
                position: { lat: number; lon: number; sog: number; cog: number; heading: number; timestamp: string } | null;
            }>;
            anomalies: Array<{
                anomalyId: string;
                mmsi: string;
                kind: Schema.GqlCAnomalyKind;
                severity: Schema.GqlCAnomalySeverity;
                title: string;
                summary: string;
                detectedAtSimMs: number;
                evidence: unknown;
            }>;
            riskEvents: Array<{
                riskEventId: string;
                mmsi: string;
                detectedAtSimMs: number;
                rule: Schema.GqlCRiskRule;
                scoreDelta: number;
                previousScore: number;
                newScore: number;
                explanation: string;
                source: string;
            }>;
            incidents: Array<{
                incidentId: string;
                mmsi: string;
                openedAtSimMs: number;
                closedAtSimMs: number | null;
                maxRiskScore: number;
                status: Schema.GqlCIncidentStatus;
                timeline: Array<{
                    eventId: string;
                    detectedAtSimMs: number;
                    eventType: string;
                    source: string;
                    explanation: string;
                    riskChange: number | null;
                }>;
            }>;
            osintAlerts: Array<{ alertId: string; source: string; title: string; body: string; region: string }>;
            highRiskZones: Array<{ zoneId: string; name: string; ring: Array<{ lat: number; lon: number }> }>;
            protectedAssets: Array<{
                assetId: string;
                name: string;
                type: Schema.GqlCProtectedAssetType;
                riskRadiusNm: number;
                path: Array<{ lat: number; lon: number }>;
            }>;
        } | null;
    };
};

export type GqlCScenarioResetMutationVariables = Exact<{ [key: string]: never }>;

export type GqlCScenarioResetMutation = {
    session: {
        scenarioReset: {
            scenarioId: string;
            title: string;
            description: string;
            status: Schema.GqlCWatchStatus;
            simMs: number;
            centerLat: number;
            centerLon: number;
            zoom: number;
            selectedMmsi: string | null;
            dataSources: Array<{ id: Schema.GqlCVesselDataSource; enabled: boolean; status: string; vesselCount: number }>;
            vessels: Array<{
                mmsi: string;
                name: string;
                imo: string | null;
                shipType: string;
                flag: string;
                aisDark: boolean;
                dataSource: Schema.GqlCVesselDataSource;
                riskScore: number;
                riskLevel: Schema.GqlCRiskLevel;
                riskTrend: Schema.GqlCRiskTrend;
                nearestAssetId: string | null;
                nearestAssetDistanceNm: number | null;
                activeFactors: Array<{ rule: Schema.GqlCRiskRule; scoreDelta: number; explanation: string; source: string }>;
                trackTail: Array<{ lat: number; lon: number }>;
                radarPosition: { lat: number; lon: number } | null;
                position: { lat: number; lon: number; sog: number; cog: number; heading: number; timestamp: string } | null;
            }>;
            anomalies: Array<{
                anomalyId: string;
                mmsi: string;
                kind: Schema.GqlCAnomalyKind;
                severity: Schema.GqlCAnomalySeverity;
                title: string;
                summary: string;
                detectedAtSimMs: number;
                evidence: unknown;
            }>;
            riskEvents: Array<{
                riskEventId: string;
                mmsi: string;
                detectedAtSimMs: number;
                rule: Schema.GqlCRiskRule;
                scoreDelta: number;
                previousScore: number;
                newScore: number;
                explanation: string;
                source: string;
            }>;
            incidents: Array<{
                incidentId: string;
                mmsi: string;
                openedAtSimMs: number;
                closedAtSimMs: number | null;
                maxRiskScore: number;
                status: Schema.GqlCIncidentStatus;
                timeline: Array<{
                    eventId: string;
                    detectedAtSimMs: number;
                    eventType: string;
                    source: string;
                    explanation: string;
                    riskChange: number | null;
                }>;
            }>;
            osintAlerts: Array<{ alertId: string; source: string; title: string; body: string; region: string }>;
            highRiskZones: Array<{ zoneId: string; name: string; ring: Array<{ lat: number; lon: number }> }>;
            protectedAssets: Array<{
                assetId: string;
                name: string;
                type: Schema.GqlCProtectedAssetType;
                riskRadiusNm: number;
                path: Array<{ lat: number; lon: number }>;
            }>;
        } | null;
    };
};

export type GqlCMockAisSetEnabledMutationVariables = Exact<{
    enabled: boolean;
}>;

export type GqlCMockAisSetEnabledMutation = {
    session: {
        mockAisSetEnabled: {
            scenarioId: string;
            title: string;
            description: string;
            status: Schema.GqlCWatchStatus;
            simMs: number;
            centerLat: number;
            centerLon: number;
            zoom: number;
            selectedMmsi: string | null;
            dataSources: Array<{ id: Schema.GqlCVesselDataSource; enabled: boolean; status: string; vesselCount: number }>;
            vessels: Array<{
                mmsi: string;
                name: string;
                imo: string | null;
                shipType: string;
                flag: string;
                aisDark: boolean;
                dataSource: Schema.GqlCVesselDataSource;
                riskScore: number;
                riskLevel: Schema.GqlCRiskLevel;
                riskTrend: Schema.GqlCRiskTrend;
                nearestAssetId: string | null;
                nearestAssetDistanceNm: number | null;
                activeFactors: Array<{ rule: Schema.GqlCRiskRule; scoreDelta: number; explanation: string; source: string }>;
                trackTail: Array<{ lat: number; lon: number }>;
                radarPosition: { lat: number; lon: number } | null;
                position: { lat: number; lon: number; sog: number; cog: number; heading: number; timestamp: string } | null;
            }>;
            anomalies: Array<{
                anomalyId: string;
                mmsi: string;
                kind: Schema.GqlCAnomalyKind;
                severity: Schema.GqlCAnomalySeverity;
                title: string;
                summary: string;
                detectedAtSimMs: number;
                evidence: unknown;
            }>;
            riskEvents: Array<{
                riskEventId: string;
                mmsi: string;
                detectedAtSimMs: number;
                rule: Schema.GqlCRiskRule;
                scoreDelta: number;
                previousScore: number;
                newScore: number;
                explanation: string;
                source: string;
            }>;
            incidents: Array<{
                incidentId: string;
                mmsi: string;
                openedAtSimMs: number;
                closedAtSimMs: number | null;
                maxRiskScore: number;
                status: Schema.GqlCIncidentStatus;
                timeline: Array<{
                    eventId: string;
                    detectedAtSimMs: number;
                    eventType: string;
                    source: string;
                    explanation: string;
                    riskChange: number | null;
                }>;
            }>;
            osintAlerts: Array<{ alertId: string; source: string; title: string; body: string; region: string }>;
            highRiskZones: Array<{ zoneId: string; name: string; ring: Array<{ lat: number; lon: number }> }>;
            protectedAssets: Array<{
                assetId: string;
                name: string;
                type: Schema.GqlCProtectedAssetType;
                riskRadiusNm: number;
                path: Array<{ lat: number; lon: number }>;
            }>;
        } | null;
    };
};

export type GqlCSessionUpdatesSubscriptionVariables = Exact<{ [key: string]: never }>;

export type GqlCSessionUpdatesSubscription = {
    sessionUpdates:
        | {
              __typename: 'SessionUpdateAnomalyAppended';
              anomaly: {
                  anomalyId: string;
                  mmsi: string;
                  kind: Schema.GqlCAnomalyKind;
                  severity: Schema.GqlCAnomalySeverity;
                  title: string;
                  summary: string;
                  detectedAtSimMs: number;
                  evidence: unknown;
              };
          }
        | {
              __typename: 'SessionUpdateIntelligence';
              intelligence: {
                  mmsi: string;
                  vesselName: string;
                  status: string;
                  summary: string;
                  whyFlagged: string;
                  playbookSteps: Array<string>;
                  generatedAt: string;
                  citations: Array<{ label: string; source: string }>;
              };
          }
        | {
              __typename: 'SessionUpdateWatchSnapshot';
              watch: {
                  scenarioId: string;
                  title: string;
                  description: string;
                  status: Schema.GqlCWatchStatus;
                  simMs: number;
                  centerLat: number;
                  centerLon: number;
                  zoom: number;
                  selectedMmsi: string | null;
                  dataSources: Array<{ id: Schema.GqlCVesselDataSource; enabled: boolean; status: string; vesselCount: number }>;
                  vessels: Array<{
                      mmsi: string;
                      name: string;
                      imo: string | null;
                      shipType: string;
                      flag: string;
                      aisDark: boolean;
                      dataSource: Schema.GqlCVesselDataSource;
                      riskScore: number;
                      riskLevel: Schema.GqlCRiskLevel;
                      riskTrend: Schema.GqlCRiskTrend;
                      nearestAssetId: string | null;
                      nearestAssetDistanceNm: number | null;
                      activeFactors: Array<{ rule: Schema.GqlCRiskRule; scoreDelta: number; explanation: string; source: string }>;
                      trackTail: Array<{ lat: number; lon: number }>;
                      radarPosition: { lat: number; lon: number } | null;
                      position: { lat: number; lon: number; sog: number; cog: number; heading: number; timestamp: string } | null;
                  }>;
                  anomalies: Array<{
                      anomalyId: string;
                      mmsi: string;
                      kind: Schema.GqlCAnomalyKind;
                      severity: Schema.GqlCAnomalySeverity;
                      title: string;
                      summary: string;
                      detectedAtSimMs: number;
                      evidence: unknown;
                  }>;
                  riskEvents: Array<{
                      riskEventId: string;
                      mmsi: string;
                      detectedAtSimMs: number;
                      rule: Schema.GqlCRiskRule;
                      scoreDelta: number;
                      previousScore: number;
                      newScore: number;
                      explanation: string;
                      source: string;
                  }>;
                  incidents: Array<{
                      incidentId: string;
                      mmsi: string;
                      openedAtSimMs: number;
                      closedAtSimMs: number | null;
                      maxRiskScore: number;
                      status: Schema.GqlCIncidentStatus;
                      timeline: Array<{
                          eventId: string;
                          detectedAtSimMs: number;
                          eventType: string;
                          source: string;
                          explanation: string;
                          riskChange: number | null;
                      }>;
                  }>;
                  osintAlerts: Array<{ alertId: string; source: string; title: string; body: string; region: string }>;
                  highRiskZones: Array<{ zoneId: string; name: string; ring: Array<{ lat: number; lon: number }> }>;
                  protectedAssets: Array<{
                      assetId: string;
                      name: string;
                      type: Schema.GqlCProtectedAssetType;
                      riskRadiusNm: number;
                      path: Array<{ lat: number; lon: number }>;
                  }>;
              };
          };
};

export const ChatAssistantBodyBlockFieldsFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'ChatAssistantBodyBlockFields' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatAssistantBodyBlock' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatAssistantBodyBlockMarkdown' } },
                        selectionSet: { kind: 'SelectionSet', selections: [{ kind: 'Field', name: { kind: 'Name', value: 'text' } }] },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatAssistantBodyBlockCardList' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'cards' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'price' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'href' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'buttonTitle' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<GqlCChatAssistantBodyBlockFieldsFragment, unknown>;
export const ChatMessageGenerationFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'ChatMessageGeneration' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatMessageGeneration' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'modelId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'inputTokens' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'outputTokens' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'totalTokens' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'reasoningTokens' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'cachedInputTokens' } },
                ],
            },
        },
    ],
} as unknown as DocumentNode<GqlCChatMessageGenerationFragment, unknown>;
export const ChatMessageFieldsFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'ChatMessageFields' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatMessage' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatMessageUser' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'chatMessageId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'body' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'author' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'userId' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'attachments' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'fileUploadId' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'filename' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'mediaType' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'size' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'url' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatMessageAssistantText' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'chatMessageId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'body' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'blocks' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ChatAssistantBodyBlockFields' } },
                                        ],
                                    },
                                },
                                { kind: 'Field', name: { kind: 'Name', value: 'reasoning' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'sources' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'url' } },
                                        ],
                                    },
                                },
                                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'generation' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'ChatMessageGeneration' } }],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatMessageToolCall' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'chatMessageId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'toolName' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'args' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'toolResult' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'parentChatMessageId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'reasoning' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'generation' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'ChatMessageGeneration' } }],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatMessageToolApprovalRequest' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'chatMessageId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'approvalId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'toolName' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'args' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'reasoning' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'generation' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'ChatMessageGeneration' } }],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatMessageToolApprovalResponse' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'chatMessageId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'approvalId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'approved' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'reason' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatMessageAssistantInputCollection' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'chatMessageId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'prompt' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'mode' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'reasoning' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'generation' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'ChatMessageGeneration' } }],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'inputs' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                                            {
                                                kind: 'InlineFragment',
                                                typeCondition: {
                                                    kind: 'NamedType',
                                                    name: { kind: 'Name', value: 'ChatAssistantInputDate' },
                                                },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        { kind: 'Field', name: { kind: 'Name', value: 'inputId' } },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'prompt' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'InlineFragment',
                                                typeCondition: {
                                                    kind: 'NamedType',
                                                    name: { kind: 'Name', value: 'ChatAssistantInputDateRange' },
                                                },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        { kind: 'Field', name: { kind: 'Name', value: 'inputId' } },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'prompt' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'InlineFragment',
                                                typeCondition: {
                                                    kind: 'NamedType',
                                                    name: { kind: 'Name', value: 'ChatAssistantInputDateTime' },
                                                },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        { kind: 'Field', name: { kind: 'Name', value: 'inputId' } },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'prompt' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'InlineFragment',
                                                typeCondition: {
                                                    kind: 'NamedType',
                                                    name: { kind: 'Name', value: 'ChatAssistantInputTime' },
                                                },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        { kind: 'Field', name: { kind: 'Name', value: 'inputId' } },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'prompt' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'InlineFragment',
                                                typeCondition: {
                                                    kind: 'NamedType',
                                                    name: { kind: 'Name', value: 'ChatAssistantInputSingleSelect' },
                                                },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        { kind: 'Field', name: { kind: 'Name', value: 'inputId' } },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'prompt' } },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'options' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'InlineFragment',
                                                typeCondition: {
                                                    kind: 'NamedType',
                                                    name: { kind: 'Name', value: 'ChatAssistantInputMultiSelect' },
                                                },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        { kind: 'Field', name: { kind: 'Name', value: 'inputId' } },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'prompt' } },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'options' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'InlineFragment',
                                                typeCondition: {
                                                    kind: 'NamedType',
                                                    name: { kind: 'Name', value: 'ChatAssistantInputBoolean' },
                                                },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        { kind: 'Field', name: { kind: 'Name', value: 'inputId' } },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'prompt' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'InlineFragment',
                                                typeCondition: {
                                                    kind: 'NamedType',
                                                    name: { kind: 'Name', value: 'ChatAssistantInputText' },
                                                },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        { kind: 'Field', name: { kind: 'Name', value: 'inputId' } },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'prompt' } },
                                                    ],
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatMessageUserInput' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'chatMessageId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'collectionMessageId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'author' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'userId' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'answers' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'inputId' } },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'value' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                                                        {
                                                            kind: 'InlineFragment',
                                                            typeCondition: {
                                                                kind: 'NamedType',
                                                                name: { kind: 'Name', value: 'ChatAssistantInputValueDate' },
                                                            },
                                                            selectionSet: {
                                                                kind: 'SelectionSet',
                                                                selections: [{ kind: 'Field', name: { kind: 'Name', value: 'date' } }],
                                                            },
                                                        },
                                                        {
                                                            kind: 'InlineFragment',
                                                            typeCondition: {
                                                                kind: 'NamedType',
                                                                name: { kind: 'Name', value: 'ChatAssistantInputValueDateRange' },
                                                            },
                                                            selectionSet: {
                                                                kind: 'SelectionSet',
                                                                selections: [
                                                                    { kind: 'Field', name: { kind: 'Name', value: 'from' } },
                                                                    { kind: 'Field', name: { kind: 'Name', value: 'to' } },
                                                                ],
                                                            },
                                                        },
                                                        {
                                                            kind: 'InlineFragment',
                                                            typeCondition: {
                                                                kind: 'NamedType',
                                                                name: { kind: 'Name', value: 'ChatAssistantInputValueDateTime' },
                                                            },
                                                            selectionSet: {
                                                                kind: 'SelectionSet',
                                                                selections: [{ kind: 'Field', name: { kind: 'Name', value: 'dateTime' } }],
                                                            },
                                                        },
                                                        {
                                                            kind: 'InlineFragment',
                                                            typeCondition: {
                                                                kind: 'NamedType',
                                                                name: { kind: 'Name', value: 'ChatAssistantInputValueTime' },
                                                            },
                                                            selectionSet: {
                                                                kind: 'SelectionSet',
                                                                selections: [{ kind: 'Field', name: { kind: 'Name', value: 'time' } }],
                                                            },
                                                        },
                                                        {
                                                            kind: 'InlineFragment',
                                                            typeCondition: {
                                                                kind: 'NamedType',
                                                                name: { kind: 'Name', value: 'ChatAssistantInputValueString' },
                                                            },
                                                            selectionSet: {
                                                                kind: 'SelectionSet',
                                                                selections: [{ kind: 'Field', name: { kind: 'Name', value: 'value' } }],
                                                            },
                                                        },
                                                        {
                                                            kind: 'InlineFragment',
                                                            typeCondition: {
                                                                kind: 'NamedType',
                                                                name: { kind: 'Name', value: 'ChatAssistantInputValueStringList' },
                                                            },
                                                            selectionSet: {
                                                                kind: 'SelectionSet',
                                                                selections: [{ kind: 'Field', name: { kind: 'Name', value: 'values' } }],
                                                            },
                                                        },
                                                        {
                                                            kind: 'InlineFragment',
                                                            typeCondition: {
                                                                kind: 'NamedType',
                                                                name: { kind: 'Name', value: 'ChatAssistantInputValueBoolean' },
                                                            },
                                                            selectionSet: {
                                                                kind: 'SelectionSet',
                                                                selections: [{ kind: 'Field', name: { kind: 'Name', value: 'boolean' } }],
                                                            },
                                                        },
                                                    ],
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'ChatAssistantBodyBlockFields' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatAssistantBodyBlock' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatAssistantBodyBlockMarkdown' } },
                        selectionSet: { kind: 'SelectionSet', selections: [{ kind: 'Field', name: { kind: 'Name', value: 'text' } }] },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatAssistantBodyBlockCardList' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'cards' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'price' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'href' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'buttonTitle' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'ChatMessageGeneration' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatMessageGeneration' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'modelId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'inputTokens' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'outputTokens' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'totalTokens' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'reasoningTokens' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'cachedInputTokens' } },
                ],
            },
        },
    ],
} as unknown as DocumentNode<GqlCChatMessageFieldsFragment, unknown>;
export const WatchFieldsFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'WatchFields' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'WatchState' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'scenarioId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'simMs' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'centerLat' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'centerLon' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'zoom' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'selectedMmsi' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'dataSources' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'enabled' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'vesselCount' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'vessels' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'mmsi' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'imo' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'shipType' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'flag' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'aisDark' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'dataSource' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'riskScore' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'riskLevel' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'riskTrend' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'nearestAssetId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'nearestAssetDistanceNm' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'activeFactors' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'rule' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'scoreDelta' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'explanation' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'source' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'trackTail' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'lat' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'lon' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'radarPosition' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'lat' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'lon' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'position' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'lat' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'lon' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'sog' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'cog' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'heading' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'timestamp' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'anomalies' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'anomalyId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'mmsi' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'kind' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'severity' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'summary' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'detectedAtSimMs' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'evidence' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'riskEvents' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'riskEventId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'mmsi' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'detectedAtSimMs' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'rule' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'scoreDelta' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'previousScore' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'newScore' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'explanation' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'source' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'incidents' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'incidentId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'mmsi' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'openedAtSimMs' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'closedAtSimMs' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'maxRiskScore' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'timeline' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'eventId' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'detectedAtSimMs' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'eventType' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'source' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'explanation' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'riskChange' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'osintAlerts' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'alertId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'source' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'body' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'region' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'highRiskZones' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'ring' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'lat' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'lon' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'protectedAssets' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'assetId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'riskRadiusNm' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'path' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'lat' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'lon' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<GqlCWatchFieldsFragment, unknown>;
export const ChatPageDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'ChatPage' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'chatId' } },
                    type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } } },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'currentSession' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'sessionId' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'user' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'userId' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'chat' },
                                    arguments: [
                                        {
                                            kind: 'Argument',
                                            name: { kind: 'Name', value: 'chatId' },
                                            value: { kind: 'Variable', name: { kind: 'Name', value: 'chatId' } },
                                        },
                                    ],
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'chatId' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'lastModifiedAt' } },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'messages' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ChatMessageFields' } },
                                                    ],
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'ChatAssistantBodyBlockFields' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatAssistantBodyBlock' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatAssistantBodyBlockMarkdown' } },
                        selectionSet: { kind: 'SelectionSet', selections: [{ kind: 'Field', name: { kind: 'Name', value: 'text' } }] },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatAssistantBodyBlockCardList' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'cards' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'price' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'href' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'buttonTitle' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'ChatMessageGeneration' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatMessageGeneration' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'modelId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'inputTokens' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'outputTokens' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'totalTokens' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'reasoningTokens' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'cachedInputTokens' } },
                ],
            },
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'ChatMessageFields' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatMessage' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatMessageUser' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'chatMessageId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'body' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'author' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'userId' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'attachments' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'fileUploadId' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'filename' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'mediaType' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'size' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'url' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatMessageAssistantText' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'chatMessageId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'body' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'blocks' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ChatAssistantBodyBlockFields' } },
                                        ],
                                    },
                                },
                                { kind: 'Field', name: { kind: 'Name', value: 'reasoning' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'sources' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'url' } },
                                        ],
                                    },
                                },
                                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'generation' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'ChatMessageGeneration' } }],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatMessageToolCall' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'chatMessageId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'toolName' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'args' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'toolResult' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'parentChatMessageId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'reasoning' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'generation' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'ChatMessageGeneration' } }],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatMessageToolApprovalRequest' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'chatMessageId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'approvalId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'toolName' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'args' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'reasoning' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'generation' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'ChatMessageGeneration' } }],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatMessageToolApprovalResponse' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'chatMessageId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'approvalId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'approved' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'reason' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatMessageAssistantInputCollection' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'chatMessageId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'prompt' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'mode' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'reasoning' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'generation' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'ChatMessageGeneration' } }],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'inputs' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                                            {
                                                kind: 'InlineFragment',
                                                typeCondition: {
                                                    kind: 'NamedType',
                                                    name: { kind: 'Name', value: 'ChatAssistantInputDate' },
                                                },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        { kind: 'Field', name: { kind: 'Name', value: 'inputId' } },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'prompt' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'InlineFragment',
                                                typeCondition: {
                                                    kind: 'NamedType',
                                                    name: { kind: 'Name', value: 'ChatAssistantInputDateRange' },
                                                },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        { kind: 'Field', name: { kind: 'Name', value: 'inputId' } },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'prompt' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'InlineFragment',
                                                typeCondition: {
                                                    kind: 'NamedType',
                                                    name: { kind: 'Name', value: 'ChatAssistantInputDateTime' },
                                                },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        { kind: 'Field', name: { kind: 'Name', value: 'inputId' } },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'prompt' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'InlineFragment',
                                                typeCondition: {
                                                    kind: 'NamedType',
                                                    name: { kind: 'Name', value: 'ChatAssistantInputTime' },
                                                },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        { kind: 'Field', name: { kind: 'Name', value: 'inputId' } },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'prompt' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'InlineFragment',
                                                typeCondition: {
                                                    kind: 'NamedType',
                                                    name: { kind: 'Name', value: 'ChatAssistantInputSingleSelect' },
                                                },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        { kind: 'Field', name: { kind: 'Name', value: 'inputId' } },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'prompt' } },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'options' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'InlineFragment',
                                                typeCondition: {
                                                    kind: 'NamedType',
                                                    name: { kind: 'Name', value: 'ChatAssistantInputMultiSelect' },
                                                },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        { kind: 'Field', name: { kind: 'Name', value: 'inputId' } },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'prompt' } },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'options' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'InlineFragment',
                                                typeCondition: {
                                                    kind: 'NamedType',
                                                    name: { kind: 'Name', value: 'ChatAssistantInputBoolean' },
                                                },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        { kind: 'Field', name: { kind: 'Name', value: 'inputId' } },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'prompt' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'InlineFragment',
                                                typeCondition: {
                                                    kind: 'NamedType',
                                                    name: { kind: 'Name', value: 'ChatAssistantInputText' },
                                                },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        { kind: 'Field', name: { kind: 'Name', value: 'inputId' } },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'prompt' } },
                                                    ],
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatMessageUserInput' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'chatMessageId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'collectionMessageId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'author' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'userId' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'answers' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'inputId' } },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'value' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                                                        {
                                                            kind: 'InlineFragment',
                                                            typeCondition: {
                                                                kind: 'NamedType',
                                                                name: { kind: 'Name', value: 'ChatAssistantInputValueDate' },
                                                            },
                                                            selectionSet: {
                                                                kind: 'SelectionSet',
                                                                selections: [{ kind: 'Field', name: { kind: 'Name', value: 'date' } }],
                                                            },
                                                        },
                                                        {
                                                            kind: 'InlineFragment',
                                                            typeCondition: {
                                                                kind: 'NamedType',
                                                                name: { kind: 'Name', value: 'ChatAssistantInputValueDateRange' },
                                                            },
                                                            selectionSet: {
                                                                kind: 'SelectionSet',
                                                                selections: [
                                                                    { kind: 'Field', name: { kind: 'Name', value: 'from' } },
                                                                    { kind: 'Field', name: { kind: 'Name', value: 'to' } },
                                                                ],
                                                            },
                                                        },
                                                        {
                                                            kind: 'InlineFragment',
                                                            typeCondition: {
                                                                kind: 'NamedType',
                                                                name: { kind: 'Name', value: 'ChatAssistantInputValueDateTime' },
                                                            },
                                                            selectionSet: {
                                                                kind: 'SelectionSet',
                                                                selections: [{ kind: 'Field', name: { kind: 'Name', value: 'dateTime' } }],
                                                            },
                                                        },
                                                        {
                                                            kind: 'InlineFragment',
                                                            typeCondition: {
                                                                kind: 'NamedType',
                                                                name: { kind: 'Name', value: 'ChatAssistantInputValueTime' },
                                                            },
                                                            selectionSet: {
                                                                kind: 'SelectionSet',
                                                                selections: [{ kind: 'Field', name: { kind: 'Name', value: 'time' } }],
                                                            },
                                                        },
                                                        {
                                                            kind: 'InlineFragment',
                                                            typeCondition: {
                                                                kind: 'NamedType',
                                                                name: { kind: 'Name', value: 'ChatAssistantInputValueString' },
                                                            },
                                                            selectionSet: {
                                                                kind: 'SelectionSet',
                                                                selections: [{ kind: 'Field', name: { kind: 'Name', value: 'value' } }],
                                                            },
                                                        },
                                                        {
                                                            kind: 'InlineFragment',
                                                            typeCondition: {
                                                                kind: 'NamedType',
                                                                name: { kind: 'Name', value: 'ChatAssistantInputValueStringList' },
                                                            },
                                                            selectionSet: {
                                                                kind: 'SelectionSet',
                                                                selections: [{ kind: 'Field', name: { kind: 'Name', value: 'values' } }],
                                                            },
                                                        },
                                                        {
                                                            kind: 'InlineFragment',
                                                            typeCondition: {
                                                                kind: 'NamedType',
                                                                name: { kind: 'Name', value: 'ChatAssistantInputValueBoolean' },
                                                            },
                                                            selectionSet: {
                                                                kind: 'SelectionSet',
                                                                selections: [{ kind: 'Field', name: { kind: 'Name', value: 'boolean' } }],
                                                            },
                                                        },
                                                    ],
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<GqlCChatPageQuery, GqlCChatPageQueryVariables>;
export const ChatMessageCreateDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'ChatMessageCreate' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'chatId' } },
                    type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'message' } },
                    type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'fileUploadIds' } },
                    type: {
                        kind: 'ListType',
                        type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } } },
                    },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'generationId' } },
                    type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'requireToolCallApprovals' } },
                    type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'Boolean' } } },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'session' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'chatMessageCreate' },
                                    arguments: [
                                        {
                                            kind: 'Argument',
                                            name: { kind: 'Name', value: 'chatId' },
                                            value: { kind: 'Variable', name: { kind: 'Name', value: 'chatId' } },
                                        },
                                        {
                                            kind: 'Argument',
                                            name: { kind: 'Name', value: 'message' },
                                            value: { kind: 'Variable', name: { kind: 'Name', value: 'message' } },
                                        },
                                        {
                                            kind: 'Argument',
                                            name: { kind: 'Name', value: 'fileUploadIds' },
                                            value: { kind: 'Variable', name: { kind: 'Name', value: 'fileUploadIds' } },
                                        },
                                        {
                                            kind: 'Argument',
                                            name: { kind: 'Name', value: 'assistantOptions' },
                                            value: {
                                                kind: 'ObjectValue',
                                                fields: [
                                                    {
                                                        kind: 'ObjectField',
                                                        name: { kind: 'Name', value: 'generationId' },
                                                        value: { kind: 'Variable', name: { kind: 'Name', value: 'generationId' } },
                                                    },
                                                    {
                                                        kind: 'ObjectField',
                                                        name: { kind: 'Name', value: 'requireToolCallApprovals' },
                                                        value: {
                                                            kind: 'Variable',
                                                            name: { kind: 'Name', value: 'requireToolCallApprovals' },
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                    ],
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'chatId' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'chatMessageId' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<GqlCChatMessageCreateMutation, GqlCChatMessageCreateMutationVariables>;
export const ChatInputCollectionRespondDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'ChatInputCollectionRespond' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'collectionMessageId' } },
                    type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } } },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'answers' } },
                    type: {
                        kind: 'NonNullType',
                        type: {
                            kind: 'ListType',
                            type: {
                                kind: 'NonNullType',
                                type: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatMessageUserInputAnswerCreate' } },
                            },
                        },
                    },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'generationId' } },
                    type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'requireToolCallApprovals' } },
                    type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'Boolean' } } },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'session' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'chatInputCollectionRespond' },
                                    arguments: [
                                        {
                                            kind: 'Argument',
                                            name: { kind: 'Name', value: 'collectionMessageId' },
                                            value: { kind: 'Variable', name: { kind: 'Name', value: 'collectionMessageId' } },
                                        },
                                        {
                                            kind: 'Argument',
                                            name: { kind: 'Name', value: 'answers' },
                                            value: { kind: 'Variable', name: { kind: 'Name', value: 'answers' } },
                                        },
                                        {
                                            kind: 'Argument',
                                            name: { kind: 'Name', value: 'assistantOptions' },
                                            value: {
                                                kind: 'ObjectValue',
                                                fields: [
                                                    {
                                                        kind: 'ObjectField',
                                                        name: { kind: 'Name', value: 'generationId' },
                                                        value: { kind: 'Variable', name: { kind: 'Name', value: 'generationId' } },
                                                    },
                                                    {
                                                        kind: 'ObjectField',
                                                        name: { kind: 'Name', value: 'requireToolCallApprovals' },
                                                        value: {
                                                            kind: 'Variable',
                                                            name: { kind: 'Name', value: 'requireToolCallApprovals' },
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                    ],
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'chatId' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'chatMessageId' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<GqlCChatInputCollectionRespondMutation, GqlCChatInputCollectionRespondMutationVariables>;
export const ChatToolApprovalRespondDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'ChatToolApprovalRespond' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'approvalId' } },
                    type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'approved' } },
                    type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'Boolean' } } },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'reason' } },
                    type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'generationId' } },
                    type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'requireToolCallApprovals' } },
                    type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'Boolean' } } },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'session' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'chatToolApprovalRespond' },
                                    arguments: [
                                        {
                                            kind: 'Argument',
                                            name: { kind: 'Name', value: 'approvalId' },
                                            value: { kind: 'Variable', name: { kind: 'Name', value: 'approvalId' } },
                                        },
                                        {
                                            kind: 'Argument',
                                            name: { kind: 'Name', value: 'approved' },
                                            value: { kind: 'Variable', name: { kind: 'Name', value: 'approved' } },
                                        },
                                        {
                                            kind: 'Argument',
                                            name: { kind: 'Name', value: 'reason' },
                                            value: { kind: 'Variable', name: { kind: 'Name', value: 'reason' } },
                                        },
                                        {
                                            kind: 'Argument',
                                            name: { kind: 'Name', value: 'assistantOptions' },
                                            value: {
                                                kind: 'ObjectValue',
                                                fields: [
                                                    {
                                                        kind: 'ObjectField',
                                                        name: { kind: 'Name', value: 'generationId' },
                                                        value: { kind: 'Variable', name: { kind: 'Name', value: 'generationId' } },
                                                    },
                                                    {
                                                        kind: 'ObjectField',
                                                        name: { kind: 'Name', value: 'requireToolCallApprovals' },
                                                        value: {
                                                            kind: 'Variable',
                                                            name: { kind: 'Name', value: 'requireToolCallApprovals' },
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                    ],
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'chatId' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'chatMessageId' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<GqlCChatToolApprovalRespondMutation, GqlCChatToolApprovalRespondMutationVariables>;
export const ChatUpdatesDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'subscription',
            name: { kind: 'Name', value: 'ChatUpdates' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'generationId' } },
                    type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } } },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'chatUpdates' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'generationId' },
                                value: { kind: 'Variable', name: { kind: 'Name', value: 'generationId' } },
                            },
                        ],
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                                {
                                    kind: 'InlineFragment',
                                    typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatUpdateMessageAppended' } },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'message' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ChatMessageFields' } },
                                                    ],
                                                },
                                            },
                                        ],
                                    },
                                },
                                {
                                    kind: 'InlineFragment',
                                    typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatUpdateAssistantTextChunk' } },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'chatMessageId' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'delta' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'InlineFragment',
                                    typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatUpdateAssistantTextClear' } },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [{ kind: 'Field', name: { kind: 'Name', value: 'chatMessageId' } }],
                                    },
                                },
                                {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                        kind: 'NamedType',
                                        name: { kind: 'Name', value: 'ChatUpdateAssistantReasoningChunk' },
                                    },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'chatMessageId' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'delta' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'InlineFragment',
                                    typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatUpdateAssistantBlocksClear' } },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [{ kind: 'Field', name: { kind: 'Name', value: 'chatMessageId' } }],
                                    },
                                },
                                {
                                    kind: 'InlineFragment',
                                    typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatUpdateAssistantBlocksReplace' } },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'chatMessageId' } },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'blocks' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'FragmentSpread',
                                                            name: { kind: 'Name', value: 'ChatAssistantBodyBlockFields' },
                                                        },
                                                    ],
                                                },
                                            },
                                        ],
                                    },
                                },
                                {
                                    kind: 'InlineFragment',
                                    typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatUpdateTurnEnded' } },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [{ kind: 'Field', name: { kind: 'Name', value: 'generationId' } }],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'ChatAssistantBodyBlockFields' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatAssistantBodyBlock' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatAssistantBodyBlockMarkdown' } },
                        selectionSet: { kind: 'SelectionSet', selections: [{ kind: 'Field', name: { kind: 'Name', value: 'text' } }] },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatAssistantBodyBlockCardList' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'cards' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'price' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'href' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'buttonTitle' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'ChatMessageGeneration' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatMessageGeneration' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'modelId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'inputTokens' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'outputTokens' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'totalTokens' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'reasoningTokens' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'cachedInputTokens' } },
                ],
            },
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'ChatMessageFields' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatMessage' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatMessageUser' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'chatMessageId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'body' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'author' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'userId' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'attachments' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'fileUploadId' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'filename' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'mediaType' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'size' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'url' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatMessageAssistantText' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'chatMessageId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'body' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'blocks' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ChatAssistantBodyBlockFields' } },
                                        ],
                                    },
                                },
                                { kind: 'Field', name: { kind: 'Name', value: 'reasoning' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'sources' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'url' } },
                                        ],
                                    },
                                },
                                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'generation' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'ChatMessageGeneration' } }],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatMessageToolCall' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'chatMessageId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'toolName' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'args' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'toolResult' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'parentChatMessageId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'reasoning' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'generation' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'ChatMessageGeneration' } }],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatMessageToolApprovalRequest' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'chatMessageId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'approvalId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'toolName' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'args' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'reasoning' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'generation' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'ChatMessageGeneration' } }],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatMessageToolApprovalResponse' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'chatMessageId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'approvalId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'approved' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'reason' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatMessageAssistantInputCollection' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'chatMessageId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'prompt' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'mode' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'reasoning' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'generation' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'ChatMessageGeneration' } }],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'inputs' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                                            {
                                                kind: 'InlineFragment',
                                                typeCondition: {
                                                    kind: 'NamedType',
                                                    name: { kind: 'Name', value: 'ChatAssistantInputDate' },
                                                },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        { kind: 'Field', name: { kind: 'Name', value: 'inputId' } },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'prompt' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'InlineFragment',
                                                typeCondition: {
                                                    kind: 'NamedType',
                                                    name: { kind: 'Name', value: 'ChatAssistantInputDateRange' },
                                                },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        { kind: 'Field', name: { kind: 'Name', value: 'inputId' } },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'prompt' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'InlineFragment',
                                                typeCondition: {
                                                    kind: 'NamedType',
                                                    name: { kind: 'Name', value: 'ChatAssistantInputDateTime' },
                                                },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        { kind: 'Field', name: { kind: 'Name', value: 'inputId' } },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'prompt' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'InlineFragment',
                                                typeCondition: {
                                                    kind: 'NamedType',
                                                    name: { kind: 'Name', value: 'ChatAssistantInputTime' },
                                                },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        { kind: 'Field', name: { kind: 'Name', value: 'inputId' } },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'prompt' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'InlineFragment',
                                                typeCondition: {
                                                    kind: 'NamedType',
                                                    name: { kind: 'Name', value: 'ChatAssistantInputSingleSelect' },
                                                },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        { kind: 'Field', name: { kind: 'Name', value: 'inputId' } },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'prompt' } },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'options' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'InlineFragment',
                                                typeCondition: {
                                                    kind: 'NamedType',
                                                    name: { kind: 'Name', value: 'ChatAssistantInputMultiSelect' },
                                                },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        { kind: 'Field', name: { kind: 'Name', value: 'inputId' } },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'prompt' } },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'options' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'InlineFragment',
                                                typeCondition: {
                                                    kind: 'NamedType',
                                                    name: { kind: 'Name', value: 'ChatAssistantInputBoolean' },
                                                },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        { kind: 'Field', name: { kind: 'Name', value: 'inputId' } },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'prompt' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'InlineFragment',
                                                typeCondition: {
                                                    kind: 'NamedType',
                                                    name: { kind: 'Name', value: 'ChatAssistantInputText' },
                                                },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        { kind: 'Field', name: { kind: 'Name', value: 'inputId' } },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'prompt' } },
                                                    ],
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ChatMessageUserInput' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'chatMessageId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'collectionMessageId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'author' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'userId' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'answers' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'inputId' } },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'value' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                                                        {
                                                            kind: 'InlineFragment',
                                                            typeCondition: {
                                                                kind: 'NamedType',
                                                                name: { kind: 'Name', value: 'ChatAssistantInputValueDate' },
                                                            },
                                                            selectionSet: {
                                                                kind: 'SelectionSet',
                                                                selections: [{ kind: 'Field', name: { kind: 'Name', value: 'date' } }],
                                                            },
                                                        },
                                                        {
                                                            kind: 'InlineFragment',
                                                            typeCondition: {
                                                                kind: 'NamedType',
                                                                name: { kind: 'Name', value: 'ChatAssistantInputValueDateRange' },
                                                            },
                                                            selectionSet: {
                                                                kind: 'SelectionSet',
                                                                selections: [
                                                                    { kind: 'Field', name: { kind: 'Name', value: 'from' } },
                                                                    { kind: 'Field', name: { kind: 'Name', value: 'to' } },
                                                                ],
                                                            },
                                                        },
                                                        {
                                                            kind: 'InlineFragment',
                                                            typeCondition: {
                                                                kind: 'NamedType',
                                                                name: { kind: 'Name', value: 'ChatAssistantInputValueDateTime' },
                                                            },
                                                            selectionSet: {
                                                                kind: 'SelectionSet',
                                                                selections: [{ kind: 'Field', name: { kind: 'Name', value: 'dateTime' } }],
                                                            },
                                                        },
                                                        {
                                                            kind: 'InlineFragment',
                                                            typeCondition: {
                                                                kind: 'NamedType',
                                                                name: { kind: 'Name', value: 'ChatAssistantInputValueTime' },
                                                            },
                                                            selectionSet: {
                                                                kind: 'SelectionSet',
                                                                selections: [{ kind: 'Field', name: { kind: 'Name', value: 'time' } }],
                                                            },
                                                        },
                                                        {
                                                            kind: 'InlineFragment',
                                                            typeCondition: {
                                                                kind: 'NamedType',
                                                                name: { kind: 'Name', value: 'ChatAssistantInputValueString' },
                                                            },
                                                            selectionSet: {
                                                                kind: 'SelectionSet',
                                                                selections: [{ kind: 'Field', name: { kind: 'Name', value: 'value' } }],
                                                            },
                                                        },
                                                        {
                                                            kind: 'InlineFragment',
                                                            typeCondition: {
                                                                kind: 'NamedType',
                                                                name: { kind: 'Name', value: 'ChatAssistantInputValueStringList' },
                                                            },
                                                            selectionSet: {
                                                                kind: 'SelectionSet',
                                                                selections: [{ kind: 'Field', name: { kind: 'Name', value: 'values' } }],
                                                            },
                                                        },
                                                        {
                                                            kind: 'InlineFragment',
                                                            typeCondition: {
                                                                kind: 'NamedType',
                                                                name: { kind: 'Name', value: 'ChatAssistantInputValueBoolean' },
                                                            },
                                                            selectionSet: {
                                                                kind: 'SelectionSet',
                                                                selections: [{ kind: 'Field', name: { kind: 'Name', value: 'boolean' } }],
                                                            },
                                                        },
                                                    ],
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<GqlCChatUpdatesSubscription, GqlCChatUpdatesSubscriptionVariables>;
export const HomePageDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'HomePage' },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'currentSession' },
                        selectionSet: { kind: 'SelectionSet', selections: [{ kind: 'Field', name: { kind: 'Name', value: 'sessionId' } }] },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<GqlCHomePageQuery, GqlCHomePageQueryVariables>;
export const WatchPageDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'WatchPage' },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'currentSession' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'sessionId' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'watch' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'WatchFields' } }],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'scenarios' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'scenarioId' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'WatchFields' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'WatchState' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'scenarioId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'simMs' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'centerLat' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'centerLon' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'zoom' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'selectedMmsi' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'dataSources' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'enabled' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'vesselCount' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'vessels' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'mmsi' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'imo' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'shipType' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'flag' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'aisDark' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'dataSource' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'riskScore' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'riskLevel' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'riskTrend' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'nearestAssetId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'nearestAssetDistanceNm' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'activeFactors' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'rule' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'scoreDelta' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'explanation' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'source' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'trackTail' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'lat' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'lon' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'radarPosition' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'lat' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'lon' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'position' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'lat' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'lon' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'sog' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'cog' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'heading' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'timestamp' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'anomalies' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'anomalyId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'mmsi' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'kind' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'severity' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'summary' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'detectedAtSimMs' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'evidence' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'riskEvents' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'riskEventId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'mmsi' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'detectedAtSimMs' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'rule' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'scoreDelta' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'previousScore' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'newScore' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'explanation' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'source' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'incidents' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'incidentId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'mmsi' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'openedAtSimMs' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'closedAtSimMs' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'maxRiskScore' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'timeline' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'eventId' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'detectedAtSimMs' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'eventType' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'source' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'explanation' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'riskChange' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'osintAlerts' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'alertId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'source' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'body' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'region' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'highRiskZones' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'ring' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'lat' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'lon' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'protectedAssets' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'assetId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'riskRadiusNm' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'path' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'lat' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'lon' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<GqlCWatchPageQuery, GqlCWatchPageQueryVariables>;
export const VesselSelectDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'VesselSelect' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'mmsi' } },
                    type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'session' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'vesselSelect' },
                                    arguments: [
                                        {
                                            kind: 'Argument',
                                            name: { kind: 'Name', value: 'mmsi' },
                                            value: { kind: 'Variable', name: { kind: 'Name', value: 'mmsi' } },
                                        },
                                    ],
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'WatchFields' } }],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'WatchFields' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'WatchState' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'scenarioId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'simMs' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'centerLat' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'centerLon' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'zoom' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'selectedMmsi' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'dataSources' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'enabled' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'vesselCount' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'vessels' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'mmsi' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'imo' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'shipType' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'flag' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'aisDark' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'dataSource' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'riskScore' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'riskLevel' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'riskTrend' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'nearestAssetId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'nearestAssetDistanceNm' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'activeFactors' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'rule' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'scoreDelta' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'explanation' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'source' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'trackTail' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'lat' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'lon' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'radarPosition' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'lat' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'lon' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'position' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'lat' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'lon' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'sog' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'cog' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'heading' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'timestamp' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'anomalies' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'anomalyId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'mmsi' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'kind' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'severity' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'summary' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'detectedAtSimMs' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'evidence' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'riskEvents' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'riskEventId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'mmsi' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'detectedAtSimMs' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'rule' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'scoreDelta' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'previousScore' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'newScore' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'explanation' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'source' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'incidents' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'incidentId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'mmsi' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'openedAtSimMs' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'closedAtSimMs' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'maxRiskScore' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'timeline' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'eventId' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'detectedAtSimMs' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'eventType' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'source' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'explanation' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'riskChange' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'osintAlerts' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'alertId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'source' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'body' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'region' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'highRiskZones' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'ring' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'lat' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'lon' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'protectedAssets' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'assetId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'riskRadiusNm' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'path' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'lat' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'lon' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<GqlCVesselSelectMutation, GqlCVesselSelectMutationVariables>;
export const VesselIntelligenceRequestDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'VesselIntelligenceRequest' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'mmsi' } },
                    type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } } },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'session' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'vesselIntelligenceRequest' },
                                    arguments: [
                                        {
                                            kind: 'Argument',
                                            name: { kind: 'Name', value: 'mmsi' },
                                            value: { kind: 'Variable', name: { kind: 'Name', value: 'mmsi' } },
                                        },
                                    ],
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'success' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'referenceId' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<GqlCVesselIntelligenceRequestMutation, GqlCVesselIntelligenceRequestMutationVariables>;
export const AlertAcknowledgeDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'AlertAcknowledge' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'incidentId' } },
                    type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } } },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'session' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'alertAcknowledge' },
                                    arguments: [
                                        {
                                            kind: 'Argument',
                                            name: { kind: 'Name', value: 'incidentId' },
                                            value: { kind: 'Variable', name: { kind: 'Name', value: 'incidentId' } },
                                        },
                                    ],
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'WatchFields' } }],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'WatchFields' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'WatchState' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'scenarioId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'simMs' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'centerLat' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'centerLon' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'zoom' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'selectedMmsi' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'dataSources' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'enabled' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'vesselCount' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'vessels' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'mmsi' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'imo' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'shipType' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'flag' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'aisDark' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'dataSource' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'riskScore' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'riskLevel' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'riskTrend' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'nearestAssetId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'nearestAssetDistanceNm' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'activeFactors' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'rule' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'scoreDelta' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'explanation' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'source' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'trackTail' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'lat' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'lon' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'radarPosition' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'lat' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'lon' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'position' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'lat' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'lon' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'sog' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'cog' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'heading' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'timestamp' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'anomalies' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'anomalyId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'mmsi' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'kind' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'severity' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'summary' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'detectedAtSimMs' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'evidence' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'riskEvents' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'riskEventId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'mmsi' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'detectedAtSimMs' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'rule' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'scoreDelta' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'previousScore' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'newScore' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'explanation' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'source' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'incidents' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'incidentId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'mmsi' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'openedAtSimMs' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'closedAtSimMs' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'maxRiskScore' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'timeline' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'eventId' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'detectedAtSimMs' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'eventType' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'source' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'explanation' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'riskChange' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'osintAlerts' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'alertId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'source' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'body' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'region' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'highRiskZones' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'ring' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'lat' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'lon' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'protectedAssets' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'assetId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'riskRadiusNm' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'path' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'lat' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'lon' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<GqlCAlertAcknowledgeMutation, GqlCAlertAcknowledgeMutationVariables>;
export const ScenarioResetDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'ScenarioReset' },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'session' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'scenarioReset' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'WatchFields' } }],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'WatchFields' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'WatchState' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'scenarioId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'simMs' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'centerLat' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'centerLon' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'zoom' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'selectedMmsi' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'dataSources' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'enabled' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'vesselCount' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'vessels' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'mmsi' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'imo' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'shipType' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'flag' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'aisDark' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'dataSource' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'riskScore' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'riskLevel' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'riskTrend' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'nearestAssetId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'nearestAssetDistanceNm' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'activeFactors' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'rule' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'scoreDelta' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'explanation' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'source' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'trackTail' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'lat' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'lon' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'radarPosition' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'lat' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'lon' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'position' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'lat' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'lon' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'sog' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'cog' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'heading' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'timestamp' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'anomalies' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'anomalyId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'mmsi' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'kind' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'severity' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'summary' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'detectedAtSimMs' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'evidence' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'riskEvents' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'riskEventId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'mmsi' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'detectedAtSimMs' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'rule' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'scoreDelta' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'previousScore' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'newScore' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'explanation' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'source' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'incidents' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'incidentId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'mmsi' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'openedAtSimMs' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'closedAtSimMs' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'maxRiskScore' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'timeline' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'eventId' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'detectedAtSimMs' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'eventType' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'source' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'explanation' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'riskChange' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'osintAlerts' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'alertId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'source' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'body' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'region' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'highRiskZones' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'ring' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'lat' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'lon' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'protectedAssets' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'assetId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'riskRadiusNm' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'path' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'lat' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'lon' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<GqlCScenarioResetMutation, GqlCScenarioResetMutationVariables>;
export const MockAisSetEnabledDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'MockAisSetEnabled' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'enabled' } },
                    type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'Boolean' } } },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'session' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'mockAisSetEnabled' },
                                    arguments: [
                                        {
                                            kind: 'Argument',
                                            name: { kind: 'Name', value: 'enabled' },
                                            value: { kind: 'Variable', name: { kind: 'Name', value: 'enabled' } },
                                        },
                                    ],
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'WatchFields' } }],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'WatchFields' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'WatchState' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'scenarioId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'simMs' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'centerLat' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'centerLon' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'zoom' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'selectedMmsi' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'dataSources' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'enabled' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'vesselCount' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'vessels' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'mmsi' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'imo' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'shipType' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'flag' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'aisDark' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'dataSource' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'riskScore' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'riskLevel' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'riskTrend' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'nearestAssetId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'nearestAssetDistanceNm' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'activeFactors' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'rule' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'scoreDelta' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'explanation' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'source' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'trackTail' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'lat' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'lon' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'radarPosition' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'lat' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'lon' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'position' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'lat' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'lon' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'sog' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'cog' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'heading' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'timestamp' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'anomalies' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'anomalyId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'mmsi' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'kind' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'severity' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'summary' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'detectedAtSimMs' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'evidence' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'riskEvents' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'riskEventId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'mmsi' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'detectedAtSimMs' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'rule' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'scoreDelta' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'previousScore' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'newScore' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'explanation' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'source' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'incidents' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'incidentId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'mmsi' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'openedAtSimMs' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'closedAtSimMs' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'maxRiskScore' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'timeline' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'eventId' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'detectedAtSimMs' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'eventType' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'source' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'explanation' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'riskChange' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'osintAlerts' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'alertId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'source' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'body' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'region' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'highRiskZones' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'ring' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'lat' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'lon' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'protectedAssets' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'assetId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'riskRadiusNm' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'path' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'lat' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'lon' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<GqlCMockAisSetEnabledMutation, GqlCMockAisSetEnabledMutationVariables>;
export const SessionUpdatesDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'subscription',
            name: { kind: 'Name', value: 'SessionUpdates' },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'sessionUpdates' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                                {
                                    kind: 'InlineFragment',
                                    typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'SessionUpdateWatchSnapshot' } },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'watch' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'WatchFields' } }],
                                                },
                                            },
                                        ],
                                    },
                                },
                                {
                                    kind: 'InlineFragment',
                                    typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'SessionUpdateAnomalyAppended' } },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'anomaly' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        { kind: 'Field', name: { kind: 'Name', value: 'anomalyId' } },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'mmsi' } },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'kind' } },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'severity' } },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'summary' } },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'detectedAtSimMs' } },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'evidence' } },
                                                    ],
                                                },
                                            },
                                        ],
                                    },
                                },
                                {
                                    kind: 'InlineFragment',
                                    typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'SessionUpdateIntelligence' } },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'intelligence' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        { kind: 'Field', name: { kind: 'Name', value: 'mmsi' } },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'vesselName' } },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'summary' } },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'whyFlagged' } },
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'citations' },
                                                            selectionSet: {
                                                                kind: 'SelectionSet',
                                                                selections: [
                                                                    { kind: 'Field', name: { kind: 'Name', value: 'label' } },
                                                                    { kind: 'Field', name: { kind: 'Name', value: 'source' } },
                                                                ],
                                                            },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'playbookSteps' } },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'generatedAt' } },
                                                    ],
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'WatchFields' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'WatchState' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'scenarioId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'simMs' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'centerLat' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'centerLon' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'zoom' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'selectedMmsi' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'dataSources' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'enabled' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'vesselCount' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'vessels' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'mmsi' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'imo' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'shipType' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'flag' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'aisDark' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'dataSource' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'riskScore' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'riskLevel' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'riskTrend' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'nearestAssetId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'nearestAssetDistanceNm' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'activeFactors' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'rule' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'scoreDelta' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'explanation' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'source' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'trackTail' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'lat' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'lon' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'radarPosition' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'lat' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'lon' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'position' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'lat' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'lon' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'sog' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'cog' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'heading' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'timestamp' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'anomalies' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'anomalyId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'mmsi' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'kind' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'severity' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'summary' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'detectedAtSimMs' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'evidence' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'riskEvents' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'riskEventId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'mmsi' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'detectedAtSimMs' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'rule' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'scoreDelta' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'previousScore' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'newScore' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'explanation' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'source' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'incidents' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'incidentId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'mmsi' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'openedAtSimMs' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'closedAtSimMs' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'maxRiskScore' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'timeline' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'eventId' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'detectedAtSimMs' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'eventType' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'source' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'explanation' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'riskChange' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'osintAlerts' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'alertId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'source' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'body' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'region' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'highRiskZones' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'ring' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'lat' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'lon' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'protectedAssets' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'assetId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'riskRadiusNm' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'path' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'lat' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'lon' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<GqlCSessionUpdatesSubscription, GqlCSessionUpdatesSubscriptionVariables>;
