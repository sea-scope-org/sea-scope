import { ChevronDownIcon } from 'lucide-react';
import type { TransitionEvent } from 'react';
import { useCallback, useId, useLayoutEffect, useRef, useState } from 'react';
import type { GqlCChatMessageUser } from '../../graphql/generated';
import { cn } from '../../utils/cn';
import { ChatAttachmentPreviewDialog } from './ChatAttachmentPreviewDialog';
import { ChatAttachmentTileGrid } from './ChatAttachmentTileGrid';
import { Bubble, CopyButton, MessageMetaRow, MessageRow, Timestamp } from './shared';

export function ChatMessageUserView({ message }: { message: GqlCChatMessageUser }) {
    const hasAttachments = message.attachments.length > 0;
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewIndex, setPreviewIndex] = useState(0);

    const openPreviewAt = (index: number) => {
        setPreviewIndex(index);
        setPreviewOpen(true);
    };

    return (
        <MessageRow side="user">
            <div className="group/msg flex w-full max-w-full flex-col items-end gap-1">
                <Bubble tone="user">
                    {hasAttachments ? (
                        <div className="mb-2">
                            <ChatAttachmentTileGrid attachments={message.attachments} onTileClick={openPreviewAt} />
                        </div>
                    ) : null}
                    {message.body.length > 0 ? <UserMessageBody body={message.body} /> : null}
                </Bubble>
                <MessageMetaRow align="end" revealOnHover>
                    <Timestamp iso={message.createdAt} className="mt-0 opacity-100" />
                    {message.body.length > 0 ? <CopyButton text={message.body} /> : null}
                </MessageMetaRow>
                {hasAttachments ? (
                    <ChatAttachmentPreviewDialog
                        open={previewOpen}
                        onOpenChange={setPreviewOpen}
                        attachments={message.attachments}
                        index={previewIndex}
                        onIndexChange={setPreviewIndex}
                    />
                ) : null}
            </div>
        </MessageRow>
    );
}

function UserMessageBody({ body }: { body: string }) {
    const panelId = useId();
    const [expanded, setExpanded] = useState(false);
    const [animate, setAnimate] = useState(false);
    const [canExpand, setCanExpand] = useState(false);
    const [collapsedH, setCollapsedH] = useState(0);
    const [fullH, setFullH] = useState(0);
    const contentRef = useRef<HTMLDivElement>(null);
    const interactive = canExpand || expanded;

    const measure = useCallback(() => {
        const el = contentRef.current;
        if (!el) return;
        const full = el.scrollHeight;
        const lh = Math.ceil(parseFloat(getComputedStyle(el).lineHeight) || 22);
        const collapsed = lh * 2;
        setFullH(full);
        setCollapsedH(collapsed);
        setCanExpand(full > collapsed + 1);
    }, []);

    useLayoutEffect(() => {
        measure();
        const el = contentRef.current;
        if (!el || typeof ResizeObserver === 'undefined') return;
        const observer = new ResizeObserver(measure);
        observer.observe(el);
        return () => observer.disconnect();
    }, [body, measure]);

    const onToggle = () => {
        if (expanded) {
            const el = contentRef.current;
            if (el) setFullH(el.scrollHeight);
            setAnimate(true);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setExpanded(false));
            });
            return;
        }
        setAnimate(true);
        setExpanded(true);
    };

    const onTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
        if (event.propertyName !== 'max-height') return;
        setAnimate(false);
        measure();
    };

    const maxHeight = !interactive || collapsedH === 0 ? undefined : expanded ? (animate ? fullH : undefined) : collapsedH;
    const label = expanded ? 'Show less' : 'Show more';

    return (
        <div className="flex flex-col items-end">
            <div
                id={panelId}
                className={cn(
                    'min-w-0 w-full overflow-hidden wrap-break-word',
                    !expanded && !animate && 'line-clamp-2',
                    animate && 'transition-[max-height] duration-200 ease-out motion-reduce:transition-none',
                )}
                style={maxHeight != null ? { maxHeight } : undefined}
                onTransitionEnd={onTransitionEnd}
            >
                <div ref={contentRef} className="whitespace-pre-wrap wrap-break-word">
                    {body}
                </div>
            </div>
            {interactive ? (
                <button
                    type="button"
                    onClick={onToggle}
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    aria-label={label}
                    className={cn(
                        '-mb-1 -mr-1 flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md',
                        'text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground',
                        'active:bg-primary-foreground/20 active:text-primary-foreground',
                        'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                    )}
                >
                    <ChevronDownIcon
                        aria-hidden
                        className={cn(
                            'size-3.5 transition-transform duration-200 ease-out motion-reduce:transition-none',
                            expanded && 'rotate-180',
                        )}
                    />
                </button>
            ) : null}
        </div>
    );
}
