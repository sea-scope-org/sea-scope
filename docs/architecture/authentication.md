# Authentication

> **SeaScope MVP:** anonymous cookie sessions only — there is no login/signup product surface. `Users` / `userId` remain infrastructure for
> optional session binding and chat authorship, but are not exposed as auth UX.

## Context

The application needs to identify users across requests without requiring an upfront login. Sessions must be established automatically on
first visit and persist across browser sessions.

## Decision

Cookie-based session management with automatic session creation on every GraphQL request.

### How It Works

1. Every request to `/api/graphql` or `/api/stream` calls `sessionUpsert()` before executing the GraphQL operation
2. `sessionUpsert()` reads the session ID from the cookie whose name is configured via `env.sessionCookie.name` (see
   [environment.md](./environment.md))
3. If a valid session exists (not terminated), it updates `lastInteractionAt` and returns the session
4. If no session exists or the session was terminated, a new session is created with `crypto.randomUUID()`
5. The response includes a `Set-Cookie` header to persist the session ID in the browser. The cookie is set `HttpOnly` so the session ID is
   not readable from JavaScript (mitigating XSS exfiltration), along with `Secure` + `SameSite=None` when `sessionCookieSecure=true`
   (production) and `SameSite=Lax` otherwise — see `createSetSessionCookie` in `src/server/utils/sessionUtils.ts`. SSR must forward the
   incoming cookie to `/api/graphql` over the public HTTPS origin (not `request.url`'s possibly-`http` value behind Coolify) or every
   document load mints a new session — see [api-layer.md](./api-layer.md#session--cookie-handover).

### Session Lifecycle

- **Created**: automatically on first request. Create also stamps first-touch attribution from request headers: `referrer` (`Referer`),
  `landingPath` (`x-landing-path` from the SSR route loader), `ipHash` (`SHA256(VISITOR_IP_HASH_SALT + ":" + clientIp)` via
  `clientIpFromRequest`), and `isBot` (via `isbot` on `userAgent`).
- **Active**: `lastInteractionAt` updated on every request; `connectionActive` tracks real-time connections. Updates refresh `userAgent` /
  `ipHash` / `isBot` but leave `referrer` / `landingPath` untouched.
- **Terminated**: soft-deleted via `wasTerminatedAt` timestamp (row is preserved, not deleted)
- **User binding**: `userId` column exists on the session but is nullable — sessions start anonymous and can be linked to a user later

### Key Files

- `src/server/utils/sessionUpsert.ts` — session creation and update logic
- `src/server/utils/clientIpFromRequest.ts` — client IP from `x-forwarded-for` / `x-real-ip`
- `src/server/utils/sessionUtils.ts` — cookie reading/writing helpers
- `src/server/db/schema.ts` — `Sessions` table definition
- `src/routes/api/graphql.ts` — session context wiring for queries and mutations
- `src/routes/api/stream.ts` — session context wiring for subscriptions
- `src/web/graphql/routeLoaderGraphqlClient.ts` — SSR loader forwards `x-landing-path` (+ `referer`) into `/api/graphql`

## Alternatives Considered

- **JWT tokens**: Stateless but harder to revoke, no server-side session state for real-time tracking
- **Third-party auth (OAuth providers)**: Adds external dependency; can be layered on top of sessions later

## Consequences

- Every request hits the database for session upsert — acceptable given the PostgreSQL connection pool
- Sessions start anonymous, so user identity requires a separate linking step
- Soft-delete means the sessions table grows over time — may need a cleanup job eventually
