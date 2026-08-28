import { format } from 'date-fns';
import type { Locale } from 'date-fns';
import { ChevronDownIcon } from 'lucide-react';
import * as React from 'react';
import { cn } from '../../utils/cn';
import { Button } from './button';
import { Calendar } from './calendar';
import { Input } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

function DateTimePicker({
    value,
    onValueChange,
    placeholder,
    timeAriaLabel,
    className,
    align = 'start',
    disabled,
    locale,
    id,
    'aria-labelledby': ariaLabelledBy,
    'aria-label': ariaLabel,
    'aria-required': ariaRequired,
    'aria-invalid': ariaInvalid,
}: {
    value?: Date;
    onValueChange?: (date: Date) => void;
    placeholder: string;
    timeAriaLabel: string;
    className?: string;
    align?: React.ComponentProps<typeof PopoverContent>['align'];
    disabled?: React.ComponentProps<typeof Calendar>['disabled'];
    locale?: Locale;
    id?: string;
    'aria-labelledby'?: string;
    'aria-label'?: string;
    'aria-required'?: boolean | 'true' | 'false';
    'aria-invalid'?: boolean | 'true' | 'false';
}) {
    const timeValue = value ? format(value, 'HH:mm') : '';

    const setDay = (day: Date | undefined) => {
        if (!day) return;
        const base = value ?? new Date();
        const next = new Date(day);
        next.setHours(base.getHours(), base.getMinutes(), 0, 0);
        onValueChange?.(next);
    };

    const setTime = (raw: string) => {
        const [h, m] = raw.split(':');
        const hours = Number(h);
        const minutes = Number(m);
        if (Number.isNaN(hours) || Number.isNaN(minutes)) return;
        const next = new Date(value ?? new Date());
        next.setHours(hours, minutes, 0, 0);
        onValueChange?.(next);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    data-slot="date-time-picker-trigger"
                    data-empty={!value}
                    id={id}
                    className={cn('w-[240px] justify-between text-left font-normal data-[empty=true]:text-muted-foreground', className)}
                    disabled={disabled === true}
                    aria-labelledby={ariaLabelledBy}
                    aria-label={ariaLabel}
                    aria-required={ariaRequired}
                    aria-invalid={ariaInvalid}
                >
                    {value ? format(value, 'PPP, HH:mm', { locale }) : <span>{placeholder}</span>}
                    <ChevronDownIcon aria-hidden />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align={align}>
                <Calendar mode="single" selected={value} onSelect={setDay} defaultMonth={value} disabled={disabled} locale={locale} />
                <div className="flex items-center gap-2 border-t border-border/60 p-3">
                    <Input
                        type="time"
                        value={timeValue}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full"
                        aria-label={timeAriaLabel}
                    />
                </div>
            </PopoverContent>
        </Popover>
    );
}

export { DateTimePicker };
