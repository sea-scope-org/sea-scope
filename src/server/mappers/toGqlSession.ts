import type { Session } from '../db/schema';
import type { GqlSChat, GqlSSession } from '../graphql/generated';

export function toGqlSession(session: Session): GqlSSession {
    return {
        sessionId: session.sessionId,
        // Internal field — not in the GraphQL schema; used by guards/commands.
        userId: session.userId,

        // resolved fields
        user: null,
        chat: null as unknown as GqlSChat,
        watch: null as unknown as GqlSSession['watch'],
        scenarios: [],
    };
}
