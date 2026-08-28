import type { ChatMessageSource } from '../db/chatPayloadTypes';

// Extract provider grounding / citation sources from an AI SDK step (or any
// object that carries the same `sources` / `providerMetadata` surfaces).
// Prefer the SDK's normalized `sources` array; also read Gemini
// `groundingMetadata.groundingChunks` so we do not depend on only one
// surface. Document-type sources without a URL are skipped — the footer
// only renders clickable links. See `docs/architecture/chat-persistence.md`.

type SdkSourceLike = {
    sourceType?: string;
    url?: string;
    title?: string;
};

type GroundingWebChunk = {
    web?: { uri?: string | null; title?: string | null } | null;
};

type GoogleProviderMetadataLike = {
    groundingMetadata?: {
        groundingChunks?: ReadonlyArray<GroundingWebChunk | null | undefined> | null;
    } | null;
};

export type ChatMessageSourcesStepLike = {
    sources?: ReadonlyArray<SdkSourceLike> | null;
    providerMetadata?: { google?: unknown } | null;
};

function titleFromUrl(url: string): string {
    try {
        return new URL(url).hostname;
    } catch {
        return url;
    }
}

function pushUnique(into: ChatMessageSource[], seen: Set<string>, url: string, title: string | null | undefined): void {
    const trimmed = url.trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    into.push({ url: trimmed, title: (title?.trim() || titleFromUrl(trimmed)).trim() });
}

export function chatMessageSourcesFromStep(step: ChatMessageSourcesStepLike): ChatMessageSource[] {
    const out: ChatMessageSource[] = [];
    const seen = new Set<string>();

    for (const source of step.sources ?? []) {
        if (source.sourceType === 'document') continue;
        if (typeof source.url !== 'string') continue;
        pushUnique(out, seen, source.url, source.title);
    }

    const google = step.providerMetadata?.google as GoogleProviderMetadataLike | null | undefined;
    const chunks = google?.groundingMetadata?.groundingChunks;
    if (Array.isArray(chunks)) {
        for (const chunk of chunks) {
            const web = chunk?.web;
            if (!web || typeof web.uri !== 'string') continue;
            pushUnique(out, seen, web.uri, web.title);
        }
    }

    return out;
}

/** Merge incoming sources into a turn accumulator, deduping by URL. */
export function chatMessageSourcesMerge(into: { value: ChatMessageSource[] }, incoming: ReadonlyArray<ChatMessageSource>): void {
    if (incoming.length === 0) return;
    const seen = new Set(into.value.map((s) => s.url));
    for (const source of incoming) {
        if (seen.has(source.url)) continue;
        seen.add(source.url);
        into.value.push(source);
    }
}
