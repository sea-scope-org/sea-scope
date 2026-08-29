# SeaScope

AI-powered maritime security copilot — **from thousands of vessel tracks to the one that actually matters.**

SeaScope sits on top of maritime surveillance demos (curated AIS replay today) and turns them into **site-specific, explainable threat
prioritization**: scored risk bands, an attention-first operator sidebar, protected-infrastructure context, simulated sensor contradictions,
incident timelines, and Gemini briefs grounded in the deterministic risk engine.

**Stack:** TanStack Start + React 19 · MapLibre GL · Apollo Server v5 + URQL (SDL-first GraphQL) · Drizzle ORM + PostgreSQL · graphql-sse +
PG NOTIFY/LISTEN · pg-boss · Vercel AI SDK (Gemini) · Tailwind 4 + shadcn/Radix · Vitest + Playwright · Vercel + VPS Postgres.

Open `/watch` after `npm run dev` for the watch console (Galaxy Leader demo: MAP → PRIORITY → WHY → ALERT). Product docs:
[`docs/features/seascope.md`](./docs/features/seascope.md), [`docs/features/watch-console.md`](./docs/features/watch-console.md). Agent
working agreement: [`AGENTS.md`](./AGENTS.md).

## Quick start

```bash
npm install

cp .env.local.example .env.local   # fill secrets — see below
cp .env.test.example  .env.test    # separate DB for integration tests

npm run db:migrate                 # or npm run db:push for quick local iteration
npm run dev                        # http://localhost:3000

npm run check && npm test          # quality gate before push
```

## Environment

Copy `.env.local.example` → `.env.local` for Vite / Drizzle, and `.env.test.example` → `.env.test` for integration tests. Full validation
rules live in [`docs/architecture/environment.md`](./docs/architecture/environment.md) and
[`docs/infrastructure.md`](./docs/infrastructure.md).

Required at boot:

| Variable                       | Purpose                                  |
| ------------------------------ | ---------------------------------------- |
| `DATABASE_URL`                 | PostgreSQL connection string             |
| `sessionCookieName`            | Cookie name for anonymous session ID     |
| `WEB_PAGE_URL`                 | Absolute site origin (no trailing slash) |
| `VISITOR_IP_HASH_SALT`         | Salt for hashed client IPs on sessions   |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Gemini key for chat / agent features     |

Production values are set in the Vercel project settings, not in committed `.env*` files.

## Docs

| Doc                                                  | When                                               |
| ---------------------------------------------------- | -------------------------------------------------- |
| [`docs/conventions.md`](./docs/conventions.md)       | Naming, commands, user-facing copy, UI conventions |
| [`docs/infrastructure.md`](./docs/infrastructure.md) | Deploy, CI, env vars                               |
| [`docs/architecture/`](./docs/architecture/)         | Auth, API, jobs, chat, SEO, maritime watch, …      |
| [`docs/features/`](./docs/features/)                 | Shipped feature behaviour                          |

## Common commands

```bash
npm run dev                  # vite dev server, port 3000
npm run build                # production build → .output/
npm test                     # vitest
npm run check                # format + lint + spell + types + knip + commitlint
npm run db:generate          # drizzle migration from schema.ts
npm run db:migrate           # apply migrations
npm run graphql:generate     # regenerate GqlS*/GqlC* from schema.graphqls
```
