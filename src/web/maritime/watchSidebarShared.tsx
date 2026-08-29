import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon, LinkIcon } from 'lucide-react';
import { Alert, AlertDescription } from '../components/base/alert';
import { Badge } from '../components/base/badge';
import type { GqlCVesselIntelligence, GqlCWatchFieldsFragment } from '../graphql/generated';
import { cn } from '../utils/cn';

export type WatchState = GqlCWatchFieldsFragment;
export type Vessel = WatchState['vessels'][number];
export type Anomaly = WatchState['anomalies'][number];
export type OsintAlert = WatchState['osintAlerts'][number];
export type RiskEvent = WatchState['riskEvents'][number];
export type Incident = WatchState['incidents'][number];
export type RiskLevel = Vessel['riskLevel'];

export const LEVEL_ORDER: Record<RiskLevel, number> = { red: 0, orange: 1, yellow: 2, green: 3 };

export function assetName(vessel: Vessel, assetsById: Map<string, WatchState['protectedAssets'][number]>): string | null {
    if (!vessel.nearestAssetId) return null;
    return assetsById.get(vessel.nearestAssetId)?.name ?? vessel.nearestAssetId;
}

export function riskBadgeClass(level: RiskLevel): string {
    if (level === 'red') return 'border-destructive/40 bg-destructive/10 text-destructive';
    if (level === 'orange') return 'border-orange-300 bg-orange-50 text-orange-800';
    if (level === 'yellow') return 'border-amber-300 bg-amber-50 text-amber-900';
    return 'border-emerald-300 bg-emerald-50 text-emerald-800';
}

export function RiskBadge({ level, score }: { level: RiskLevel; score: number }) {
    return (
        <Badge
            variant="outline"
            className={cn('rounded-sm px-1.5 py-0 text-[10px] font-semibold tracking-wide uppercase', riskBadgeClass(level))}
        >
            {level} {score}
        </Badge>
    );
}

export function TrendIcon({ trend }: { trend: Vessel['riskTrend'] }) {
    if (trend === 'rising') return <ArrowUpIcon className="size-3 text-destructive" aria-label="Rising" />;
    if (trend === 'falling') return <ArrowDownIcon className="size-3 text-emerald-700" aria-label="Falling" />;
    return <ArrowRightIcon className="size-3 text-muted-foreground" aria-label="Stable" />;
}

export function riskAccentClass(level: RiskLevel): string {
    if (level === 'red') return 'border-l-destructive';
    if (level === 'orange') return 'border-l-orange-400';
    if (level === 'yellow') return 'border-l-amber-400';
    return 'border-l-emerald-400';
}

export function IntelligenceBrief({ intelligence }: { intelligence: GqlCVesselIntelligence }) {
    return (
        <div className="flex flex-col gap-3">
            <Alert className="border-primary/30 bg-primary/5 px-2.5 py-2">
                <Badge
                    variant="outline"
                    className="col-span-full mb-1 rounded-sm border-primary/40 bg-transparent px-0 text-[10px] font-semibold tracking-wider text-primary uppercase"
                >
                    {intelligence.status}
                </Badge>
                <AlertDescription className="col-span-full text-xs text-foreground">{intelligence.summary}</AlertDescription>
            </Alert>

            <div>
                <p className="mb-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Why flagged</p>
                <p className="text-xs text-foreground">{intelligence.whyFlagged}</p>
            </div>

            {intelligence.citations.length > 0 ? (
                <div>
                    <p className="mb-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Citations</p>
                    <ul className="flex flex-col gap-1">
                        {intelligence.citations.map((citation) => (
                            <li
                                key={`${citation.label}-${citation.source}`}
                                className="flex items-start gap-1.5 text-[11px] text-muted-foreground"
                            >
                                <LinkIcon className="mt-0.5 size-3 shrink-0 text-primary" aria-hidden />
                                <span>
                                    <span className="text-foreground">{citation.label}</span>
                                    <span className="text-muted-foreground"> — {citation.source}</span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : null}

            {intelligence.playbookSteps.length > 0 ? (
                <div>
                    <p className="mb-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                        Recommended verification
                    </p>
                    <ol className="flex list-decimal flex-col gap-1 pl-4 text-[11px] text-foreground">
                        {intelligence.playbookSteps.map((step) => (
                            <li key={step}>{step}</li>
                        ))}
                    </ol>
                </div>
            ) : null}
        </div>
    );
}
