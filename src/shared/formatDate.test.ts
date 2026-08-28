import { describe, expect, it } from 'vitest';
import { formatDate, formatDateRange, formatMonthYear } from './formatDate';
import { formatIsoDate } from './formatIsoDate';

describe('formatDate', () => {
    it('formats an ISO date-only string as a local calendar date', () => {
        const formatted = formatDate('2026-03-15');
        expect(formatted).toMatch(/Mar/);
        expect(formatted).toMatch(/15/);
        expect(formatted).toMatch(/2026/);
    });

    it('returns an em dash for null', () => {
        expect(formatDate(null)).toBe('—');
    });

    it('supports short date style', () => {
        const formatted = formatDate(new Date(2026, 2, 15), { dateStyle: 'short' });
        expect(formatted).toMatch(/15/);
        expect(formatted).toMatch(/03|3/);
        expect(formatted).toMatch(/26|2026/);
    });

    it('includes weekday when requested', () => {
        const formatted = formatDate('2026-03-15', { weekday: true });
        expect(formatted.toLowerCase()).toMatch(/sunday|sun/);
    });
});

describe('formatDateRange', () => {
    it('joins both ends with an en dash', () => {
        const formatted = formatDateRange('2026-03-01', '2026-03-15');
        expect(formatted).toContain('–');
        expect(formatted).toMatch(/Mar/);
    });

    it('prefixes open-ended starts and ends', () => {
        expect(formatDateRange('2026-03-01', null, { openEnded: true })).toMatch(/^from /);
        expect(formatDateRange(null, '2026-03-15', { openEnded: true })).toMatch(/^until /);
    });

    it('returns em dash when both ends are missing', () => {
        expect(formatDateRange(null, undefined)).toBe('—');
    });
});

describe('formatMonthYear', () => {
    it('formats short and long month styles', () => {
        expect(formatMonthYear('2026-07-01')).toMatch(/Jul/);
        expect(formatMonthYear('2026-07-01', { month: 'long' })).toMatch(/July/);
    });
});

describe('formatIsoDate', () => {
    it('formats a local Date without UTC shift', () => {
        expect(formatIsoDate(new Date(2026, 2, 15))).toBe('2026-03-15');
    });
});
