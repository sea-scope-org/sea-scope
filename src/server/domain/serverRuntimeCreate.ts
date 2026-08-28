import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { db } from '../db';
import { environmentVariables } from '../env/environmentVariablesCreate';
import { PubSubPostgres } from '../graphql/PubSubPostgres';
import { jobEnqueue, jobsActiveCount } from '../jobs/boss';
import { browserCapture, browserCapturePdf } from '../utils/browserCapture';
import { loggerCreate } from '../utils/loggerCreate';
import type { ServerRuntime } from './ServerRuntime';

export function serverRuntimeCreate(): ServerRuntime {
    const postgresPubSub = new PubSubPostgres({ db });

    async function publish(keys: Array<string> | string, payload: any) {
        await (typeof keys === 'string'
            ? postgresPubSub.publish(keys, payload)
            : Promise.all(keys.map((key: string) => postgresPubSub.publish(key, payload))));
    }

    // Fail-fast: a real-app boot without the Google key is broken — surface it
    // here, with provider-specific context, instead of letting the AI SDK read
    // `process.env.GOOGLE_GENERATIVE_AI_API_KEY` implicitly on the first agent
    // call. Tests build a `ServerRuntime` directly and skip this path entirely.
    const googleApiKey = environmentVariables.googleGenerativeAiApiKey;
    if (!googleApiKey) {
        throw new Error(
            'Missing required environment variable: GOOGLE_GENERATIVE_AI_API_KEY (required by serverRuntimeCreate for the Gemini language model)',
        );
    }
    const google = createGoogleGenerativeAI({ apiKey: googleApiKey });

    const serverRuntime: ServerRuntime = {
        db,
        log: loggerCreate(db),
        subscribe: {
            to: (key: string) => postgresPubSub.asyncIterableIterator([key]),
        },
        publish: {
            userUpdates: ({ userId }) => publish(userId, {}),
            // Channel namespaced so a generationId reused as both a chat-update
            // key and (hypothetically) some other key wouldn't collide. The
            // `PubSubPostgres` transport lower-cases the channel name; a UUIDv4
            // is already lower-case so the prefix is the only case-sensitive
            // part. Wire payload is the lean `ChatUpdateWirePayload` — the
            // subscription resolver re-loads the row and maps to the full
            // `GqlSChatUpdate` before handing it to subscribers.
            chatUpdates: ({ generationId, payload }) => publish(`chat-updates:${generationId}`, payload),
            sessionUpdates: ({ sessionId, payload }) => publish(`session-updates:${sessionId}`, payload),
        },
        jobs: {
            enqueue: jobEnqueue,
            activeCount: jobsActiveCount,
        },
        ai: {
            // Optional `modelId` selects a concrete Gemini id; when omitted the
            // runtime returns the default conversation model (`gemini-3.6-flash`).
            userConversationModel: (modelId?: string) => google(modelId ?? 'gemini-3.6-flash'),
            // Cheapest catalog tier — bounded, low-stakes summarization for
            // `chatTitleGenerate`. See `docs/features/chat-titles.md`.
            chatTitlerModel: () => google('gemini-2.5-flash-lite'),
            // Google Search grounding. Gemini executes the search itself and
            // rides the result back on the same tool-call channel as function
            // tools. Agents wrap this via a `delegateTo*` / web-search tool
            // when product surfaces need it.
            webSearchTool: () => google.tools.googleSearch({}),
        },
        browser: {
            // The renderer is a long-lived singleton inside `browserCapture`;
            // `serverRuntimeCreate` just exposes the entry point. Tests build
            // a `ServerRuntime` directly and stub `browser.capture` /
            // `browser.capturePdf` — they never launch a real Chromium.
            capture: browserCapture,
            capturePdf: browserCapturePdf,
        },
    };

    return serverRuntime;
}
