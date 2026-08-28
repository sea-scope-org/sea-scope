# Chat Titles

## User Behavior

Every chat row carries a short human title (`Chats.title`). Chat list UIs and headers render it verbatim; an empty title falls back to a
localized "Ohne Titel / Untitled" label where those surfaces exist.

The user never authors the title. As soon as the chat has meaningful content (see below), a background job asks a cheap LLM to summarize the
first user+assistant exchange into ≤ 6 words in the language the conversation is being held in, then writes it to `Chats.title`.

Manual rename is not yet implemented — [Open Threads](#open-threads).

## Options Considered

### When to fire the titler

| Option                                                                | Rejected because                                                                                                                                                   |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| After the first **user** message                                      | Titles off "hi" / "what can you do" are useless; the model has no reply to summarize against.                                                                      |
| Inline at the end of `chatMessageCreate`                              | Adds Gemini latency to the "message done" moment and couples titling failure to the chat command.                                                                  |
| Every turn until the user renames it                                  | Overwrites a good-enough early title as the topic shifts; noisy in chat lists.                                                                                     |
| **After each assistant turn while the title is still empty** (chosen) | Retries naturally when the first exchange had no topic; converges the first time an actual topic lands; stops touching the row the moment a real title is written. |

### How to filter no-signal exchanges ("hey" / "hey there")

| Option                                                                               | Rejected because                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Skip if concatenated user+assistant text is under N characters                       | Whitespace/character-count filters mis-fire on short-but-titleable prompts ("SQL fix", "revolut vs wise fees?", German compound nouns), and let long-but-empty greetings ("hey how are you doing today my friend") through. Wrong proxy.                                                                                           |
| Detect greetings with a regex / classifier                                           | Fragile per-language, and the titler LLM is already a better classifier than anything hand-rolled at this scale.                                                                                                                                                                                                                   |
| **Ask the LLM to return `NONE` when the exchange has no discernible topic** (chosen) | One branch in the handler. The LLM is far better at "is there a topic here?" than any heuristic. Combines cleanly with the retry loop — a `NONE` leaves the title empty, and the next assistant turn re-enqueues. Self-correcting: "hey" / "hey there" / "can you help with my tax return?" → third turn writes "Tax return help". |

### Language

Titles are English (matching the English-only product UI). The titler is instructed to write English noun phrases into the single
`Chats.title` column. See [`chat-persistence.md`](../architecture/chat-persistence.md) for the column and
[`content-model.md`](../architecture/content-model.md) for editable English text columns.

### Delivery to the UI

For MVP the freshly-written title is picked up on the client's next `cache-and-network` fetch (route mount, list reopen / refresh). Live
delivery to a mid-turn subscriber via a new `ChatUpdateChatTitleChanged` union member was left as an [open thread](#open-threads); list
surfaces that remount on open already make the delay imperceptible.

## Implementation

### Model

`serverRuntime.ai.chatTitlerModel()` — the cheapest catalog tier (`gemini-2.5-flash-lite`). Bounded, low-stakes summarization; the flagship
would be overkill. Wired in [`serverRuntimeCreate.ts`](../../src/server/domain/serverRuntimeCreate.ts) alongside the other purpose-specific
factories.

### Job

`chatTitleGenerate` (`src/server/jobs/handlers/chatTitleGenerate.ts`) — a `QueuedJobDefinition<{ chatId: string }>`. Handler:

1. **Idempotent short-circuit.** Load `Chats.title`; if it is non-empty, return. Covers job redelivery, manual rename racing the job, and
   the case where a later turn re-enqueued after an earlier turn already wrote a title.
2. **Load the first exchange.** Pull the earliest user body and earliest assistant text body for the chat, oldest first.
3. **Call the titler.** Structured output `{ title: string }`. The system prompt instructs: return `NONE` if the exchange has no discernible
   topic; otherwise return a ≤ 6-word, ≤ 50-char noun-phrase title in the conversation's own language, without quotes or trailing
   punctuation.
4. **Handle `NONE`.** Leave `title = ''` and return. The next assistant turn's post-insert enqueue picks up the retry.
5. **Persist.** Trim, truncate to 60 chars defensively, and `UPDATE Chats SET title = ... WHERE chatId = ? AND title = ''` — the empty-title
   guard in the `WHERE` clause makes concurrent writes race-safe.
6. **Errors are logged and swallowed.** A failed title never blocks the chat path. Retry is via pg-boss (`retryLimit: 2`), and the post-turn
   enqueue also retries organically the next time an assistant turn lands.

### Enqueue site

`runAgentTurn` in [`chatAssistantTurnRun.ts`](../../src/server/commands/chatAssistantTurnRun.ts) — after the `chatMessagesAssistantText` row
commits, and only when the turn actually produced assistant text (including a `promptUserForInput` preamble written ahead of the form).
Fire-and-forget `serverRuntime.jobs.enqueue(chatTitleGenerate, { chatId })`; enqueue failures route to `serverRuntime.log` and never
propagate. The handler's own idempotency check keeps the enqueue-per-turn cost bounded to one cheap DB read once a real title exists.

## Open Threads

- **Live delivery.** A new `ChatUpdateChatTitleChanged { chatId, title }` union member on `ChatUpdate` would let a mid-turn subscriber
  splice the title into the URQL cache without a refetch. Deferred until a persistent chat list makes the delay user-visible.
- **Manual rename.** `chatTitleUpdate(chatId: ID!, title: String!): Chat` mutation + guard. Auto-titles become the default, not a lock. Left
  for a follow-up once the UI grows a rename affordance.
- **Retitle after topic drift.** Currently the title is written once and then frozen. A future variant could re-enqueue with the empty-title
  guard dropped, e.g. every 20 turns, if chat lists surface stale titles as a real problem.
