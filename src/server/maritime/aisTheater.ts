import type { EnvironmentVariables } from '../env/EnvironmentVariables';
import type { LatLon, ScenarioDefinition } from './types';

/** Galaxy Leader scenario geographic origin (map + tracks). */
const MOCK_SCENARIO_ORIGIN: LatLon = { lat: 14.5, lon: 42.5 };

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

function aisStreamBoundingBoxCenter(bbox: EnvironmentVariables['aisStreamBoundingBox']): LatLon {
    return {
        lat: (bbox.southLat + bbox.northLat) / 2,
        lon: (bbox.westLon + bbox.eastLon) / 2,
    };
}

export function aisStreamBoundingBoxOffset(bbox: EnvironmentVariables['aisStreamBoundingBox']): LatLon {
    const center = aisStreamBoundingBoxCenter(bbox);
    return {
        lat: center.lat - MOCK_SCENARIO_ORIGIN.lat,
        lon: center.lon - MOCK_SCENARIO_ORIGIN.lon,
    };
}

function latLonOffset(point: LatLon, offset: LatLon): LatLon {
    return { lat: point.lat + offset.lat, lon: point.lon + offset.lon };
}

/** Shift demo scenario geometry into the live AIS bounding box so both share one map.
 * Scenario `protectedAssets` are still offset when authored relative to the mock origin.
 * Real-world infrastructure from `protectedInfrastructureCatalog` must never be passed through here. */
export function scenarioOffsetToBbox(scenario: ScenarioDefinition, bbox: EnvironmentVariables['aisStreamBoundingBox']): ScenarioDefinition {
    const offset = aisStreamBoundingBoxOffset(bbox);
    const center = aisStreamBoundingBoxCenter(bbox);
    return {
        ...scenario,
        centerLat: center.lat,
        centerLon: center.lon,
        zoom: 9,
        highRiskZones: scenario.highRiskZones.map((zone) => ({
            ...zone,
            ring: zone.ring.map((p) => latLonOffset(p, offset)),
        })),
        protectedAssets: scenario.protectedAssets.map((asset) => ({
            ...asset,
            path: asset.path.map((p) => latLonOffset(p, offset)),
        })),
        simulatedObservations: scenario.simulatedObservations.map((obs) => ({
            ...obs,
            lat: obs.lat + offset.lat,
            lon: obs.lon + offset.lon,
        })),
    };
}
