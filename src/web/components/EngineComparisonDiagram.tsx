import type { LucideIcon } from 'lucide-react';
import { BrainCircuitIcon, CableIcon, CheckCircle2Icon, MapIcon, SatelliteDishIcon, SatelliteIcon, SparklesIcon } from 'lucide-react';
import type { PropsWithChildren, ReactNode } from 'react';
import { cn } from '../utils/cn';
import { Reveal } from './Reveal';

const ACTIONS = ['Task Security Response', 'Observation Drone'] as const;

function FlowChevron({ className, direction = 'right' }: { className?: string; direction?: 'right' | 'down' }) {
    return (
        <svg
            aria-hidden
            className={cn('size-3.5 shrink-0 text-muted-foreground', direction === 'down' && 'rotate-90', className)}
            fill="none"
            viewBox="0 0 14 14"
        >
            <path d="M2.5 7h8M7.5 3.5 11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function DiagramNode({
    icon: Icon,
    title,
    subtitle,
    tone = 'plain',
    className,
}: {
    icon: LucideIcon;
    title: string;
    subtitle: ReactNode;
    tone?: 'plain' | 'muted';
    className?: string;
}) {
    return (
        <div
            className={cn(
                'flex min-w-0 items-start gap-2.5 rounded-lg border border-border/80 bg-card px-3 py-2.5 shadow-sm',
                tone === 'muted' && 'bg-muted/70',
                className,
            )}
        >
            <Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
            <div className="min-w-0 leading-snug">
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <div className="text-xs text-muted-foreground">{subtitle}</div>
            </div>
        </div>
    );
}

function EngineSegment({ children }: PropsWithChildren) {
    return <div className="border-t border-border/70 p-3 text-center text-sm text-foreground">{children}</div>;
}

function ActionNode({ label }: { label: string }) {
    return (
        <div className="rounded-lg border border-primary/40 bg-card px-3 py-2.5 text-center text-sm/snug font-medium text-foreground shadow-sm">
            {label}
        </div>
    );
}

function WatchAlertsCard() {
    return (
        <div className="overflow-hidden rounded-xl border border-foreground/15 bg-card shadow-md">
            <div className="bg-primary px-3 py-2.5 text-center text-sm font-semibold text-primary-foreground">Watch + Alerts</div>
            <div className="space-y-1.5 bg-muted/40 px-4 py-5 text-center text-sm">
                <p>Ranked priorities</p>
                <p>Explainable why · Context-aware</p>
                <p className="inline-flex w-full items-center justify-center gap-1.5">
                    AI briefs
                    <SparklesIcon aria-hidden className="size-3.5 text-foreground" strokeWidth={1.75} />
                </p>
            </div>
        </div>
    );
}

function EngineCard({ className }: { className?: string }) {
    return (
        <div className={cn('flex flex-col overflow-hidden rounded-xl border border-border bg-muted/60 shadow-sm', className)}>
            <div className="flex items-center justify-center gap-2 p-3">
                <BrainCircuitIcon aria-hidden className="size-5 text-primary" strokeWidth={1.75} />
                <p className="text-sm font-semibold">SeaScope Engine</p>
            </div>
            <EngineSegment>Risk classification</EngineSegment>
            <EngineSegment>Anomaly detection check</EngineSegment>
            <EngineSegment>Runs continuously</EngineSegment>
            <EngineSegment>Works offline / offshore</EngineSegment>
        </div>
    );
}

function InputStack() {
    return (
        <div className="flex w-48 flex-col justify-center gap-3">
            <DiagramNode icon={SatelliteIcon} title="AIS providers" subtitle="terrestrial • coastal • satellite" />
            <DiagramNode icon={SatelliteDishIcon} title="Satellite imagery" subtitle="EO • SAR • optical" />
            <DiagramNode icon={CableIcon} title="Public infra" subtitle="cables • pipelines • registries" />
        </div>
    );
}

function TypicalAisFlow() {
    return (
        <section aria-labelledby="typical-ais-heading" className="space-y-4">
            <h2
                id="typical-ais-heading"
                className="inline-block rounded border border-foreground/80 px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase"
            >
                Typical AIS display
            </h2>
            <div className="overflow-x-auto">
                <div className="flex w-max items-center gap-3">
                    <DiagramNode
                        icon={SatelliteIcon}
                        title="AIS feed"
                        subtitle="terrestrial • coastal • satellite"
                        className="w-64 shrink-0"
                    />
                    <FlowChevron className="shrink-0" />
                    <DiagramNode
                        icon={MapIcon}
                        title="Map display"
                        subtitle="vessel tracks, traffic density, status quo picture"
                        tone="muted"
                        className="w-72 shrink-0"
                    />
                </div>
            </div>
            <p className="text-sm text-foreground italic">More dots. No priorities.</p>
        </section>
    );
}

function SeaScopeFlow() {
    return (
        <section aria-labelledby="seascope-flow-heading" className="space-y-5">
            <h2 id="seascope-flow-heading" className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                SeaScope
            </h2>

            <div className="overflow-x-auto pb-1">
                <div className="flex min-w-220 items-stretch gap-0">
                    <div className="flex shrink-0 items-center">
                        <InputStack />
                    </div>

                    <div className="flex w-8 shrink-0 flex-col justify-around py-4" aria-hidden>
                        <FlowChevron className="mx-auto" />
                        <FlowChevron className="mx-auto" />
                        <FlowChevron className="mx-auto" />
                    </div>

                    <EngineCard className="w-46 shrink-0 self-stretch" />

                    <div className="flex w-8 shrink-0 items-center justify-center" aria-hidden>
                        <FlowChevron />
                    </div>

                    {/* Watch → two parallel actions below, identical chevrons */}
                    <div className="flex w-80 shrink-0 flex-col">
                        <WatchAlertsCard />

                        <div className="mt-3 mb-2 grid grid-cols-2 gap-3" aria-hidden>
                            <FlowChevron className="mx-auto" direction="down" />
                            <FlowChevron className="mx-auto" direction="down" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {ACTIONS.map((label) => (
                                <ActionNode key={label} label={label} />
                            ))}
                        </div>

                        <p className="mt-3 flex items-center gap-2 text-sm font-semibold italic">
                            Priorities you can explain and act on.
                            <CheckCircle2Icon aria-hidden className="size-4 shrink-0 text-emerald-600" strokeWidth={2} />
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export function EngineComparisonDiagram({ className }: { className?: string }) {
    return (
        <figure
            className={cn(
                'overflow-hidden rounded-2xl border border-border/70 bg-card px-4 py-6 shadow-sm sm:px-6 sm:py-8 lg:px-8',
                className,
            )}
        >
            <figcaption className="sr-only">
                Comparison of a typical AIS map display versus SeaScope: multi-source inputs feed the SeaScope Engine, which produces ranked
                Watch and Alerts priorities and actionable tasking.
            </figcaption>
            <div className="space-y-10 lg:space-y-14">
                <Reveal>
                    <TypicalAisFlow />
                </Reveal>
                <Reveal index={1}>
                    <SeaScopeFlow />
                </Reveal>
            </div>
        </figure>
    );
}
