import type { ComponentType, SVGProps } from 'react';
import {
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    Compass,
    Flag,
    Gauge,
    MapPinned,
    RadioTower,
    Route,
    Satellite,
    ShieldAlert,
    Ship,
    Waves,
} from 'lucide-react';
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

const TREND_META: Record<WatchVessel['riskTrend'], { Icon: PreviewIcon; label: string }> = {
    falling: { Icon: ArrowDownRight, label: 'Falling' },
    rising: { Icon: ArrowUpRight, label: 'Rising' },
    steady: { Icon: ArrowRight, label: 'Steady' },
};

export function VesselPreview({ vessel, nowMs, assetName }: { vessel: WatchVessel; nowMs: number; assetName: string | null }) {
    const position = vessel.position;
    const familyMeta = VESSEL_FAMILY_COLORS[vesselTypeNormalize(vessel.shipType)];
    const projection = vesselProjection(vessel, nowMs);
    const reason = vessel.activeFactors.at(-1)?.explanation;
    const trend = TREND_META[vessel.riskTrend];
    const aisStatus = vessel.aisDark ? 'AIS dark' : position ? freshnessLabel(position.timestamp, nowMs) : 'No AIS fix';

    return (
        <div
            className="pointer-events-none absolute bottom-10 left-1/2 z-50 w-72 -translate-x-1/2 overflow-hidden rounded-md border border-border bg-card/95 text-left text-[11px]/4 text-card-foreground shadow-lg shadow-slate-950/10 backdrop-blur"
            role="tooltip"
        >
            <div className="flex items-start justify-between gap-3 border-b border-border bg-background/70 p-3">
                <div className="min-w-0">
                    <p className="truncate text-xs font-semibold">{vessel.name || 'Unknown vessel'}</p>
                    <div className="mt-1 flex items-center gap-1.5 text-muted-foreground">
                        <span className="size-2 rounded-full" style={{ backgroundColor: familyMeta.color }} aria-hidden />
                        <span className="truncate">
                            {familyMeta.label} · {vessel.shipType || 'Unknown'}
                        </span>
                    </div>
                </div>
                <div
                    className={cn(
                        'flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 font-semibold',
                        RISK_TONE[vessel.riskLevel],
                    )}
                >
                    <ShieldAlert className="size-3.5" aria-hidden />
                    <span>{vessel.riskScore}</span>
                    <trend.Icon className="size-3.5" aria-label={trend.label} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-px bg-border text-[10px]">
                <PreviewMetric Icon={Flag} label="Flag" value={vessel.flag || 'Unknown'} />
                <PreviewMetric Icon={Ship} label="MMSI" value={vessel.mmsi} />
                {vessel.imo ? <PreviewMetric Icon={Waves} label="IMO" value={vessel.imo} /> : null}
                <PreviewMetric Icon={Gauge} label="Speed" value={position ? `${position.sog.toFixed(1)} kn` : 'No fix'} />
                <PreviewMetric
                    Icon={Compass}
                    label="Course"
                    value={position ? `${String(Math.round(position.cog)).padStart(3, '0')} deg` : 'No fix'}
                />
                <PreviewMetric Icon={vessel.aisDark ? RadioTower : Satellite} label="AIS" value={aisStatus} />
                {vessel.radarPosition ? <PreviewMetric Icon={RadioTower} label="Radar" value="Available" /> : null}
                {assetName ? (
                    <PreviewMetric
                        Icon={MapPinned}
                        label="Asset"
                        value={vessel.nearestAssetDistanceNm != null ? `${vessel.nearestAssetDistanceNm.toFixed(2)} nm` : assetName}
                    />
                ) : null}
            </div>

            <div className="space-y-2 p-3">
                <div className="flex items-start gap-2 rounded-sm bg-muted/70 p-2">
                    <ShieldAlert className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
                    <p className="line-clamp-2 text-muted-foreground">{reason ?? 'No elevated factors'}</p>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                        <Route className="size-3.5" aria-hidden />
                        {projection.length ? '+10 / +20 min projection' : 'No projection'}
                    </span>
                    <span className="font-medium text-foreground">Click for evidence</span>
                </div>
            </div>
        </div>
    );
}

function PreviewMetric({ Icon, label, value }: { Icon: PreviewIcon; label: string; value: string }) {
    return (
        <div className="min-w-0 bg-card px-2.5 py-2">
            <div className="flex items-center gap-1.5 text-muted-foreground">
                <Icon className="size-3.5 shrink-0" aria-hidden />
                <span className="font-medium uppercase tracking-wide">{label}</span>
            </div>
            <p className="mt-1 truncate font-semibold text-foreground">{value}</p>
        </div>
    );
}
