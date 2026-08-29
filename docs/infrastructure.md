# Infrastructure

## Deployment

**Application** — deployed on **Vercel**. The Git integration builds and ships on every push to `main` (production) and on every pull
request (preview). There is no Docker image and no deploy job in GitHub Actions — Vercel owns the app CD pipeline.

**Database** — **PostgreSQL on a self-hosted VPS**, not Vercel Postgres or another managed DB product. Production and preview `DATABASE_URL`
values point at that VPS (separate databases or roles as you prefer). Backups, upgrades, and network access for the VPS are outside this
repo; the app only needs a reachable connection string.

### Build output: nitro + TanStack Start

`npm run build` (Vite production build via TanStack Start) emits a nitro-wrapped Node entrypoint under `.output/`. The `tanstackStart()`
Vite plugin alone would emit only a fetch-handler module (`export default { fetch }`) with no listener; `vite.config.ts` adds the
`nitro/vite` plugin so nitro wraps that handler in a `node:http` listener (local / self-host) and produces the Vercel-compatible output
Vercel runs in production.

Nitro inlines most application runtime deps (`react`, `@tanstack/react-router`, `pg`, etc.) into `.output/`. Playwright stays external — see
[architecture/browser-capture.md](./architecture/browser-capture.md).

Vercel terminates TLS and forwards requests into the app. Absolute URLs derived from `request.url` must not assume the inbound scheme
matches the public HTTPS origin — see [architecture/api-layer.md](./architecture/api-layer.md#session--cookie-handover).

### Health Check

`GET /api/health` (handler at `src/routes/api/health.ts`) returns `{ status: 'ok', version: '<commit-sha>' }` with HTTP 200 as soon as the
HTTP listener is up — it deliberately does **not** check the database. The `version` field is the commit SHA of the running build, read
through `EnvironmentVariables.buildSha` from `BUILD_SHA` or, on Vercel, the platform-provided `VERCEL_GIT_COMMIT_SHA`. When neither is set
(e.g. local `npm run dev`), `version` is `"unknown"`.

### Environment Variables

The following environment variables must be configured in the Vercel project (Production + Preview as needed). They are validated at startup
by `src/server/env/environmentVariablesCreate.ts` — see [architecture/environment.md](./architecture/environment.md).

| Variable                       | Required | Description                                                                                                                                                                                                                                            |
| ------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `DATABASE_URL`                 | Yes      | PostgreSQL connection string for the self-hosted VPS database                                                                                                                                                                                          |
| `sessionCookieName`            | Yes      | Name of the cookie used to store the session ID                                                                                                                                                                                                        |
| `WEB_PAGE_URL`                 | Yes      | Absolute origin of the deployed site, no trailing slash (e.g. `https://example.com`). Drives canonical URLs, the dynamic `/sitemap.xml`, and `/robots.txt` — see [architecture/discovery-seo.md](./architecture/discovery-seo.md)                      |
| `VISITOR_IP_HASH_SALT`         | Yes      | Per-deploy salt mixed into `SHA256(salt + ":" + clientIp)` before it lands in `Sessions.ipHash`. Generate with `openssl rand -hex 32`; treat as a secret — see [architecture/authentication.md](./architecture/authentication.md)                      |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Yes      | Google Generative AI API key. Validated when `serverRuntimeCreate` builds the Gemini language model                                                                                                                                                    |
| `AISSTREAM_API_KEY`            | No\*     | AISStream WebSocket API key. When set, live AIS fuses into the watch board and persists to `Vessels` / `AisPositions` — see [architecture/maritime-watch.md](./architecture/maritime-watch.md)                                                         |
| `AISSTREAM_BBOX`               | No       | Optional `southLat,westLon,northLat,eastLon` for AISStream (default Strait of Gibraltar `35.7,-6.0,36.3,-5.0` — Red Sea has little free AISStream coverage)                                                                                            |
| `AIS_MOCK_ENABLED`             | No       | `true` (default) or `false`. When true, Galaxy Leader mock tracks stream into the same fused board as live AIS                                                                                                                                         |
| `SERVER_TOKEN_SECRET`          | No\*     | HMAC secret signing short-lived server-side render tokens. Required only by features that call `serverRuntime.browser.capture()` against an authenticated `/server/*` route — see [architecture/browser-capture.md](./architecture/browser-capture.md) |
| `sessionCookieSecure`          | No       | Set to `"true"` in production to enable Secure + SameSite=None                                                                                                                                                                                         |
| `sessionCookieDomainScope`     | No       | Cookie domain scope for cross-subdomain sessions                                                                                                                                                                                                       |

\* `AISSTREAM_API_KEY` and `SERVER_TOKEN_SECRET` are capability-optional — validated at the ingest / browser-capture sites, not at boot.

`VERCEL_GIT_COMMIT_SHA` is injected by Vercel; you do not set it manually. Override with `BUILD_SHA` only if you need a custom version
string.

### Database Migrations

Migrations are managed by Drizzle Kit. Run against the target VPS database before (or as part of) promoting schema-dependent code:

```bash
npm run db:migrate
```

Migration files live in the `drizzle/` directory and are committed to version control.

**Do not run `db:push` against prod or your dev DB.** `db:push` diffs your local `schema.ts` against the live DB and applies changes
directly, bypassing the `drizzle/` folder entirely — so the `drizzle.__drizzle_migrations` tracking table is never updated. The next
`db:migrate` will then try to re-run every unrecorded migration and fail on already-existing tables. `db:push` is only for the CI test
container (`drizzle-kit push` in `pipeline.yml`), which starts from an empty database each run.

If `db:push` has already been run by accident, the schema is up-to-date but the tracking table is out of sync. Recover with:

```bash
# Dry run — shows missing migration hashes and any phantom rows in the ledger
npm run db:reconcile

# Apply the fix — inserts the missing hashes (transactional; use --remove-phantoms if the dry run flagged any)
npm run db:reconcile -- --apply --remove-phantoms

# Verify
npm run db:check-applied
```

`scripts/migrationsReconcile.ts` reads `drizzle/meta/_journal.json`, hashes each migration's SQL the same way Drizzle does
(`sha256(file content)`), and inserts any hash that isn't already in `drizzle.__drizzle_migrations`, using the journal's `when` as
`created_at`. It never mutates schema — only the ledger. Run it once locally, then again with the prod `DATABASE_URL` against the VPS.

## Continuous Integration (GitHub Actions)

CI lives in `.github/workflows/pipeline.yml`. Gate jobs run in parallel on every pull request and push to `main`. Deployment is left to
Vercel — this workflow does not build or push images.

### Job graph

```
                      ┌─ commitlint ─────────┐
                      ├─ codegen ────────────┤
trigger ──────────────┼─ check ──────────────┤
                      ├─ test ───────────────┤
                      └─ migrations-check ───┘
                          (matrix: prod, preview)
```

All gate jobs share the composite action at `.github/actions/setup` which runs `actions/setup-node@v6`, pins the npm version from
`package.json#packageManager`, and runs `npm ci`. Update there if you change the dependency-install flow.

### Gate jobs

**commitlint** — validates commit messages against the conventional-commits config.

**codegen** — verifies generated files are up to date (no database required):

1. `npm ci`
2. `npm run graphql:generate` and `npm run db:generate`
3. `git diff --exit-code` on `*.gen.ts` / `*.generated.ts` / `drizzle/` — fails if codegen output differs from what was committed, or if new
   untracked files appear

**check** — static analysis (no database required):

| Step   | Command                                                                                                                                    |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Format | `prettier --check .`                                                                                                                       |
| Lint   | `eslint .` (includes `@typescript-eslint/no-deprecated` and Tailwind canonical classes via `better-tailwindcss/enforce-canonical-classes`) |
| Spell  | `cspell .`                                                                                                                                 |
| Types  | `tsc --noEmit`                                                                                                                             |
| Usage  | `knip`                                                                                                                                     |

**test** — runs against a PostgreSQL 17 service container:

1. `npm ci`
2. `drizzle-kit push` (applies schema to the test database)
3. `npm test`

**migrations-check** — verifies that prod and preview databases have applied every migration in the `drizzle/` folder. Runs as a matrix
(`prod`, `preview`) and fails the PR if any migration is missing — forces you to deploy migrations before merging schema-dependent code. The
script (`scripts/migrationsCheck.ts`) hashes each local migration's SQL with the same algorithm Drizzle uses internally
(`sha256(file content)`) and compares against rows in `drizzle.__drizzle_migrations`.

PRs from forks have no access to the DB secrets and so the job is skipped on them; require a maintainer push or branch to run the check.

### Required secrets

| Secret                 | Description                                                                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `DATABASE_URL_PROD`    | Connection string for the VPS prod DB — used by `migrations-check (prod)`; recommend a role with `SELECT` on `drizzle.__drizzle_migrations` only       |
| `DATABASE_URL_PREVIEW` | Connection string for the VPS preview DB — used by `migrations-check (preview)`; recommend a role with `SELECT` on `drizzle.__drizzle_migrations` only |

Runtime app secrets live in the Vercel project settings, not in GitHub Actions.

## Vercel Deployment Strategy

**Production** tracks `main`. **Preview** deployments are created automatically for every pull request. Configure environment variables
separately for Production and Preview in the Vercel dashboard. Both point at the **self-hosted VPS Postgres** — typically a shared preview
database (or a separate DB/role on the same VPS) via `DATABASE_URL`.

### Database Migrations in Deployment

Run migrations against the target VPS database before merging schema-dependent PRs (the `migrations-check` gate enforces this). Preferred
pattern:

```bash
DATABASE_URL=<vps-prod-or-preview-url> npm run db:migrate
```

Do this before the code that depends on the new schema reaches the matching Vercel environment. Avoid running migrations as a silent
side-effect of the first request — a failed migration should not leave a half-live deployment.

## Storybook (GitHub Pages)

There is **only one Storybook**, built from `main` and deployed to GitHub Pages. Storybook documents components, which live in `main`, so a
production-branch Storybook would not show anything different — keep it single regardless of how many runtime environments you add.

Workflow: `.github/workflows/storybook.yml`

### How it works

The workflow runs on pushes to `main` that include at least one change under `src/web/components/`, or on manual `workflow_dispatch`.
GitHub's native `paths` filter handles the path check across the entire push range, so multi-commit pushes work correctly. The workflow runs
in parallel with CI — a CI failure on the same commit shows as a separate red check and does not block the deploy.

1. Installs dependencies and runs `npm run storybook:build`
2. Uploads the `storybook-static/` output as a Pages artifact
3. Deploys to GitHub Pages via `actions/deploy-pages`

URL: `https://<owner>.github.io/<repo>/`

### Setup

GitHub Pages must be configured in the repository settings:

**Settings → Pages → Source** → set to **GitHub Actions** (not "Deploy from a branch")
