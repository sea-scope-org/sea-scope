import type { JSONValue, LanguageModelUsage, ModelMessage } from 'ai';
import { and, eq, isNull } from 'drizzle-orm';
import { summarizeDelegateError } from '../agents/agentScaffolding';
import { agentUserConversation } from '../agents/agentUserConversation';
import type { AssistantPresentationPartial } from '../agents/assistantPresentationOutput';
import { assistantPresentationNormalize, chatAssistantTextLooksLikeStructuredOutput } from '../agents/assistantPresentationOutput';
import type { ChatStepArtifact } from '../agents/chatStepArtifact';
import {
    chatStepArtifactClaimFirstMessageId,
    chatStepArtifactCreate,
    chatStepArtifactReasoningOrNull,
    chatStepArtifactReset,
} from '../agents/chatStepArtifact';
import { chatAssistantInputCollectionInputSchema } from '../agents/toolPromptUserForInput';
import type { ChatAssistantInputCollectionInput } from '../agents/toolPromptUserForInput';
import type {
    ChatAssistantBodyPayload,
    ChatAssistantInputSlot,
    ChatMessagePartProviderOptions,
    ChatMessageSource,
} from '../db/chatPayloadTypes';
import { chatAssistantBodyFlattenMarkdown, chatAssistantBodyFromMarkdown } from '../db/chatPayloadTypes';
import {
    chatMessagesAssistantInputCollection,
    chatMessagesAssistantText,
    chatMessagesToolApprovalRequest,
    chatMessagesToolCall,
    chats,
} from '../db/schema';
import type {
    ChatMessageAssistantInputCollectionCreate,
    ChatMessageAssistantTextCreate,
    ChatMessageCreate as ChatMessageRowCreate,
    ChatMessageToolApprovalRequestCreate,
    ChatMessageToolCallCreate,
} from '../db/schema';
import type { ServerRuntime } from '../domain/ServerRuntime';
import { chatAssistantLiveBlocksDelete, chatAssistantLiveBlocksSet } from '../graphql/chatAssistantLiveBlocks';
import type { GqlSChatAssistantOptions, GqlSSession } from '../graphql/generated';
import { chatTitleGenerate } from '../jobs/handlers/chatTitleGenerate';
import { chatMessageSourcesFromStep, chatMessageSourcesMerge } from '../mappers/chatMessageSourcesFromStep';
import { toModelMessages } from '../mappers/toModelMessages';
import { chatMessageRowsLoad } from '../queries/chatMessageRowsLoad';
import { chatMessageAppend } from './chatMessageAppend';

// Shared turn-runner: builds the agent, streams or generates, persists every
// tool call (with the `promptUserForInput` branch that becomes an input
// collection), publishes live body-block updates for structured presentation,
// and writes the assistant text row at end-of-stream.
//
// Each persisted message commits in its own short transaction; after commit
// the runner publishes a `messageAppended` wire event so subscribers see the
// new message immediately. Streaming publishes text / reasoning / blocks
// against the *current LLM step's* pre-allocated id (`ChatStepArtifact`).
//
// Nested-tool spine: `chatPersistStep` accepts `parentChatMessageId` +
// `preWrittenToolCallIds` so `delegateTo*` tools (see agent-delegation.md)
// can pre-write a parent row and nest child tool calls under it. The template
// ships the spine without a domain delegate catalog.

const PROMPT_USER_FOR_INPUT_TOOL_NAME = 'promptUserForInput';

/**
 * Coerce a step's per-part `providerMetadata` into the JSONB shape we store
 * as `providerOptions`. Returns null when the blob is missing or empty so
 * we don't write `{}` rows for providers that attach nothing.
 */
function chatMessagePartProviderOptionsFromMetadata(
    providerMetadata: Record<string, unknown> | null | undefined,
): ChatMessagePartProviderOptions | null {
    if (providerMetadata == null) return null;
    const entries = Object.entries(providerMetadata).filter(
        (entry): entry is [string, Record<string, unknown>] => entry[1] != null && typeof entry[1] === 'object' && !Array.isArray(entry[1]),
    );
    if (entries.length === 0) return null;
    return Object.fromEntries(entries) as ChatMessagePartProviderOptions;
}

type StepGenerationMeta = Pick<
    ChatMessageAssistantTextCreate,
    'modelId' | 'inputTokens' | 'outputTokens' | 'totalTokens' | 'reasoningTokens' | 'cachedInputTokens'
>;

function stepGenerationMeta(step: { usage: LanguageModelUsage; model: { modelId: string } }): StepGenerationMeta {
    const { inputTokens, outputTokens, totalTokens, inputTokenDetails, outputTokenDetails } = step.usage;
    const reasoningTokens = outputTokenDetails.reasoningTokens;
    const cachedInputTokens = inputTokenDetails.cacheReadTokens;
    const totalFallback = totalTokens ?? (inputTokens != null && outputTokens != null ? inputTokens + outputTokens : null);
    return {
        modelId: step.model.modelId,
        inputTokens: inputTokens ?? null,
        outputTokens: outputTokens ?? null,
        totalTokens: totalFallback,
        reasoningTokens: reasoningTokens ?? null,
        cachedInputTokens: cachedInputTokens ?? null,
    };
}

type OnStepEndStep = {
    content: ReadonlyArray<any>;
    toolCalls: ReadonlyArray<{
        toolCallId: string;
        toolName: string;
        input: unknown;
        providerMetadata?: Record<string, unknown> | undefined;
    }>;
    toolResults: ReadonlyArray<{ toolCallId: string; output: unknown }>;
    usage: LanguageModelUsage;
    model: { modelId: string };
    reasoningText?: string | undefined;
    text?: string | undefined;
    sources?: ReadonlyArray<{ sourceType?: string; url?: string; title?: string }> | undefined;
    providerMetadata?: { google?: unknown } | undefined;
};

interface OnStepEndContext {
    chatId: string;
    generationId: string | null | undefined;
    requestingSession: GqlSSession;
    serverRuntime: ServerRuntime;
    parentChatMessageId: string | null;
    preWrittenToolCallIds: ReadonlySet<string>;
    stepArtifact?: ChatStepArtifact;
    endedOnPromptForInput?: { value: boolean };
    lastStepGeneration?: { value: StepGenerationMeta | null };
    turnSources?: { value: ChatMessageSource[] };
}

/** Spine id + optional reasoning for the next row written in this step. */
function stepFirstArtifactFields(
    context: OnStepEndContext,
    step: OnStepEndStep,
    firstOfPersist: { value: boolean },
): { chatMessageId: string; reasoning: string | null } {
    const claimed = chatStepArtifactClaimFirstMessageId(context.stepArtifact);
    if (claimed != null) {
        return {
            chatMessageId: claimed,
            reasoning: chatStepArtifactReasoningOrNull(context.stepArtifact, step.reasoningText),
        };
    }
    if (context.stepArtifact) {
        return { chatMessageId: crypto.randomUUID(), reasoning: null };
    }
    if (firstOfPersist.value) {
        firstOfPersist.value = false;
        return {
            chatMessageId: crypto.randomUUID(),
            reasoning: chatStepArtifactReasoningOrNull(null, step.reasoningText),
        };
    }
    return { chatMessageId: crypto.randomUUID(), reasoning: null };
}

function toolCallOutcomeFromStep(
    step: OnStepEndStep,
    toolCallId: string,
): { toolResult: JSONValue; resultedAt: Date; fromError: boolean } | null {
    const matchingResult = step.toolResults.find((r) => r.toolCallId === toolCallId);
    if (matchingResult) {
        return {
            toolResult: matchingResult.output as JSONValue,
            resultedAt: new Date(),
            fromError: false,
        };
    }
    for (const part of step.content) {
        if (part.type !== 'tool-error') continue;
        const errorPart = part as { toolCallId?: string; error: unknown };
        if (errorPart.toolCallId !== toolCallId) continue;
        return {
            toolResult: {
                status: 'failed',
                summary: summarizeDelegateError(errorPart.error),
            } as unknown as JSONValue,
            resultedAt: new Date(),
            fromError: true,
        };
    }
    return null;
}

/**
 * Persist every persistable artifact of one `onStepEnd` step. Used by the
 * orchestrator (`parentChatMessageId: null`) and by nested sub-agents inside
 * a `delegateTo*` execute (parent pointer set). See agent-delegation.md.
 */
async function chatPersistStep(step: OnStepEndStep, context: OnStepEndContext): Promise<void> {
    const { chatId, generationId, requestingSession, serverRuntime, parentChatMessageId, preWrittenToolCallIds } = context;
    const generation = stepGenerationMeta(step);
    if (context.lastStepGeneration) context.lastStepGeneration.value = generation;
    if (context.turnSources) {
        chatMessageSourcesMerge(context.turnSources, chatMessageSourcesFromStep(step));
    }
    const { db } = serverRuntime;
    const firstOfPersist = { value: true };

    const approvalRequestedToolCallIds = new Set<string>();
    for (const part of step.content) {
        if (part.type === 'tool-error') {
            const errorPart = part as unknown as { toolName?: string; toolCallId?: string; error: unknown };
            const wrapped =
                errorPart.error instanceof Error
                    ? errorPart.error
                    : new Error(
                          `tool-error from ${errorPart.toolName ?? 'unknown'} (toolCallId=${errorPart.toolCallId ?? '?'}): ${
                              typeof errorPart.error === 'string' ? errorPart.error : String(errorPart.error)
                          }`,
                      );
            serverRuntime.log.error(wrapped, requestingSession);
            continue;
        }
        if (part.type !== 'tool-approval-request') continue;
        const approvalPart = part as unknown as {
            approvalId: string;
            toolCall: {
                toolCallId: string;
                toolName: string;
                input: unknown;
                providerMetadata?: Record<string, unknown> | undefined;
            };
        };
        const { approvalId, toolCall } = approvalPart;
        approvalRequestedToolCallIds.add(toolCall.toolCallId);
        const { chatMessageId, reasoning } = stepFirstArtifactFields(context, step, firstOfPersist);
        const requestSpine: ChatMessageRowCreate = {
            chatMessageId,
            chatId,
            kind: 'toolApprovalRequest',
            authorUserId: null,
            parentChatMessageId,
            createdAt: new Date(),
        };
        const requestVariant: ChatMessageToolApprovalRequestCreate = {
            chatMessageId: requestSpine.chatMessageId,
            approvalId,
            toolCallId: toolCall.toolCallId,
            toolName: toolCall.toolName,
            toolArgs: toolCall.input,
            reasoning,
            providerOptions: chatMessagePartProviderOptionsFromMetadata(toolCall.providerMetadata),
            ...generation,
        };
        await chatMessageAppend(db, serverRuntime, generationId, requestSpine, async (transaction) => {
            await transaction.insert(chatMessagesToolApprovalRequest).values(requestVariant);
        });
    }

    for (const call of step.toolCalls) {
        if (approvalRequestedToolCallIds.has(call.toolCallId)) continue;
        if (preWrittenToolCallIds.has(call.toolCallId)) {
            const outcome = toolCallOutcomeFromStep(step, call.toolCallId);
            const providerOptions = chatMessagePartProviderOptionsFromMetadata(call.providerMetadata);
            if (outcome?.fromError) {
                const updated = await db
                    .update(chatMessagesToolCall)
                    .set({
                        toolResult: outcome.toolResult,
                        resultedAt: outcome.resultedAt,
                        ...(providerOptions != null ? { providerOptions } : {}),
                    })
                    .where(and(eq(chatMessagesToolCall.toolCallId, call.toolCallId), isNull(chatMessagesToolCall.resultedAt)))
                    .returning({ chatMessageId: chatMessagesToolCall.chatMessageId });
                const chatMessageId = updated[0]?.chatMessageId;
                if (generationId && chatMessageId) {
                    await serverRuntime.publish.chatUpdates({
                        generationId,
                        payload: { kind: 'messageAppended', chatMessageId },
                    });
                }
            } else if (providerOptions != null) {
                await db.update(chatMessagesToolCall).set({ providerOptions }).where(eq(chatMessagesToolCall.toolCallId, call.toolCallId));
            }
            continue;
        }
        if (call.toolName === PROMPT_USER_FOR_INPUT_TOOL_NAME) {
            if (context.endedOnPromptForInput) context.endedOnPromptForInput.value = true;
            const parsed = chatAssistantInputCollectionInputSchema.safeParse(call.input);
            if (!parsed.success) {
                serverRuntime.log.error(
                    new Error(`promptUserForInput call rejected: ${parsed.error.message}; raw=${JSON.stringify(call.input)}`),
                    requestingSession,
                );
                continue;
            }
            const preambleText = context.stepArtifact?.text.trim() || (typeof step.text === 'string' ? step.text.trim() : '');
            if (preambleText.length > 0) {
                const textFields = stepFirstArtifactFields(context, step, firstOfPersist);
                const textSpine: ChatMessageRowCreate = {
                    chatMessageId: textFields.chatMessageId,
                    chatId,
                    kind: 'assistantText',
                    authorUserId: null,
                    parentChatMessageId,
                    createdAt: new Date(),
                };
                const textVariant: ChatMessageAssistantTextCreate = {
                    chatMessageId: textSpine.chatMessageId,
                    body: chatAssistantBodyFromMarkdown(preambleText),
                    reasoning: textFields.reasoning,
                    ...generation,
                };
                await chatMessageAppend(db, serverRuntime, generationId, textSpine, async (transaction) => {
                    await transaction.insert(chatMessagesAssistantText).values(textVariant);
                });
                if (context.stepArtifact) context.stepArtifact.text = '';
                serverRuntime.jobs.enqueue(chatTitleGenerate, { chatId }).catch((enqueueError) => {
                    serverRuntime.log.error(enqueueError, requestingSession);
                });
            }
            const { chatMessageId, reasoning } = stepFirstArtifactFields(context, step, firstOfPersist);
            const collectionCreatedAt = new Date(Date.now() + 1);
            const collectionSpine: ChatMessageRowCreate = {
                chatMessageId,
                chatId,
                kind: 'assistantInputCollection',
                authorUserId: null,
                parentChatMessageId,
                createdAt: collectionCreatedAt,
            };
            const collectionVariant: ChatMessageAssistantInputCollectionCreate = {
                chatMessageId: collectionSpine.chatMessageId,
                prompt: parsed.data.prompt,
                inputs: parsed.data.inputs.map(chatAssistantInputSlotPromote),
                mode: parsed.data.mode,
                reasoning,
                providerOptions: chatMessagePartProviderOptionsFromMetadata(call.providerMetadata),
                ...generation,
            };
            await chatMessageAppend(db, serverRuntime, generationId, collectionSpine, async (transaction) => {
                await transaction.insert(chatMessagesAssistantInputCollection).values(collectionVariant);
            });
            continue;
        }

        const { chatMessageId, reasoning } = stepFirstArtifactFields(context, step, firstOfPersist);
        const toolCallSpine: ChatMessageRowCreate = {
            chatMessageId,
            chatId,
            kind: 'toolCall',
            authorUserId: null,
            parentChatMessageId,
            createdAt: new Date(),
        };
        const outcome = toolCallOutcomeFromStep(step, call.toolCallId);
        const toolCallVariant: ChatMessageToolCallCreate = {
            chatMessageId: toolCallSpine.chatMessageId,
            toolCallId: call.toolCallId,
            toolName: call.toolName,
            toolArgs: call.input,
            toolResult: outcome?.toolResult ?? null,
            resultedAt: outcome?.resultedAt ?? null,
            reasoning,
            providerOptions: chatMessagePartProviderOptionsFromMetadata(call.providerMetadata),
            ...generation,
        };
        await chatMessageAppend(db, serverRuntime, generationId, toolCallSpine, async (transaction) => {
            await transaction.insert(chatMessagesToolCall).values(toolCallVariant);
        });
    }
}

interface ChatAssistantTurnRunOptions {
    chatId: string;
    coreMessages: ModelMessage[];
    requestingSession: GqlSSession;
    assistantOptions: GqlSChatAssistantOptions;
    serverRuntime: ServerRuntime;
}

async function chatAssistantTurnRun({
    chatId,
    coreMessages,
    requestingSession,
    assistantOptions,
    serverRuntime,
}: ChatAssistantTurnRunOptions): Promise<void> {
    const { generationId } = assistantOptions;
    const stepArtifact = chatStepArtifactCreate();

    try {
        await runAgentTurn({
            chatId,
            coreMessages,
            requestingSession,
            assistantOptions,
            serverRuntime,
            stepArtifact,
        });
    } finally {
        if (generationId) {
            try {
                chatAssistantLiveBlocksDelete(stepArtifact.messageId);
                await serverRuntime.publish.chatUpdates({
                    generationId,
                    payload: { kind: 'turnEnded', generationId },
                });
            } catch (publishError) {
                serverRuntime.log.error(publishError, requestingSession);
            }
        }
    }
}

interface ChatAssistantTurnRunDetachedOptions {
    chatId: string;
    requestingSession: GqlSSession;
    assistantOptions: GqlSChatAssistantOptions;
    serverRuntime: ServerRuntime;
}

/**
 * Kick the assistant turn off on a void promise. Returns synchronously so the
 * mutation can resolve as soon as the user-side row is durable; the agent
 * runs detached and emits `TurnEnded` when done.
 */
export function chatAssistantTurnRunDetached({
    chatId,
    requestingSession,
    assistantOptions,
    serverRuntime,
}: ChatAssistantTurnRunDetachedOptions): void {
    void (async () => {
        try {
            const coreMessages = toModelMessages(await chatMessageRowsLoad(serverRuntime.db, chatId));
            await chatAssistantTurnRun({
                chatId,
                coreMessages,
                requestingSession,
                assistantOptions,
                serverRuntime,
            });
            await serverRuntime.db.update(chats).set({ lastModifiedAt: new Date() }).where(eq(chats.chatId, chatId));
        } catch (turnError) {
            serverRuntime.log.error(turnError, requestingSession);
        }
    })();
}

async function runAgentTurn({
    chatId,
    coreMessages,
    requestingSession,
    assistantOptions,
    serverRuntime,
    stepArtifact,
}: ChatAssistantTurnRunOptions & { stepArtifact: ChatStepArtifact }): Promise<void> {
    const { generationId } = assistantOptions;
    const { db } = serverRuntime;
    const lastStepGeneration: { value: StepGenerationMeta | null } = { value: null };
    const endedOnPromptForInput = { value: false };
    const preWrittenToolCallIds = new Set<string>();
    const turnSources: { value: ChatMessageSource[] } = { value: [] };
    const structuredMarkdownActive = { value: false };
    const pendingBody: { value: ChatAssistantBodyPayload | null } = { value: null };

    const agent = await agentUserConversation({
        session: requestingSession,
        serverRuntime,
        assistantOptions,
        onStepEnd: async (step) => {
            await chatPersistStep(step, {
                chatId,
                generationId,
                requestingSession,
                serverRuntime,
                parentChatMessageId: null,
                preWrittenToolCallIds,
                stepArtifact,
                endedOnPromptForInput,
                lastStepGeneration,
                turnSources,
            });
            if (!generationId && step.toolCalls.length > 0) {
                chatStepArtifactReset(stepArtifact);
            }
        },
    });

    if (generationId) {
        const result = await agent.stream({ messages: coreMessages });
        const presentationPublisher = chatAssistantPresentationPublisherCreate({
            generationId,
            serverRuntime,
            stepArtifact,
            structuredMarkdownActive,
            pendingBody,
        });

        await Promise.all([
            (async () => {
                for await (const part of result.stream) {
                    if (part.type === 'start-step') {
                        chatAssistantLiveBlocksDelete(stepArtifact.messageId);
                        chatStepArtifactReset(stepArtifact);
                        structuredMarkdownActive.value = false;
                        pendingBody.value = null;
                        presentationPublisher.resetForNewStep();
                        await serverRuntime.publish.chatUpdates({
                            generationId,
                            payload: {
                                kind: 'assistantBlocksClear',
                                chatMessageId: stepArtifact.messageId,
                            },
                        });
                        continue;
                    }
                    if (part.type === 'text-delta') {
                        if (structuredMarkdownActive.value) continue;
                        const nextText = stepArtifact.text + part.text;
                        if (chatAssistantTextLooksLikeStructuredOutput(nextText)) {
                            structuredMarkdownActive.value = true;
                            stepArtifact.text = '';
                            await serverRuntime.publish.chatUpdates({
                                generationId,
                                payload: {
                                    kind: 'assistantTextClear',
                                    chatMessageId: stepArtifact.messageId,
                                },
                            });
                            continue;
                        }
                        stepArtifact.text = nextText;
                        await serverRuntime.publish.chatUpdates({
                            generationId,
                            payload: {
                                kind: 'assistantTextChunk',
                                chatMessageId: stepArtifact.messageId,
                                delta: part.text,
                            },
                        });
                    } else if (part.type === 'reasoning-delta') {
                        stepArtifact.reasoning += part.text;
                        await serverRuntime.publish.chatUpdates({
                            generationId,
                            payload: {
                                kind: 'assistantReasoningChunk',
                                chatMessageId: stepArtifact.messageId,
                                delta: part.text,
                            },
                        });
                    }
                }
            })(),
            (async () => {
                try {
                    for await (const partial of result.partialOutputStream) {
                        await presentationPublisher.onPartial(partial as AssistantPresentationPartial);
                    }
                } catch (error) {
                    serverRuntime.log.error(
                        error instanceof Error ? error : new Error(`partialOutputStream failed: ${String(error)}`),
                        requestingSession,
                    );
                }
            })(),
        ]);

        try {
            const streamSources = await result.sources;
            chatMessageSourcesMerge(turnSources, chatMessageSourcesFromStep({ sources: streamSources }));
        } catch {
            // rejected sources must not abort the turn
        }

        try {
            const output = await result.output;
            const normalized = assistantPresentationNormalize(output);
            if (normalized != null) {
                pendingBody.value = normalized;
                stepArtifact.text = chatAssistantBodyFlattenMarkdown(normalized);
            }
        } catch {
            // Non-structured agents / failed parse — keep buffered text.
        }
    } else {
        const result = await agent.generate({ messages: coreMessages });
        const finalStep = Array.isArray(result.steps) ? result.steps.at(-1) : undefined;
        const finalHadTools = Array.isArray(finalStep?.toolCalls) && finalStep.toolCalls.length > 0;
        if (!finalHadTools) {
            const normalized = assistantPresentationNormalize(result.output);
            if (normalized != null) {
                pendingBody.value = normalized;
                stepArtifact.text = chatAssistantBodyFlattenMarkdown(normalized);
            } else {
                stepArtifact.text = typeof result.text === 'string' ? result.text : '';
            }
            const reasoningText = typeof finalStep?.reasoningText === 'string' ? finalStep.reasoningText : '';
            stepArtifact.reasoning = reasoningText;
        }
        if (Array.isArray(result.sources)) {
            chatMessageSourcesMerge(turnSources, chatMessageSourcesFromStep({ sources: result.sources }));
        }
        if (Array.isArray(result.steps)) {
            for (const step of result.steps) {
                chatMessageSourcesMerge(turnSources, chatMessageSourcesFromStep(step));
            }
        }
    }

    const assistantText = stepArtifact.text;
    const assistantReasoning = stepArtifact.reasoning;
    const assistantTextMessageId = stepArtifact.messageId;
    const bodyPayload: ChatAssistantBodyPayload =
        pendingBody.value ?? (assistantText.length > 0 ? chatAssistantBodyFromMarkdown(assistantText) : { blocks: [] });

    const hasAssistantBody = bodyPayload.blocks.length > 0;
    if (hasAssistantBody && !endedOnPromptForInput.value && !stepArtifact.firstClaimed) {
        chatStepArtifactClaimFirstMessageId(stepArtifact);
        const assistantSpine: ChatMessageRowCreate = {
            chatMessageId: assistantTextMessageId,
            chatId,
            kind: 'assistantText',
            authorUserId: null,
            parentChatMessageId: null,
            createdAt: new Date(),
        };
        const generation = lastStepGeneration.value;
        const assistantVariant: ChatMessageAssistantTextCreate = {
            chatMessageId: assistantSpine.chatMessageId,
            body: bodyPayload,
            reasoning: assistantReasoning.length > 0 ? assistantReasoning : null,
            sources: turnSources.value.length > 0 ? turnSources.value : null,
            ...(generation ?? {}),
        };
        await chatMessageAppend(db, serverRuntime, generationId, assistantSpine, async (transaction) => {
            await transaction.insert(chatMessagesAssistantText).values(assistantVariant);
        });

        serverRuntime.jobs.enqueue(chatTitleGenerate, { chatId }).catch((enqueueError) => {
            serverRuntime.log.error(enqueueError, requestingSession);
        });
    }
}

/** Publish live body-block updates from structured `partialOutputStream`. */
function chatAssistantPresentationPublisherCreate({
    generationId,
    serverRuntime,
    stepArtifact,
    structuredMarkdownActive,
    pendingBody,
}: {
    generationId: string;
    serverRuntime: ServerRuntime;
    stepArtifact: ChatStepArtifact;
    structuredMarkdownActive: { value: boolean };
    pendingBody: { value: ChatAssistantBodyPayload | null };
}) {
    let lastBlocksJson = '';
    let clearedLeakedJsonText = false;

    return {
        resetForNewStep() {
            lastBlocksJson = '';
            clearedLeakedJsonText = false;
        },
        async onPartial(partial: AssistantPresentationPartial) {
            const chatMessageId = stepArtifact.messageId;
            const enteringStructured = !structuredMarkdownActive.value;
            structuredMarkdownActive.value = true;
            if (enteringStructured && !clearedLeakedJsonText) {
                clearedLeakedJsonText = true;
                if (chatAssistantTextLooksLikeStructuredOutput(stepArtifact.text)) {
                    stepArtifact.text = '';
                }
                chatAssistantLiveBlocksDelete(chatMessageId);
                await serverRuntime.publish.chatUpdates({
                    generationId,
                    payload: { kind: 'assistantTextClear', chatMessageId },
                });
                await serverRuntime.publish.chatUpdates({
                    generationId,
                    payload: { kind: 'assistantBlocksClear', chatMessageId },
                });
            }

            const normalized = assistantPresentationNormalize(partial);
            if (normalized == null) return;

            pendingBody.value = normalized;
            stepArtifact.text = chatAssistantBodyFlattenMarkdown(normalized);

            const replaceJson = JSON.stringify(normalized.blocks);
            if (replaceJson === lastBlocksJson) return;
            lastBlocksJson = replaceJson;

            chatAssistantLiveBlocksSet(chatMessageId, normalized.blocks);
            await serverRuntime.publish.chatUpdates({
                generationId,
                payload: { kind: 'assistantBlocksReplace', chatMessageId },
            });
        },
    };
}

function chatAssistantInputSlotPromote(slot: ChatAssistantInputCollectionInput['inputs'][number]): ChatAssistantInputSlot {
    const inputId = crypto.randomUUID();
    const shared = { inputId, prompt: slot.prompt };
    switch (slot.kind) {
        case 'Date':
        case 'DateRange':
        case 'DateTime':
        case 'Time':
        case 'Boolean':
        case 'Text':
            return { ...shared, kind: slot.kind };
        case 'SingleSelect':
        case 'MultiSelect':
            if (!slot.options || slot.options.length === 0) {
                throw new Error(`promptUserForInput: ${slot.kind} slot is missing required 'options'`);
            }
            return { ...shared, kind: slot.kind, options: slot.options };
    }
}
