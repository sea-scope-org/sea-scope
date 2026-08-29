import { format, parseISO } from 'date-fns';
import { useCallback, useState } from 'react';
import type { GqlCChatAssistantBodyBlock, GqlCChatMessageAssistantText } from '../../graphql/generated';
import { cn } from '../../utils/cn';
import { AssistantMarkdown } from '../AssistantMarkdown';
import { AssistantReasoning } from '../AssistantReasoning';
import { ChatAssistantBodyBlocks } from './ChatAssistantBodyBlocks';
import { CopyButton, SourcesButton } from './shared';
import { SourceFavicon } from './SourceFavicon';

export function ChatMessageAssistantTextView({
    message,
    reasoningText,
    liveBlocks,
}: {
    message: GqlCChatMessageAssistantText;
    /** Resolved thought summary for this step (live or persisted). */
    reasoningText?: string;
    /** Live body blocks before the persisted row settles (same message id). */
    liveBlocks?: ReadonlyArray<GqlCChatAssistantBodyBlock> | null;
}) {
    const sources = message.sources;
    const [sourcesOpen, setSourcesOpen] = useState(false);
    const copyText = message.body.length > 0 ? message.body : null;
    const blocks = liveBlocks ?? message.blocks;
    const hasBlocks = blocks.length > 0;
    const hasSources = sources.length > 0;
    const onToggleSources = useCallback(() => setSourcesOpen((v) => !v), []);

    return (
        <div data-slot="chat-message-row" data-side="assistant" className="flex w-full min-w-0 max-w-full">
            <div className="flex w-full min-w-0 max-w-full flex-col gap-1 overflow-x-auto">
                {reasoningText ? <AssistantReasoning text={reasoningText} /> : null}
                {hasBlocks ? <ChatAssistantBodyBlocks blocks={blocks} /> : null}
                {!hasBlocks && message.body.length > 0 ? <AssistantMarkdown text={message.body} /> : null}
                <div className="flex items-center gap-2 text-[11px] opacity-70">
                    <time dateTime={message.createdAt}>{format(parseISO(message.createdAt), 'HH:mm')}</time>
                    {copyText ? <CopyButton text={copyText} /> : null}
                    {hasSources ? <SourcesButton open={sourcesOpen} count={sources.length} onToggle={onToggleSources} /> : null}
                </div>
                {hasSources ? (
                    <div
                        className={cn(
                            'grid',
                            sourcesOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                            'transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none',
                        )}
                    >
                        <div className="min-h-0 overflow-hidden" aria-hidden={!sourcesOpen} inert={!sourcesOpen}>
                            <div className="mt-1 flex min-w-0 flex-col gap-1.5 pt-2">
                                <div className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                                    Sources ({sources.length})
                                </div>
                                <ul className="flex min-w-0 gap-2 overflow-x-auto overflow-y-hidden no-scrollbar scroll-fade-x">
                                    {sources.map((source) => (
                                        <li key={source.url} className="shrink-0">
                                            <a
                                                href={source.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex max-w-48 cursor-pointer items-center gap-1.5 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                                            >
                                                <SourceFavicon url={source.url} title={source.title} />
                                                <span className="truncate">{source.title}</span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
