const WATCH_LAYER_KEYS = ['cables', 'pipelinesOilGas', 'pipelinesOther', 'trackTails', 'radarContacts'] as const;

export interface WatchLayerFilters {
    /** TeleGeography submarine telecom cables. */
    cables: boolean;
    /** EMODnet oil / gas / chemical pipelines. */
    pipelinesOilGas: boolean;
    /** EMODnet water, sewage, and other non-hydrocarbon pipelines. */
    pipelinesOther: boolean;
    trackTails: boolean;
    radarContacts: boolean;
}

export interface WatchFiltersState {
    layers: WatchLayerFilters;
    /** Ship types currently shown on the map and in the Queue. */
    shipTypes: ReadonlySet<string>;
}

/** Canonical `/watch` search — absent keys mean defaults (all layers/types on, Queue). */
export interface WatchSearch {
    /** Case vessel MMSI; omit for Queue. */
    mmsi?: string;
    /** Comma-separated layer keys that are off. */
    layersOff?: string;
    /** Comma-separated ship types that are unchecked. */
    shipTypesOff?: string;
}

const DEFAULT_LAYER_FILTERS: WatchLayerFilters = {
    cables: true,
    pipelinesOilGas: true,
    pipelinesOther: true,
    trackTails: true,
    radarContacts: true,
};

const WATCH_LAYER_KEY_SET = new Set<string>(WATCH_LAYER_KEYS);

function watchCommaListParse(value: unknown): string[] {
    if (typeof value !== 'string' || value.length === 0) return [];
    return value
        .split(',')
        .map((part) => part.trim())
        .filter((part) => part.length > 0);
}

function watchCommaListJoin(values: ReadonlyArray<string>): string | undefined {
    return values.length > 0 ? values.join(',') : undefined;
}

/** TanStack `validateSearch` — drop empty / unknown junk; keep shareable defaults omitted. */
export function watchSearchValidate(search: Record<string, unknown>): WatchSearch {
    const result: WatchSearch = {};
    if (typeof search.mmsi === 'string' && search.mmsi.trim().length > 0) {
        result.mmsi = search.mmsi.trim();
    }
    const layersOff = watchCommaListParse(search.layersOff).filter((key) => WATCH_LAYER_KEY_SET.has(key));
    const layersOffJoined = watchCommaListJoin(layersOff);
    if (layersOffJoined) result.layersOff = layersOffJoined;
    const shipTypesOffJoined = watchCommaListJoin(watchCommaListParse(search.shipTypesOff));
    if (shipTypesOffJoined) result.shipTypesOff = shipTypesOffJoined;
    return result;
}

export function watchFiltersFromSearch(search: WatchSearch, catalog: ReadonlyArray<string>): WatchFiltersState {
    const layersOff = new Set(watchCommaListParse(search.layersOff));
    const shipTypesOff = new Set(watchCommaListParse(search.shipTypesOff));
    const layers = { ...DEFAULT_LAYER_FILTERS };
    for (const key of WATCH_LAYER_KEYS) {
        if (layersOff.has(key)) layers[key] = false;
    }
    return {
        layers,
        shipTypes: new Set(catalog.filter((type) => !shipTypesOff.has(type))),
    };
}

/** Build the next search object from filters + selection (defaults omitted). */
export function watchSearchFromState(args: {
    mmsi?: string | null;
    filters: WatchFiltersState;
    catalog: ReadonlyArray<string>;
}): WatchSearch {
    const layersOff = WATCH_LAYER_KEYS.filter((key) => !args.filters.layers[key]);
    const shipTypesOff = args.catalog.filter((type) => !args.filters.shipTypes.has(type));
    const result: WatchSearch = {};
    if (args.mmsi) result.mmsi = args.mmsi;
    const layersOffJoined = watchCommaListJoin(layersOff);
    if (layersOffJoined) result.layersOff = layersOffJoined;
    const shipTypesOffJoined = watchCommaListJoin(shipTypesOff);
    if (shipTypesOffJoined) result.shipTypesOff = shipTypesOffJoined;
    return result;
}

export function watchShipTypesFromVessels(vessels: ReadonlyArray<{ shipType: string }>): string[] {
    return [...new Set(vessels.map((v) => v.shipType))].sort((a, b) => a.localeCompare(b));
}

export function watchFiltersCreate(shipTypes: ReadonlyArray<string>): WatchFiltersState {
    return {
        layers: { ...DEFAULT_LAYER_FILTERS },
        shipTypes: new Set(shipTypes),
    };
}

/**
 * Keep checked/unchecked state for types that remain in the catalog.
 * Newly seen ship types start checked.
 */
export function watchFiltersReconcile(
    filters: WatchFiltersState,
    catalog: ReadonlyArray<string>,
    previousCatalog: ReadonlyArray<string>,
): WatchFiltersState {
    const previous = new Set(previousCatalog);
    const next = new Set<string>();
    for (const type of catalog) {
        if (!previous.has(type) || filters.shipTypes.has(type)) {
            next.add(type);
        }
    }
    return { layers: filters.layers, shipTypes: next };
}

/** Map: selected vessel stays visible even when its ship type is unchecked. */
export function vesselPassesShipTypeFilter(
    vessel: { mmsi: string; shipType: string },
    filters: WatchFiltersState,
    selectedMmsi?: string | null,
): boolean {
    if (selectedMmsi && vessel.mmsi === selectedMmsi) return true;
    return filters.shipTypes.has(vessel.shipType);
}

/** Queue: unchecked ship types are omitted (no selected-vessel exception). */
export function vesselPassesQueueShipTypeFilter(vessel: { shipType: string }, filters: WatchFiltersState): boolean {
    return filters.shipTypes.has(vessel.shipType);
}

export function watchInfrastructureLayersVisible(layers: WatchLayerFilters): boolean {
    return layers.cables || layers.pipelinesOilGas || layers.pipelinesOther;
}

export function watchFiltersOffCount(filters: WatchFiltersState, catalog: ReadonlyArray<string>): number {
    let off = 0;
    const layers = filters.layers;
    if (!layers.cables) off += 1;
    if (!layers.pipelinesOilGas) off += 1;
    if (!layers.pipelinesOther) off += 1;
    if (!layers.trackTails) off += 1;
    if (!layers.radarContacts) off += 1;
    for (const type of catalog) {
        if (!filters.shipTypes.has(type)) off += 1;
    }
    return off;
}
