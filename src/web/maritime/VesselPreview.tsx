import {
    ArrowDownRightIcon,
    ArrowRightIcon,
    ArrowUpRightIcon,
    BellIcon,
    CompassIcon,
    FlagIcon,
    GaugeIcon,
    HashIcon,
    HistoryIcon,
    MapPinnedIcon,
    RadioTowerIcon,
    RouteIcon,
    SatelliteIcon,
    ShieldAlertIcon,
    ShipIcon,
    WeightIcon,
} from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { cn } from '../utils/cn';
import type { WatchVessel } from './vesselVisuals';
import { freshnessLabel, VESSEL_FAMILY_COLORS, vesselProjection, vesselTypeNormalize } from './vesselVisuals';

type PreviewIcon = ComponentType<SVGProps<SVGSVGElement>>;

const RISK_TONE: Record<WatchVessel['riskLevel'], string> = {
    green: 'border-emerald-600/25 bg-emerald-50 text-emerald-700',
    yellow: 'border-yellow-500/35 bg-yellow-50 text-yellow-800',
    orange: 'border-orange-500/35 bg-orange-50 text-orange-800',
    red: 'border-red-500/35 bg-red-50 text-red-700',
};

const RISK_DOT: Record<WatchVessel['riskLevel'], string> = {
    green: 'bg-emerald-500',
    yellow: 'bg-yellow-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
};

export function VesselPreview({ vessel, nowMs, assetName }: { vessel: WatchVessel; nowMs: number; assetName: string | null }) {
    const position = vessel.position;
    const familyMeta = VESSEL_FAMILY_COLORS[vesselTypeNormalize(vessel.shipType)];
    const projection = vesselProjection(vessel, nowMs);
    const reason = vessel.activeFactors.at(-1)?.explanation;
    const trend = trendMeta(vessel.riskTrend);
    const aisStatus = vessel.aisDark ? 'AIS dark' : position ? freshnessLabel(position.timestamp, nowMs) : 'No AIS fix';
    const projectedDistance = projection.at(-1)
        ? `${(position!.sog * (projection.at(-1)!.minutes / 60)).toFixed(1)} nm`
        : 'Idle';
    const assetValue = assetName ? (vessel.nearestAssetDistanceNm != null ? `${vessel.nearestAssetDistanceNm.toFixed(2)} nm` : assetName) : 'None';

    return (
        <div
            className="pointer-events-none absolute bottom-10 left-1/2 z-50 w-80 -translate-x-1/2 overflow-hidden rounded-md border border-border bg-card/95 text-left text-[11px]/4 text-card-foreground shadow-xl shadow-slate-950/15 backdrop-blur"
            role="tooltip"
        >
            <div className="border-b border-border bg-background/75 px-3 py-2.5">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-sm border border-border bg-card">
                                <ShipIcon className="size-4" style={{ color: familyMeta.color }} aria-hidden />
                            </span>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold">{vessel.name || 'Unknown vessel'}</p>
                                <p className="truncate text-muted-foreground">{familyMeta.label} / {vessel.shipType || 'Unknown class'}</p>
                            </div>
                        </div>
                    </div>
                    <div className={cn('flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 font-semibold', RISK_TONE[vessel.riskLevel])}>
                        <span className={cn('size-1.5 rounded-full', RISK_DOT[vessel.riskLevel])} aria-hidden />
                        <span>{vessel.riskScore}</span>
                        <trend.Icon className="size-3.5" aria-label={trend.label} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-px bg-border text-[10px]">
                <PreviewTile Icon={HistoryIcon} label="Activity" value={aisStatus} />
                <PreviewTile Icon={BellIcon} label="Alerts" value={`${vessel.activeFactors.length}`} tone={vessel.activeFactors.length ? 'alert' : 'quiet'} />
                <PreviewTile Icon={RouteIcon} label="Projection" value={projectedDistance} />
            </div>

            <div className="grid gap-1.5 p-3">
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                    <PreviewDetail Icon={FlagIcon} label="Flag" value={vessel.flag || 'Unknown'} />
                    <PreviewDetail Icon={HashIcon} label="IMO" value={vessel.imo || 'Unknown'} />
                    <PreviewDetail Icon={SatelliteIcon} label="MMSI" value={vessel.mmsi} />
                    <PreviewDetail Icon={ShieldAlertIcon} label="Risk" value={trend.label} />
                    <PreviewDetail Icon={GaugeIcon} label="Speed" value={position ? `${position.sog.toFixed(1)} kn` : 'No fix'} />
                    <PreviewDetail
                        Icon={CompassIcon}
                        label="Course"
                        value={position ? `${String(Math.round(position.cog)).padStart(3, '0')} deg` : 'No fix'}
                    />
                    <PreviewDetail Icon={RadioTowerIcon} label="Radar" value={vessel.radarPosition ? 'Available' : 'No return'} />
                    <PreviewDetail Icon={MapPinnedIcon} label="Asset" value={assetValue} />
                </div>

                <div className="mt-1 flex items-start gap-2 rounded-sm border border-border bg-muted/60 p-2">
                    <ShieldAlertIcon className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
                    <p className="line-clamp-2 text-muted-foreground">{reason ?? 'No elevated factors'}</p>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-2 text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                        <WeightIcon className="size-3.5" aria-hidden />
                        {familyMeta.label} profile
                    </span>
                    <span className="font-medium text-foreground">Click for evidence</span>
                </div>
            </div>
        </div>
    );
}

function trendMeta(trend: WatchVessel['riskTrend']): { Icon: PreviewIcon; label: string } {
    if (trend === 'rising') return { Icon: ArrowUpRightIcon, label: 'Rising' };
    if (trend === 'falling') return { Icon: ArrowDownRightIcon, label: 'Falling' };
    return { Icon: ArrowRightIcon, label: 'Stable' };
}

function PreviewTile({ Icon, label, value, tone = 'quiet' }: { Icon: PreviewIcon; label: string; value: string; tone?: 'alert' | 'quiet' }) {
    return (
        <div className="min-w-0 bg-card px-2.5 py-2">
            <div className="flex items-center gap-1.5 text-muted-foreground">
                <Icon className={cn('size-3.5 shrink-0', tone === 'alert' ? 'text-primary' : null)} aria-hidden />
                <span className="font-medium uppercase tracking-wide">{label}</span>
            </div>
            <p className="mt-1 truncate font-semibold text-foreground">{value}</p>
        </div>
    );
}

function PreviewDetail({ Icon, label, value }: { Icon: PreviewIcon; label: string; value: string }) {
    return (
        <div className="flex min-w-0 items-center gap-2 rounded-sm bg-muted/40 px-2 py-1.5">
            <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
            <span className="shrink-0 font-semibold text-foreground">{label}</span>
            <span className="min-w-0 truncate text-muted-foreground">{value}</span>
        </div>
    );
}
