import { setWorkerUrl } from 'maplibre-gl';
import type { FilterSpecification, Map as MapLibreMap } from 'maplibre-gl';
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
import { protectedInfrastructureResolveName, useProtectedInfrastructure } from './useProtectedInfrastructure';
import { VesselMarker } from './VesselMarker';
import { vesselProjection } from './vesselVisuals';
import type { WatchLayerFilters } from './watchFilterState';
import { watchInfrastructureLayersVisible } from './watchFilterState';
import 'maplibre-gl/dist/maplibre-gl.css';

// MapLibre v6 workers are separate ESM modules — Vite needs an explicit URL
// (`?worker&url`) or vector tiles never load under the bundler.
setWorkerUrl(maplibreWorkerUrl);

type WatchState = GqlCWatchFieldsFragment;
type Vessel = WatchState['vessels'][number];

export interface NavalMapClientProps {
    centerLat: number;
    centerLon: number;
    zoom: number;
    vessels: ReadonlyArray<Vessel>;
    layers: WatchLayerFilters;
    selectedMmsi: string | null | undefined;
    focusRequest: NavalMapFocusRequest | null;
    onSelect: (mmsi: string) => void;
    onViewportChange?: (bounds: { southLat: number; westLon: number; northLat: number; eastLon: number }) => void;
    className?: string;
}

/** Browser-only MapLibre surface — import dynamically from `NavalMap`. */
export function NavalMapClient({
    centerLat,
    centerLon,
    zoom,
    vessels,
    layers,
    selectedMmsi,
    focusRequest,
    onSelect,
    onViewportChange,
    className,
}: NavalMapClientProps) {
    const mapRef = useRef<MapLibreMap | null>(null);
    const vesselsRef = useRef(vessels);
    vesselsRef.current = vessels;
    const theaterRef = useRef({ centerLat, centerLon, zoom });
    theaterRef.current = { centerLat, centerLon, zoom };
    const focusRequestRef = useRef(focusRequest);
    focusRequestRef.current = focusRequest;
    const onViewportChangeRef = useRef(onViewportChange);
    onViewportChangeRef.current = onViewportChange;

    const isMobile = useIsMobile();
    const [arrivalPulseMmsi, setArrivalPulseMmsi] = useState<string | null>(null);
    const [previewMmsi, setPreviewMmsi] = useState<string | null>(null);
    const [nowMs, setNowMs] = useState(() => Date.now());
    const { catalog, nameById, attribution } = useProtectedInfrastructure();

    const assetGeoJson = useMemo(() => catalog ?? emptyFeatureCollection, [catalog]);
    const infrastructureFilter = useMemo(() => infrastructureLayerFilter(layers), [layers]);
    const showInfrastructure = watchInfrastructureLayersVisible(layers) && Boolean(catalog);
    const activeMmsi = previewMmsi ?? selectedMmsi ?? null;
    const trackGeoJson = useMemo(() => tracksToGeoJson(vessels, activeMmsi), [activeMmsi, vessels]);
    const projectionGeoJson = useMemo(() => projectionsToGeoJson(vessels, activeMmsi, nowMs), [activeMmsi, nowMs, vessels]);

    useEffect(() => {
        const timer = window.setInterval(() => setNowMs(Date.now()), 15_000);
        return () => window.clearInterval(timer);
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

    const reportViewport = useCallback((map: MapLibreMap) => {
        const report = onViewportChangeRef.current;
        if (!report) return;
        const bounds = map.getBounds();
        report({
            southLat: bounds.getSouth(),
            westLon: bounds.getWest(),
            northLat: bounds.getNorth(),
            eastLon: bounds.getEast(),
        });
    }, []);

    const onMapLoad = useCallback(
        (event: { target: MapLibreMap }) => {
            mapRef.current = event.target;
            navalChartTintApply(event.target);
            reportViewport(event.target);
            const pending = focusRequestRef.current;
            if (pending) applyFocusRequest(pending);
        },
        [applyFocusRequest, reportViewport],
    );

    const onMoveEnd = useCallback(() => {
        const map = mapRef.current;
        if (map) reportViewport(map);
    }, [reportViewport]);

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
                onMoveEnd={onMoveEnd}
            >
                <NavigationControl position="bottom-left" showCompass={false} />

                {showInfrastructure ? (
                    <Source id="protected-assets" type="geojson" data={assetGeoJson}>
                        <Layer
                            id="protected-assets-line"
                            type="line"
                            filter={infrastructureFilter}
                            paint={{
                                'line-color': ['match', ['get', 'type'], 'pipeline', '#9a3412', 'cable', '#7a8a98', '#7a8a98'],
                                'line-width': ['match', ['get', 'type'], 'pipeline', 3, 1.75],
                                'line-opacity': ['match', ['get', 'type'], 'pipeline', 0.85, 0.45],
                                'line-dasharray': ['match', ['get', 'type'], 'pipeline', ['literal', [1.5, 1.25]], ['literal', [1, 0]]],
                            }}
                        />
                        <Layer
                            id="protected-assets-label"
                            type="symbol"
                            minzoom={5}
                            filter={infrastructureFilter}
                            layout={{
                                'symbol-placement': 'line',
                                'text-field': ['get', 'name'],
                                'text-size': 11,
                                'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
                                'text-max-angle': 30,
                                'text-padding': 12,
                            }}
                            paint={{
                                'text-color': ['match', ['get', 'type'], 'pipeline', '#7c2d12', '#5c6b78'],
                                'text-halo-color': '#f5f0e8',
                                'text-halo-width': 1.5,
                                'text-opacity': ['match', ['get', 'type'], 'pipeline', 0.9, 0.65],
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
                                'line-color': ['case', ['==', ['get', 'active'], 1], '#0f172a', '#94a3b8'],
                                'line-width': ['case', ['==', ['get', 'active'], 1], 2.5, 1.25],
                                'line-opacity': ['case', ['==', ['get', 'active'], 1], 0.9, 0.4],
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
                    const asset = vessel.nearestAssetId ? protectedInfrastructureResolveName(vessel.nearestAssetId, nameById) : null;

                    const previewOpen = previewMmsi === vessel.mmsi;

                    return (
                        <Marker
                            key={vessel.mmsi}
                            longitude={position.lon}
                            latitude={position.lat}
                            anchor="center"
                            style={{ zIndex: previewOpen ? 30 : selected ? 20 : 1 }}
                        >
                            <VesselMarker
                                vessel={vessel}
                                nowMs={nowMs}
                                selected={selected}
                                arrivalPulse={arrivalPulse}
                                assetName={asset}
                                onClick={() => onSelect(vessel.mmsi)}
                                onPreviewOpenChange={(open) => {
                                    if (open) setPreviewMmsi(vessel.mmsi);
                                    else setPreviewMmsi((current) => (current === vessel.mmsi ? null : current));
                                }}
                            />
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
            <MapLegend attribution={attribution} />
        </div>
    );
}

const emptyFeatureCollection: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };

function infrastructureLayerFilter(layers: WatchLayerFilters): FilterSpecification {
    const clauses: FilterSpecification[] = [];
    if (layers.cables) {
        clauses.push(['==', ['get', 'type'], 'cable']);
    }
    if (layers.pipelinesOilGas) {
        clauses.push(['all', ['==', ['get', 'type'], 'pipeline'], ['==', ['get', 'pipelineClass'], 'oilGas']]);
    }
    if (layers.pipelinesOther) {
        clauses.push(['all', ['==', ['get', 'type'], 'pipeline'], ['==', ['get', 'pipelineClass'], 'other']]);
    }
    if (clauses.length === 0) {
        return ['==', ['get', 'type'], '__none__'];
    }
    if (clauses.length === 1) {
        return clauses[0]!;
    }
    return ['any', ...clauses] as FilterSpecification;
}

function tracksToGeoJson(vessels: ReadonlyArray<Vessel>, activeMmsi: string | null) {
    return {
        type: 'FeatureCollection' as const,
        features: vessels
            .filter((v) => v.trackTail.length >= 2)
            .map((vessel) => ({
                type: 'Feature' as const,
                properties: {
                    mmsi: vessel.mmsi,
                    active: vessel.mmsi === activeMmsi ? 1 : 0,
                },
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

function MapLegend({ attribution }: { attribution: string | null }) {
    return (
        <details className="absolute top-3 left-3 max-w-64 rounded-md border border-border bg-background/95 text-[10px] text-foreground shadow-sm">
            <summary className="cursor-pointer px-3 py-2 font-semibold tracking-wide uppercase transition-colors hover:bg-muted/40 hover:text-foreground">
                Map legend
            </summary>
            <div className="space-y-2 border-t border-border px-3 py-2 text-muted-foreground">
                <p>
                    <strong className="text-foreground">Vessel color</strong> = type: Cargo blue · Tanker burgundy · Passenger purple ·
                    Fishing green · Service orange · Pleasure cyan · Government black · Unknown gray.
                </p>
                <p>
                    <strong className="text-foreground">Risk halo</strong>: none Green · Yellow elevated · Orange high · pulsing Red
                    critical.
                </p>
                <p>Orientation = heading · faded = stale · dashed ring = AIS dark · double outline = selected.</p>
                <p>
                    <span className="font-semibold text-foreground">Solid slate</span> = submarine cable ·{' '}
                    <span className="font-semibold text-foreground">dashed bronze</span> = pipeline.
                </p>
                <p>
                    <span className="font-semibold text-foreground">Solid</span> = observed (muted; stronger when focused) ·{' '}
                    <span className="font-semibold text-foreground">dashed</span> = calculated projection, not declared intent.
                </p>
                {attribution ? <p className="text-[9px] leading-snug">{attribution}</p> : null}
            </div>
        </details>
    );
}
