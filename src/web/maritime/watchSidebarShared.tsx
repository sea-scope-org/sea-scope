import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon } from 'lucide-react';
import { Badge } from '../components/base/badge';
import type { GqlCWatchFieldsFragment } from '../graphql/generated';
import { cn } from '../utils/cn';
import { protectedInfrastructureResolveName } from './useProtectedInfrastructure';

export type WatchState = GqlCWatchFieldsFragment;
export type Vessel = WatchState['vessels'][number];
export type Anomaly = WatchState['anomalies'][number];
export type OsintAlert = WatchState['osintAlerts'][number];
export type RiskEvent = WatchState['riskEvents'][number];
export type Incident = WatchState['incidents'][number];
export type RiskLevel = Vessel['riskLevel'];

export const LEVEL_ORDER: Record<RiskLevel, number> = { red: 0, orange: 1, yellow: 2, green: 3 };

export function assetName(vessel: Vessel, nameById: ReadonlyMap<string, string>): string | null {
    if (!vessel.nearestAssetId) return null;
    return protectedInfrastructureResolveName(vessel.nearestAssetId, nameById) ?? vessel.nearestAssetId;
}

export function riskBadgeClass(level: RiskLevel): string {
    if (level === 'red') return 'border-destructive/40 bg-destructive/10 text-destructive';
    if (level === 'orange') return 'border-orange-300 bg-orange-50 text-orange-800';
    if (level === 'yellow') return 'border-amber-300 bg-amber-50 text-amber-900';
    return 'border-emerald-300 bg-emerald-50 text-emerald-800';
}

export function RiskBadge({ level, score, trend }: { level: RiskLevel; score: number; trend: Vessel['riskTrend'] }) {
    return (
        <Badge
            variant="outline"
            className={cn(
                'inline-flex items-center gap-1 rounded-sm px-1.5 py-0 text-[10px] font-semibold tracking-wide uppercase',
                riskBadgeClass(level),
            )}
        >
            {level} {score}
            <TrendIcon trend={trend} />
        </Badge>
    );
}

export function TrendIcon({ trend }: { trend: Vessel['riskTrend'] }) {
    if (trend === 'rising') return <ArrowUpIcon className="size-3 shrink-0" aria-label="Rising" />;
    if (trend === 'falling') return <ArrowDownIcon className="size-3 shrink-0" aria-label="Falling" />;
    return <ArrowRightIcon className="size-3 shrink-0 opacity-70" aria-label="Stable" />;
}

export function riskAccentClass(level: RiskLevel): string {
    if (level === 'red') return 'border-l-destructive';
    if (level === 'orange') return 'border-l-orange-400';
    if (level === 'yellow') return 'border-l-amber-400';
    return 'border-l-emerald-400';
}
