import type { Map as MapLibreMap } from 'maplibre-gl';

/**
 * SeaScope chart tint — warm bronze land over muted sea, applied on top of
 * Carto Positron so the watch board matches the light brand without a hosted
 * custom style.
 */
const CHART_LAND = '#c4a882';
const CHART_LAND_SOFT = '#d2bc9a';
const CHART_WATER = '#8fa3ab';
const CHART_INK = '#3d3429';
const CHART_MUTED = '#6a5f50';
const CHART_WATER_INK = '#4a5c64';
const CHART_HALO = 'rgba(244, 243, 236, 0.65)';

type PaintSet = ReadonlyArray<readonly [string, string, unknown]>;

const FILL_LAYERS: PaintSet = [
    ['water', 'fill-color', CHART_WATER],
    ['building', 'fill-color', '#b39674'],
    ['building-top', 'fill-color', CHART_LAND_SOFT],
    ['building-top', 'fill-outline-color', '#a88968'],
    ['landcover', 'fill-color', 'rgba(168, 140, 96, 0.4)'],
    ['landuse', 'fill-color', 'rgba(168, 140, 96, 0.35)'],
    ['park_national_park', 'fill-color', 'rgba(158, 150, 100, 0.4)'],
    ['park_nature_reserve', 'fill-color', 'rgba(158, 150, 100, 0.4)'],
    ['landuse_residential', 'fill-color', 'rgba(196, 168, 130, 0.45)'],
];

const LINE_LAYERS: PaintSet = [
    ['waterway', 'line-color', '#7a9098'],
    ['boundary_country_outline', 'line-color', '#a88968'],
    ['boundary_country_inner', 'line-color', '#8f7358'],
    ['boundary_state', 'line-color', '#b89a78'],
    ['boundary_county', 'line-color', '#c4a882'],
];

const ROAD_FILL = '#ddd0b8';
const ROAD_CASE = '#b8a688';

const ROAD_FILL_IDS = [
    'road_service_fill',
    'road_minor_fill',
    'road_pri_fill_ramp',
    'road_trunk_fill_ramp',
    'road_mot_fill_ramp',
    'road_sec_fill_noramp',
    'road_pri_fill_noramp',
    'road_trunk_fill_noramp',
    'road_mot_fill_noramp',
    'bridge_service_fill',
    'bridge_minor_fill',
    'bridge_sec_fill',
    'bridge_pri_fill',
    'bridge_trunk_fill',
    'bridge_mot_fill',
    'tunnel_service_fill',
    'tunnel_minor_fill',
    'tunnel_sec_fill',
    'tunnel_pri_fill',
    'tunnel_trunk_fill',
    'tunnel_mot_fill',
] as const;

const ROAD_CASE_IDS = [
    'road_service_case',
    'road_minor_case',
    'road_pri_case_ramp',
    'road_trunk_case_ramp',
    'road_mot_case_ramp',
    'road_sec_case_noramp',
    'road_pri_case_noramp',
    'road_trunk_case_noramp',
    'road_mot_case_noramp',
    'bridge_service_case',
    'bridge_minor_case',
    'bridge_sec_case',
    'bridge_pri_case',
    'bridge_trunk_case',
    'bridge_mot_case',
    'tunnel_service_case',
    'tunnel_minor_case',
    'tunnel_sec_case',
    'tunnel_pri_case',
    'tunnel_trunk_case',
    'tunnel_mot_case',
    'road_path',
    'bridge_path',
    'tunnel_path',
    'aeroway-runway',
    'aeroway-taxiway',
    'rail',
] as const;

const LABEL_LAYERS: PaintSet = [
    ['watername_ocean', 'text-color', CHART_WATER_INK],
    ['watername_ocean', 'text-halo-color', CHART_WATER],
    ['watername_sea', 'text-color', CHART_WATER_INK],
    ['watername_sea', 'text-halo-color', CHART_WATER],
    ['watername_lake', 'text-color', CHART_WATER_INK],
    ['watername_lake', 'text-halo-color', CHART_HALO],
    ['watername_lake_line', 'text-color', CHART_WATER_INK],
    ['watername_lake_line', 'text-halo-color', CHART_HALO],
    ['waterway_label', 'text-color', CHART_WATER_INK],
    ['waterway_label', 'text-halo-color', CHART_HALO],
    ['place_hamlet', 'text-color', CHART_MUTED],
    ['place_suburbs', 'text-color', CHART_MUTED],
    ['place_villages', 'text-color', CHART_MUTED],
    ['place_town', 'text-color', CHART_MUTED],
    ['place_city_r6', 'text-color', CHART_INK],
    ['place_city_r5', 'text-color', CHART_INK],
    ['place_city_dot_r7', 'text-color', CHART_INK],
    ['place_city_dot_r4', 'text-color', CHART_INK],
    ['place_city_dot_r2', 'text-color', CHART_INK],
    ['place_city_dot_z7', 'text-color', CHART_INK],
    ['place_capital_dot_z7', 'text-color', CHART_INK],
    ['place_country_2', 'text-color', CHART_MUTED],
    ['place_country_1', 'text-color', CHART_MUTED],
    ['place_state', 'text-color', CHART_MUTED],
    ['place_continent', 'text-color', CHART_INK],
    ['poi_stadium', 'text-color', CHART_MUTED],
    ['poi_park', 'text-color', CHART_MUTED],
    ['roadname_minor', 'text-color', CHART_MUTED],
    ['roadname_sec', 'text-color', CHART_MUTED],
    ['roadname_pri', 'text-color', CHART_MUTED],
    ['roadname_major', 'text-color', CHART_MUTED],
];

const LABEL_HALO_LAYERS = [
    'place_hamlet',
    'place_suburbs',
    'place_villages',
    'place_town',
    'place_city_r6',
    'place_city_r5',
    'place_city_dot_r7',
    'place_city_dot_r4',
    'place_city_dot_r2',
    'place_city_dot_z7',
    'place_capital_dot_z7',
    'place_country_2',
    'place_country_1',
    'place_state',
    'place_continent',
    'poi_stadium',
    'poi_park',
    'roadname_minor',
    'roadname_sec',
    'roadname_pri',
    'roadname_major',
] as const;

function setPaint(map: MapLibreMap, layerId: string, property: string, value: unknown) {
    if (!map.getLayer(layerId)) return;
    try {
        // Paint keys are layer-type-specific; layer ids come from Carto Positron.
        map.setPaintProperty(layerId, property as never, value as never);
    } catch {
        // Layer type / property mismatch on style revisions — skip quietly.
    }
}

/** Apply the SeaScope warm chart palette onto a loaded Positron style. */
export function navalChartTintApply(map: MapLibreMap) {
    setPaint(map, 'background', 'background-color', CHART_LAND);

    for (const [id, prop, value] of FILL_LAYERS) {
        setPaint(map, id, prop, value);
    }
    for (const [id, prop, value] of LINE_LAYERS) {
        setPaint(map, id, prop, value);
    }
    for (const id of ROAD_FILL_IDS) {
        setPaint(map, id, 'line-color', ROAD_FILL);
    }
    for (const id of ROAD_CASE_IDS) {
        setPaint(map, id, 'line-color', ROAD_CASE);
    }
    for (const [id, prop, value] of LABEL_LAYERS) {
        setPaint(map, id, prop, value);
    }
    for (const id of LABEL_HALO_LAYERS) {
        setPaint(map, id, 'text-halo-color', CHART_HALO);
    }
}
