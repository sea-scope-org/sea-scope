const LANGUAGE_TAG = 'en-US';
const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export type FormatDateOptions = {
    dateStyle?: 'short' | 'medium' | 'long';
    weekday?: boolean;
    nullAs?: string;
};

export type FormatDateRangeOptions = {
    openEnded?: boolean;
    dateStyle?: 'short' | 'medium' | 'long';
    nullAs?: string;
};

export type FormatMonthYearOptions = {
    month?: 'short' | 'long';
};

function parseDisplayDate(value: string | Date): Date | null {
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }

    if (ISO_DATE_ONLY.test(value)) {
        const [y, m, d] = value.split('-').map(Number);
        if (y == null || m == null || d == null) return null;
        const date = new Date(y, m - 1, d);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: string | Date | null | undefined, options: FormatDateOptions = {}): string {
    const { dateStyle = 'medium', weekday = false, nullAs = '—' } = options;
    if (value == null || value === '') return nullAs;

    const date = parseDisplayDate(value);
    if (!date) return typeof value === 'string' ? value : nullAs;

    // Intl forbids mixing `dateStyle` with individual field options like `weekday`.
    if (weekday) {
        return new Intl.DateTimeFormat(LANGUAGE_TAG, {
            weekday: 'long',
            year: 'numeric',
            month: dateStyle === 'short' ? 'numeric' : dateStyle === 'long' ? 'long' : 'short',
            day: 'numeric',
        }).format(date);
    }

    return new Intl.DateTimeFormat(LANGUAGE_TAG, { dateStyle }).format(date);
}

export function formatDateRange(
    startsOn: string | Date | null | undefined,
    endsOn: string | Date | null | undefined,
    options: FormatDateRangeOptions = {},
): string {
    const { openEnded = false, dateStyle = 'medium', nullAs = '—' } = options;
    const dateOpts: FormatDateOptions = { dateStyle, nullAs };

    if (startsOn == null && endsOn == null) return nullAs;
    if (startsOn != null && endsOn != null) {
        return `${formatDate(startsOn, dateOpts)} – ${formatDate(endsOn, dateOpts)}`;
    }
    if (!openEnded) {
        return formatDate(startsOn ?? endsOn, dateOpts);
    }
    if (startsOn != null) {
        return `from ${formatDate(startsOn, dateOpts)}`;
    }
    return `until ${formatDate(endsOn, dateOpts)}`;
}

export function formatMonthYear(value: string | Date, options: FormatMonthYearOptions = {}): string {
    const { month = 'short' } = options;
    const date = parseDisplayDate(value);
    if (!date) return typeof value === 'string' ? value : '';

    return new Intl.DateTimeFormat(LANGUAGE_TAG, {
        month,
        year: 'numeric',
    }).format(date);
}
