import { ChevronDownIcon, ShipIcon } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '../components/base/badge';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia } from '../components/base/empty';
import { cn } from '../utils/cn';
import { useProtectedInfrastructure } from './useProtectedInfrastructure';
import { assetName, LEVEL_ORDER, riskAccentClass, RiskBadge } from './watchSidebarShared';
import type { OsintAlert, Vessel, WatchState } from './watchSidebarShared';

export interface WatchQueueProps {
    watch: WatchState;
    onSelectVessel: (mmsi: string) => void;
    /** When set, only these ship types appear in the queue. */
    visibleShipTypes?: ReadonlySet<string>;
    /** Blocks queue picks while Case ↔ Queue selection is settling. */
    disabled?: boolean;
}

export function WatchQueue({ watch, onSelectVessel, visibleShipTypes, disabled = false }: WatchQueueProps) {
    const [osintOpen, setOsintOpen] = useState(false);
    const { nameById } = useProtectedInfrastructure();
    const openAlertVessels = new Set(watch.incidents.filter((i) => i.status === 'open').map((i) => i.mmsi));

    const queue = [...watch.vessels]
        .filter((v) => (visibleShipTypes ? visibleShipTypes.has(v.shipType) : true))
        .filter((v) => v.riskLevel !== 'green' || openAlertVessels.has(v.mmsi))
        .sort((a, b) => {
            const aAlert = openAlertVessels.has(a.mmsi) ? 0 : 1;
            const bAlert = openAlertVessels.has(b.mmsi) ? 0 : 1;
            if (aAlert !== bAlert) return aAlert - bAlert;
            return LEVEL_ORDER[a.riskLevel] - LEVEL_ORDER[b.riskLevel] || b.riskScore - a.riskScore;
        });

    const osintAlerts = watch.osintAlerts;

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
                {queue.length === 0 ? (
                    <EmptyState />
                ) : (
                    <ul className="flex flex-col gap-1.5">
                        {queue.map((vessel) => (
                            <QueueRow
                                key={vessel.mmsi}
                                vessel={vessel}
                                asset={assetName(vessel, nameById)}
                                hasOpenAlert={openAlertVessels.has(vessel.mmsi)}
                                disabled={disabled}
                                onSelect={() => onSelectVessel(vessel.mmsi)}
                            />
                        ))}
                    </ul>
                )}
            </div>

            {osintAlerts.length > 0 ? (
                <div className="shrink-0 border-t border-sidebar-border">
                    <button
                        type="button"
                        className="flex w-full cursor-pointer items-center justify-between gap-2 px-4 py-2.5 text-left text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase transition-colors hover:bg-muted/40 hover:text-foreground"
                        aria-expanded={osintOpen}
                        onClick={() => setOsintOpen((open) => !open)}
                    >
                        <span>Theater OSINT · {osintAlerts.length}</span>
                        <ChevronDownIcon className={cn('size-3.5 transition-transform', osintOpen ? 'rotate-180' : null)} aria-hidden />
                    </button>
                    {osintOpen ? (
                        <ul className="flex max-h-48 flex-col gap-2 overflow-y-auto px-4 pb-4">
                            {osintAlerts.map((alert) => (
                                <OsintRow key={alert.alertId} alert={alert} />
                            ))}
                        </ul>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}

function EmptyState() {
    return (
        <Empty className="gap-3 rounded-md border border-dashed border-border bg-muted/40 px-4 py-8 md:p-8">
            <EmptyHeader className="gap-3">
                <EmptyMedia variant="icon">
                    <ShipIcon aria-hidden />
                </EmptyMedia>
                <EmptyDescription className="text-sm">
                    All contacts Green — software is monitoring. Select a vessel on the chart for details.
                </EmptyDescription>
            </EmptyHeader>
        </Empty>
    );
}

function QueueRow({
    vessel,
    asset,
    hasOpenAlert,
    disabled,
    onSelect,
}: {
    vessel: Vessel;
    asset: string | null;
    hasOpenAlert: boolean;
    disabled: boolean;
    onSelect: () => void;
}) {
    const primaryReason = [...vessel.activeFactors].reverse()[0]?.explanation ?? null;

    return (
        <li>
            <button
                type="button"
                onClick={onSelect}
                disabled={disabled}
                className={cn(
                    'w-full cursor-pointer border-l-2 border-y border-r border-border bg-background px-2.5 py-2 text-left transition-colors outline-none',
                    'rounded-md hover:border-border hover:bg-muted/60 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
                    'active:bg-muted disabled:pointer-events-none disabled:opacity-50',
                    riskAccentClass(vessel.riskLevel),
                )}
            >
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <p className="truncate text-xs font-semibold text-foreground">{vessel.name}</p>
                            {hasOpenAlert ? (
                                <Badge
                                    variant="outline"
                                    className="rounded-sm border-destructive/40 px-1 py-0 text-[9px] font-semibold tracking-wide text-destructive uppercase"
                                >
                                    Alert
                                </Badge>
                            ) : null}
                        </div>
                        {asset ? <p className="truncate text-[10px] text-primary">{asset}</p> : null}
                    </div>
                    <RiskBadge level={vessel.riskLevel} score={vessel.riskScore} trend={vessel.riskTrend} />
                </div>
                {primaryReason ? <p className="mt-1 truncate text-[11px] text-muted-foreground">{primaryReason}</p> : null}
            </button>
        </li>
    );
}

function OsintRow({ alert }: { alert: OsintAlert }) {
    return (
        <li className="rounded-md border border-border px-2.5 py-2">
            <div className="flex items-center justify-between gap-2 text-[10px] tracking-wide text-muted-foreground uppercase">
                <span>{alert.source}</span>
                <span>{alert.region}</span>
            </div>
            <p className="mt-1 text-xs font-medium text-foreground">{alert.title}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{alert.body}</p>
        </li>
    );
}
