import {
    AlertTriangleIcon,
    ArrowDownIcon,
    ArrowRightIcon,
    ArrowUpIcon,
    BookOpenIcon,
    LinkIcon,
    RadarIcon,
    ShieldAlertIcon,
    ShipIcon,
    SparklesIcon,
} from 'lucide-react';
import type { PropsWithChildren, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../components/base/alert';
import { Badge } from '../components/base/badge';
import { Button } from '../components/base/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/base/card';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia } from '../components/base/empty';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarRail,
    SidebarSeparator,
} from '../components/base/sidebar';
import { Spinner } from '../components/base/spinner';
import type { GqlCVesselIntelligence, GqlCWatchFieldsFragment } from '../graphql/generated';
import { cn } from '../utils/cn';

type WatchState = GqlCWatchFieldsFragment;
type Vessel = WatchState['vessels'][number];
type Anomaly = WatchState['anomalies'][number];
type OsintAlert = WatchState['osintAlerts'][number];
type RiskEvent = WatchState['riskEvents'][number];
type Incident = WatchState['incidents'][number];
type RiskLevel = Vessel['riskLevel'];

const LEVEL_ORDER: Record<RiskLevel, number> = { red: 0, orange: 1, yellow: 2, green: 3 };

export interface IntelligenceSidebarProps {
    watch: WatchState | null;
    intelligence: GqlCVesselIntelligence | null;
    intelligenceBusy: boolean;
    onRequestIntelligence: (mmsi: string) => void;
    onSelectVessel: (mmsi: string) => void;
    onAcknowledgeAlert: (incidentId: string) => void;
    onClearSelection: () => void;
    className?: string;
}

export function IntelligenceSidebar({
    watch,
    intelligence,
    intelligenceBusy,
    onRequestIntelligence,
    onSelectVessel,
    onAcknowledgeAlert,
    onClearSelection,
    className,
}: IntelligenceSidebarProps) {
    const selectedMmsi = watch?.selectedMmsi ?? null;
    const vessel = selectedMmsi ? (watch?.vessels.find((v) => v.mmsi === selectedMmsi) ?? null) : null;
    const vesselAnomalies = selectedMmsi ? (watch?.anomalies.filter((a) => a.mmsi === selectedMmsi) ?? []) : [];
    const vesselRiskEvents = selectedMmsi ? (watch?.riskEvents.filter((e) => e.mmsi === selectedMmsi) ?? []) : [];
    const vesselIncident = selectedMmsi ? (watch?.incidents.find((i) => i.mmsi === selectedMmsi && i.status !== 'closed') ?? null) : null;
    const osintAlerts = watch?.osintAlerts ?? [];
    const briefForSelection = intelligence && selectedMmsi && intelligence.mmsi === selectedMmsi ? intelligence : null;
    const assetsById = new Map((watch?.protectedAssets ?? []).map((a) => [a.assetId, a]));
    const vesselsByMmsi = new Map((watch?.vessels ?? []).map((v) => [v.mmsi, v]));

    const attention = [...(watch?.vessels ?? [])]
        .filter((v) => v.riskLevel !== 'green')
        .sort((a, b) => LEVEL_ORDER[a.riskLevel] - LEVEL_ORDER[b.riskLevel] || b.riskScore - a.riskScore);

    const openAlerts = (watch?.incidents ?? []).filter((i) => i.status === 'open');

    const bandCounts = {
        green: 0,
        yellow: 0,
        orange: 0,
        red: 0,
        total: watch?.vessels.length ?? 0,
    };
    for (const v of watch?.vessels ?? []) {
        bandCounts[v.riskLevel] += 1;
    }

    return (
        <Sidebar side="right" collapsible="offcanvas" className={className}>
            <SidebarHeader className="flex-row items-center gap-2 border-b border-sidebar-border px-4 py-3">
                <RadarIcon className="size-4 text-primary" aria-hidden />
                <h2 className="text-xs font-semibold tracking-[0.14em] text-foreground uppercase">
                    {vessel ? 'Investigation' : 'Needs attention'}
                </h2>
                {vessel ? (
                    <Button type="button" size="xs" variant="ghost" className="ml-auto" onClick={onClearSelection}>
                        Back to queue
                    </Button>
                ) : null}
            </SidebarHeader>

            <SidebarContent className="gap-0 p-0">
                <div className="flex flex-col gap-5 p-4">
                    {vessel ? (
                        <>
                            <VesselCard vessel={vessel} assetName={assetName(vessel, assetsById)} />

                            <IntelGroup
                                title="Why this vessel matters"
                                icon={<ShieldAlertIcon className="size-3.5 text-destructive" aria-hidden />}
                            >
                                <WhySection vessel={vessel} />
                            </IntelGroup>

                            <IntelGroup title="Risk evolution" icon={<ArrowUpIcon className="size-3.5 text-amber-700" aria-hidden />}>
                                {vesselRiskEvents.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">No score changes yet.</p>
                                ) : (
                                    <ul className="flex flex-col gap-1.5">
                                        {vesselRiskEvents.slice(-8).map((event) => (
                                            <RiskEventRow key={event.riskEventId} event={event} />
                                        ))}
                                    </ul>
                                )}
                            </IntelGroup>

                            {vesselIncident ? (
                                <IntelGroup
                                    title="Incident timeline"
                                    icon={<AlertTriangleIcon className="size-3.5 text-destructive" aria-hidden />}
                                >
                                    <IncidentBlock incident={vesselIncident} onAcknowledge={onAcknowledgeAlert} />
                                </IntelGroup>
                            ) : null}

                            <IntelGroup title="Anomalies" icon={<AlertTriangleIcon className="size-3.5 text-amber-700" aria-hidden />}>
                                {vesselAnomalies.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">No anomalies for this contact.</p>
                                ) : (
                                    <ul className="flex flex-col gap-2">
                                        {vesselAnomalies.map((anomaly) => (
                                            <AnomalyRow key={anomaly.anomalyId} anomaly={anomaly} />
                                        ))}
                                    </ul>
                                )}
                            </IntelGroup>

                            <IntelGroup
                                title="AI briefing"
                                icon={<SparklesIcon className="size-3.5 text-primary" aria-hidden />}
                                action={
                                    <Button
                                        type="button"
                                        size="xs"
                                        variant="outline"
                                        disabled={intelligenceBusy}
                                        onClick={() => onRequestIntelligence(vessel.mmsi)}
                                    >
                                        {intelligenceBusy ? (
                                            <>
                                                <Spinner data-icon="inline-start" aria-hidden />
                                                Running…
                                            </>
                                        ) : (
                                            'Request briefing'
                                        )}
                                    </Button>
                                }
                            >
                                {briefForSelection ? (
                                    <IntelligenceBrief intelligence={briefForSelection} />
                                ) : intelligenceBusy ? (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Spinner className="size-3.5" aria-hidden />
                                        Generating briefing…
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground">No briefing yet — request starts the analysis.</p>
                                )}
                            </IntelGroup>
                        </>
                    ) : (
                        <>
                            <IntelGroup title="Needs attention" icon={<ShieldAlertIcon className="size-3.5 text-amber-700" aria-hidden />}>
                                {attention.length === 0 ? (
                                    <EmptyState />
                                ) : (
                                    <ul className="flex flex-col gap-2">
                                        {attention.map((v) => (
                                            <AttentionCard
                                                key={v.mmsi}
                                                vessel={v}
                                                assetName={assetName(v, assetsById)}
                                                onSelect={() => onSelectVessel(v.mmsi)}
                                            />
                                        ))}
                                    </ul>
                                )}
                            </IntelGroup>

                            <IntelGroup
                                title="Active alerts"
                                icon={<AlertTriangleIcon className="size-3.5 text-destructive" aria-hidden />}
                            >
                                {openAlerts.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">No unacknowledged Red alerts.</p>
                                ) : (
                                    <ul className="flex flex-col gap-2">
                                        {openAlerts.map((incident) => {
                                            const v = vesselsByMmsi.get(incident.mmsi);
                                            return (
                                                <li key={incident.incidentId}>
                                                    <Alert variant="destructive" className="px-2.5 py-2">
                                                        <AlertTitle className="col-span-full text-xs font-medium">
                                                            {v?.name ?? incident.mmsi} — {incident.maxRiskScore}
                                                        </AlertTitle>
                                                        <AlertDescription className="col-span-full text-[11px]">
                                                            {incident.timeline[incident.timeline.length - 1]?.explanation ??
                                                                'Risk exceeded Red threshold'}
                                                        </AlertDescription>
                                                        <div className="col-span-full mt-2 flex gap-2">
                                                            <Button
                                                                type="button"
                                                                size="xs"
                                                                variant="outline"
                                                                onClick={() => onSelectVessel(incident.mmsi)}
                                                            >
                                                                Investigate
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                size="xs"
                                                                variant="destructive"
                                                                onClick={() => onAcknowledgeAlert(incident.incidentId)}
                                                            >
                                                                Acknowledge
                                                            </Button>
                                                        </div>
                                                    </Alert>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </IntelGroup>

                            <SystemSummary counts={bandCounts} assetCount={watch?.protectedAssets.length ?? 0} />
                        </>
                    )}

                    <IntelGroup title="OSINT alerts" icon={<BookOpenIcon className="size-3.5 text-amber-700" aria-hidden />}>
                        {osintAlerts.length === 0 ? (
                            <p className="text-xs text-muted-foreground">No alerts in this scenario.</p>
                        ) : (
                            <ul className="flex flex-col gap-2">
                                {osintAlerts.map((alert) => (
                                    <OsintRow key={alert.alertId} alert={alert} />
                                ))}
                            </ul>
                        )}
                    </IntelGroup>
                </div>
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    );
}

function assetName(vessel: Vessel, assetsById: Map<string, WatchState['protectedAssets'][number]>): string | null {
    if (!vessel.nearestAssetId) return null;
    return assetsById.get(vessel.nearestAssetId)?.name ?? vessel.nearestAssetId;
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

function AttentionCard({ vessel, assetName: asset, onSelect }: { vessel: Vessel; assetName: string | null; onSelect: () => void }) {
    const reasons = vessel.activeFactors.slice(-3).reverse();
    return (
        <li>
            <button
                type="button"
                onClick={onSelect}
                className={cn(
                    'w-full rounded-md border px-2.5 py-2 text-left transition-colors outline-none',
                    'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
                    'active:bg-muted',
                    vessel.riskLevel === 'red'
                        ? 'border-destructive/40 bg-destructive/5 hover:bg-destructive/10 active:bg-destructive/15'
                        : vessel.riskLevel === 'orange'
                          ? 'border-orange-300 bg-orange-50 hover:bg-orange-100/80 active:bg-orange-100'
                          : 'border-amber-300 bg-amber-50 hover:bg-amber-100/80 active:bg-amber-100',
                )}
            >
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <p className="text-xs font-semibold text-foreground">{vessel.name}</p>
                        {asset ? <p className="text-[10px] text-primary">{asset}</p> : null}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <TrendIcon trend={vessel.riskTrend} />
                        <RiskBadge level={vessel.riskLevel} score={vessel.riskScore} />
                    </div>
                </div>
                {reasons.length > 0 ? (
                    <ul className="mt-1.5 flex flex-col gap-0.5">
                        {reasons.map((r) => (
                            <li key={r.rule} className="truncate text-[11px] text-muted-foreground">
                                · {r.explanation}
                            </li>
                        ))}
                    </ul>
                ) : null}
            </button>
        </li>
    );
}

function WhySection({ vessel }: { vessel: Vessel }) {
    const factors = [...vessel.activeFactors].reverse();
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <RiskBadge level={vessel.riskLevel} score={vessel.riskScore} />
                <span className="text-[11px] text-muted-foreground">
                    {vessel.riskTrend === 'rising' ? 'Rising' : vessel.riskTrend === 'falling' ? 'Falling' : 'Stable'}
                </span>
            </div>
            {factors.length === 0 ? (
                <p className="text-xs text-muted-foreground">Baseline monitoring — no elevated factors.</p>
            ) : (
                <ul className="flex flex-col gap-1">
                    {factors.map((f) => (
                        <li key={f.rule} className="flex gap-2 text-[11px] text-foreground">
                            <span className="font-mono text-amber-700">+{f.scoreDelta}</span>
                            <span>{f.explanation}</span>
                        </li>
                    ))}
                </ul>
            )}
            {vessel.nearestAssetDistanceNm != null && vessel.nearestAssetId ? (
                <p className="text-[11px] text-primary">
                    Nearest asset distance: {vessel.nearestAssetDistanceNm.toFixed(2)} nm
                    {vessel.radarPosition ? ' · Simulated radar track active' : ''}
                </p>
            ) : null}
        </div>
    );
}

function RiskEventRow({ event }: { event: RiskEvent }) {
    const simMin = Math.floor(event.detectedAtSimMs / 60_000);
    return (
        <li className="flex gap-2 font-mono text-[11px] text-muted-foreground">
            <span className="shrink-0">T+{String(simMin).padStart(2, '0')}m</span>
            <span className="text-foreground">
                {event.previousScore} → {event.newScore}
            </span>
            <span className="truncate">{event.explanation}</span>
        </li>
    );
}

function IncidentBlock({ incident, onAcknowledge }: { incident: Incident; onAcknowledge: (id: string) => void }) {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
                <Badge
                    variant="outline"
                    className={cn(
                        'rounded-sm text-[10px] uppercase',
                        incident.status === 'open' ? 'border-destructive/40 text-destructive' : 'text-muted-foreground',
                    )}
                >
                    {incident.status}
                </Badge>
                {incident.status === 'open' ? (
                    <Button type="button" size="xs" variant="destructive" onClick={() => onAcknowledge(incident.incidentId)}>
                        Acknowledge
                    </Button>
                ) : null}
            </div>
            <ul className="flex flex-col gap-1.5">
                {incident.timeline.map((e) => (
                    <li key={e.eventId} className="text-[11px] text-muted-foreground">
                        <span className="font-mono">T+{Math.floor(e.detectedAtSimMs / 60_000)}m</span>{' '}
                        <span className="text-foreground">{e.eventType}</span> — {e.explanation}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function SystemSummary({
    counts,
    assetCount,
}: {
    counts: { total: number; green: number; yellow: number; orange: number; red: number };
    assetCount: number;
}) {
    return (
        <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
            <p className="mb-1 text-[10px] font-semibold tracking-wider text-foreground uppercase">System summary</p>
            <p>
                {counts.total} vessels · {counts.red} red / {counts.orange} orange / {counts.yellow} yellow / {counts.green} green
            </p>
            <p className="mt-0.5">
                Sensors: AIS live · Radar sim · EO sim · {assetCount} protected asset{assetCount === 1 ? '' : 's'}
            </p>
        </div>
    );
}

function VesselCard({ vessel, assetName: asset }: { vessel: Vessel; assetName: string | null }) {
    const position = vessel.position;
    return (
        <Card className="gap-2 rounded-md py-0 shadow-none">
            <CardHeader className="gap-1 px-3 pt-3 [.border-b]:pb-0">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <CardDescription className="font-mono text-[10px] tracking-wider uppercase">
                            MMSI {vessel.mmsi}
                            {vessel.imo ? ` · IMO ${vessel.imo}` : ''}
                        </CardDescription>
                        <CardTitle className="text-sm font-semibold">{vessel.name}</CardTitle>
                        {asset ? <p className="text-[10px] text-primary">{asset}</p> : null}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <RiskBadge level={vessel.riskLevel} score={vessel.riskScore} />
                        {vessel.aisDark ? (
                            <Badge
                                variant="destructive"
                                className="rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase"
                            >
                                AIS DARK
                            </Badge>
                        ) : null}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-3 pb-3">
                <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                    <Field label="Type" value={vessel.shipType} />
                    <Field label="Flag" value={vessel.flag} />
                    <Field label="SOG" value={position ? `${position.sog.toFixed(1)} kn` : '—'} />
                    <Field label="COG" value={position ? `${Math.round(position.cog)}°` : '—'} />
                    <Field label="Heading" value={position ? `${Math.round(position.heading)}°` : '—'} />
                    <Field label="Position" value={position ? `${position.lat.toFixed(3)}, ${position.lon.toFixed(3)}` : '—'} />
                </dl>
            </CardContent>
        </Card>
    );
}

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-mono text-foreground">{value}</dd>
        </div>
    );
}

function RiskBadge({ level, score }: { level: RiskLevel; score: number }) {
    const cls =
        level === 'red'
            ? 'border-destructive/40 bg-destructive/10 text-destructive'
            : level === 'orange'
              ? 'border-orange-300 bg-orange-50 text-orange-800'
              : level === 'yellow'
                ? 'border-amber-300 bg-amber-50 text-amber-900'
                : 'border-emerald-300 bg-emerald-50 text-emerald-800';
    return (
        <Badge variant="outline" className={cn('rounded-sm px-1.5 py-0 text-[10px] font-semibold tracking-wide uppercase', cls)}>
            {level} {score}
        </Badge>
    );
}

function TrendIcon({ trend }: { trend: Vessel['riskTrend'] }) {
    if (trend === 'rising') return <ArrowUpIcon className="size-3 text-destructive" aria-label="Rising" />;
    if (trend === 'falling') return <ArrowDownIcon className="size-3 text-emerald-700" aria-label="Falling" />;
    return <ArrowRightIcon className="size-3 text-muted-foreground" aria-label="Stable" />;
}

function AnomalyRow({ anomaly }: { anomaly: Anomaly }) {
    const severityClass =
        anomaly.severity === 'critical'
            ? 'border-destructive/40 bg-destructive/5'
            : anomaly.severity === 'high'
              ? 'border-amber-300 bg-amber-50'
              : 'border-border bg-muted/40';

    return (
        <li>
            <Alert
                variant={anomaly.severity === 'critical' ? 'destructive' : 'default'}
                className={cn('gap-y-1 px-2.5 py-2', severityClass)}
            >
                <div className="col-span-full flex items-center justify-between gap-2">
                    <Badge
                        variant="outline"
                        className="rounded-sm border-current/30 bg-transparent px-1.5 py-0 text-[10px] font-semibold tracking-wider uppercase"
                    >
                        {anomaly.severity}
                    </Badge>
                    <span className="font-mono text-[10px] text-muted-foreground">{anomaly.kind}</span>
                </div>
                <AlertTitle className="col-span-full line-clamp-none text-xs font-medium">{anomaly.title}</AlertTitle>
                <AlertDescription className="col-span-full text-[11px]">{anomaly.summary}</AlertDescription>
            </Alert>
        </li>
    );
}

function OsintRow({ alert }: { alert: OsintAlert }) {
    return (
        <li>
            <Alert className="border-amber-300 bg-amber-50 px-2.5 py-2 text-amber-950">
                <div className="col-span-full flex items-center justify-between gap-2 text-[10px] tracking-wide text-amber-800 uppercase">
                    <span>{alert.source}</span>
                    <span>{alert.region}</span>
                </div>
                <AlertTitle className="col-span-full line-clamp-none text-xs font-medium text-amber-950">{alert.title}</AlertTitle>
                <AlertDescription className="col-span-full text-[11px] text-amber-900/80">{alert.body}</AlertDescription>
            </Alert>
        </li>
    );
}

function IntelligenceBrief({ intelligence }: { intelligence: GqlCVesselIntelligence }) {
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

function IntelGroup({
    title,
    icon,
    action,
    children,
}: PropsWithChildren<{
    title: string;
    icon: ReactNode;
    action?: ReactNode;
}>) {
    return (
        <SidebarGroup className="gap-2 p-0">
            <div className="flex items-center justify-between gap-2">
                <SidebarGroupLabel className="h-auto gap-1.5 p-0 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                    {icon}
                    {title}
                </SidebarGroupLabel>
                {action}
            </div>
            <SidebarSeparator className="mx-0" />
            <SidebarGroupContent className="text-sm">{children}</SidebarGroupContent>
        </SidebarGroup>
    );
}
