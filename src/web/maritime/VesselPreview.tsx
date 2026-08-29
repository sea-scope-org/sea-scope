import type { WatchVessel } from './vesselVisuals';
import { freshnessLabel, VESSEL_FAMILY_COLORS, vesselProjection, vesselTypeNormalize } from './vesselVisuals';

export function VesselPreview({ vessel, nowMs, assetName }: { vessel: WatchVessel; nowMs: number; assetName: string | null }) {
    const position = vessel.position;
    const family = VESSEL_FAMILY_COLORS[vesselTypeNormalize(vessel.shipType)].label;
    const projection = vesselProjection(vessel, nowMs);
    const reason = vessel.activeFactors.at(-1)?.explanation;
    const trend = vessel.riskTrend === 'rising' ? '↑' : vessel.riskTrend === 'falling' ? '↓' : '→';
    return (
        <div
            className="pointer-events-none absolute bottom-9 left-1/2 z-50 w-64 -translate-x-1/2 rounded-md border border-slate-700 bg-slate-950/95 p-3 text-left text-[11px]/4 text-slate-200 shadow-xl"
            role="tooltip"
        >
            <p className="truncate text-xs font-semibold tracking-wide text-white uppercase">{vessel.name || 'Unknown'}</p>
            <p className="text-slate-400">
                {family} · {vessel.shipType || 'Unknown'}
            </p>
            <p className="mt-2 font-semibold">
                Risk: {vessel.riskLevel.toUpperCase()} · {vessel.riskScore} {trend}
            </p>
            <p>
                {position
                    ? `${position.sog.toFixed(1)} kn · ${String(Math.round(position.cog)).padStart(3, '0')}°`
                    : 'Position not received'}
            </p>
            <p>Navigational status: Not received</p>
            <p>Destination / ETA: Not received</p>
            <p>
                Flag: {vessel.flag || 'Unknown'} · MMSI {vessel.mmsi}
                {vessel.imo ? ` · IMO ${vessel.imo}` : ''}
            </p>
            <p>{position ? freshnessLabel(position.timestamp, nowMs) : 'AIS stale · last update not received'}</p>
            <p>{vessel.radarPosition ? 'AIS + Radar available' : 'Sensor agreement not calculated'}</p>
            {assetName ? (
                <p className="mt-1 text-cyan-300">
                    {assetName}
                    {vessel.nearestAssetDistanceNm != null ? ` · ${vessel.nearestAssetDistanceNm.toFixed(2)} nm` : ''}
                </p>
            ) : null}
            <p className="mt-2 text-slate-400">Why now:</p>
            <p>{reason ?? 'No elevated factors'}</p>
            <p className="mt-2 text-slate-400">
                {projection.length ? 'Calculated projection · not declared intent · +10 / +20 min' : 'Projection not calculated'}
            </p>
            <p className="mt-2 font-medium text-white">Click for evidence</p>
        </div>
    );
}
