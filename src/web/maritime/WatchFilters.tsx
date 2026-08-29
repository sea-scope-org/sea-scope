import { ListFilterIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '../components/base/button';
import { Checkbox } from '../components/base/checkbox';
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from '../components/base/popover';
import { Separator } from '../components/base/separator';
import { cn } from '../utils/cn';
import type { WatchFiltersState, WatchLayerFilters } from './watchFilterState';
import { watchFiltersCreate, watchFiltersOffCount } from './watchFilterState';

const LAYER_OPTIONS: ReadonlyArray<{ key: keyof WatchLayerFilters; label: string }> = [
    { key: 'protectedAssets', label: 'Protected assets' },
    { key: 'highRiskZones', label: 'High-risk zones' },
    { key: 'trackTails', label: 'Track tails' },
    { key: 'radarContacts', label: 'Radar contacts' },
];

export interface WatchFiltersProps {
    filters: WatchFiltersState;
    shipTypeCatalog: ReadonlyArray<string>;
    onChange: (next: WatchFiltersState) => void;
    className?: string;
}

export function WatchFilters({ filters, shipTypeCatalog, onChange, className }: WatchFiltersProps) {
    const offCount = watchFiltersOffCount(filters, shipTypeCatalog);
    const triggerLabel = offCount > 0 ? `Filters · ${offCount} off` : 'Filters';

    const setLayer = (key: keyof WatchLayerFilters, checked: boolean) => {
        onChange({
            ...filters,
            layers: { ...filters.layers, [key]: checked },
        });
    };

    const setShipType = (shipType: string, checked: boolean) => {
        const next = new Set(filters.shipTypes);
        if (checked) next.add(shipType);
        else next.delete(shipType);
        onChange({ ...filters, shipTypes: next });
    };

    const reset = () => {
        onChange(watchFiltersCreate(shipTypeCatalog));
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    size="xs"
                    variant={offCount > 0 ? 'secondary' : 'ghost'}
                    className={cn('gap-1 tracking-wide uppercase', className)}
                    aria-label={triggerLabel}
                >
                    <ListFilterIcon className="size-3.5" aria-hidden />
                    {triggerLabel}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 gap-0 p-0">
                <PopoverHeader className="border-b border-border px-3 py-2.5">
                    <PopoverTitle className="text-xs font-semibold tracking-[0.14em] uppercase">Filters</PopoverTitle>
                    <PopoverDescription className="text-[11px]">Chart layers and vessel types for map and queue.</PopoverDescription>
                </PopoverHeader>

                <div className="flex max-h-80 flex-col gap-3 overflow-y-auto p-3">
                    <FilterSection title="Layers">
                        {LAYER_OPTIONS.map(({ key, label }) => (
                            <FilterRow
                                key={key}
                                id={`watch-filter-layer-${key}`}
                                label={label}
                                checked={filters.layers[key]}
                                onCheckedChange={(checked) => setLayer(key, checked)}
                            />
                        ))}
                    </FilterSection>

                    {shipTypeCatalog.length > 0 ? (
                        <>
                            <Separator />
                            <FilterSection title="Vessel types">
                                {shipTypeCatalog.map((shipType) => (
                                    <FilterRow
                                        key={shipType}
                                        id={`watch-filter-ship-${shipType}`}
                                        label={shipType}
                                        checked={filters.shipTypes.has(shipType)}
                                        onCheckedChange={(checked) => setShipType(shipType, checked)}
                                    />
                                ))}
                            </FilterSection>
                        </>
                    ) : null}
                </div>

                <div className="flex items-center justify-end border-t border-border px-2 py-1.5">
                    <Button
                        type="button"
                        size="xs"
                        variant="ghost"
                        className="tracking-wide uppercase"
                        disabled={offCount === 0}
                        onClick={reset}
                    >
                        Show all
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <fieldset className="flex flex-col gap-2">
            <legend className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{title}</legend>
            <div className="flex flex-col gap-1.5">{children}</div>
        </fieldset>
    );
}

function FilterRow({
    id,
    label,
    checked,
    onCheckedChange,
}: {
    id: string;
    label: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
}) {
    return (
        <label htmlFor={id} className="flex cursor-pointer items-center gap-2 text-xs text-foreground">
            <Checkbox id={id} checked={checked} onCheckedChange={(value) => onCheckedChange(value === true)} />
            <span className="min-w-0 truncate">{label}</span>
        </label>
    );
}
