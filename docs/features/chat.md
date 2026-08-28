# Chat surfaces

Index only — where to look for chat docs. This is **not** a third product doc. Chat behaviour is split across foundation, persistence,
presentation, and satellite feature docs; the grab-bag that used to live here has been split into those homes.

| Concern                                                                    | Doc                                                                                                                                                                                                      |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Desired experience (scroll, composer states, copy row, paddings)           | [`docs/styles/chat.md`](../styles/chat.md)                                                                                                                                                               |
| Message model, streaming, live updates, HITL tool approvals                | [`docs/architecture/chat.md`](../architecture/chat.md)                                                                                                                                                   |
| DB shape, history replay, attachments persistence + client upload pipeline | [`docs/architecture/chat-persistence.md`](../architecture/chat-persistence.md)                                                                                                                           |
| Auto-generated chat titles                                                 | [`docs/features/chat-titles.md`](./chat-titles.md)                                                                                                                                                       |
| Attachments (persist + upload → render → replay)                           | [`docs/architecture/chat-persistence.md#attachments`](../architecture/chat-persistence.md#attachments)                                                                                                   |
| Tool-call approvals (HITL)                                                 | [`docs/architecture/chat.md#human-in-the-loop-approval-is-a-requestresponse-pair-executed-by-the-sdk`](../architecture/chat.md#human-in-the-loop-approval-is-a-requestresponse-pair-executed-by-the-sdk) |

The template ships one reference surface at `/chat` (`src/routes/chat.tsx`). Do **not** duplicate streaming scroll rules or composer
micro-states here — those live in [`styles/chat.md`](../styles/chat.md).

## Composer stack

Two layers, base → chat wiring:

- **`<MessageComposer />`** — `src/web/components/MessageComposer.tsx` — presentational shell (textarea, Send, attachment tiles, DnD,
  busy/disabled wiring, `addonStart` slot).
- **`<ChatComposer />`** — `src/web/chat/ChatComposer.tsx` — shared `chatMessageCreate` base (draft, upload lifecycle, submit gating, turn
  handshake, tool-call mode selector).

Additional audience wrappers belong above `ChatComposer` when a fork adds more than one chat product — never beside a raw `<textarea>`.
