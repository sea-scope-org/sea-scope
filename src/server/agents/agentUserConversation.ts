import type { GenerateTextOnStepEndCallback } from 'ai';
import { hasToolCall, isStepCount, Output, ToolLoopAgent } from 'ai';
import type { GqlCChatAssistantOptions } from '../../web/graphql/generated';
import type { ServerRuntime } from '../domain/ServerRuntime';
import type { GqlSSession } from '../graphql/generated';
import { currentDateForAgent, googleAgentProviderOptionsFor } from './agentScaffolding';
import { assistantPresentationOutputSchema } from './assistantPresentationOutput';
import { toolPromptUserForInput } from './toolPromptUserForInput';
import { toolWriteToConsole } from './toolWriteToConsole';

interface AgentUserConversationOptions {
    assistantOptions: GqlCChatAssistantOptions;
    session: GqlSSession;
    serverRuntime: ServerRuntime;
    // Optional override for the conversation model id. When omitted the
    // runtime default (`gemini-2.5-flash`) is used.
    modelId?: string;
    // The tool set the agent is built with is heterogeneous (one entry per
    // approval-gated tool plus `promptUserForInput`), each with its own Zod
    // input schema. There is no single concrete `ToolSet` the caller can name
    // upfront — and the on-step callback only reads the structurally-uniform
    // bits (`step.content`, `step.toolCalls`, `step.toolResults`) — so a wide
    // `any` here keeps the call signature tractable. Tightening would mean
    // exporting a precise tool-set type from the agent and threading it
    // through every onStepEnd caller.
    onStepEnd: GenerateTextOnStepEndCallback<any>;
}

export async function agentUserConversation({
    assistantOptions,
    session: _session,
    serverRuntime,
    modelId,
    onStepEnd,
}: AgentUserConversationOptions) {
    const resolvedModelId = modelId ?? 'gemini-3.6-flash';
    const toolApproval = assistantOptions.requireToolCallApprovals ? { writeToConsole: 'user-approval' as const } : undefined;
    return new ToolLoopAgent({
        // Provider, model id, and API key are bound on the runtime
        // (`serverRuntimeCreate`) so this agent can be exercised against a
        // mock `LanguageModel` in tests without ever calling the real Gemini
        // endpoint.
        model: serverRuntime.ai.userConversationModel(resolvedModelId),
        onStepEnd,
        providerOptions: googleAgentProviderOptionsFor(resolvedModelId),
        // Structured final answers stream as ordered body blocks (markdown +
        // cardList). See `assistantPresentationOutput.ts` and chat.md.
        output: Output.object({ schema: assistantPresentationOutputSchema }),
        stopWhen: [
            // Hard ceiling so a runaway loop can't burn through quota.
            isStepCount(5),
            // `promptUserForInput` hands the turn back to the human — there is
            // no tool result to feed the LLM, so without this the model would
            // keep stepping and (with Gemini) tend to apologize that "the tool
            // failed". The next assistant turn happens after the user submits
            // a `ChatMessageUserInput`, which `toModelMessages` replays as the
            // matching tool-result.
            hasToolCall('promptUserForInput'),
        ],
        instructions: [
            currentDateForAgent(),
            'You are SeaScope, an AI assistant for maritime security operators.',
            'Reply with structured `blocks`: use `markdown` for prose and `cardList` when listing ≥2 browseable entities. Never invent URLs.',
        ].join('\n'),
        // Approval gating is per-chat: when `requireToolCallApprovals` is on,
        // the AI SDK suspends the loop on the gated call and emits a
        // `tool-approval-request` content part instead of executing. The
        // human's decision lands as a `chatMessagesToolApprovalResponse` row
        // and is replayed (by `toModelMessages`) as a `tool-approval-response`
        // part on the next turn — at which point the SDK runs `execute`
        // itself. We never call `execute` manually.
        toolApproval,
        tools: {
            promptUserForInput: toolPromptUserForInput(),
            writeToConsole: toolWriteToConsole(),
        },
    });
}
