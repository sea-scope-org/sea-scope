import {
    boolean,
    customType,
    doublePrecision,
    foreignKey,
    index,
    integer,
    jsonb,
    pgTable,
    timestamp,
    uniqueIndex,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core';
import type { ChatAssistantBodyPayload, ChatMessagePartProviderOptions, ChatMessageSource } from './chatPayloadTypes';

// Drizzle has no first-class `bytea` builder; the `customType` helper wraps
// `bytea` so the column round-trips as a Node `Buffer` on read and accepts
// `Buffer | Uint8Array` on write. Used by `fileUploads.bytes`.
const bytea = customType<{ data: Buffer; driverData: Buffer }>({
    dataType() {
        return 'bytea';
    },
});

export const sessions = pgTable(
    'Sessions',
    {
        sessionId: uuid().primaryKey(),
        userId: uuid(),
        lastInteractionAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
        wasTerminatedAt: timestamp({ withTimezone: true }),
        connectionActive: boolean().notNull().default(false),
        userAgent: varchar(),
        // `ipHash` is `SHA256(VISITOR_IP_HASH_SALT + ":" + clientIp)`, computed
        // on every session upsert by `sessionUpsert`. Nullable because local
        // dev / unproxied requests have no resolvable IP (see
        // `clientIpFromRequest`). See docs/architecture/authentication.md.
        ipHash: varchar(),
        // First-touch attribution: stamped only on create from the request
        // `Referer` header (SSR loaders forward the browser page Referer into
        // `/api/graphql`). Never overwritten on later upserts.
        referrer: varchar(),
        // First path the visitor hit (`x-landing-path` from the SSR route
        // loader). Same sticky-on-create rule as `referrer`.
        landingPath: varchar(),
        // Derived from `userAgent` via `isbot` on every upsert so bot vs human
        // classification stays current if the UA string changes.
        isBot: boolean().notNull().default(false),
        createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.userId],
            foreignColumns: [users.userId],
        })
            .onUpdate('cascade')
            .onDelete('set null'),
        index('Sessions_ipHash_idx').on(table.ipHash),
        index('Sessions_createdAt_idx').on(table.createdAt),
    ],
);

export type SessionCreate = typeof sessions.$inferInsert;
export type Session = typeof sessions.$inferSelect;

export const logs = pgTable(
    'Logs',
    {
        logId: uuid().primaryKey(),
        sessionId: uuid(),
        level: varchar().notNull(),
        message: varchar().notNull(),
        context: jsonb(),
        createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.sessionId],
            foreignColumns: [sessions.sessionId],
        })
            .onUpdate('cascade')
            .onDelete('set null'),
    ],
);

export type Log = typeof logs.$inferSelect;
export type LogCreate = typeof logs.$inferInsert;

// `isAdmin` gates the admin surface — the `User.admin` resolver and the
// `Mutation.admin` `guardAdminMutation` gate both read this column. Access is
// simply: the session has a `userId` whose row has `isAdmin = true`. Set
// manually with `UPDATE "Users" SET "isAdmin" = true WHERE …` for admin
// accounts; anonymous sessions never flip it. A dedicated `Admins` table is a
// clean upgrade later because the column move is mechanical. See
// `docs/architecture/authorization-admin.md`.
export const users = pgTable('Users', {
    userId: uuid().primaryKey(),
    name: varchar().notNull(),
    isAdmin: boolean().notNull().default(false),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type UserCreate = typeof users.$inferInsert;

// --- Chat ---------------------------------------------------------------------
//
// See docs/architecture/chat-persistence.md for the rationale behind this
// shape. Summary: a spine table `ChatMessages` carrying ordering and shared
// columns, plus one per-variant table keyed by the same `chatMessageId`. JSONB
// is used only where the GraphQL schema itself is a union of values
// (`inputs`, `answers`, tool args/result).

export const chats = pgTable('Chats', {
    chatId: uuid().primaryKey(),
    title: varchar().notNull().default(''),
    lastModifiedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export type Chat = typeof chats.$inferSelect;
export type ChatCreate = typeof chats.$inferInsert;

export const chatMessageKinds = [
    'user',
    'assistantText',
    'toolCall',
    'toolApprovalRequest',
    'toolApprovalResponse',
    'assistantInputCollection',
    'userInput',
] as const;

export type ChatMessageKind = (typeof chatMessageKinds)[number];

export const chatMessages = pgTable(
    'ChatMessages',
    {
        chatMessageId: uuid().primaryKey(),
        chatId: uuid().notNull(),
        kind: varchar().$type<ChatMessageKind>().notNull(),
        authorUserId: uuid(),
        // Self-FK: when a sub-agent runs inside a parent tool's `execute`,
        // each child tool call is persisted with `parentChatMessageId` set to
        // the parent delegate row's id. The transcript filters child rows out
        // of the top-level list and renders them indented under the parent's
        // tool-call card. LLM replay (`toModelMessages`) ignores this column —
        // the rows are still valid AI-SDK tool-call/tool-result pairs. See
        // `docs/architecture/agent-delegation.md` ("Nested tool calls").
        parentChatMessageId: uuid(),
        createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.chatId],
            foreignColumns: [chats.chatId],
        })
            .onUpdate('cascade')
            .onDelete('cascade'),
        foreignKey({
            columns: [table.authorUserId],
            foreignColumns: [users.userId],
        })
            .onUpdate('cascade')
            .onDelete('set null'),
        // Self-FK on `parentChatMessageId`. `ON DELETE CASCADE` so deleting a
        // parent (e.g. retention cleanup) takes its children with it.
        foreignKey({
            columns: [table.parentChatMessageId],
            foreignColumns: [table.chatMessageId],
        })
            .onUpdate('cascade')
            .onDelete('cascade'),
        index('ChatMessages_chatId_createdAt_idx').on(table.chatId, table.createdAt),
        index('ChatMessages_kind_idx').on(table.kind),
        // Powers "load children of X in insertion order" inside the transcript
        // and the live-updates merge.
        index('ChatMessages_parentChatMessageId_createdAt_idx').on(table.parentChatMessageId, table.createdAt),
    ],
);

export type ChatMessage = typeof chatMessages.$inferSelect;
export type ChatMessageCreate = typeof chatMessages.$inferInsert;

export const chatMessagesUser = pgTable(
    'ChatMessagesUser',
    {
        chatMessageId: uuid().primaryKey(),
        body: varchar().notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.chatMessageId],
            foreignColumns: [chatMessages.chatMessageId],
        })
            .onUpdate('cascade')
            .onDelete('cascade'),
    ],
);

export type ChatMessageUser = typeof chatMessagesUser.$inferSelect;
export type ChatMessageUserCreate = typeof chatMessagesUser.$inferInsert;

// Per-step generation metadata is denormalized onto every AI-produced variant
// row (see `docs/architecture/chat-persistence.md` — "Generation metadata"). A
// single LLM step can persist multiple rows (text + N tool calls + an input
// collection); each row carries the same `(modelId, *Tokens)` snapshot that
// the AI SDK reported for that step. All columns are nullable so legacy rows
// (pre-feature) and providers that don't report a given metric still load.
// Aggregating across rows therefore over-counts: a step that produced one
// `assistantText` plus three `toolCall` rows reports its tokens four times.
// Analytics consumers must dedupe by step boundary or accept the duplication
// — see the alternatives table in `chat-persistence.md`.
export const chatMessagesAssistantText = pgTable(
    'ChatMessagesAssistantText',
    {
        chatMessageId: uuid().primaryKey(),
        // Ordered content blocks (`markdown` | `cardList`). See
        // `ChatAssistantBodyPayload` and `docs/architecture/chat.md`.
        body: jsonb().$type<ChatAssistantBodyPayload>().notNull(),
        // Gemini thought summary for this step (`includeThoughts`). Null when
        // the model emitted none or for legacy rows. See chat-persistence.md.
        reasoning: varchar(),
        // Provider grounding / citation sources for this answer (AI SDK
        // `sources` + `providerMetadata.google.groundingMetadata`). Null when
        // the turn had none or for legacy rows. UI-only — not replayed.
        sources: jsonb().$type<ChatMessageSource[]>(),
        modelId: varchar(),
        inputTokens: integer(),
        outputTokens: integer(),
        totalTokens: integer(),
        reasoningTokens: integer(),
        cachedInputTokens: integer(),
    },
    (table) => [
        foreignKey({
            columns: [table.chatMessageId],
            foreignColumns: [chatMessages.chatMessageId],
        })
            .onUpdate('cascade')
            .onDelete('cascade'),
    ],
);

export type ChatMessageAssistantText = typeof chatMessagesAssistantText.$inferSelect;
export type ChatMessageAssistantTextCreate = typeof chatMessagesAssistantText.$inferInsert;

// `toolArgs` and `toolResult` are per-tool-typed payloads; they are validated
// by Zod schemas at the application boundary (the tool definition), never
// queried by the database, and never exposed via GraphQL. `toolCallId` mirrors
// the AI SDK's tool-call id so replay can pair the call with its result.
//
// Generation metadata columns: see comment on `chatMessagesAssistantText`.
export const chatMessagesToolCall = pgTable(
    'ChatMessagesToolCall',
    {
        chatMessageId: uuid().primaryKey(),
        toolCallId: varchar().notNull(),
        toolName: varchar().notNull(),
        toolArgs: jsonb().notNull(),
        toolResult: jsonb(),
        resultedAt: timestamp({ withTimezone: true }),
        // Opaque provider blob for this part — `providerMetadata` on the step,
        // `providerOptions` on replay. Gemini's `thoughtSignature` lives here.
        providerOptions: jsonb().$type<ChatMessagePartProviderOptions>(),
        // Thought summary for the LLM step that decided on this call. Set only
        // on the first persisted artifact of a parallel multi-tool step.
        reasoning: varchar(),
        modelId: varchar(),
        inputTokens: integer(),
        outputTokens: integer(),
        totalTokens: integer(),
        reasoningTokens: integer(),
        cachedInputTokens: integer(),
    },
    (table) => [
        foreignKey({
            columns: [table.chatMessageId],
            foreignColumns: [chatMessages.chatMessageId],
        })
            .onUpdate('cascade')
            .onDelete('cascade'),
        index('ChatMessagesToolCall_toolCallId_idx').on(table.toolCallId),
    ],
);

export type ChatMessageToolCall = typeof chatMessagesToolCall.$inferSelect;
export type ChatMessageToolCallCreate = typeof chatMessagesToolCall.$inferInsert;

export const chatMessagesToolApprovalRequest = pgTable(
    'ChatMessagesToolApprovalRequest',
    {
        chatMessageId: uuid().primaryKey(),
        approvalId: varchar().notNull().unique('ChatMessagesToolApprovalRequest_approvalId_uniq'),
        // The AI SDK assigns a `toolCallId` to the suspended call. We persist
        // it so that on approve/decline the respond command can write a
        // matching `chatMessagesToolCall` row whose id lines up with what the
        // agent originally produced — `toModelMessages` then emits a coherent
        // tool-call/tool-result pair on resume.
        toolCallId: varchar().notNull(),
        toolName: varchar().notNull(),
        toolArgs: jsonb().notNull(),
        // See `chatMessagesToolCall.providerOptions`.
        providerOptions: jsonb().$type<ChatMessagePartProviderOptions>(),
        // Thought summary for the step that requested approval — same
        // first-of-step rule as `chatMessagesToolCall.reasoning`.
        reasoning: varchar(),
        // Generation metadata columns: see comment on `chatMessagesAssistantText`.
        modelId: varchar(),
        inputTokens: integer(),
        outputTokens: integer(),
        totalTokens: integer(),
        reasoningTokens: integer(),
        cachedInputTokens: integer(),
    },
    (table) => [
        foreignKey({
            columns: [table.chatMessageId],
            foreignColumns: [chatMessages.chatMessageId],
        })
            .onUpdate('cascade')
            .onDelete('cascade'),
    ],
);

export type ChatMessageToolApprovalRequest = typeof chatMessagesToolApprovalRequest.$inferSelect;
export type ChatMessageToolApprovalRequestCreate = typeof chatMessagesToolApprovalRequest.$inferInsert;

export const chatMessagesToolApprovalResponse = pgTable(
    'ChatMessagesToolApprovalResponse',
    {
        chatMessageId: uuid().primaryKey(),
        approvalId: varchar().notNull().unique(),
        approved: boolean().notNull(),
        // Optional free-text justification the human typed when responding.
        // Persisted so `toModelMessages` can forward it onto the SDK's
        // `tool-approval-response` part — the SDK then routes it to the
        // synthetic denied tool-result so the LLM sees *why* the human
        // declined instead of a generic "execution-denied". The column is
        // schema-symmetric (valid on approve too) so an "approve with
        // justification" UX can land later without a migration; today only
        // the Decline UI exposes the textarea.
        reason: varchar(),
    },
    (table) => [
        foreignKey({
            columns: [table.chatMessageId],
            foreignColumns: [chatMessages.chatMessageId],
        })
            .onUpdate('cascade')
            .onDelete('cascade'),
        foreignKey({
            columns: [table.approvalId],
            foreignColumns: [chatMessagesToolApprovalRequest.approvalId],
        })
            .onUpdate('cascade')
            .onDelete('cascade'),
        uniqueIndex('ChatMessagesToolApprovalResponse_approvalId_uniq').on(table.approvalId),
    ],
);

export type ChatMessageToolApprovalResponse = typeof chatMessagesToolApprovalResponse.$inferSelect;
export type ChatMessageToolApprovalResponseCreate = typeof chatMessagesToolApprovalResponse.$inferInsert;

// `inputs` is a `ChatAssistantInputSlot[]` — a GraphQL union of typed slot kinds.
// Stored as JSONB because the slot variants share no flat row shape; typed by
// an internal Zod schema before insert. NOT a GraphQL type — the mapper
// converts to `GqlSChatAssistantInput` on read.
//
// `mode` controls only how the collection is rendered: `'form'` (default)
// shows every slot at once, `'stepThrough'` walks the user through one slot
// at a time. It's a flat enum — not a union — so it lives as a column rather
// than inside the JSONB payload, matching the JSONB-only-for-unions rule the
// table comment lays down.
export const chatMessagesAssistantInputCollection = pgTable(
    'ChatMessagesAssistantInputCollection',
    {
        chatMessageId: uuid().primaryKey(),
        prompt: varchar().notNull(),
        inputs: jsonb().notNull(),
        mode: varchar().$type<'form' | 'stepThrough'>().notNull().default('form'),
        // See `chatMessagesToolCall.providerOptions`.
        providerOptions: jsonb().$type<ChatMessagePartProviderOptions>(),
        // Thought summary for the step that produced this collection — same
        // first-of-step rule as `chatMessagesToolCall.reasoning`.
        reasoning: varchar(),
        // Generation metadata columns: see comment on `chatMessagesAssistantText`.
        modelId: varchar(),
        inputTokens: integer(),
        outputTokens: integer(),
        totalTokens: integer(),
        reasoningTokens: integer(),
        cachedInputTokens: integer(),
    },
    (table) => [
        foreignKey({
            columns: [table.chatMessageId],
            foreignColumns: [chatMessages.chatMessageId],
        })
            .onUpdate('cascade')
            .onDelete('cascade'),
    ],
);

export type ChatMessageAssistantInputCollection = typeof chatMessagesAssistantInputCollection.$inferSelect;
export type ChatMessageAssistantInputCollectionCreate = typeof chatMessagesAssistantInputCollection.$inferInsert;

// `answers` is a `ChatMessageUserInputAnswer[]` whose `value` is itself a
// GraphQL union (`ChatAssistantInputValue`). Same JSONB rationale as
// `inputs` above.
//
// An empty `answers: []` is the "user pivoted away" signal: written by
// `chatMessageCreate` when the user types a free-text message while the
// previous collection is still open — see "Pivoting away from an open
// collection" in `docs/architecture/chat.md`. Real submits always carry at
// least one answer (the form's `canSubmit` gate enforces it), so absence
// uniquely identifies a skip.
export const chatMessagesUserInput = pgTable(
    'ChatMessagesUserInput',
    {
        chatMessageId: uuid().primaryKey(),
        collectionMessageId: uuid().notNull(),
        answers: jsonb().notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.chatMessageId],
            foreignColumns: [chatMessages.chatMessageId],
        })
            .onUpdate('cascade')
            .onDelete('cascade'),
        foreignKey({
            columns: [table.collectionMessageId],
            foreignColumns: [chatMessagesAssistantInputCollection.chatMessageId],
        })
            .onUpdate('cascade')
            .onDelete('cascade'),
    ],
);

export type ChatMessageUserInput = typeof chatMessagesUserInput.$inferSelect;
export type ChatMessageUserInputCreate = typeof chatMessagesUserInput.$inferInsert;

// --- File uploads -------------------------------------------------------------
//
// Bytes-in-Postgres for user-uploaded file blobs. Each row carries the original
// filename, IANA media type, byte length, and the raw payload. The bytes column
// uses `bytea` via `customType` (Drizzle has no first-class bytea builder).
// Storage location decision (Postgres vs. filesystem vs. object storage) is
// template-wide: see `docs/architecture/file-storage.md`. The store is
// consumer-agnostic — chat is its first consumer (via the
// `ChatMessageUserAttachments` join below), but other surfaces can reference
// `FileUploads.fileUploadId` directly. Per-consumer caps live at the upload
// route (`src/routes/api/file-uploads.ts` enforces 10 MB today) — the column
// itself is unbounded.
//
// File uploads are owned by a user. On user delete, the rows cascade away.
// Other surfaces reference uploads by id and may layer their own cascade /
// retention rules on top via their own join rows.

export const fileUploads = pgTable(
    'FileUploads',
    {
        fileUploadId: uuid().primaryKey(),
        userId: uuid().notNull(),
        filename: varchar().notNull(),
        mediaType: varchar().notNull(),
        size: integer().notNull(),
        bytes: bytea().notNull(),
        createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.userId],
            foreignColumns: [users.userId],
        })
            .onUpdate('cascade')
            .onDelete('cascade'),
        index('FileUploads_userId_idx').on(table.userId),
    ],
);

export type FileUpload = typeof fileUploads.$inferSelect;
export type FileUploadCreate = typeof fileUploads.$inferInsert;

// Join row pinning file uploads to a user-authored chat message as
// "attachments". `position` is the user-visible order of attachments inside
// the message — preserved from the order the composer sent them so the
// rendered tile row matches what the user dragged in. An attachment can in
// principle reference the same file upload from more than one message (we
// don't dedupe today, but the schema doesn't forbid sharing). On chat delete,
// the join rows cascade away but the underlying `FileUploads` row is
// preserved — reachable only by id, and cleaned up by the user row's cascade
// if the user is removed.
export const chatMessageUserAttachments = pgTable(
    'ChatMessageUserAttachments',
    {
        chatMessageId: uuid().notNull(),
        fileUploadId: uuid().notNull(),
        position: integer().notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.chatMessageId],
            foreignColumns: [chatMessagesUser.chatMessageId],
        })
            .onUpdate('cascade')
            .onDelete('cascade'),
        foreignKey({
            columns: [table.fileUploadId],
            foreignColumns: [fileUploads.fileUploadId],
        })
            .onUpdate('cascade')
            .onDelete('cascade'),
        uniqueIndex('ChatMessageUserAttachments_pk').on(table.chatMessageId, table.fileUploadId),
        index('ChatMessageUserAttachments_chatMessageId_idx').on(table.chatMessageId),
    ],
);

export type ChatMessageUserAttachment = typeof chatMessageUserAttachments.$inferSelect;
export type ChatMessageUserAttachmentCreate = typeof chatMessageUserAttachments.$inferInsert;

// --- Maritime AIS -------------------------------------------------------------
//
// Live AIS from AISStream is upserted into `Vessels` (latest identity + last
// known fix) and appended to `AisPositions` (throttled history). MMSI is the
// natural primary key. See `docs/architecture/maritime-watch.md`.

export const vessels = pgTable(
    'Vessels',
    {
        mmsi: varchar().primaryKey(),
        name: varchar().notNull().default(''),
        imo: varchar(),
        callSign: varchar(),
        shipType: varchar().notNull().default('Unknown'),
        flag: varchar().notNull().default('Unknown'),
        // Ingest source: `mock` (Galaxy Leader feeder) or `aisstream`.
        source: varchar().notNull().default('aisstream'),
        lastLat: doublePrecision(),
        lastLon: doublePrecision(),
        lastSog: doublePrecision(),
        lastCog: doublePrecision(),
        lastHeading: doublePrecision(),
        lastNavStatus: varchar(),
        lastReportedAt: timestamp({ withTimezone: true }),
        updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
        createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [index('Vessels_lastReportedAt_idx').on(table.lastReportedAt), index('Vessels_source_idx').on(table.source)],
);

export type Vessel = typeof vessels.$inferSelect;
export type VesselCreate = typeof vessels.$inferInsert;

export const aisPositions = pgTable(
    'AisPositions',
    {
        aisPositionId: uuid().primaryKey(),
        mmsi: varchar().notNull(),
        source: varchar().notNull().default('aisstream'),
        lat: doublePrecision().notNull(),
        lon: doublePrecision().notNull(),
        sog: doublePrecision().notNull(),
        cog: doublePrecision().notNull(),
        heading: doublePrecision().notNull(),
        navStatus: varchar(),
        reportedAt: timestamp({ withTimezone: true }).notNull(),
        createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.mmsi],
            foreignColumns: [vessels.mmsi],
        })
            .onUpdate('cascade')
            .onDelete('cascade'),
        index('AisPositions_mmsi_reportedAt_idx').on(table.mmsi, table.reportedAt),
        index('AisPositions_reportedAt_idx').on(table.reportedAt),
        index('AisPositions_source_idx').on(table.source),
    ],
);

export type AisPositionRow = typeof aisPositions.$inferSelect;
export type AisPositionCreate = typeof aisPositions.$inferInsert;
