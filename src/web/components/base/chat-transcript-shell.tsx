import type { PropsWithChildren } from 'react';
import { cn } from '../../utils/cn';
import {
    MessageScroller,
    MessageScrollerButton,
    MessageScrollerContent,
    MessageScrollerProvider,
    MessageScrollerViewport,
} from './message-scroller';

// Shared scaffolding every chat transcript in the app sits on top of. Pins the
// scroll config in exactly one place — `defaultScrollPosition="last-anchor"`,
// `scrollEdgeThreshold={64}`, `scrollPreviousItemPeek={0}`, the jump-to-latest
// pill at the tail — so a new surface can't drift by forgetting one. See
// docs/styles/chat.md.

/** Transcript shell props. Every scroll-managed row MUST be a direct
 *  `MessageScrollerItem` child of Content — wrappers (`<section>`,
 *  live-region divs) break turn anchoring and stick-to-bottom. See
 *  docs/styles/chat.md. */
export interface ChatTranscriptShellProps extends PropsWithChildren {
    /** Label for the SR-only text on the jump-to-latest pill. */
    jumpToLatestLabel: string;
    /** Accessible name for the messages region. Defaults to "Messages". */
    messagesAriaLabel?: string;
    /** Extra className on the outer `MessageScroller`. */
    className?: string;
    /** Extra className on the inner `MessageScrollerViewport`. */
    viewportClassName?: string;
    /** Extra className on `MessageScrollerContent`. Chat transcripts pass
     *  `gap-4` so row spacing matches `--chat-row-gap`; the primitive default
     *  is `gap-8`. */
    contentClassName?: string;
}

export function ChatTranscriptShell({
    jumpToLatestLabel,
    messagesAriaLabel,
    className,
    viewportClassName,
    contentClassName,
    children,
}: ChatTranscriptShellProps) {
    const regionLabel = messagesAriaLabel ?? 'Messages';

    return (
        <MessageScrollerProvider
            // Follow the live edge as new messages / streamed chunks land, but
            // only while the reader is AT the edge — the primitive stops
            // following the moment they scroll up, select text, or open a link
            // (gated by `scrollEdgeThreshold`). Off by default in the
            // primitive, so it must be set explicitly or the transcript never
            // sticks to the bottom during streaming. See docs/styles/chat.md.
            autoScroll
            // `last-anchor` opens saved conversations at the last meaningful
            // turn (usually the last user message) — see docs/styles/chat.md
            // ("Opening a chat — anchor, don't dump").
            defaultScrollPosition="last-anchor"
            // 64 px absorbs Streamdown's sub-pixel content-height jitter
            // while streaming without dropping stick mode. Any smaller
            // chatters; larger and casual scroll-ups look like the reader
            // is still at the bottom.
            scrollEdgeThreshold={64}
            // Primitive default is 64 px of the previous item peeking above a
            // new turn anchor. We want the new user message flush at the top
            // so the prior reply leaves the viewport entirely.
            scrollPreviousItemPeek={0}
        >
            <MessageScroller className={className}>
                {/*
                 * `scrollbar-gutter: stable` reserves the scrollbar column in
                 * its own lane so the vertical scrollbar never overlaps the
                 * rightmost user bubbles when it appears. `pr-2` gives the
                 * bubbles a couple of pixels of breathing room between content
                 * and the reserved gutter — without it a right-aligned bubble
                 * still visually touches the scrollbar track on WebKit. Baked
                 * in here so every surface (visitor sheet, workspace sidebar,
                 * deep-link route, compass interview) inherits the same
                 * treatment; a surface can only widen the gutter via
                 * `viewportClassName`, never turn it off. See
                 * docs/styles/chat.md ("Scrollbar gutter").
                 */}
                <MessageScrollerViewport className={cn('scrollbar-gutter-stable pr-2', viewportClassName)} aria-label={regionLabel}>
                    <MessageScrollerContent className={contentClassName}>{children}</MessageScrollerContent>
                </MessageScrollerViewport>
                <MessageScrollerButton direction="end" variant="secondary" size="sm" className="gap-1.5 rounded-full px-3 text-xs">
                    {jumpToLatestLabel}
                </MessageScrollerButton>
            </MessageScroller>
        </MessageScrollerProvider>
    );
}
