import { format, parseISO } from 'date-fns';
import {
    AlertTriangleIcon,
    BookIcon,
    BookOpenIcon,
    BracesIcon,
    CheckIcon,
    ChevronDownIcon,
    CopyIcon,
    Loader2Icon,
    WorkflowIcon,
} from 'lucide-react';
import type { PropsWithChildren } from 'react';
import * as React from 'react';
import { toast } from 'sonner';
import { toolDisplay } from '../../chat/toolDisplay';
import { interpretToolResult } from '../../chat/toolResult';
import type { ToolStatus } from '../../chat/toolResult';
import { cn } from '../../utils/cn';
import { AssistantMarkdown } from '../AssistantMarkdown';
import { Button } from '../base/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../base/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '../base/tooltip';

// Bits shared across the chat-message variants. Kept variant-agnostic — anything
// specific to a single message type lives next to that variant's view file.

interface MessageRowProps extends PropsWithChildren {
    side: 'user' | 'assistant' | 'system';
}

export function MessageRow({ side, children }: MessageRowProps) {
    return (
        <div
            data-slot="chat-message-row"
            data-side={side}
            className={cn('flex w-full gap-3', side === 'user' && 'justify-end', side === 'system' && 'justify-start')}
        >
            {children}
        </div>
    );
}

interface BubbleProps extends PropsWithChildren {
    tone: 'user' | 'assistant';
}

export function Bubble({ tone, children }: BubbleProps) {
    return (
        <div
            data-slot="chat-message-bubble"
            data-tone={tone}
            className={cn(
                'max-w-[80%] rounded-2xl px-4 py-2 text-sm/relaxed shadow-sm',
                tone === 'user' ? 'rounded-br-sm bg-primary text-primary-foreground' : 'rounded-bl-sm bg-muted text-foreground',
            )}
        >
            {children}
        </div>
    );
}

export function ToolStatusIcon({ status, className }: { status: ToolStatus; className?: string }) {
    if (status === 'inProgress') return <Loader2Icon aria-hidden className={cn('animate-spin', className)} />;
    if (status === 'failed') return <AlertTriangleIcon aria-hidden className={cn('text-destructive', className)} />;
    return <CheckIcon aria-hidden className={cn('opacity-70', className)} />;
}

export function ToolRowShell({
    toolName,
    args,
    result,
    createdAt,
    active = false,
    nestedStepsOpen,
    nestedStepCount,
    onNestedStepsToggle,
}: {
    toolName: string;
    args: unknown;
    result?: unknown;
    createdAt: string;
    active?: boolean;
    nestedStepsOpen?: boolean;
    nestedStepCount?: number;
    onNestedStepsToggle?: () => void;
}) {
    const { Icon, label } = toolDisplay(toolName);
    const { status, summary } = interpretToolResult(result, active);
    const text = active ? `${label}…` : label;
    const showNestedToggle = (nestedStepCount ?? 0) > 0 && onNestedStepsToggle != null && nestedStepsOpen != null;
    return (
        <div data-slot="chat-message-tool-call-shell" className="flex max-w-full flex-col items-start gap-1">
            <div
                data-slot="chat-message-tool-call-pill"
                data-active={active}
                data-status={status}
                className="group/tool-row inline-flex max-w-full items-center gap-2 rounded-full border bg-muted/60 px-3 py-1 text-xs text-muted-foreground"
            >
                <Icon aria-hidden className="size-3.5 shrink-0" />
                <span className={cn('truncate', active && 'shimmer')}>{text}</span>
                <ToolStatusIcon status={status} className="size-3.5 shrink-0" />
                <ToolArgumentsButton toolName={toolName} args={args} result={result} />
                {showNestedToggle ? (
                    <NestedStepsButton open={nestedStepsOpen} count={nestedStepCount!} onToggle={onNestedStepsToggle} />
                ) : null}
                <Timestamp iso={createdAt} className="mt-0" />
            </div>
            {summary ? <ToolResultSummary summary={summary} failed={status === 'failed'} /> : null}
        </div>
    );
}

function NestedStepsButton({ open, count, onToggle }: { open: boolean; count: number; onToggle: () => void }) {
    const label = open ? 'Hide steps' : `Show steps (${count})`;
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={label}
                    aria-expanded={open}
                    aria-pressed={open}
                    onClick={onToggle}
                    className={cn(
                        'opacity-70 transition-opacity hover:opacity-100',
                        open
                            ? 'opacity-100'
                            : 'pointer-fine:opacity-0 pointer-fine:group-hover/tool-row:opacity-70 pointer-fine:group-hover/tool-row:hover:opacity-100 pointer-fine:focus-visible:opacity-100',
                    )}
                >
                    <WorkflowIcon aria-hidden />
                </Button>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
        </Tooltip>
    );
}

function ToolResultSummary({ summary, failed }: { summary: string; failed: boolean }) {
    const [expanded, setExpanded] = React.useState(false);
    const [animate, setAnimate] = React.useState(false);
    const [canExpand, setCanExpand] = React.useState(false);
    const [collapsedH, setCollapsedH] = React.useState(0);
    const [fullH, setFullH] = React.useState(0);
    const contentRef = React.useRef<HTMLDivElement>(null);
    const interactive = canExpand || expanded;

    const measure = React.useCallback(() => {
        const el = contentRef.current;
        if (!el) return;
        const full = el.scrollHeight;
        const first = el.querySelector('p, li, h1, h2, h3, h4, h5, h6, pre') ?? el.firstElementChild ?? el;
        const lh = Math.ceil(parseFloat(getComputedStyle(first).lineHeight) || first.getBoundingClientRect().height || 16);
        setFullH(full);
        setCollapsedH(lh);
        setCanExpand(full > lh + 1);
    }, []);

    React.useLayoutEffect(() => {
        measure();
        const el = contentRef.current;
        if (!el || typeof ResizeObserver === 'undefined') return;
        const observer = new ResizeObserver(measure);
        observer.observe(el);
        return () => observer.disconnect();
    }, [summary, measure]);

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

    const onTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
        if (event.propertyName !== 'max-height') return;
        setAnimate(false);
        measure();
    };

    const maxHeight = !interactive || collapsedH === 0 ? undefined : expanded ? (animate ? fullH : undefined) : collapsedH;

    const tone = failed ? 'text-destructive/90' : 'text-muted-foreground';
    const label = expanded ? 'Show less' : 'Show more';

    return (
        <div className={cn('group/summary ml-1 flex max-w-full gap-1 text-xs', expanded ? 'items-start' : 'items-center', tone)}>
            {interactive ? (
                <button
                    type="button"
                    onClick={onToggle}
                    aria-expanded={expanded}
                    aria-label={label}
                    className={cn(
                        'shrink-0 cursor-pointer rounded text-inherit hover:text-foreground',
                        expanded && 'mt-0.5',
                        'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                    )}
                >
                    <ChevronDownIcon
                        aria-hidden
                        className={cn(
                            'size-3 transition-transform duration-200 ease-out motion-reduce:transition-none',
                            expanded && 'rotate-180',
                        )}
                    />
                </button>
            ) : null}
            <div
                className={cn(
                    'min-w-0 flex-1 overflow-hidden wrap-break-word',
                    !expanded && !animate && 'line-clamp-1',
                    animate && 'transition-[max-height] duration-200 ease-out motion-reduce:transition-none',
                )}
                style={maxHeight != null ? { maxHeight } : undefined}
                onTransitionEnd={onTransitionEnd}
            >
                <div ref={contentRef}>
                    <AssistantMarkdown
                        text={summary}
                        className="text-xs/relaxed text-inherit [&_p]:my-0 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0"
                    />
                </div>
            </div>
        </div>
    );
}

export function Timestamp({ iso, className }: { iso: string; className?: string }) {
    return (
        <time dateTime={iso} className={cn('mt-1 block text-[11px] opacity-70', className)}>
            {format(parseISO(iso), 'HH:mm')}
        </time>
    );
}

interface MessageMetaRowProps extends PropsWithChildren {
    align?: 'start' | 'end';
    revealOnHover?: boolean;
}

export function MessageMetaRow({ align = 'start', revealOnHover = false, children }: MessageMetaRowProps) {
    return (
        <div
            data-slot="chat-message-meta"
            className={cn(
                'flex items-center gap-2 text-[11px] opacity-70 transition-opacity',
                align === 'end' && 'justify-end',
                revealOnHover &&
                    'pointer-fine:opacity-0 pointer-fine:group-hover/msg:opacity-70 pointer-fine:focus-within:opacity-70 pointer-fine:has-data-[state=open]:opacity-70',
            )}
        >
            {children}
        </div>
    );
}

export function CopyButton({ text, label }: { text: string; label?: string }) {
    const [copied, setCopied] = React.useState(false);
    const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const idleLabel = label ?? 'Copy message';
    const ariaLabel = copied ? 'Copied' : idleLabel;
    React.useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);
    const onCopy = React.useCallback(async () => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success('Copied to clipboard');
        } catch {
            toast.error('Could not copy to clipboard');
        }
        setCopied(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopied(false), 1500);
    }, [text]);
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={ariaLabel}
                    onClick={onCopy}
                    className="opacity-70 hover:opacity-100"
                >
                    {copied ? <CheckIcon aria-hidden /> : <CopyIcon aria-hidden />}
                </Button>
            </TooltipTrigger>
            <TooltipContent>{ariaLabel}</TooltipContent>
        </Tooltip>
    );
}

export function SourcesButton({ open, count, onToggle }: { open: boolean; count: number; onToggle: () => void }) {
    const label = open ? 'Hide sources' : `Show sources (${count})`;
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={label}
                    aria-expanded={open}
                    aria-pressed={open}
                    onClick={onToggle}
                    className={cn('opacity-70 hover:opacity-100', open && 'opacity-100')}
                >
                    {open ? <BookOpenIcon aria-hidden /> : <BookIcon aria-hidden />}
                </Button>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
        </Tooltip>
    );
}

export function ToolArgumentsButton({ toolName, args, result }: { toolName: string; args: unknown; result?: unknown }) {
    const formattedArgs = React.useMemo(() => formatToolJson(args), [args]);
    const hasResult = result !== null && result !== undefined;
    const formattedResult = React.useMemo(() => (hasResult ? formatToolJson(result) : ''), [result, hasResult]);
    const openLabel = 'Show details';
    return (
        <Dialog>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            aria-label={openLabel}
                            className="opacity-70 transition-opacity hover:opacity-100 pointer-fine:opacity-0 pointer-fine:group-hover/tool-row:opacity-70 pointer-fine:group-hover/tool-row:hover:opacity-100 pointer-fine:focus-visible:opacity-100"
                        >
                            <BracesIcon aria-hidden />
                        </Button>
                    </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>{openLabel}</TooltipContent>
            </Tooltip>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-sm">
                        <BracesIcon aria-hidden />
                        <code className="font-mono">{toolName}</code>
                    </DialogTitle>
                    <DialogDescription>{'The arguments and result for this tool call.'}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <ToolJsonSection title="Arguments" copyLabel="Copy arguments" value={formattedArgs} />
                    {hasResult ? <ToolJsonSection title="Result" copyLabel="Copy result" value={formattedResult} /> : null}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function ToolJsonSection({ title, copyLabel, value }: { title: string; copyLabel: string; value: string }) {
    return (
        <section className="grid gap-1.5">
            <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-medium text-muted-foreground">{title}</h3>
                <CopyButton text={value} label={copyLabel} />
            </div>
            <pre className="max-h-[40vh] overflow-auto rounded-md bg-muted p-3 font-mono text-xs/relaxed whitespace-pre-wrap wrap-break-word">
                {value}
            </pre>
        </section>
    );
}

function formatToolJson(value: unknown): string {
    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return '// Could not format as JSON.';
    }
}
