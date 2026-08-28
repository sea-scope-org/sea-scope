import { eq } from 'drizzle-orm';
import { sessions, users } from '../db/schema';
import type { ServerRuntime } from '../domain/ServerRuntime';
import type { GqlSSession, GqlSSessionMutation } from '../graphql/generated';

// SeaScope has no login surface. Chat authorship still needs a Users row
// (non-null GraphQL `ChatMessageUser.author`). Bind a durable "Operator"
// user to the cookie session on first SessionMutation — invisible identity,
// not product auth.

export async function sessionOperatorEnsure(requestingSession: GqlSSession, serverRuntime: ServerRuntime): Promise<GqlSSessionMutation> {
    if (requestingSession.userId) {
        return { sessionId: requestingSession.sessionId, userId: requestingSession.userId } as GqlSSessionMutation;
    }

    const userId = crypto.randomUUID();
    const now = new Date();
    await serverRuntime.db.insert(users).values({
        userId,
        name: 'Operator',
        isAdmin: false,
        createdAt: now,
    });
    await serverRuntime.db.update(sessions).set({ userId }).where(eq(sessions.sessionId, requestingSession.sessionId));
    requestingSession.userId = userId;

    return { sessionId: requestingSession.sessionId, userId } as GqlSSessionMutation;
}
