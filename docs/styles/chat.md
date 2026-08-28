# Chat

Every chat surface — the template's `/chat` route and any future surface a fork adds — is held to the same bar. The rules below exist so the
_next_ chat surface inherits the good behaviours automatically.

This doc is about the **desired chat experience** — how a chat looks, how it scrolls, how the composer feels, and how shared transcript /
composer primitives are composed. It is not about the message union, streaming machinery, tool-call approval flow, or LLM replay — those
live in [`docs/architecture/chat.md`](../architecture/chat.md) and
[`docs/architecture/chat-persistence.md`](../architecture/chat-persistence.md). Index: [`features/chat.md`](../features/chat.md).
Attachments: [`chat-persistence.md#attachments`](../architecture/chat-persistence.md#attachments).

## The one principle

**Every chat surface reads as the same product.** Chat is where trust is either earned or lost — a jittery scroll, a lost draft, a
hover-only copy button on mobile, an assistant reply that appears without streaming — any one of those breaks the illusion that a considered
counterpart is on the other end.

Before adding _anything_ chat-shaped — a new surface, a new message variant, an extra button in the composer — check: does it obey these
rules already, or does it break one? If it breaks one, the answer is almost always to reach past the surface into the shared primitive and
add the rule there, not to bend the rule for the new surface.

## Opening a chat — anchor, don't dump

| Rule                                                                               | Where it lives                                                |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Open at the **last meaningful anchor**, not the absolute bottom                    | `MessageScrollerProvider defaultScrollPosition="last-anchor"` |
| No JS `scrollIntoView` on mount — the primitive lands the reader before paint      | `MessageScroller`                                             |
| The empty state renders **inside** the transcript viewport, not above the composer | Surface layout (`grid grid-rows-[1fr_auto]`)                  |

**Why the last anchor, not the bottom.** Returning to a chat should drop the reader at the last user message with its reply visible — not
past everything with no context. This is the industry norm (ChatGPT, Claude.ai, Gemini). Always pass `defaultScrollPosition="last-anchor"`.

**Why not `scrollIntoView`.** A JS scroll on mount produces a visible flash — first paint at the top, then a jump to the tail.

**Why the empty state stays in the viewport.** If the empty state renders _above_ the composer, the composer moves as soon as the first
message lands. Keeping it in the viewport row of `grid grid-rows-[1fr_auto]` means the composer is sticky-bottom in every state.

When a surface still uses a hand-rolled scroller, migrate toward `ChatTranscriptShell` / `MessageScroller` (see
[Shared primitives](#the-shared-primitives)) rather than inventing a second stick-to-bottom implementation.

## Streaming — one channel, one slot, no polling

| Rule                                                                 | Where it lives                                                             |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Every AI reply **streams**. Non-streaming is a bug                   | Server (`chatUpdates` subscription), client (`useChatLiveUpdates`)         |
| The streaming row's `chatMessageId` is **pre-allocated** server-side | `chatAssistantTurnRun.ts`                                                  |
| The persisted row keys on the same id — swap is a React no-op        | Transcript streaming section keyed on the pre-allocated id                 |
| Send **never refetches**                                             | Initial query + `chatUpdates` subscription; no `mutate → refetch` anywhere |
| Pending status is a **shimmer**, not a spinner                       | Pending row while `isGenerating &&` no streaming text yet                  |

**Why streaming is non-negotiable.** Perceived latency drops the moment the first token paints. A non-streaming assistant reads as broken.

**Why pre-allocated ids.** The server allocates the eventual `ChatMessageAssistantText.chatMessageId` before the stream starts and publishes
it on every text chunk. The client renders the streaming preview keyed on that id; when the persisted append lands with the same id, React
swaps in place — no flash. See
[Chat foundation — Live updates](../architecture/chat.md#live-updates-flow-through-one-chat-scoped-subscription).

**Why no refetch on send.** A `refetch()` races the subscription, drops the pre-allocated-id swap, and flashes.

**Why a turn-level pending row.** The wait that matters is `beginTurn` → first token. Mount a pending shimmer whenever `isGenerating` is
true, streaming text is empty, no live thoughts slot is showing, **and** no in-flight tool shimmer is active. Pending and tool shimmer are
**exclusive**. Gate the tool shimmer with **`liveTurnMessageIds`** (ids the current still-running turn has appended) so a completed tool in
an older turn — or an unrelated chat — never keeps shimmering.

**Thought summaries.** When the model emits reasoning / thought parts, publish them as reasoning chunks keyed on the current LLM step's
pre-allocated `chatMessageId` and render a collapsed disclosure via `AssistantReasoning` **above the message that step produced**. User
toggles animate height + chevron rotate (200 ms `ease-out`) — height clip only, no opacity fade. Live-driven open/close stays instant.
`prefers-reduced-motion` skips the transition. See [motion.md](./motion.md).

## Scroll behaviour during streaming — follow while at the edge, never yank

| Concern                                    | Value                                                                  |
| ------------------------------------------ | ---------------------------------------------------------------------- |
| Stick-to-bottom edge threshold             | **64 px**                                                              |
| Anchor new turns                           | **flush at top of viewport** (`scrollAnchor` on the **user** row only) |
| Previous-item peek on turn anchor          | **0 px** (`scrollPreviousItemPeek={0}`)                                |
| Jump-to-latest pill visibility             | **only while not at the live edge**                                    |
| Auto-follow enabled                        | **`autoScroll` on `MessageScrollerProvider`**                          |
| Auto-follow interrupts on                  | **any user scroll up, keyboard nav, text selection, or link open**     |
| Position preservation on prepended history | **free** — the primitive handles it                                    |

**Follow while at the live edge, never yank a reader who scrolled up.**

**Do not** hand-roll `scrollIntoView` or a home-grown `isAtBottom` toggle. Route through `ChatTranscriptShell` so every surface inherits the
same values.

**Do not** wrap scroll items in extra DOM parents (date `<section>`, `aria-live` regions). The primitive only sees direct children of
Content — nested items break follow-output and turn anchoring.

## Scrollbar gutter — reserved, never over the bubbles

Classic scrollbars grow/shrink content width when they appear. In chat that shows up as a left–right jump on right-aligned user bubbles.

| Rule                                                                                              | Where it lives                                       |
| ------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| The viewport reserves `scrollbar-gutter: stable`                                                  | Transcript viewport / shell                          |
| The viewport ships `pr-2` breathing room to the right of bubbles                                  | Transcript shell                                     |
| **Never** hide the bar with `scrollbar-none` / `scrollbar-width: none` on the transcript viewport | —                                                    |
| A surface **must not** turn the gutter off via `viewportClassName`                                | Review-time reject unless widening the reserved lane |

## Message rendering

| Rule                                                                                                                              | Where it lives                                            |
| --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| User messages are **right-aligned bubbles**                                                                                       | `Bubble tone="user"` (`chat-message/shared.tsx`)          |
| User text **clamps to two lines** by default; a chevron appears only when the body is taller and expands the bubble in place      | `UserMessageBody` in the user-message view                |
| Assistant text is **unbubbled markdown flush in the row**                                                                         | `AssistantMarkdown` inside assistant `MessageRow`         |
| **System rows (tool calls, approval request/response) are left-aligned**, not centred                                             | `MessageRow side="system"` → `justify-start`              |
| Tool rows show a **friendly tool label** — never the raw tool id                                                                  | Tool display helper when present; raw id in inspector     |
| The **trailing tool row shimmers** while the turn is in flight, then settles                                                      | Driven by `isGenerating` + live-turn message ids          |
| Tool rows carry a **status glyph** — spinner / check / alert                                                                      | Tool result interpreter when present                      |
| Tool rows show a **one-line markdown result summary** when the tool returns one                                                   | `ToolResultSummary` when present                          |
| The **full args + result JSON** live behind an inspector dialog, never inline; each section has a **copy** button                 | `ToolArgumentsButton`                                     |
| Nested child tool rows under a parent delegate are **collapsible**                                                                | Parent pill workflow toggle                               |
| **No avatars** on any variant                                                                                                     | —                                                         |
| Every assistant text row ships **timestamp + copy** (and TTS / sources / fork when those features exist), always visible on touch | `chat-message/shared.tsx`                                 |
| Every user text row ships **timestamp + copy**; on desktop the row may **reveal on hover** (coarse-pointer keeps it visible)      | `MessageMetaRow` when present                             |
| Copy button copies **raw markdown**, not rendered text; flashes check for **1.5 s**                                               | `CopyButton`                                              |
| Bubble max-width                                                                                                                  | `max-w-[80%]` of the row                                  |
| Bubble radius                                                                                                                     | `rounded-2xl`, with corner cut toward the speaker         |
| Input-collection slots carry **no type headline** — the slot's prompt + control are self-describing                               | Input-collection view                                     |
| Collection card is `max-w-md` and `min-w-0` down the flex/grid chain; select placeholders are short (“Select…”)                   | Input-collection view                                     |
| CardList is a **container-query grid**: 1 col → 2 cols from ~28 rem → 3 cols from ~42 rem                                         | Wrapper `@container` (not on the grid that uses `@min-*`) |

### Nested tool steps

When a parent `delegateTo*` row has child tool-call rows (see [agent-delegation.md](../architecture/agent-delegation.md)), render them in an
indented list under the parent pill. That list is **collapsible**: open while the parent is the live active tool; collapsed by default on
settled rows; user toggles sticky until the parent becomes active again. Animate height the same way as Thoughts (`grid-template-rows`
0fr↔1fr, 200 ms `ease-out`, no opacity fade; `motion-reduce:transition-none`). Active-driven open stays instant so stick-to-bottom is not
fought.

**Why system rows go left, not centre.** Tool calls and approval cards are the assistant's own actions, not neutral announcements. Aligning
them to the assistant (left) rail keeps the human↔assistant exchange owning the centre.

**Why unbubbled assistant markdown.** Long-form markdown needs unclipped width. A bubble clips tables and code.

**Why timestamp + copy always visible on assistant rows.** Hover-only actions are hostile on mobile.

**Why raw markdown for copy.** Power users paste into tools that render markdown themselves.

## Internal vs external links

Assistant markdown renders through `AssistantMarkdown` (Streamdown). Override Streamdown's default anchor so every href is not treated as
external:

- **Incomplete** (`streamdown:incomplete-link`, emitted mid-stream) → styled but inert.
- **Internal** (a single leading slash, not `//host`) → SPA `router.navigate`. Modified clicks (⌘/Ctrl/Shift/Alt, non-primary button) fall
  through so "open in new tab" still works.
- **External** → per-surface confirmation via `ExternalLinkConfirmationProvider`. Public surfaces may enable the confirm dialog; privileged
  surfaces may disable it. Internal links ignore this flag.

## Shared transcript composition

```text
MessageScrollerProvider (defaultScrollPosition="last-anchor", scrollEdgeThreshold=64, scrollPreviousItemPeek=0, autoScroll)
└── MessageScroller
    ├── MessageScrollerViewport
    │   └── MessageScrollerContent   ← every MessageScrollerItem is a *direct* child
    │       ├── MessageScrollerItem (date marker, no scrollAnchor)
    │       ├── MessageScrollerItem scrollAnchor={user?} + ChatMessage
    │       ├── …
    │       ├── MessageScrollerItem (pending while isGenerating && no stream)
    │       └── MessageScrollerItem (streaming, aria-live, no scrollAnchor)
    └── MessageScrollerButton direction="end"  ("Jump to latest")
```

**Direct children only.** Nesting items in a date `<section>` or an `aria-live` region silently breaks stick-to-bottom and `last-anchor`.

**`scrollAnchor` only on user messages.** Streaming / assistant / tool rows must not set `scrollAnchor`.

The template's `/chat` route composes transcript + composer today; extract shared shell helpers as soon as a second surface appears so both
inherit the same scroll config.

## Composer — hard rules

Every chat composer wraps `MessageComposer` (`src/web/components/MessageComposer.tsx`). Anything that hand-rolls a textarea + send button is
a review-time reject.

| Concern                | Value                                                                                                                                              |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Submit key             | **Desktop:** Enter sends; Shift+Enter inserts a newline. **Mobile:** Enter inserts a newline; only Send submits.                                   |
| Auto-grow              | **`field-sizing: content` + max height cap**                                                                                                       |
| Focus ring             | **Primary / brand token** — see [motion.md — Composer states](./motion.md#composer-states)                                                         |
| Ready micro-state      | Send **lifts `-translate-y-px`** and fades muted → full opacity, 200 ms                                                                            |
| Sending                | **`SendIcon` crossfades to `Spinner`**, 150 ms                                                                                                     |
| Sent                   | **`CheckIcon` flashes for 700 ms** on the `busy → !busy` edge                                                                                      |
| Post-turn focus        | Textarea **refocuses automatically** on `busy → !busy`                                                                                             |
| Draft restore on error | Restore the trimmed message and call `endTurn()`                                                                                                   |
| Locked while streaming | Textarea + Send disabled while `busy === true`                                                                                                     |
| Attachments (opt-in)   | Paperclip, drop zone, paste; parent owns upload lifecycle — see [chat-persistence.md#attachments](../architecture/chat-persistence.md#attachments) |
| Textarea `name`        | Defaults to `'message'`                                                                                                                            |
| `autoFocus`            | Opt-in via prop                                                                                                                                    |

`ChatComposer` (`src/web/chat/ChatComposer.tsx`) owns draft state, upload lifecycle, and the `beginTurn` / `endTurn` handshake for
`chatMessageCreate` surfaces. Audience wrappers (if a fork adds more than one chat product) sit above it — never beside a raw `<textarea>`.

## Layout — paddings, max-widths, breakpoints

Prefer CSS variables in `src/styles.css` (`--chat-*`) so surfaces read the same value in one place.

| Concern                       | Guidance                                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------------------------ |
| Transcript vertical padding   | Comfortable top/bottom so the composer gap reads ~24 px                                          |
| Transcript horizontal padding | ~16 px mobile / ~24 px desktop                                                                   |
| Message column max-width      | Roughly `max-w-3xl` (48 rem) for continuous prose; narrower sheet caps are fine for overlay chat |
| Row gap inside a date group   | ~16 px                                                                                           |
| Gap between date groups       | ~32 px                                                                                           |
| Composer safe-area            | `pb` accounts for `env(safe-area-inset-bottom)` on iOS                                           |
| Sticky composer               | Bottom row of `grid grid-rows-[1fr_auto]` on every surface                                       |
| Bubble max-width (both tones) | `max-w-[80%]` of the row                                                                         |

## Accessibility

| Rule                                                                                 | Where                                  |
| ------------------------------------------------------------------------------------ | -------------------------------------- |
| Streaming assistant text renders inside `aria-live="polite" aria-atomic="false"`     | Streaming item itself — no wrapper     |
| Composer textarea has an explicit `name`                                             | `MessageComposer`                      |
| Send button has an `aria-label` matching the localised "Send" tooltip                | `MessageComposer`                      |
| Assistant / user action icon buttons expose localised tooltips matching `aria-label` | Copy / TTS / sources / etc.            |
| Jump-to-latest pill has an SR-only label                                             | Jump button                            |
| `prefers-reduced-motion` suppresses the Send-button lift                             | `motion-reduce:…` in `MessageComposer` |
| Escape closes sheet / dialog surfaces                                                | Radix defaults — do not override       |

**Why `polite` not `assertive`.** `assertive` interrupts whatever the screen reader is currently reading.

## User-facing copy

Every user-facing string in a chat surface is plain English at the call site (see
[`docs/conventions.md`](../conventions.md#user-facing-copy)). Strings the shared primitives own (Send, Jump to latest, Thinking…, copy / TTS
labels) live in the primitive — not in each surface — so chrome stays coherent across every chat surface.

## The shared primitives

| Primitive                                   | File                                                                        | Use when                                                                 |
| ------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `MessageComposer`                           | `src/web/components/MessageComposer.tsx`                                    | Any chat-style textarea. Never hand-roll one.                            |
| `ChatComposer`                              | `src/web/chat/ChatComposer.tsx`                                             | Surface fires `chatMessageCreate`. Owns draft + uploads + turn handshake |
| `ChatTranscriptShell` / `MessageScroller*`  | `src/web/components/base/chat-transcript-shell.tsx`, `message-scroller.tsx` | Canonical scroll container + stick-to-bottom config                      |
| `Attachment*`                               | `src/web/components/base/attachment.tsx`                                    | File/image tile primitive for composers and tool results                 |
| `ChatAssistantBodyBlocks`                   | `src/web/components/chat-message/ChatAssistantBodyBlocks.tsx`               | Ordered markdown + cardList rendering                                    |
| `AssistantReasoning`                        | `src/web/components/AssistantReasoning.tsx`                                 | Thought-summary disclosure                                               |
| `AssistantMarkdown`                         | `src/web/components/AssistantMarkdown.tsx`                                  | AI markdown (internal hrefs, external-link confirm)                      |
| Row atoms (`MessageRow`, `ToolRowShell`, …) | `src/web/components/chat-message/shared.tsx`                                | Row-level atoms including inspector + status                             |
| `toolDisplay` / `interpretToolResult`       | `src/web/chat/toolDisplay.ts`, `toolResult.ts`                              | Friendly tool labels + status                                            |
| `useChatLiveUpdates`                        | `src/web/chat/useChatLiveUpdates.tsx`                                       | `chatUpdates` subscription + `beginTurn` / `endTurn` + live `blocksFor`  |

## Anti-patterns

- **Hand-rolled `scrollIntoView` on new messages.**
- **A home-grown `isAtBottom` toggle.**
- **Typing indicator dots without a shimmer'd pending row.**
- **Hover-only copy / TTS on assistant rows (or on touch).**
- **Full-page scroll (transcript scrolls with the page).**
- **`aria-live="assertive"` on the streaming region.**
- **Bubbled assistant markdown.**
- **Avatars.**
- **A refetch on send.**
- **Composer that doesn't wrap `MessageComposer`.**
- **Raw tool ids in the transcript pill** — use `toolDisplay`; the id belongs in the inspector.
- **`scrollbar-width: none` on the transcript viewport.**
- **Wrapping scroll items in a date `<section>` or `aria-live` region.**
- **`scrollAnchor` on every row** — only the user message that starts a turn.

## How to add a new chat surface

1. Decide whether the message shape is the `ChatMessage` union or something new. Prefer the union + `ChatComposer` / shared transcript.
2. Add the GraphQL query / subscription (initial query + `chatUpdates` — see [`architecture/chat.md`](../architecture/chat.md)).
3. Wrap `MessageComposer` (via `ChatComposer` when applicable). **Do not** import a bare `<textarea>`.
4. Lay the surface out as `grid grid-rows-[1fr_auto]` — transcript on top, composer at the bottom.
5. Document surface-specific product behaviour under `docs/features/` and keep presentation rules here.

## File locations

| Concern                          | File                                               |
| -------------------------------- | -------------------------------------------------- |
| This doc                         | `docs/styles/chat.md`                              |
| Composer primitive               | `src/web/components/MessageComposer.tsx`           |
| Chat composer base               | `src/web/chat/ChatComposer.tsx`                    |
| Shared row atoms                 | `src/web/components/chat-message/shared.tsx`       |
| Streaming markdown               | `src/web/components/AssistantMarkdown.tsx`         |
| Thoughts disclosure              | `src/web/components/AssistantReasoning.tsx`        |
| Live-updates hook                | `src/web/chat/useChatLiveUpdates.tsx`              |
| Motion rules for composer states | `docs/styles/motion.md`                            |
| Foundation / persistence         | `docs/architecture/chat.md`, `chat-persistence.md` |
| Chat surfaces index              | `docs/features/chat.md`                            |
