# Admin Access

## Context

Many products built on this template grow two surfaces:

- **Public** — marketing pages, signed-in app areas open to every authenticated user, visitor chat, etc.
- **Admin** — privileged operators (content editors, support, personal-assistant tooling). Must not be reachable by non-admins.

Both surfaces typically share one GraphQL schema. Admin **reads** often hang off a nullable field on the current user (e.g. `User.admin`);
admin **writes** live under `Mutation.admin`. Something has to stop non-admin callers from resolving fields under those namespaces.

This ADR records the gate. Forks that never need an admin surface can ignore it until the first privileged namespace lands.

## Decision

Add `isAdmin: boolean` to the `Users` table. Access is: the current session has a `userId`, and that user's row has `isAdmin = true`.

- **Reads.** `User.admin: Admin` is nullable. The `User.admin` resolver returns the empty `Admin` shell only when the requesting session
  owns the parent user row **and** that row has `isAdmin = true`; otherwise `null`. Because the field is nullable, a non-admin caller gets
  `sessionFindOne.user.admin = null` instead of an exception — public pages can compose the probe and decide whether to surface an admin
  entry point. Admin pages gate on the field being non-null and render an inline "no access" surface when it is null. The template `Admin`
  type ships a placeholder `ok: Boolean!` (always `true`) so the GraphQL type is non-empty until real admin queries land.
- **Writes.** `Mutation.admin: AdminMutation!` is non-nullable and gated by `guardAdminMutation`, which throws on non-admins. Writes are not
  composable from the public surface, so the throw-on-mismatch contract is correct there. The guard stamps the admin's `userId` onto the
  returned shell so child resolvers can publish without re-deriving identity. **Every admin write publishes `userUpdates({ userId })` after
  commit** (seed-and-subscribe); public / anonymous chat mutations stay quiet when there is no `User` to refresh. `AdminMutation` likewise
  ships a placeholder `ok: Boolean!` until real admin mutations land.

```ts
// src/server/db/schema.ts
export const users = pgTable('Users', {
  userId: uuid().primaryKey(),
  name: varchar().notNull(),
  isAdmin: boolean().notNull().default(false),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});
```

```ts
// User.admin resolver sketch
User: {
  async admin(parentUser, _, requestingSession) {
    if (!requestingSession.userId || requestingSession.userId !== parentUser.userId) return null;
    const [row] = await serverRuntime.db
      .select({ isAdmin: users.isAdmin })
      .from(users)
      .where(eq(users.userId, parentUser.userId))
      .limit(1);
    return row?.isAdmin ? ({} as GqlSAdmin) : null;
  },
},
```

`Users.isAdmin` defaults to `false`. The flag is set out-of-band (manual SQL, bootstrap script, IdP claim sync). How the flag gets set is
out of scope for the gate itself — the gate only reads the column.

### Why a boolean column

- One row per user, one column per fact. The migration is a single `ALTER TABLE`.
- Reads cost one PK lookup per resolved `User.admin` / `Mutation.admin`, at most once per GraphQL request.
- Cheap to promote to a dedicated `Admins` table later if membership gains roles / scopes / audit fields.

### Why the read side returns null instead of throwing

A top-level `Query.admin: Admin!` gated by a throwing guard makes it impossible to ask "is this user an admin?" from a public page without
catching a GraphQL error. Nullable `User.admin` turns admin-ness into a regular composable query.

### Anonymous sessions

Sessions without a `userId` resolve `sessionFindOne.user = null`, so `sessionFindOne.user?.admin` never reaches the `User.admin` resolver.

## Alternatives Considered

- **Permissive guard + obscurity** (`noindex` + unlinked URL). Rejected once the admin surface hosts real privileged data or tools.
- **Top-level `Query.admin: Admin!` gated by `guardAdmin`.** Incompatible with composing the field on public pages.
- **Dedicated `Admins` table from day one.** Premature while there is one fact and few admin rows. When membership grows roles / scopes /
  audit fields, promotion is mechanical: copy `userId` for every `isAdmin = true` row into `Admins`, drop the column.

## Consequences

- Adding a new admin is typically a manual `UPDATE` (or equivalent) until a richer membership model exists.
- Forgetting to set `isAdmin` locks that user out of admin UI until the row is updated — recovery is a DB write, not a code change.
- The `User.admin` resolver does a DB read per request that selects the field; cost is negligible.

## Key Files (when adopted)

- `src/server/db/schema.ts` — `users.isAdmin` column
- `src/server/graphql/resolversCreate.ts` — `User.admin` resolver and `Mutation.admin` guard call site
- `src/server/guards/guardAdminMutation.ts` — write namespace gate
- Shared "no access" UI for admin routes whose loader saw a null `admin`

See also [authorization.md](./authorization.md) for the general guard pattern.
