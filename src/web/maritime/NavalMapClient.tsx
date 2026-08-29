import { setWorkerUrl } from 'maplibre-gl';
import type { Map as MapLibreMap } from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Map, { Layer, Marker, NavigationControl, Source } from 'react-map-gl/maplibre';
import type { GqlCWatchFieldsFragment } from '../graphql/generated';
import { useIsMobile } from '../hooks/use-mobile';
import { cn } from '../utils/cn';
import { navalChartTintApply } from './navalChartTint';
import { VesselMarker } from './VesselMarker';
import { VesselPreview } from './VesselPreview';
import { vesselProjection } from './vesselVisuals';
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
    const [previewMmsi, setPreviewMmsi] = useState<string | null>(null);
    const [nowMs, setNowMs] = useState(() => Date.now());
    const previewTimerRef = useRef<number | null>(null);

    const zoneGeoJson = useMemo(() => zonesToGeoJson(highRiskZones), [highRiskZones]);
    const assetGeoJson = useMemo(() => assetsToGeoJson(protectedAssets), [protectedAssets]);
    const activeMmsi = previewMmsi ?? selectedMmsi ?? null;
    const trackGeoJson = useMemo(() => tracksToGeoJson(vessels, activeMmsi), [activeMmsi, vessels]);
    const projectionGeoJson = useMemo(() => projectionsToGeoJson(vessels, activeMmsi, nowMs), [activeMmsi, nowMs, vessels]);

    useEffect(() => {
        const timer = window.setInterval(() => setNowMs(Date.now()), 15_000);
        return () => window.clearInterval(timer);
    }, []);

    useEffect(
        () => () => {
            if (previewTimerRef.current) window.clearTimeout(previewTimerRef.current);
        },
        [],
    );

    const previewSchedule = useCallback((mmsi: string) => {
        if (previewTimerRef.current) window.clearTimeout(previewTimerRef.current);
        previewTimerRef.current = window.setTimeout(() => setPreviewMmsi(mmsi), 200);
    }, []);
    const previewClear = useCallback(() => {
        if (previewTimerRef.current) window.clearTimeout(previewTimerRef.current);
        setPreviewMmsi(null);
    }, []);

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
                                'line-color': '#1e179f',
                                'line-width': 2.5,
                                'line-opacity': 0.9,
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
                                'line-color': '#334155',
                                'line-width': 2.25,
                                'line-opacity': 0.8,
                            }}
                        />
                    </Source>
                ) : null}

                {projectionGeoJson.features.length ? (
                    <Source id="vessel-projection" type="geojson" data={projectionGeoJson}>
                        <Layer
                            id="vessel-projection-line"
                            type="line"
                            paint={{ 'line-color': '#0e7490', 'line-width': 2, 'line-opacity': 0.85, 'line-dasharray': [2, 2] }}
                        />
                        <Layer
                            id="vessel-projection-points"
                            type="circle"
                            paint={{
                                'circle-radius': 3.5,
                                'circle-color': '#ecfeff',
                                'circle-stroke-color': '#0e7490',
                                'circle-stroke-width': 1.5,
                            }}
                            filter={['==', '$type', 'Point']}
                        />
                    </Source>
                ) : null}

                {vessels.map((vessel) => {
                    const position = vessel.position;
                    if (!position) return null;
                    const selected = vessel.mmsi === selectedMmsi;
                    const arrivalPulse = vessel.mmsi === arrivalPulseMmsi;
                    const asset = vessel.nearestAssetId
                        ? (protectedAssets.find((item) => item.assetId === vessel.nearestAssetId)?.name ?? null)
                        : null;

                    return (
                        <Marker key={vessel.mmsi} longitude={position.lon} latitude={position.lat} anchor="center">
                            <div className="relative">
                                <VesselMarker
                                    vessel={vessel}
                                    nowMs={nowMs}
                                    selected={selected}
                                    arrivalPulse={arrivalPulse}
                                    onClick={() => onSelect(vessel.mmsi)}
                                    onPointerEnter={() => previewSchedule(vessel.mmsi)}
                                    onPointerLeave={previewClear}
                                    onFocus={() => setPreviewMmsi(vessel.mmsi)}
                                    onBlur={previewClear}
                                />
                                {previewMmsi === vessel.mmsi ? <VesselPreview vessel={vessel} nowMs={nowMs} assetName={asset} /> : null}
                            </div>
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
            <MapLegend />
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

function tracksToGeoJson(vessels: ReadonlyArray<Vessel>, activeMmsi: string | null) {
    return {
        type: 'FeatureCollection' as const,
        features: vessels
            .filter((v) => v.mmsi === activeMmsi && v.trackTail.length >= 2)
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

function projectionsToGeoJson(vessels: ReadonlyArray<Vessel>, activeMmsi: string | null, nowMs: number) {
    const vessel = vessels.find((item) => item.mmsi === activeMmsi);
    const position = vessel?.position;
    const points = vessel ? vesselProjection(vessel, nowMs) : [];
    if (!position || points.length === 0) return { type: 'FeatureCollection' as const, features: [] };
    return {
        type: 'FeatureCollection' as const,
        features: [
            {
                type: 'Feature' as const,
                properties: { kind: 'projection' },
                geometry: {
                    type: 'LineString' as const,
                    coordinates: [[position.lon, position.lat], ...points.map((point) => [point.lon, point.lat])],
                },
            },
            ...points.map((point) => ({
                type: 'Feature' as const,
                properties: { kind: 'position', minutes: point.minutes },
                geometry: { type: 'Point' as const, coordinates: [point.lon, point.lat] },
            })),
        ],
    };
}

function MapLegend() {
    return (
        <details className="absolute top-3 left-3 max-w-64 rounded-md border border-border bg-background/95 text-[10px] text-foreground shadow-sm">
            <summary className="cursor-pointer px-3 py-2 font-semibold tracking-wide uppercase">Map legend</summary>
            <div className="space-y-2 border-t border-border px-3 py-2 text-muted-foreground">
                <p>
                    <strong className="text-foreground">Vessel color</strong> = type: Cargo blue · Tanker red · Passenger purple · Fishing
                    green · Service orange · Pleasure cyan · Government black · Unknown gray.
                </p>
                <p>
                    <strong className="text-foreground">Risk halo</strong>: none Green · Yellow elevated · Orange high · pulsing Red
                    critical.
                </p>
                <p>Orientation = heading · faded = stale · double outline = selected.</p>
                <p>
                    <span className="font-semibold text-foreground">Solid</span> = observed ·{' '}
                    <span className="font-semibold text-foreground">dashed</span> = calculated projection, not declared intent.
                </p>
            </div>
        </details>
    );
}
