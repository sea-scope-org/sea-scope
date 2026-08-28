import { describe, expect, it } from 'vitest';
import type { ChatMessageRowJoined } from './toGqlChatMessage';
import { toModelMessages } from './toModelMessages';

// Pure unit tests — no DB. The mapper is the single boundary that translates
// persisted rows to AI SDK `ModelMessage[]`, so we cover the user-content
// shapes here in detail.

function userRow(
    body: string,
    attachments: ReadonlyArray<{ filename: string; mediaType: string; bytes: Buffer }> = [],
): ChatMessageRowJoined {
    const chatMessageId = crypto.randomUUID();
    return {
        spine: {
            chatMessageId,
            chatId: 'c',
            kind: 'user',
            authorUserId: 'u',
            parentChatMessageId: null,
            createdAt: new Date('2026-06-01T00:00:00Z'),
        },
        user: { chatMessageId, body },
        userAttachments: attachments.map((a, i) => ({
            fileUploadId: `att-${i}`,
            userId: 'u',
            filename: a.filename,
            mediaType: a.mediaType,
            size: a.bytes.byteLength,
            bytes: a.bytes,
            createdAt: new Date('2026-06-01T00:00:00Z'),
        })),
    };
}

describe('toModelMessages', () => {
    it('emits a string-content user message when there are no attachments', () => {
        // Arrange
        const rows = [userRow('hello world')];

        // Act
        const messages = toModelMessages(rows);

        // Assert
        expect(messages).toEqual([{ role: 'user', content: 'hello world' }]);
    });

    it('emits a parts array with text + file part carrying the image media type for an image attachment', () => {
        // Arrange
        const png = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
        const rows = [userRow('check this', [{ filename: 'pic.png', mediaType: 'image/png', bytes: png }])];

        // Act
        const messages = toModelMessages(rows);

        // Assert — AI SDK v7 removed `ImagePart`; images ride through `FilePart`
        // with an `image/*` media type.
        expect(messages).toHaveLength(1);
        const message = messages[0]!;
        expect(message.role).toBe('user');
        expect(Array.isArray(message.content)).toBe(true);
        const parts = message.content as Array<{ type: string; text?: string; mediaType?: string; data?: Buffer; filename?: string }>;
        expect(parts).toHaveLength(2);
        expect(parts[0]).toEqual({ type: 'text', text: 'check this' });
        expect(parts[1]!.type).toBe('file');
        expect(parts[1]!.mediaType).toBe('image/png');
        // Images deliberately omit `filename` — some providers treat a named
        // image part as a document rather than a picture.
        expect(parts[1]!.filename).toBeUndefined();
        expect(parts[1]!.data).toBe(png);
    });

    it('emits a parts array with text + file part for a non-image attachment', () => {
        // Arrange
        const pdf = Buffer.from('%PDF-1.4');
        const rows = [userRow('see attached', [{ filename: 'doc.pdf', mediaType: 'application/pdf', bytes: pdf }])];

        // Act
        const messages = toModelMessages(rows);

        // Assert
        const parts = messages[0]!.content as Array<{ type: string; mediaType?: string; data?: Buffer; filename?: string }>;
        expect(parts[0]).toEqual({ type: 'text', text: 'see attached' });
        expect(parts[1]!.type).toBe('file');
        expect(parts[1]!.mediaType).toBe('application/pdf');
        expect(parts[1]!.filename).toBe('doc.pdf');
        expect(parts[1]!.data).toBe(pdf);
    });

    it('omits the text part when the user sent attachments without a body', () => {
        // Arrange — files-only send.
        const png = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
        const rows = [userRow('', [{ filename: 'pic.png', mediaType: 'image/png', bytes: png }])];

        // Act
        const messages = toModelMessages(rows);

        // Assert — only the file part survives; no empty-text part injected.
        const parts = messages[0]!.content as Array<{ type: string }>;
        expect(parts).toHaveLength(1);
        expect(parts[0]!.type).toBe('file');
    });

    it('replays providerOptions on the tool-call part when persisted', () => {
        // Arrange — Gemini thoughtSignature (or any provider blob) must
        // round-trip or the next turn 400s / warns.
        const chatMessageId = crypto.randomUUID();
        const providerOptions = { google: { thoughtSignature: 'sig-abc' } };
        const rows: ChatMessageRowJoined[] = [
            {
                spine: {
                    chatMessageId,
                    chatId: 'c',
                    kind: 'toolCall',
                    authorUserId: null,
                    parentChatMessageId: null,
                    createdAt: new Date('2026-06-01T00:00:00Z'),
                },
                toolCall: {
                    chatMessageId,
                    toolCallId: 'call-signed',
                    toolName: 'someTool',
                    toolArgs: { x: 1 },
                    toolResult: { status: 'completed' },
                    resultedAt: new Date('2026-06-01T00:00:01Z'),
                    providerOptions,
                    reasoning: null,
                    modelId: null,
                    inputTokens: null,
                    outputTokens: null,
                    totalTokens: null,
                    reasoningTokens: null,
                    cachedInputTokens: null,
                },
            },
        ];

        // Act
        const messages = toModelMessages(rows);

        // Assert
        expect(messages[0]).toMatchObject({
            role: 'assistant',
            content: [{ type: 'tool-call', toolCallId: 'call-signed', providerOptions }],
        });
    });

    it('omits providerOptions on the tool-call part when the column is null', () => {
        // Arrange
        const chatMessageId = crypto.randomUUID();
        const rows: ChatMessageRowJoined[] = [
            {
                spine: {
                    chatMessageId,
                    chatId: 'c',
                    kind: 'toolCall',
                    authorUserId: null,
                    parentChatMessageId: null,
                    createdAt: new Date('2026-06-01T00:00:00Z'),
                },
                toolCall: {
                    chatMessageId,
                    toolCallId: 'call-unsigned',
                    toolName: 'someTool',
                    toolArgs: { x: 1 },
                    toolResult: { status: 'completed' },
                    resultedAt: new Date('2026-06-01T00:00:01Z'),
                    providerOptions: null,
                    reasoning: null,
                    modelId: null,
                    inputTokens: null,
                    outputTokens: null,
                    totalTokens: null,
                    reasoningTokens: null,
                    cachedInputTokens: null,
                },
            },
        ];

        // Act
        const messages = toModelMessages(rows);

        // Assert
        const part = (messages[0]!.content as Array<Record<string, unknown>>)[0]!;
        expect(part).toMatchObject({ type: 'tool-call', toolCallId: 'call-unsigned' });
        expect(part).not.toHaveProperty('providerOptions');
    });
});
