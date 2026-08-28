import type { ChatAssistantBodyBlock } from '../db/chatPayloadTypes';

// Ephemeral live body blocks for in-flight structured answers. The
// `assistantBlocksReplace` wire payload fans out by `chatMessageId` only
// (pg_notify caps at 8000 bytes); the subscription resolver re-reads this
// store before delivering GraphQL. Same process as PubSub LISTEN — Coolify
// is single-server. Cleared on step rotate, blocks-clear, and MessageAppended.

const store = new Map<string, ChatAssistantBodyBlock[]>();

export function chatAssistantLiveBlocksSet(chatMessageId: string, blocks: ChatAssistantBodyBlock[]): void {
    store.set(chatMessageId, blocks);
}

export function chatAssistantLiveBlocksGet(chatMessageId: string): ChatAssistantBodyBlock[] | undefined {
    return store.get(chatMessageId);
}

export function chatAssistantLiveBlocksDelete(chatMessageId: string): void {
    store.delete(chatMessageId);
}
