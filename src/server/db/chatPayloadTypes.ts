// Type declarations for the JSONB payloads stored on chat-message variant
// tables. The shapes are defined here (not in `schema.ts`) so persistence
// stays a transport-free concern: drizzle types the columns as `unknown`,
// the mapper casts to these once on read, and producers build values that
// satisfy them on write. No runtime validation — every writer is in this
// codebase, so a malformed row is a code bug, not user input.
//
// The `kind` strings deliberately match the GraphQL union member suffixes
// (`Date`, `DateTime`, `SingleSelect`, ...) so the mapper can map kind →
// `__typename` mechanically.

interface ChatAssistantInputSlotShared {
    inputId: string;
    prompt: string;
}

export type ChatAssistantInputSlot =
    | (ChatAssistantInputSlotShared & { kind: 'Date' })
    | (ChatAssistantInputSlotShared & { kind: 'DateRange' })
    | (ChatAssistantInputSlotShared & { kind: 'DateTime' })
    | (ChatAssistantInputSlotShared & { kind: 'Time' })
    | (ChatAssistantInputSlotShared & { kind: 'SingleSelect'; options: string[] })
    | (ChatAssistantInputSlotShared & { kind: 'MultiSelect'; options: string[] })
    | (ChatAssistantInputSlotShared & { kind: 'Boolean' })
    | (ChatAssistantInputSlotShared & { kind: 'Text' });

// Answer values mirror the `ChatAssistantInputValue` GraphQL union. Date /
// DateTime values are stored as ISO strings; the mapper passes Date-shaped
// strings through and constructs `Date` objects for DateTime scalars.
// `DateRange` stores both endpoints as `YYYY-MM-DD`, same convention as `Date`.
export type ChatAssistantInputValue =
    | { kind: 'Date'; date: string }
    | { kind: 'DateRange'; from: string; to: string }
    | { kind: 'DateTime'; dateTime: string }
    | { kind: 'Time'; time: string }
    | { kind: 'String'; value: string }
    | { kind: 'StringList'; values: string[] }
    | { kind: 'Boolean'; value: boolean };

export interface ChatMessageUserInputAnswer {
    inputId: string;
    value: ChatAssistantInputValue;
}

// Provider grounding / citation sources attached to an assistant-text row.
// UI-only — extracted from AI SDK `step.sources` and/or
// `providerMetadata.google.groundingMetadata`, never invented from tool
// results. See `docs/architecture/chat-persistence.md`.
export interface ChatMessageSource {
    title: string;
    url: string;
}

// Opaque per-part provider blob. The AI SDK surfaces it as `providerMetadata`
// on a step's content parts and accepts it back as `providerOptions` when the
// part is replayed. Gemini 3+ puts its `thoughtSignature` here: drop it and the
// next turn either 400s or silently loses the model's reasoning chain, so it
// has to survive the round-trip through the database. We never inspect the
// contents — see docs/architecture/chat-persistence.md.
type ChatMessagePartProviderJson =
    null | string | number | boolean | ChatMessagePartProviderJson[] | { [key: string]: ChatMessagePartProviderJson | undefined };

export type ChatMessagePartProviderOptions = {
    [provider: string]: { [key: string]: ChatMessagePartProviderJson | undefined };
};

export type ChatAssistantBodyCard = {
    imageUrl?: string;
    title: string;
    description: string;
    price?: string;
    href?: string;
    buttonTitle?: string;
};

/** One ordered segment of an assistant reply (markdown and/or card lists). */
export type ChatAssistantBodyBlock = { kind: 'markdown'; text: string } | { kind: 'cardList'; cards: ChatAssistantBodyCard[] };

/**
 * Persisted on `chatMessagesAssistantText.body` (jsonb). Turns produce this
 * via `Output.object` when structured presentation is enabled; plain markdown
 * wraps as a single markdown block. See `docs/architecture/chat.md`.
 */
export type ChatAssistantBodyPayload = {
    blocks: ChatAssistantBodyBlock[];
};

export function chatAssistantBodyFromMarkdown(text: string): ChatAssistantBodyPayload {
    return { blocks: [{ kind: 'markdown', text }] };
}

/** Concatenate markdown blocks for copy / titles / LLM replay. */
export function chatAssistantBodyFlattenMarkdown(body: ChatAssistantBodyPayload | string | null | undefined): string {
    if (body == null) return '';
    if (typeof body === 'string') return body;
    const parts: string[] = [];
    for (const block of body.blocks) {
        if (block.kind === 'markdown' && block.text.length > 0) parts.push(block.text);
    }
    return parts.join('\n\n');
}

/** Narrow unknown DB jsonb into a body payload (legacy plain string → markdown block). */
export function chatAssistantBodyPayloadFromUnknown(raw: unknown): ChatAssistantBodyPayload {
    if (typeof raw === 'string') return chatAssistantBodyFromMarkdown(raw);
    if (raw && typeof raw === 'object' && Array.isArray((raw as ChatAssistantBodyPayload).blocks)) {
        return raw as ChatAssistantBodyPayload;
    }
    return chatAssistantBodyFromMarkdown('');
}
