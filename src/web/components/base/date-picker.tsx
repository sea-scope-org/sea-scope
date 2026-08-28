import { format } from 'date-fns';
import type { Locale } from 'date-fns';
import { ChevronDownIcon } from 'lucide-react';
import * as React from 'react';
import { cn } from '../../utils/cn';
import { Button } from './button';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

function DatePicker({
    value,
    onValueChange,
    placeholder,
    className,
    align = 'start',
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
    value?: Date;
    onValueChange?: (date: Date | undefined) => void;
    placeholder: string;
    className?: string;
    align?: React.ComponentProps<typeof PopoverContent>['align'];
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
                    data-slot="date-picker-trigger"
                    data-empty={!value}
                    id={id}
                    className={cn('w-[212px] justify-between text-left font-normal data-[empty=true]:text-muted-foreground', className)}
                    aria-labelledby={ariaLabelledBy}
                    aria-label={ariaLabel}
                    aria-required={ariaRequired}
                    aria-invalid={ariaInvalid}
                >
                    {value ? format(value, 'PPP', { locale }) : <span>{placeholder}</span>}
                    <ChevronDownIcon aria-hidden />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align={align}>
                <Calendar
                    mode="single"
                    selected={value}
                    onSelect={onValueChange}
                    defaultMonth={value}
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

export { DatePicker };
