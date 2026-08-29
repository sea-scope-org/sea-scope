# ServerRuntime

## Context

Resolver functions, commands, queries, and guards all need access to shared infrastructure: the database, pub-sub publishing, and pub-sub
subscribing. Passing these as individual parameters would create unwieldy function signatures.

## Decision

A `ServerRuntime` interface that bundles all shared infrastructure into a single dependency injection container, created once via
`serverRuntimeCreate()`.

### Interface

Defined in [`src/server/domain/ServerRuntime.ts`](../../src/server/domain/ServerRuntime.ts) — that file is the source of truth for every
field. Do not mirror the full TypeScript interface in this doc; it drifts. Capability groups today:

- **`db`**: Drizzle ORM database instance for all database operations
- **`log`**: structured logger that persists records to the `logs` table (see `loggerCreate.ts`)
- **`subscribe.to(key)`**: returns an async iterator for a pub-sub channel (used by subscription resolvers)
- **`publish.*`**: typed methods for publishing to specific channels (used by commands and agents):
  - `userUpdates({ userId })` — fan-out for seed-and-subscribe reads
  - `chatUpdates({ generationId, … })` — chat live updates. Prefer an id / small-delta **wire payload** on the NOTIFY channel (pg_notify
    caps payloads at 8000 bytes); the subscription resolver re-loads and maps to `GqlSChatUpdate` before delivery — see
    [chat.md](./chat.md#why-the-wire-payload-is-the-id-not-the-full-message) and [state-synchronization.md](./state-synchronization.md)
- **`jobs`**: `enqueue` (typed pg-boss job; optional `transaction` for atomic enqueue-with-writes) and `activeCount` (live queue depth for a
  definition — `created` | `retry` | `active`) — see [jobs.md](./jobs.md)
- **`ai.*`**: factory functions returning `LanguageModel` instances. Provider, model id, and API key are bound here so tests can inject a
  `MockLanguageModelV3` (see `src/server/test/aiTestUtils.ts`) and never reach a real LLM endpoint. Factories today:
  `userConversationModel`, `chatTitlerModel`. Capability-specific env validation (e.g. `GOOGLE_GENERATIVE_AI_API_KEY`) lives in
  `serverRuntimeCreate`, not in `environmentVariablesCreate` — see [environment.md](./environment.md#capability-specific-variables).
- **`browser`**: `capture` and `capturePdf` drive a singleton headless Chromium against an internal `/server/*` route — see
  [browser-capture.md](./browser-capture.md). Tests stub these to return a fixed `Buffer` and never launch a real browser. The
  `SERVER_TOKEN_SECRET` validation lives at the call site (`serverToken.ts`), not at boot.

AISStream ingest and the Galaxy Leader mock feeder are **not** `ServerRuntime` fields — they are process-global capabilities started from
`ensureServerStarted` via `mockScenarioSourceEnsureStarted` / `aisStreamIngestEnsureStarted` / `watchBoardTickDriverStart` (see
[maritime-watch.md](./maritime-watch.md)).

### Factory

`serverRuntimeCreate()` in `src/server/domain/serverRuntimeCreate.ts` creates the runtime:

1. Initializes `PubSubPostgres` with the database connection
2. Wraps the pub-sub into typed `subscribe` and `publish` interfaces
3. Validates capability-specific env vars (e.g. throws if `GOOGLE_GENERATIVE_AI_API_KEY` is missing) and binds the LLM provider
4. Wires `jobs.enqueue` / `jobs.activeCount` to the pg-boss singleton and `browser.capture` / `browser.capturePdf` to the singleton-Chromium
   renderer
5. Returns the assembled `ServerRuntime`

### Usage Pattern

`resolversCreate()` creates a single `ServerRuntime` instance and passes it to all resolver functions:

```typescript
const serverRuntime = serverRuntimeCreate();
return {
  Query: {
    session: (_, __, ctx) => sessionFindOne(serverRuntime, ctx),
  },
  Mutation: {
    doSomething: (_, args, ctx) => someCommand(serverRuntime, args, ctx),
  },
};
```

Commands and queries receive `serverRuntime` as their first argument.

### Key Files

- `src/server/domain/ServerRuntime.ts` — interface definition
- `src/server/domain/serverRuntimeCreate.ts` — factory function
- `src/server/graphql/resolversCreate.ts` — where the runtime is created and distributed

## Alternatives Considered

- **Global singletons**: Simpler but harder to test and makes dependencies invisible
- **GraphQL context**: Apollo context is per-request; ServerRuntime is per-process (pub-sub connections and the database pool should not be
  recreated per request)
- **Dependency injection framework**: Overkill for the current scope; a plain factory function is sufficient

## Consequences

- All shared infrastructure is discoverable through one interface
- Adding a new shared dependency means extending the `ServerRuntime` interface and updating `serverRuntimeCreate()`
- The runtime is created once at server startup (inside `resolversCreate()`), so state like pub-sub connections is shared across all
  requests
