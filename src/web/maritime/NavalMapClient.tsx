import { setWorkerUrl } from 'maplibre-gl';
import type { Map as MapLibreMap } from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { useCallback, useMemo } from 'react';
import Map, { Layer, Marker, NavigationControl, Source } from 'react-map-gl/maplibre';
import type { GqlCWatchFieldsFragment } from '../graphql/generated';
import { cn } from '../utils/cn';
import { navalChartTintApply } from './navalChartTint';
import 'maplibre-gl/dist/maplibre-gl.css';

// MapLibre v6 workers are separate ESM modules — Vite needs an explicit URL
// (`?worker&url`) or vector tiles never load under the bundler.
setWorkerUrl(maplibreWorkerUrl);

type WatchState = GqlCWatchFieldsFragment;
type Vessel = WatchState['vessels'][number];
type HighRiskZone = WatchState['highRiskZones'][number];
type ProtectedAsset = WatchState['protectedAssets'][number];
type RiskLevel = Vessel['riskLevel'];

export interface NavalMapClientProps {
    centerLat: number;
    centerLon: number;
    zoom: number;
    vessels: ReadonlyArray<Vessel>;
    highRiskZones: ReadonlyArray<HighRiskZone>;
    protectedAssets: ReadonlyArray<ProtectedAsset>;
    selectedMmsi: string | null | undefined;
    onSelect: (mmsi: string) => void;
    className?: string;
}

const RISK_MARKER: Record<RiskLevel, { border: string; size: string }> = {
    green: {
        border: 'border-b-emerald-500',
        size: 'border-x-[5px] border-b-12',
    },
    yellow: {
        border: 'border-b-amber-300',
        size: 'border-x-[6px] border-b-14',
    },
    orange: {
        border: 'border-b-orange-400',
        size: 'border-x-[7px] border-b-16',
    },
    red: {
        border: 'border-b-red-500',
        size: 'border-x-[8px] border-b-18',
    },
};

/** Browser-only MapLibre surface — import dynamically from `NavalMap`. */
export function NavalMapClient({
    centerLat,
    centerLon,
    zoom,
    vessels,
    highRiskZones,
    protectedAssets,
    selectedMmsi,
    onSelect,
    className,
}: NavalMapClientProps) {
    const zoneGeoJson = useMemo(() => zonesToGeoJson(highRiskZones), [highRiskZones]);
    const assetGeoJson = useMemo(() => assetsToGeoJson(protectedAssets), [protectedAssets]);
    const trackGeoJson = useMemo(() => tracksToGeoJson(vessels), [vessels]);

    const onMapLoad = useCallback((event: { target: MapLibreMap }) => {
        navalChartTintApply(event.target);
    }, []);

    return (
        <div className={cn('relative size-full', className)}>
            <Map
                mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                initialViewState={{
                    latitude: centerLat,
                    longitude: centerLon,
                    zoom,
                }}
                style={{ width: '100%', height: '100%' }}
                attributionControl={false}
                onLoad={onMapLoad}
            >
                <NavigationControl position="bottom-left" showCompass={false} />

                <Source id="high-risk-zones" type="geojson" data={zoneGeoJson}>
                    <Layer
                        id="high-risk-zones-fill"
                        type="fill"
                        paint={{
                            'fill-color': '#b45309',
                            'fill-opacity': 0.16,
                        }}
                    />
                    <Layer
                        id="high-risk-zones-line"
                        type="line"
                        paint={{
                            'line-color': '#9a3412',
                            'line-width': 1.5,
                            'line-dasharray': [2, 1],
                        }}
                    />
                </Source>

                <Source id="protected-assets" type="geojson" data={assetGeoJson}>
                    <Layer
                        id="protected-assets-line"
                        type="line"
                        paint={{
                            'line-color': '#1e179f',
                            'line-width': 2.5,
                            'line-opacity': 0.9,
                        }}
                    />
                </Source>

                <Source id="vessel-tracks" type="geojson" data={trackGeoJson}>
                    <Layer
                        id="vessel-tracks-line"
                        type="line"
                        paint={{
                            'line-color': [
                                'match',
                                ['get', 'riskLevel'],
                                'red',
                                '#ef4444',
                                'orange',
                                '#ea580c',
                                'yellow',
                                '#d97706',
                                '#047857',
                            ],
                            'line-width': ['match', ['get', 'riskLevel'], 'red', 2.5, 'orange', 2, 1.25],
                            'line-opacity': 0.7,
                        }}
                    />
                </Source>

                {vessels.map((vessel) => {
                    const position = vessel.position;
                    if (!position) return null;
                    const selected = vessel.mmsi === selectedMmsi;
                    const heading = position.heading;
                    const style = RISK_MARKER[vessel.riskLevel];
                    const topReason = vessel.activeFactors[vessel.activeFactors.length - 1]?.explanation;
                    const title = [vessel.name, `${vessel.riskLevel.toUpperCase()} ${vessel.riskScore}`, topReason]
                        .filter(Boolean)
                        .join(' · ');

                    return (
                        <Marker
                            key={vessel.mmsi}
                            longitude={position.lon}
                            latitude={position.lat}
                            anchor="center"
                            onClick={(e) => {
                                e.originalEvent.stopPropagation();
                                onSelect(vessel.mmsi);
                            }}
                        >
                            <button
                                type="button"
                                title={title}
                                aria-label={`${vessel.name}, risk ${vessel.riskScore}`}
                                className="relative flex size-8 cursor-pointer items-center justify-center border-0 bg-transparent p-0 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                style={{ transform: `rotate(${heading}deg)` }}
                            >
                                {vessel.riskLevel === 'red' || vessel.aisDark ? (
                                    <span className="absolute size-7 rounded-full border border-red-500/60" aria-hidden />
                                ) : null}
                                <span
                                    className={cn(
                                        'block size-0 border-x-transparent transition-colors',
                                        style.size,
                                        style.border,
                                        selected && vessel.riskLevel === 'green' && 'border-b-primary',
                                    )}
                                />
                            </button>
                        </Marker>
                    );
                })}

                {vessels.map((vessel) => {
                    const radar = vessel.radarPosition;
                    if (!radar || vessel.riskLevel === 'green') return null;
                    return (
                        <Marker key={`radar-${vessel.mmsi}`} longitude={radar.lon} latitude={radar.lat} anchor="center">
                            <div
                                title={`Simulated radar · ${vessel.name}`}
                                className="size-2.5 rotate-45 border border-foreground/70 bg-violet-700/70"
                                aria-hidden
                            />
                        </Marker>
                    );
                })}
            </Map>
        </div>
    );
}

function zonesToGeoJson(zones: ReadonlyArray<HighRiskZone>) {
    return {
        type: 'FeatureCollection' as const,
        features: zones.map((zone) => {
            const ring = zone.ring.map((p) => [p.lon, p.lat] as [number, number]);
            const first = ring[0];
            if (first && (ring.length === 0 || ring[ring.length - 1]![0] !== first[0] || ring[ring.length - 1]![1] !== first[1])) {
                ring.push(first);
            }
            return {
                type: 'Feature' as const,
                properties: { zoneId: zone.zoneId, name: zone.name },
                geometry: {
                    type: 'Polygon' as const,
                    coordinates: [ring],
                },
            };
        }),
    };
}

function assetsToGeoJson(assets: ReadonlyArray<ProtectedAsset>) {
    return {
        type: 'FeatureCollection' as const,
        features: assets.map((asset) => ({
            type: 'Feature' as const,
            properties: { assetId: asset.assetId, name: asset.name, type: asset.type },
            geometry: {
                type: 'LineString' as const,
                coordinates: asset.path.map((p) => [p.lon, p.lat] as [number, number]),
            },
        })),
    };
}

function tracksToGeoJson(vessels: ReadonlyArray<Vessel>) {
    return {
        type: 'FeatureCollection' as const,
        features: vessels
            .filter((v) => v.trackTail.length >= 2)
            .map((vessel) => ({
                type: 'Feature' as const,
                properties: { mmsi: vessel.mmsi, riskLevel: vessel.riskLevel },
                geometry: {
                    type: 'LineString' as const,
                    coordinates: vessel.trackTail.map((p) => [p.lon, p.lat] as [number, number]),
                },
            })),
    };
}
