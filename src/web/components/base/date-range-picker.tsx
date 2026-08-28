import { format } from 'date-fns';
import type { Locale } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import * as React from 'react';
import type { DateRange } from 'react-day-picker';
import { cn } from '../../utils/cn';
import { Button } from './button';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

function DateRangePicker({
    value,
    onValueChange,
    placeholder,
    className,
    align = 'start',
    numberOfMonths = 2,
    disabled,
    locale,
    captionLayout,
    startMonth,
    endMonth,
    id,
    'aria-labelledby': ariaLabelledBy,
    'aria-label': ariaLabel,
    'aria-required': ariaRequired,
    'aria-invalid': ariaInvalid,
}: {
    value?: DateRange;
    onValueChange?: (range: DateRange | undefined) => void;
    placeholder: string;
    className?: string;
    align?: React.ComponentProps<typeof PopoverContent>['align'];
    numberOfMonths?: number;
    disabled?: React.ComponentProps<typeof Calendar>['disabled'];
    locale?: Locale;
    captionLayout?: React.ComponentProps<typeof Calendar>['captionLayout'];
    startMonth?: Date;
    endMonth?: Date;
    id?: string;
    'aria-labelledby'?: string;
    'aria-label'?: string;
    'aria-required'?: boolean | 'true' | 'false';
    'aria-invalid'?: boolean | 'true' | 'false';
}) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    data-slot="date-range-picker-trigger"
                    data-empty={!value?.from}
                    id={id}
                    className={cn('justify-start px-2.5 font-normal data-[empty=true]:text-muted-foreground', className)}
                    aria-labelledby={ariaLabelledBy}
                    aria-label={ariaLabel}
                    aria-required={ariaRequired}
                    aria-invalid={ariaInvalid}
                >
                    <CalendarIcon aria-hidden />
                    {value?.from ? (
                        value.to ? (
                            <>
                                {format(value.from, 'LLL dd, y', { locale })} - {format(value.to, 'LLL dd, y', { locale })}
                            </>
                        ) : (
                            format(value.from, 'LLL dd, y', { locale })
                        )
                    ) : (
                        <span>{placeholder}</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align={align}>
                <Calendar
                    mode="range"
                    defaultMonth={value?.from}
                    selected={value}
                    onSelect={onValueChange}
                    numberOfMonths={numberOfMonths}
                    disabled={disabled}
                    locale={locale}
                    captionLayout={captionLayout}
                    startMonth={startMonth}
                    endMonth={endMonth}
                />
            </PopoverContent>
        </Popover>
    );
}

export { DateRangePicker };
