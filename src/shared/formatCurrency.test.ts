import { describe, expect, it } from 'vitest';
import { formatCurrency } from './formatCurrency';

describe('formatCurrency', () => {
    it('formats whole euros without fraction digits', () => {
        expect(formatCurrency(123456, { maximumFractionDigits: 0 })).toBe('€1,235');
    });

    it('formats cents in English (en-US)', () => {
        expect(formatCurrency(123456)).toBe('€1,234.56');
    });

    it('treats null as zero by default', () => {
        expect(formatCurrency(null, { maximumFractionDigits: 0 })).toBe('€0');
    });

    it('returns an em dash when nullAs is emDash', () => {
        expect(formatCurrency(undefined, { nullAs: 'emDash' })).toBe('—');
    });

    it('returns empty string when nullAs is empty', () => {
        expect(formatCurrency(null, { nullAs: 'empty' })).toBe('');
    });
});
