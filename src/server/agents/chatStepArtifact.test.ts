import { describe, expect, it } from 'vitest';
import {
    chatStepArtifactClaimFirstMessageId,
    chatStepArtifactCreate,
    chatStepArtifactReasoningOrNull,
    chatStepArtifactReset,
} from './chatStepArtifact';

describe('chatStepArtifact', () => {
    it('claims the pre-allocated id exactly once', () => {
        const step = chatStepArtifactCreate('step-1');
        expect(chatStepArtifactClaimFirstMessageId(step)).toBe('step-1');
        expect(chatStepArtifactClaimFirstMessageId(step)).toBeNull();
        expect(step.firstClaimed).toBe(true);
    });

    it('resets id and buffers for a new LLM step', () => {
        const step = chatStepArtifactCreate('step-1');
        step.text = 'hello';
        step.reasoning = 'thinking';
        chatStepArtifactClaimFirstMessageId(step);

        chatStepArtifactReset(step);

        expect(step.messageId).not.toBe('step-1');
        expect(step.text).toBe('');
        expect(step.reasoning).toBe('');
        expect(step.firstClaimed).toBe(false);
    });

    it('prefers step.reasoningText over the stream buffer', () => {
        const step = chatStepArtifactCreate();
        step.reasoning = 'from stream';
        expect(chatStepArtifactReasoningOrNull(step, 'from step')).toBe('from step');
        expect(chatStepArtifactReasoningOrNull(step)).toBe('from stream');
        expect(chatStepArtifactReasoningOrNull(null)).toBeNull();
    });
});
