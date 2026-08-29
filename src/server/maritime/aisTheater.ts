import type { EnvironmentVariables } from '../env/EnvironmentVariables';
import type { LatLon, ScenarioDefinition } from './types';

type GeoBounds = {
    southLat: number;
    westLon: number;
    northLat: number;
    eastLon: number;
};

/**
 * Galaxy Leader authoring bounds (southern Red Sea / Bab el-Mandeb approaches).
 * Background traffic + the main incident stay inside this box; the decoy spoof jump
 * may leave it and is lat-clamped into water after mapping.
 */
const MOCK_SCENARIO_BOUNDS: GeoBounds = {
    southLat: 14.05,
    westLon: 41.9,
    northLat: 15.2,
    eastLon: 42.95,
};

/**
 * Strait of Gibraltar — dense terrestrial AIS on AISStream.
 * The Red Sea / Bab el-Mandeb theater has essentially no AISStream coverage.
 */
export const DEFAULT_AIS_STREAM_BBOX = {
    southLat: 35.7,
    westLon: -6.0,
    northLat: 36.3,
    eastLon: -5.0,
} as const;

/**
 * Navigable water inside the live AIS bbox for demo tracks.
 * Relative insets are tuned for the default Gibraltar box so ships sit in the
 * TSS channel (not Andalusia / Morocco). Custom bboxes reuse the same fractions.
 */
function demoWaterCorridor(bbox: EnvironmentVariables['aisStreamBoundingBox']): GeoBounds {
    const latSpan = bbox.northLat - bbox.southLat;
    const lonSpan = bbox.eastLon - bbox.westLon;
    return {
        southLat: bbox.southLat + latSpan * 0.3,
        northLat: bbox.southLat + latSpan * 0.52,
        westLon: bbox.westLon + lonSpan * 0.1,
        eastLon: bbox.westLon + lonSpan * 0.8,
    };
}

function interpolate(from: number, to: number, t: number): number {
    return from + (to - from) * t;
}

function fractionAlong(from: number, to: number, value: number): number {
    const span = to - from;
    if (span === 0) return 0;
    return (value - from) / span;
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

function aisStreamBoundingBoxCenter(bbox: EnvironmentVariables['aisStreamBoundingBox']): LatLon {
    return {
        lat: (bbox.southLat + bbox.northLat) / 2,
        lon: (bbox.westLon + bbox.eastLon) / 2,
    };
}

/**
 * Map a Red Sea–authored point into the live AIS water corridor.
 * Pure center-offset put the ~1° Red Sea theater onto Spanish/Moroccan land
 * inside the narrow Gibraltar channel — affine fit + lat clamp keeps demos wet.
 */
export function aisTheaterMapPoint(point: LatLon, bbox: EnvironmentVariables['aisStreamBoundingBox']): LatLon {
    const corridor = demoWaterCorridor(bbox);
    const latT = fractionAlong(MOCK_SCENARIO_BOUNDS.southLat, MOCK_SCENARIO_BOUNDS.northLat, point.lat);
    const lonT = fractionAlong(MOCK_SCENARIO_BOUNDS.westLon, MOCK_SCENARIO_BOUNDS.eastLon, point.lon);

    // Clamp latitude into the channel (open water). Allow longitude to stretch
    // into Atlantic approaches west of the corridor for spoof-jump demos.
    const lat = clamp(interpolate(corridor.southLat, corridor.northLat, latT), corridor.southLat, corridor.northLat);
    const lon = clamp(interpolate(corridor.westLon, corridor.eastLon, lonT), bbox.westLon - 0.8, bbox.eastLon + 0.3);
    return { lat, lon };
}

/** Map demo scenario geometry into the live AIS water corridor so both share one map.
 * Scenario `protectedAssets` are still mapped when authored relative to the mock theater.
 * Real-world infrastructure from `protectedInfrastructureCatalog` must never be passed through here. */
export function scenarioOffsetToBbox(scenario: ScenarioDefinition, bbox: EnvironmentVariables['aisStreamBoundingBox']): ScenarioDefinition {
    const center = aisStreamBoundingBoxCenter(bbox);
    const map = (point: LatLon) => aisTheaterMapPoint(point, bbox);
    return {
        ...scenario,
        centerLat: center.lat,
        centerLon: center.lon,
        zoom: 9,
        protectedAssets: scenario.protectedAssets.map((asset) => ({
            ...asset,
            path: asset.path.map(map),
        })),
        simulatedObservations: scenario.simulatedObservations.map((obs) => {
            const mapped = map({ lat: obs.lat, lon: obs.lon });
            return {
                ...obs,
                lat: mapped.lat,
                lon: mapped.lon,
            };
        }),
    };
}
