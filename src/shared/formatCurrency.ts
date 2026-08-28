const LANGUAGE_TAG = 'en-US';

type FormatCurrencyNullAs = 'zero' | 'emDash' | 'empty';

export type FormatCurrencyOptions = {
    currency?: string;
    maximumFractionDigits?: number;
    nullAs?: FormatCurrencyNullAs;
};

export function formatCurrency(cents: number | null | undefined, options: FormatCurrencyOptions = {}): string {
    const { currency = 'EUR', maximumFractionDigits, nullAs = 'zero' } = options;

    if (cents == null) {
        if (nullAs === 'emDash') return '—';
        if (nullAs === 'empty') return '';
        cents = 0;
    }

    return new Intl.NumberFormat(LANGUAGE_TAG, {
        style: 'currency',
        currency,
        ...(maximumFractionDigits === undefined ? {} : { maximumFractionDigits }),
    }).format(cents / 100);
}
