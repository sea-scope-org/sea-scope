import { RadarIcon, RotateCcwIcon } from 'lucide-react';
import { Badge } from '../components/base/badge';
import { Button } from '../components/base/button';
import { Separator } from '../components/base/separator';
import { SidebarTrigger } from '../components/base/sidebar';
import type { GqlCWatchFieldsFragment } from '../graphql/generated';
import { cn } from '../utils/cn';
import { WatchFilters } from './WatchFilters';
import type { WatchFiltersState } from './watchFilterState';
import { riskBadgeClass } from './watchSidebarShared';
import type { RiskLevel } from './watchSidebarShared';

export interface WatchToolbarProps {
    watch: GqlCWatchFieldsFragment;
    /** Vessels after ship-type filter — band counts match map/queue. */
    countedVessels: ReadonlyArray<GqlCWatchFieldsFragment['vessels'][number]>;
    filters: WatchFiltersState;
    shipTypeCatalog: ReadonlyArray<string>;
    onFiltersChange: (next: WatchFiltersState) => void;
    onReset?: () => void;
    className?: string;
}

const BAND_ORDER: ReadonlyArray<RiskLevel> = ['red', 'orange', 'yellow', 'green'];

export function WatchToolbar({ watch, countedVessels, filters, shipTypeCatalog, onFiltersChange, onReset, className }: WatchToolbarProps) {
    const openAlerts = watch.incidents.filter((i) => i.status === 'open').length;
    const alertLabel = openAlerts === 1 ? '1 alert' : `${openAlerts} alerts`;

    const bandCounts: Record<RiskLevel, number> = { green: 0, yellow: 0, orange: 0, red: 0 };
    for (const vessel of countedVessels) {
        bandCounts[vessel.riskLevel] += 1;
    }

    return (
        <header
            className={cn(
                'flex shrink-0 flex-wrap items-center gap-3 border-b border-border bg-card px-4 py-2.5 text-foreground',
                className,
            )}
        >
            <div className="flex min-w-0 items-center gap-2.5">
                <SidebarTrigger className="md:hidden" />
                <RadarIcon className="size-5 shrink-0 text-primary" aria-hidden />
                <div className="min-w-0">
                    <p className="text-sm font-semibold tracking-tight text-foreground">SeaScope</p>
                    <p className="truncate text-[11px] text-muted-foreground">{watch.title}</p>
                </div>
            </div>

            <div className="mx-auto flex flex-wrap items-center gap-2">
                <ul className="flex flex-wrap items-center gap-1.5" aria-label="Vessels by risk band">
                    {BAND_ORDER.map((level) => (
                        <li key={level}>
                            <Badge
                                variant="outline"
                                className={cn(
                                    'rounded-sm px-1.5 py-0 text-[10px] font-semibold tracking-wide uppercase',
                                    riskBadgeClass(level),
                                )}
                            >
                                {bandCounts[level]} {level}
                            </Badge>
                        </li>
                    ))}
                </ul>

                {openAlerts > 0 ? (
                    <>
                        <Separator orientation="vertical" className="h-5" />
                        <Badge
                            variant="outline"
                            className="rounded border-destructive/40 bg-destructive/10 px-2 py-1 text-[10px] font-semibold tracking-[0.14em] text-destructive uppercase"
                        >
                            {alertLabel}
                        </Badge>
                    </>
                ) : null}
            </div>

            <div className="ml-auto flex items-center gap-1">
                <WatchFilters filters={filters} shipTypeCatalog={shipTypeCatalog} onChange={onFiltersChange} />
                {onReset ? (
                    <Button
                        type="button"
                        size="xs"
                        variant="ghost"
                        className="gap-1 tracking-wide uppercase"
                        onClick={onReset}
                        title="Reset demo scenario"
                    >
                        <RotateCcwIcon className="size-3.5" aria-hidden />
                        Reset
                    </Button>
                ) : null}
                <SidebarTrigger className="hidden md:inline-flex" />
            </div>
        </header>
    );
}
