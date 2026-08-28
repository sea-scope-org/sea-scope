import { RadarIcon, RotateCcwIcon } from 'lucide-react';
import { formatHms } from '../../shared';
import { Badge } from '../components/base/badge';
import { Button } from '../components/base/button';
import { Separator } from '../components/base/separator';
import { SidebarTrigger } from '../components/base/sidebar';
import type { GqlCWatchFieldsFragment } from '../graphql/generated';
import { cn } from '../utils/cn';

export interface WatchToolbarProps {
    watch: GqlCWatchFieldsFragment;
    onReset?: () => void;
    className?: string;
}

export function WatchToolbar({ watch, onReset, className }: WatchToolbarProps) {
    const simSec = Math.floor(watch.simMs / 1000);
    const openAlerts = watch.incidents.filter((i) => i.status === 'open').length;
    const alertLabel = openAlerts === 1 ? '1 alert' : `${openAlerts} alerts`;

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
                <Badge
                    variant="outline"
                    className="rounded border-emerald-600/40 bg-emerald-50 px-2 py-1 text-[10px] font-semibold tracking-[0.16em] text-emerald-800 uppercase"
                    title="Mocked AIS feed is streaming"
                >
                    Live
                </Badge>

                <Separator orientation="vertical" className="h-5" />

                <Badge
                    variant="outline"
                    className="rounded bg-muted px-2.5 py-1 font-mono text-xs font-normal tabular-nums text-foreground"
                    title="Simulation time"
                >
                    T+{formatHms(simSec)}
                </Badge>

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
