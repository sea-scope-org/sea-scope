import { ChevronDownIcon, LinkIcon, LocateFixedIcon } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription } from '../components/base/alert';
import { Badge } from '../components/base/badge';
import { Button } from '../components/base/button';
import { Skeleton } from '../components/base/skeleton';
import type { GqlCVesselIntelligence } from '../graphql/generated';
import { cn } from '../utils/cn';
import { assetName, RiskBadge, TrendIcon } from './watchSidebarShared';
import type { Anomaly, Incident, RiskEvent, Vessel, WatchState } from './watchSidebarShared';

type EvidencePanel = 'timeline' | 'anomalies';

export interface WatchCaseProps {
    watch: WatchState;
    vessel: Vessel;
    /** True when showing a last-known vessel that is no longer on the live board. */
    contactMissing?: boolean;
    intelligence: GqlCVesselIntelligence | null;
    intelligenceBusy: boolean;
    onRequestIntelligence: (mmsi: string) => void;
    onLocateOnChart: () => void;
    onAcknowledgeAlert: (incidentId: string) => void;
}

export function WatchCase({
    watch,
    vessel,
    contactMissing = false,
    intelligence,
    intelligenceBusy,
    onRequestIntelligence,
    onLocateOnChart,
    onAcknowledgeAlert,
}: WatchCaseProps) {
    const assetsById = new Map(watch.protectedAssets.map((a) => [a.assetId, a]));
    const asset = assetName(vessel, assetsById);
    const vesselAnomalies = watch.anomalies.filter((a) => a.mmsi === vessel.mmsi);
    const vesselRiskEvents = watch.riskEvents.filter((e) => e.mmsi === vessel.mmsi);
    const vesselIncident = watch.incidents.find((i) => i.mmsi === vessel.mmsi && i.status !== 'closed') ?? null;
    const briefForSelection = intelligence && intelligence.mmsi === vessel.mmsi ? intelligence : null;
    const briefStreaming = Boolean(briefForSelection && !briefForSelection.complete);

    const [panel, setPanel] = useState<EvidencePanel>('timeline');
    const [navOpen, setNavOpen] = useState(false);

    const factors = [...vessel.activeFactors].reverse().slice(0, 3);

    const requestBriefing = () => {
        onRequestIntelligence(vessel.mmsi);
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="shrink-0 space-y-3 border-b border-sidebar-border px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <p className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                            MMSI {vessel.mmsi}
                            {vessel.imo ? ` · IMO ${vessel.imo}` : ''}
                        </p>
                        <h3 className="truncate text-sm font-semibold text-foreground">{vessel.name}</h3>
                        {asset ? (
                            <p className="truncate text-[11px] text-primary">
                                {asset}
                                {vessel.nearestAssetDistanceNm != null ? ` · ${vessel.nearestAssetDistanceNm.toFixed(2)} nm` : ''}
                            </p>
                        ) : null}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5">
                            <TrendIcon trend={vessel.riskTrend} />
                            <RiskBadge level={vessel.riskLevel} score={vessel.riskScore} />
                        </div>
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

                {contactMissing ? (
                    <p className="text-[11px] text-amber-800">Contact left the live board — showing last known state.</p>
                ) : null}

                <div>
                    <button
                        type="button"
                        className="flex w-full items-center justify-between gap-2 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase hover:text-foreground"
                        aria-expanded={navOpen}
                        onClick={() => setNavOpen((open) => !open)}
                    >
                        Nav data
                        <ChevronDownIcon className={cn('size-3.5 transition-transform', navOpen ? 'rotate-180' : null)} aria-hidden />
                    </button>
                    {navOpen ? <NavData vessel={vessel} /> : null}
                </div>

                <div>
                    <p className="mb-1.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Why now</p>
                    {factors.length === 0 ? (
                        <p className="text-xs text-muted-foreground">Baseline monitoring — no elevated factors.</p>
                    ) : (
                        <ul className="flex flex-col gap-1">
                            {factors.map((f) => (
                                <li key={f.rule} className="flex gap-2 text-[11px] text-foreground">
                                    <span className="shrink-0 font-mono text-amber-700">+{f.scoreDelta}</span>
                                    <span>{f.explanation}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button type="button" size="xs" disabled={intelligenceBusy || contactMissing} onClick={requestBriefing}>
                        {intelligenceBusy ? 'Generating…' : 'Request briefing'}
                    </Button>
                    {vesselIncident?.status === 'open' ? (
                        <Button type="button" size="xs" variant="destructive" onClick={() => onAcknowledgeAlert(vesselIncident.incidentId)}>
                            Acknowledge
                        </Button>
                    ) : null}
                    <Button type="button" size="xs" variant="outline" onClick={onLocateOnChart} disabled={contactMissing}>
                        <LocateFixedIcon data-icon="inline-start" aria-hidden />
                        Locate on chart
                    </Button>
                </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 flex-1 overflow-y-auto">
                    <IntelligenceStage intelligence={briefForSelection} busy={intelligenceBusy || briefStreaming} />

                    <EvidenceTabs panel={panel} onPanelChange={setPanel} anomalyCount={vesselAnomalies.length} />
                    <div className="px-4 py-3">
                        {panel === 'timeline' ? <TimelinePanel riskEvents={vesselRiskEvents} incident={vesselIncident} /> : null}
                        {panel === 'anomalies' ? <AnomaliesPanel anomalies={vesselAnomalies} /> : null}
                    </div>
                </div>
            </div>
        </div>
    );
}

function NavData({ vessel }: { vessel: Vessel }) {
    const position = vessel.position;
    const sourceLabel = vessel.dataSource === 'aisstream' ? 'Live AIS' : 'Demo mock';
    return (
        <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
            <Field label="Source" value={sourceLabel} />
            <Field label="Type" value={vessel.shipType} />
            <Field label="Flag" value={vessel.flag} />
            <Field label="SOG" value={position ? `${position.sog.toFixed(1)} kn` : '—'} />
            <Field label="COG" value={position ? `${Math.round(position.cog)}°` : '—'} />
            <Field label="Heading" value={position ? `${Math.round(position.heading)}°` : '—'} />
            <Field label="Position" value={position ? `${position.lat.toFixed(3)}, ${position.lon.toFixed(3)}` : '—'} />
        </dl>
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

function EvidenceTabs({
    panel,
    onPanelChange,
    anomalyCount,
}: {
    panel: EvidencePanel;
    onPanelChange: (panel: EvidencePanel) => void;
    anomalyCount: number;
}) {
    const tabs: { id: EvidencePanel; label: string }[] = [
        { id: 'timeline', label: 'Timeline' },
        { id: 'anomalies', label: anomalyCount > 0 ? `Anomalies (${anomalyCount})` : 'Anomalies' },
    ];

    return (
        <div role="tablist" aria-label="Evidence" className="flex shrink-0 gap-0 border-y border-sidebar-border px-2">
            {tabs.map((tab) => {
                const selected = panel === tab.id;
                return (
                    <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        className={cn(
                            '-mb-px border-b-2 px-3 py-2 text-[11px] font-semibold tracking-wide uppercase transition-colors',
                            selected ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground',
                        )}
                        onClick={() => onPanelChange(tab.id)}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}

type TimelineEntry = {
    key: string;
    simMs: number;
    kind: string;
    text: string;
};

function TimelinePanel({ riskEvents, incident }: { riskEvents: RiskEvent[]; incident: Incident | null }) {
    const entries: TimelineEntry[] = [
        ...riskEvents.map((event) => ({
            key: event.riskEventId,
            simMs: event.detectedAtSimMs,
            kind: 'Score',
            text: `${event.previousScore} → ${event.newScore} — ${event.explanation}`,
        })),
        ...(incident?.timeline ?? []).map((e) => ({
            key: e.eventId,
            simMs: e.detectedAtSimMs,
            kind: e.eventType,
            text: e.explanation,
        })),
    ].sort((a, b) => a.simMs - b.simMs);

    if (entries.length === 0) {
        return <p className="text-xs text-muted-foreground">No timeline events yet.</p>;
    }

    return (
        <ul className="flex flex-col gap-2">
            {entries.map((entry) => (
                <li key={entry.key} className="text-[11px] text-muted-foreground">
                    <span className="font-mono text-foreground">T+{Math.floor(entry.simMs / 60_000)}m</span>{' '}
                    <span className="font-medium text-foreground">{entry.kind}</span> — {entry.text}
                </li>
            ))}
        </ul>
    );
}

function AnomaliesPanel({ anomalies }: { anomalies: Anomaly[] }) {
    if (anomalies.length === 0) {
        return <p className="text-xs text-muted-foreground">No anomalies for this contact.</p>;
    }

    return (
        <ul className="flex flex-col gap-2">
            {anomalies.map((anomaly) => (
                <li
                    key={anomaly.anomalyId}
                    className={cn(
                        'rounded-md border border-l-2 border-border px-2.5 py-2',
                        anomaly.severity === 'critical'
                            ? 'border-l-destructive'
                            : anomaly.severity === 'high'
                              ? 'border-l-amber-400'
                              : 'border-l-border',
                    )}
                >
                    <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className="rounded-sm px-1.5 py-0 text-[10px] font-semibold tracking-wider uppercase">
                            {anomaly.severity}
                        </Badge>
                        <span className="font-mono text-[10px] text-muted-foreground">{anomaly.kind}</span>
                    </div>
                    <p className="mt-1 text-xs font-medium text-foreground">{anomaly.title}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{anomaly.summary}</p>
                </li>
            ))}
        </ul>
    );
}

function IntelligenceStage({ intelligence, busy }: { intelligence: GqlCVesselIntelligence | null; busy: boolean }) {
    return (
        <section className="border-b border-sidebar-border px-4 py-3" aria-busy={busy} aria-live="polite">
            <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Intelligence</p>
                {busy ? <span className="shimmer text-[11px] text-muted-foreground">Analyzing contact…</span> : null}
            </div>
            {intelligence ? (
                <IntelligenceBrief intelligence={intelligence} streaming={busy || !intelligence.complete} />
            ) : busy ? (
                <BriefSkeleton />
            ) : (
                <p className="text-xs text-muted-foreground">No briefing yet — request starts the analysis.</p>
            )}
        </section>
    );
}

function BriefSkeleton() {
    return (
        <div className="flex flex-col gap-3" aria-hidden>
            <div className="rounded-md border border-primary/20 bg-primary/5 px-2.5 py-2">
                <Skeleton className="mb-2 h-3 w-28" />
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="mt-1.5 h-3.5 w-[92%]" />
                <Skeleton className="mt-1.5 h-3.5 w-4/5" />
            </div>
            <div>
                <Skeleton className="mb-1.5 h-2.5 w-20" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="mt-1.5 h-3 w-[88%]" />
            </div>
            <div>
                <Skeleton className="mb-1.5 h-2.5 w-16" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="mt-1.5 h-3 w-2/3" />
            </div>
            <div>
                <Skeleton className="mb-1.5 h-2.5 w-36" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="mt-1.5 h-3 w-[85%]" />
            </div>
        </div>
    );
}

function IntelligenceBrief({ intelligence, streaming }: { intelligence: GqlCVesselIntelligence; streaming: boolean }) {
    const hasStatus = intelligence.status.length > 0;
    const hasSummary = intelligence.summary.length > 0;
    const hasWhy = intelligence.whyFlagged.length > 0;
    const hasCitations = intelligence.citations.length > 0;
    const hasPlaybook = intelligence.playbookSteps.length > 0;
    const showSummarySkeleton = streaming && !hasSummary && !hasStatus;
    const showWhySkeleton = streaming && !hasWhy;
    const showCitationsSkeleton = streaming && !hasCitations;
    const showPlaybookSkeleton = streaming && !hasPlaybook;

    return (
        <div className="flex flex-col gap-3">
            {hasStatus || hasSummary ? (
                <Alert className="border-primary/30 bg-primary/5 px-2.5 py-2">
                    {hasStatus ? (
                        <Badge
                            variant="outline"
                            className="col-span-full mb-1 rounded-sm border-primary/40 bg-transparent px-0 text-[10px] font-semibold tracking-wider text-primary uppercase"
                        >
                            {intelligence.status}
                        </Badge>
                    ) : streaming ? (
                        <Skeleton className="col-span-full mb-1 h-3 w-28" />
                    ) : null}
                    {hasSummary ? (
                        <AlertDescription className="col-span-full text-sm/snug text-foreground">
                            {intelligence.summary}
                            {streaming && !intelligence.complete ? <span className="ml-0.5 inline-block text-primary">▍</span> : null}
                        </AlertDescription>
                    ) : streaming ? (
                        <div className="col-span-full space-y-1.5" aria-hidden>
                            <Skeleton className="h-3.5 w-full" />
                            <Skeleton className="h-3.5 w-[90%]" />
                        </div>
                    ) : null}
                </Alert>
            ) : showSummarySkeleton ? (
                <div className="rounded-md border border-primary/20 bg-primary/5 px-2.5 py-2" aria-hidden>
                    <Skeleton className="mb-2 h-3 w-28" />
                    <Skeleton className="h-3.5 w-full" />
                    <Skeleton className="mt-1.5 h-3.5 w-[92%]" />
                </div>
            ) : null}

            {hasWhy ? (
                <div>
                    <p className="mb-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Why flagged</p>
                    <p className="text-xs text-foreground">
                        {intelligence.whyFlagged}
                        {streaming && !hasCitations && !hasPlaybook ? <span className="ml-0.5 inline-block text-primary">▍</span> : null}
                    </p>
                </div>
            ) : showWhySkeleton ? (
                <div aria-hidden>
                    <Skeleton className="mb-1.5 h-2.5 w-20" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="mt-1.5 h-3 w-[88%]" />
                </div>
            ) : null}

            {hasCitations ? (
                <div>
                    <p className="mb-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Citations</p>
                    <ul className="flex flex-col gap-1">
                        {intelligence.citations.map((citation) => (
                            <li
                                key={`${citation.label}-${citation.source}`}
                                className="flex items-start gap-1.5 text-[11px] text-foreground"
                                title={citation.source}
                            >
                                <LinkIcon className="mt-0.5 size-3 shrink-0 text-primary" aria-hidden />
                                <span>{citation.label}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : showCitationsSkeleton ? (
                <div aria-hidden>
                    <Skeleton className="mb-1.5 h-2.5 w-16" />
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="mt-1.5 h-3 w-2/3" />
                </div>
            ) : null}

            {hasPlaybook ? (
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
            ) : showPlaybookSkeleton ? (
                <div aria-hidden>
                    <Skeleton className="mb-1.5 h-2.5 w-36" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="mt-1.5 h-3 w-[85%]" />
                </div>
            ) : null}
        </div>
    );
}
