export interface WatchLayerFilters {
    /** TeleGeography submarine telecom cables. */
    cables: boolean;
    /** EMODnet oil / gas / chemical pipelines. */
    pipelinesOilGas: boolean;
    /** EMODnet water, sewage, and other non-hydrocarbon pipelines. */
    pipelinesOther: boolean;
    highRiskZones: boolean;
    trackTails: boolean;
    radarContacts: boolean;
}

export interface WatchFiltersState {
    layers: WatchLayerFilters;
    /** Ship types currently shown on the map and in the Queue. */
    shipTypes: ReadonlySet<string>;
}

const DEFAULT_LAYER_FILTERS: WatchLayerFilters = {
    cables: true,
    pipelinesOilGas: true,
    pipelinesOther: true,
    highRiskZones: true,
    trackTails: true,
    radarContacts: true,
};

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
    if (!layers.highRiskZones) off += 1;
    if (!layers.trackTails) off += 1;
    if (!layers.radarContacts) off += 1;
    for (const type of catalog) {
        if (!filters.shipTypes.has(type)) off += 1;
    }
    return off;
}
