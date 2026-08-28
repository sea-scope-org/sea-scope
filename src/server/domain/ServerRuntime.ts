import type { LanguageModel, Tool } from 'ai';
import type { Database, DatabaseTransaction } from '../db';
import type { ChatUpdateWirePayload } from '../graphql/chatUpdateWirePayload';
import type { SessionUpdateWirePayload } from '../graphql/sessionUpdateWirePayload';
import type { QueuedJobDefinition } from '../jobs/types';
import type { BrowserCaptureOptions, BrowserCapturePdfOptions } from '../utils/browserCapture';
import type { Logger } from '../utils/loggerCreate';

export interface ServerRuntime {
    db: Database;
    log: Logger;
    subscribe: {
        to: (key: string) => AsyncIterableIterator<any>;
    };
    publish: {
        userUpdates: (args: { userId: string }) => Promise<void>;
        // Wire payload carries only ids/small primitives — pg_notify caps
        // NOTIFY at 8000 bytes, so we can't put a full `ChatMessage` on the
        // wire (a long user-message body or fat tool-call args blob blows
        // the cap). The subscription resolver re-loads via `chatMessageRowLoad`
        // and maps to `GqlSChatUpdate` before delivery. See
        // `src/server/graphql/chatUpdateWirePayload.ts`.
        chatUpdates: (args: { generationId: string; payload: ChatUpdateWirePayload }) => Promise<void>;
        // Per cookie-session watch-console channel. Wire payload is lean — the
        // subscription resolver reloads watch / anomaly / intelligence from
        // in-memory stores. See `sessionUpdateWirePayload.ts`.
        sessionUpdates: (args: { sessionId: string; payload: SessionUpdateWirePayload }) => Promise<void>;
    };
    jobs: {
        enqueue: <TData>(
            definition: QueuedJobDefinition<TData>,
            data: TData,
            options?: { startAfter?: Date | string | number; transaction?: DatabaseTransaction },
        ) => Promise<string | null>;
        // Count active (created | retry | active) jobs for a queue. Used to
        // derive live UI flags from pg-boss without a stale column on domain
        // rows — pg-boss owns the state.
        activeCount: <TData>(definition: QueuedJobDefinition<TData>) => Promise<number>;
    };
    // LLM clients are exposed as factory functions on the runtime so the
    // provider, model id, and API key are bound in exactly one place
    // (`serverRuntimeCreate`). Tests build a runtime backed by a `MockLanguageModelV3`
    // and never reach a real LLM endpoint — see `commandTestUtils.ts` /
    // `serverRuntimeStubCreate` in command tests.
    ai: {
        // Optional `modelId` selects a concrete Gemini id; when omitted the
        // runtime returns the default conversation model.
        userConversationModel: (modelId?: string) => LanguageModel;
        // Cheap model used by the `chatTitleGenerate` job to summarize the
        // first exchange into a short chat title. See
        // `docs/features/chat-titles.md`.
        chatTitlerModel: () => LanguageModel;
        // Provider-executed web search (Gemini Google Search grounding).
        // Exposed as a factory so `@ai-sdk/google` stays out of agent files.
        webSearchTool: () => Tool;
    };
    // Server-side rendering capability — drives a singleton headless
    // Chromium against an internal `/server/*` route to produce an image
    // (`capture`) or a PDF (`capturePdf`) of the rendered React UI. See
    // `docs/architecture/browser-capture.md`. Tests inject a stub
    // that returns a fixed `Buffer` and never launch a real browser.
    browser: {
        capture: (options: BrowserCaptureOptions) => Promise<Buffer>;
        capturePdf: (options: BrowserCapturePdfOptions) => Promise<Buffer>;
    };
}
