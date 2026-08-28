import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { format, parseISO } from 'date-fns';
import { useCallback, useMemo } from 'react';
import { useMutation, useQuery } from 'urql';
import { toFlatAnswerInput } from '../web/chat/chatAssistantInputKinds';
import { ChatComposer } from '../web/chat/ChatComposer';
import type { TranscriptMessage } from '../web/chat/chatTranscript';
import {
    activeToolCallId,
    findLatestCollectionId,
    findPendingApprovalIds,
    findUserInputByCollectionId,
    groupMessagesByDate,
    mergeTranscriptMessages,
    partitionByParent,
} from '../web/chat/chatTranscript';
import { useChatLiveUpdates } from '../web/chat/useChatLiveUpdates';
import { AssistantMarkdown } from '../web/components/AssistantMarkdown';
import { AssistantPendingStatus } from '../web/components/AssistantPendingStatus';
import { AssistantReasoning } from '../web/components/AssistantReasoning';
import { ChatTranscriptShell } from '../web/components/base/chat-transcript-shell';
import { MessageScrollerItem } from '../web/components/base/message-scroller';
import { Spinner } from '../web/components/base/spinner';
import { ChatMessage } from '../web/components/chat-message';
import { ChatAssistantBodyBlocks } from '../web/components/chat-message/ChatAssistantBodyBlocks';
import type { GqlCChatAssistantBodyBlock, GqlCChatAssistantInputValue, GqlCChatPageQuery } from '../web/graphql/generated';
import { ChatInputCollectionRespondDocument, ChatPageDocument, ChatToolApprovalRespondDocument } from '../web/graphql/generated';
import { seoMeta } from '../web/seo/seoMeta';
import { webPageUrlGet } from '../web/seo/webPageUrlGet';

// Minimal AI chat surface — see `docs/features/chat.md`. Live updates flow
// exclusively through the `chatUpdates` subscription, owned by
// `useChatLiveUpdates`. Per-turn state lives at the route level so the
// subscription survives the empty→loaded handoff after the first send. The
// agent turn runs detached server-side: the mutation returns as soon as the
// user-side row is durable, and the assistant streams over the subscription;
// `ChatUpdateTurnEnded` is the signal that the turn is done.

export const Route = createFileRoute('/chat')({
    validateSearch: (search: Record<string, unknown>) => ({ chatId: typeof search.chatId === 'string' ? search.chatId : undefined }),
    staleTime: 0,
    head: () =>
        seoMeta({
            title: 'Chat',
            description: 'A conversation with the assistant.',
            path: '/chat',
            webPageUrl: webPageUrlGet(),
            // Chat is a logged-in, per-session surface — exclude it from
            // search engines. The sitemap also drops it via
            // `sitemapRoutes.ts`.
            noindex: true,
        }),
    component() {
        const { chatId } = Route.useSearch();
        const live = useChatLiveUpdates();
        return (
            <>
                {live.listeners}
                {chatId ? <ChatPage chatId={chatId} live={live} /> : <ChatEmpty live={live} />}
            </>
        );
    },
});

// --- Empty state -------------------------------------------------------------
//
// No chatId in the URL means we have no chat yet. The composer creates one on
// first send and then navigates to `?chatId=...`, after which `ChatPage` takes
// over. The subscription was set up at the route level BEFORE the mutation
// fired, so the user message and all subsequent updates are already buffered
// when the navigate completes — there's no perceptible "loading then a flash"
// gap any more.

function ChatEmpty({ live }: { live: ReturnType<typeof useChatLiveUpdates> }) {
    const navigate = useNavigate();
    return (
        <main className="mx-auto grid h-dvh w-full max-w-2xl grid-rows-[1fr_auto] gap-4 p-6">
            <div className="grid place-items-center text-sm text-muted-foreground">
                {live.isGenerating(undefined) ? <Spinner className="size-4 text-muted-foreground" /> : 'Start a new conversation.'}
            </div>
            <ChatComposer
                onMessageSent={(newChatId) => navigate({ to: '/chat', search: { chatId: newChatId } })}
                isLocked={live.isGenerating(undefined)}
                beginTurn={live.beginTurn}
                bindTurn={live.bindTurn}
                endTurn={live.endTurn}
            />
        </main>
    );
}

// --- Loaded chat -------------------------------------------------------------

function ChatPage({ chatId, live }: { chatId: string; live: ReturnType<typeof useChatLiveUpdates> }) {
    const [{ data, fetching, error }] = useQuery({
        query: ChatPageDocument,
        variables: { chatId },
        // Initial transcript only — subsequent updates arrive via the
        // `chatUpdates` subscription. `cache-and-network` keeps the transcript
        // fresh across navigations without forcing a refetch on every send.
        requestPolicy: 'cache-and-network',
    });

    const [, respondToCollection] = useMutation(ChatInputCollectionRespondDocument);
    const [, respondToApproval] = useMutation(ChatToolApprovalRespondDocument);

    const onCollectionSubmit = useCallback(
        async (collectionMessageId: string, answers: ReadonlyArray<{ inputId: string; value: GqlCChatAssistantInputValue }>) => {
            const generationId = live.beginTurn(chatId);
            const flatAnswers = answers.map((answer) => toFlatAnswerInput(answer.inputId, answer.value));
            // The mutation returns as soon as the userInput row is committed
            // server-side; the resumed assistant turn streams over the
            // subscription and clears `generationId` via `TurnEnded`.
            const result = await respondToCollection({
                collectionMessageId,
                answers: flatAnswers,
                generationId,
                // Approvals aren't reachable from a collection-respond yet —
                // the assistant's resumed turn shouldn't suddenly surface them.
                requireToolCallApprovals: false,
            });
            if (result.error || !result.data?.session.chatInputCollectionRespond) {
                live.endTurn(generationId);
            }
        },
        [respondToCollection, live, chatId],
    );

    const onApprovalRespond = useCallback(
        async (approvalId: string, approved: boolean, reason?: string) => {
            const generationId = live.beginTurn(chatId);
            const result = await respondToApproval({
                approvalId,
                approved,
                reason,
                generationId,
                // Stay in manual mode for the resumed turn — if the LLM
                // follows up with another gated tool call its approval card
                // surfaces too.
                requireToolCallApprovals: true,
            });
            if (result.error || !result.data?.session.chatToolApprovalRespond) {
                live.endTurn(generationId);
            }
        },
        [respondToApproval, live, chatId],
    );

    const session = data?.currentSession;
    const chat = session?.chat;

    if (error) {
        return <main className="grid place-items-center p-8 text-sm text-destructive">Failed to load chat: {error.message}</main>;
    }
    if (!chat) {
        return (
            <main className="grid place-items-center p-8 text-sm text-muted-foreground">
                <Spinner />
            </main>
        );
    }

    return (
        <main className="mx-auto grid h-dvh w-full min-w-0 max-w-2xl grid-rows-[auto_1fr_auto] gap-4 p-6">
            <header className="flex items-baseline justify-between">
                <h1 className="text-lg font-semibold">{chat.title || 'New chat'}</h1>
                {fetching ? <Spinner className="size-3 text-muted-foreground" /> : null}
            </header>

            <ChatTranscript
                chat={chat}
                appendedMessages={live.appendedMessagesFor(chatId)}
                streamingTexts={live.streamingTextsFor(chatId)}
                reasoningTexts={live.reasoningTextsFor(chatId)}
                liveBlocks={live.blocksFor(chatId)}
                isGenerating={live.isGenerating(chatId)}
                liveTurnMessageIds={live.liveTurnMessageIdsFor(chatId)}
                onCollectionSubmit={onCollectionSubmit}
                onApprovalRespond={onApprovalRespond}
            />

            <ChatComposer
                chatId={chat.chatId}
                isLocked={live.isGenerating(chatId)}
                beginTurn={live.beginTurn}
                bindTurn={live.bindTurn}
                endTurn={live.endTurn}
            />
        </main>
    );
}

// --- Transcript --------------------------------------------------------------

function ChatTranscript({
    chat,
    appendedMessages,
    streamingTexts,
    reasoningTexts,
    liveBlocks,
    isGenerating,
    liveTurnMessageIds,
    onCollectionSubmit,
    onApprovalRespond,
}: {
    chat: GqlCChatPageQuery['currentSession']['chat'];
    appendedMessages: ReadonlyArray<TranscriptMessage>;
    streamingTexts: Readonly<Record<string, string>>;
    reasoningTexts: Readonly<Record<string, string>>;
    liveBlocks: Readonly<Record<string, ReadonlyArray<GqlCChatAssistantBodyBlock>>>;
    isGenerating: boolean;
    liveTurnMessageIds: ReadonlySet<string>;
    onCollectionSubmit: (
        collectionMessageId: string,
        answers: ReadonlyArray<{ inputId: string; value: GqlCChatAssistantInputValue }>,
    ) => void;
    onApprovalRespond: (approvalId: string, approved: boolean, reason?: string) => void;
}) {
    const allMessages = mergeTranscriptMessages(chat.messages, appendedMessages);
    const { topLevel, childrenByParentId } = useMemo(() => partitionByParent(allMessages), [allMessages]);
    const latestCollectionId = findLatestCollectionId(topLevel);
    const pendingApprovalIds = findPendingApprovalIds(allMessages);
    const userInputByCollection = findUserInputByCollectionId(allMessages);
    const groupedMessages = groupMessagesByDate(topLevel);
    const persistedMessageIds = useMemo(() => new Set(allMessages.map((m) => m.chatMessageId)), [allMessages]);

    const liveAssistantSlotIds = useMemo(() => {
        const ids = new Set<string>();
        for (const id of Object.keys(streamingTexts)) {
            if (!persistedMessageIds.has(id)) ids.add(id);
        }
        for (const id of Object.keys(reasoningTexts)) {
            if (!persistedMessageIds.has(id)) ids.add(id);
        }
        for (const id of Object.keys(liveBlocks)) {
            if (!persistedMessageIds.has(id)) ids.add(id);
        }
        return [...ids];
    }, [streamingTexts, reasoningTexts, liveBlocks, persistedMessageIds]);

    const hasStreamingText = Object.keys(streamingTexts).length > 0;
    const activeId = activeToolCallId(topLevel, liveTurnMessageIds, isGenerating, hasStreamingText);
    const showPending = isGenerating && !hasStreamingText && liveAssistantSlotIds.length === 0 && activeId === null;

    return (
        <ChatTranscriptShell jumpToLatestLabel="Jump to latest" contentClassName="gap-4" className="min-h-0 min-w-0">
            {groupedMessages.flatMap((group) => [
                <MessageScrollerItem key={`date-${group.date}`}>
                    <DateSeparator iso={group.date} />
                </MessageScrollerItem>,
                ...group.messages.map((message) => {
                    const approvalRespondHandler =
                        message.__typename === 'ChatMessageToolApprovalRequest' && pendingApprovalIds.has(message.approvalId)
                            ? onApprovalRespond
                            : undefined;
                    const collectionUserInput =
                        message.__typename === 'ChatMessageAssistantInputCollection'
                            ? userInputByCollection.get(message.chatMessageId)
                            : undefined;
                    const reasoning =
                        message.__typename === 'ChatMessageAssistantText' ||
                        message.__typename === 'ChatMessageToolCall' ||
                        message.__typename === 'ChatMessageToolApprovalRequest' ||
                        message.__typename === 'ChatMessageAssistantInputCollection'
                            ? (reasoningTexts[message.chatMessageId] ?? message.reasoning ?? undefined)
                            : undefined;
                    const childMessages =
                        message.__typename === 'ChatMessageToolCall' ? childrenByParentId.get(message.chatMessageId) : undefined;
                    const toolCallActive = message.__typename === 'ChatMessageToolCall' && message.chatMessageId === activeId;
                    return (
                        <MessageScrollerItem
                            key={message.chatMessageId}
                            scrollAnchor={message.__typename === 'ChatMessageUser' || undefined}
                        >
                            <ChatMessage
                                message={message}
                                isInteractiveCollection={
                                    message.__typename === 'ChatMessageAssistantInputCollection' &&
                                    message.chatMessageId === latestCollectionId
                                }
                                collectionUserInput={collectionUserInput}
                                reasoningText={reasoning}
                                liveBlocks={
                                    message.__typename === 'ChatMessageAssistantText' ? (liveBlocks[message.chatMessageId] ?? null) : null
                                }
                                childMessages={childMessages}
                                toolCallActive={toolCallActive}
                                onCollectionSubmit={onCollectionSubmit}
                                onApprovalRespond={approvalRespondHandler}
                            />
                        </MessageScrollerItem>
                    );
                }),
            ])}
            {showPending ? (
                <MessageScrollerItem key="pending">
                    <AssistantPendingStatus />
                </MessageScrollerItem>
            ) : null}
            {liveAssistantSlotIds.map((slotId) => {
                const reasoning = reasoningTexts[slotId];
                const streamingText = streamingTexts[slotId];
                const blocks = liveBlocks[slotId];
                const answerStarted = streamingText !== undefined || (blocks != null && blocks.length > 0);
                const reasoningLive = isGenerating && !answerStarted;
                return (
                    <MessageScrollerItem key={slotId} aria-live="polite" aria-atomic="false">
                        <div className="flex min-w-0 flex-col gap-2">
                            {reasoning ? <AssistantReasoning text={reasoning} live={reasoningLive} /> : null}
                            {blocks != null && blocks.length > 0 ? (
                                <ChatAssistantBodyBlocks blocks={blocks} streamingMarkdown />
                            ) : streamingText !== undefined ? (
                                <AssistantMarkdown text={streamingText} streaming />
                            ) : null}
                        </div>
                    </MessageScrollerItem>
                );
            })}
        </ChatTranscriptShell>
    );
}

function DateSeparator({ iso }: { iso: string }) {
    return (
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-wide text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            <time dateTime={iso}>{format(parseISO(iso), 'PP')}</time>
            <span className="h-px flex-1 bg-border" />
        </div>
    );
}
