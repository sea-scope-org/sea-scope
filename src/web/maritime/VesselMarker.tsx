import { HoverCard, HoverCardContent, HoverCardTrigger } from '../components/base/hover-card';
import { cn } from '../utils/cn';
import { VesselPreview } from './VesselPreview';
import type { WatchVessel } from './vesselVisuals';
import { vesselFreshness, vesselTypeColor } from './vesselVisuals';

const HALO_CLASS: Record<WatchVessel['riskLevel'], string | null> = {
    green: null,
    yellow: 'size-7 border border-yellow-400/75 bg-yellow-300/10 shadow-[0_0_8px_rgba(250,204,21,0.35)]',
    orange: 'size-9 border-2 border-orange-500/80 bg-orange-400/10 shadow-[0_0_12px_rgba(249,115,22,0.5)]',
    red: 'size-11 border-2 border-red-500 bg-red-500/10 shadow-[0_0_16px_rgba(239,68,68,0.75)]',
};

export function VesselMarker({
    vessel,
    nowMs,
    selected,
    arrivalPulse,
    assetName,
    onClick,
    onPreviewOpenChange,
}: {
    vessel: WatchVessel;
    nowMs: number;
    selected: boolean;
    arrivalPulse: boolean;
    assetName: string | null;
    onClick: () => void;
    onPreviewOpenChange: (open: boolean) => void;
}) {
    const position = vessel.position!;
    const opacity = vesselFreshness(position.timestamp, nowMs).opacity;
    const halo = HALO_CLASS[vessel.riskLevel];
    const aisDarkLabel = vessel.aisDark ? ', AIS dark' : '';
    return (
        <HoverCard openDelay={200} closeDelay={100} onOpenChange={onPreviewOpenChange}>
            <HoverCardTrigger asChild>
                <button
                    type="button"
                    aria-label={`${vessel.name}, ${vessel.shipType}, ${vessel.riskLevel} risk ${vessel.riskScore}${aisDarkLabel}`}
                    aria-current={selected ? 'true' : undefined}
                    className="relative flex size-9 cursor-pointer items-center justify-center border-0 bg-transparent p-0 outline-none focus-visible:ring-[3px] focus-visible:ring-white/90"
                    onClick={(event) => {
                        event.stopPropagation();
                        onClick();
                    }}
                >
                    {halo ? <span className={cn('absolute rounded-full', halo)} aria-hidden /> : null}
                    {vessel.riskLevel === 'red' ? (
                        <span
                            className="absolute size-12 rounded-full border-2 border-red-500/80 animate-[naval-map-critical-halo_2400ms_ease-out_infinite] motion-reduce:animate-none"
                            aria-hidden
                        />
                    ) : null}
                    {vessel.aisDark ? (
                        <span className="absolute size-10 rounded-full border border-dashed border-foreground/80" aria-hidden />
                    ) : null}
                    {selected ? (
                        <span className="absolute size-8 rounded-full border border-slate-950 ring-2 ring-white" aria-hidden />
                    ) : null}
                    {arrivalPulse ? (
                        <span
                            className="absolute size-9 rounded-full border-2 border-primary animate-[naval-map-arrival-ring_400ms_ease-out_forwards] motion-reduce:animate-none"
                            aria-hidden
                        />
                    ) : null}
                    <span className="relative z-10" style={{ opacity, transform: `rotate(${position.heading}deg)` }} aria-hidden>
                        <span
                            className="block size-0 border-x-[6px] border-b-15 border-x-transparent drop-shadow-[0_1px_1px_rgba(15,23,42,0.8)]"
                            style={{ borderBottomColor: vesselTypeColor(vessel.shipType) }}
                        />
                    </span>
                </button>
            </HoverCardTrigger>
            <HoverCardContent side="top" align="center" sideOffset={12} className="w-80 p-0">
                <VesselPreview vessel={vessel} nowMs={nowMs} assetName={assetName} />
            </HoverCardContent>
        </HoverCard>
    );
}
