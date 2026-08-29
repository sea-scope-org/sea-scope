import { setWorkerUrl } from 'maplibre-gl';
import type { Map as MapLibreMap } from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Map, { Layer, Marker, NavigationControl, Source } from 'react-map-gl/maplibre';
import type { GqlCWatchFieldsFragment } from '../graphql/generated';
import { useIsMobile } from '../hooks/use-mobile';
import { cn } from '../utils/cn';
import { navalChartTintApply } from './navalChartTint';
import {
    NAVAL_MAP_FOCUS_DURATION_MS,
    navalMapCaseZoom,
    navalMapFocusApply,
    navalMapFocusNeeded,
    navalMapFocusPadding,
    navalMapFocusPrefersReducedMotion,
} from './navalMapFocus';
import type { NavalMapFocusRequest } from './navalMapFocus';
import type { WatchLayerFilters } from './watchFilterState';
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
    layers: WatchLayerFilters;
    selectedMmsi: string | null | undefined;
    focusRequest: NavalMapFocusRequest | null;
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
    layers,
    selectedMmsi,
    focusRequest,
    onSelect,
    className,
}: NavalMapClientProps) {
    const mapRef = useRef<MapLibreMap | null>(null);
    const vesselsRef = useRef(vessels);
    vesselsRef.current = vessels;
    const theaterRef = useRef({ centerLat, centerLon, zoom });
    theaterRef.current = { centerLat, centerLon, zoom };
    const focusRequestRef = useRef(focusRequest);
    focusRequestRef.current = focusRequest;

    const isMobile = useIsMobile();
    const [arrivalPulseMmsi, setArrivalPulseMmsi] = useState<string | null>(null);

    const zoneGeoJson = useMemo(() => zonesToGeoJson(highRiskZones), [highRiskZones]);
    const assetGeoJson = useMemo(() => assetsToGeoJson(protectedAssets), [protectedAssets]);
    const trackGeoJson = useMemo(() => tracksToGeoJson(vessels), [vessels]);

    const applyFocusRequest = useCallback(
        (request: NavalMapFocusRequest) => {
            const map = mapRef.current;
            if (!map) return;

            const padding = navalMapFocusPadding(isMobile);
            const reducedMotion = navalMapFocusPrefersReducedMotion();
            const theater = theaterRef.current;

            if (request.mmsi === null) {
                if (!navalMapFocusNeeded(map, { lon: theater.centerLon, lat: theater.centerLat, zoom: theater.zoom }, padding)) {
                    return;
                }
                navalMapFocusApply(map, {
                    lon: theater.centerLon,
                    lat: theater.centerLat,
                    zoom: theater.zoom,
                    padding,
                    reducedMotion,
                });
                return;
            }

            const vessel = vesselsRef.current.find((v) => v.mmsi === request.mmsi);
            const position = vessel?.position;
            if (!position) return;

            const targetZoom = navalMapCaseZoom(theater.zoom, map.getZoom());
            if (navalMapFocusNeeded(map, { lon: position.lon, lat: position.lat, zoom: targetZoom }, padding)) {
                navalMapFocusApply(map, {
                    lon: position.lon,
                    lat: position.lat,
                    zoom: targetZoom,
                    padding,
                    reducedMotion,
                });
            }

            if (request.arrivalPulse) {
                setArrivalPulseMmsi(request.mmsi);
            }
        },
        [isMobile],
    );

    const onMapLoad = useCallback(
        (event: { target: MapLibreMap }) => {
            mapRef.current = event.target;
            navalChartTintApply(event.target);
            const pending = focusRequestRef.current;
            if (pending) applyFocusRequest(pending);
        },
        [applyFocusRequest],
    );

    // Only generation changes should move the camera — never chase live AIS ticks.
    useEffect(() => {
        if (!focusRequest) return;
        applyFocusRequest(focusRequest);
    }, [applyFocusRequest, focusRequest]);

    useEffect(() => {
        if (!arrivalPulseMmsi) return;
        const timer = window.setTimeout(() => setArrivalPulseMmsi(null), NAVAL_MAP_FOCUS_DURATION_MS);
        return () => window.clearTimeout(timer);
    }, [arrivalPulseMmsi, focusRequest?.generation]);

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

                {layers.highRiskZones ? (
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
                ) : null}

                {layers.protectedAssets ? (
                    <Source id="protected-assets" type="geojson" data={assetGeoJson}>
                        <Layer
                            id="protected-assets-line"
                            type="line"
                            paint={{
                                'line-color': ['match', ['get', 'type'], 'pipeline', '#9a3412', 'cable', '#1e179f', '#1e179f'],
                                'line-width': ['match', ['get', 'type'], 'pipeline', 3, 2.5],
                                'line-opacity': 0.9,
                                'line-dasharray': ['match', ['get', 'type'], 'pipeline', ['literal', [1.5, 1.25]], ['literal', [1, 0]]],
                            }}
                        />
                        <Layer
                            id="protected-assets-label"
                            type="symbol"
                            minzoom={5}
                            layout={{
                                'symbol-placement': 'line',
                                'text-field': ['get', 'name'],
                                'text-size': 11,
                                'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
                                'text-max-angle': 30,
                                'text-padding': 12,
                            }}
                            paint={{
                                'text-color': ['match', ['get', 'type'], 'pipeline', '#7c2d12', '#1e179f'],
                                'text-halo-color': '#f5f0e8',
                                'text-halo-width': 1.5,
                            }}
                        />
                    </Source>
                ) : null}

                {layers.trackTails ? (
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
                ) : null}

                {vessels.map((vessel) => {
                    const position = vessel.position;
                    if (!position) return null;
                    const selected = vessel.mmsi === selectedMmsi;
                    const arrivalPulse = vessel.mmsi === arrivalPulseMmsi;
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
                                aria-current={selected ? 'true' : undefined}
                                className="relative flex size-8 cursor-pointer items-center justify-center border-0 bg-transparent p-0 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                style={{ transform: `rotate(${heading}deg)` }}
                            >
                                {selected ? (
                                    <span className="absolute size-8 rounded-full border-2 border-primary/70 bg-primary/10" aria-hidden />
                                ) : null}
                                {arrivalPulse ? (
                                    <span
                                        className="absolute size-9 rounded-full border-2 border-primary animate-[naval-map-arrival-ring_400ms_ease-out_forwards] motion-reduce:animate-none"
                                        aria-hidden
                                    />
                                ) : null}
                                {vessel.riskLevel === 'red' || vessel.aisDark ? (
                                    <span className="absolute size-7 rounded-full border border-red-500/60" aria-hidden />
                                ) : null}
                                <span className={cn('relative z-10 block size-0 border-x-transparent', style.size, style.border)} />
                            </button>
                        </Marker>
                    );
                })}

                {layers.radarContacts
                    ? vessels.map((vessel) => {
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
                      })
                    : null}
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
