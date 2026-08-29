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

/** Chart cream outline — matches Positron tint halo so glyphs stay sharp on water. */
const GLYPH_OUTLINE = '#f5f0e8';
const GLYPH_PATH = 'M7 1 L13 16.75 L7 13.25 L1 16.75 Z';

/** SVG chevron (not a CSS border-triangle) keeps heading edges crisp on the chart. */
function VesselGlyph({ color, className }: { color: string; className?: string }) {
    return (
        <svg className={cn('block overflow-visible', className)} width={14} height={18} viewBox="0 0 14 18" aria-hidden>
            <path d={GLYPH_PATH} fill="none" stroke="#0f172a" strokeWidth={2.6} strokeLinejoin="miter" strokeMiterlimit={3} />
            <path
                d={GLYPH_PATH}
                fill={color}
                stroke={GLYPH_OUTLINE}
                strokeWidth={1.4}
                strokeLinejoin="miter"
                strokeMiterlimit={3}
                paintOrder="stroke fill"
            />
        </svg>
    );
}

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
                    <span
                        className="relative z-10 will-change-transform"
                        style={{ opacity, transform: `rotate(${position.heading}deg)` }}
                        aria-hidden
                    >
                        <VesselGlyph color={vesselTypeColor(vessel.shipType)} />
                    </span>
                </button>
            </HoverCardTrigger>
            <HoverCardContent side="top" align="center" sideOffset={12} className="w-80 p-0">
                <VesselPreview vessel={vessel} nowMs={nowMs} assetName={assetName} />
            </HoverCardContent>
        </HoverCard>
    );
}
