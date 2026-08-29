import { useEffect, useMemo, useState } from 'react';

type ProtectedInfrastructureFeatureProperties = {
    assetId: string;
    name: string;
    type: 'cable' | 'pipeline';
    source?: string;
    medium?: string | null;
    pipelineClass?: 'oilGas' | 'other';
};

type ProtectedInfrastructureFeature = {
    type: 'Feature';
    properties: ProtectedInfrastructureFeatureProperties;
    geometry: GeoJSON.LineString | GeoJSON.MultiLineString;
};

export type ProtectedInfrastructureCollection = {
    type: 'FeatureCollection';
    features: ProtectedInfrastructureFeature[];
    attribution?: string;
};

const CATALOG_URL = '/maritime/protected-infrastructure.geojson';

let catalogPromise: Promise<ProtectedInfrastructureCollection> | null = null;

function catalogLoad(): Promise<ProtectedInfrastructureCollection> {
    if (!catalogPromise) {
        catalogPromise = fetch(CATALOG_URL)
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error(`Failed to load protected infrastructure (${response.status})`);
                }
                return (await response.json()) as ProtectedInfrastructureCollection;
            })
            .catch((error) => {
                catalogPromise = null;
                throw error;
            });
    }
    return catalogPromise;
}

/** Client catalog for chart layers + asset name lookup (geometries stay off the watch SSE). */
export function useProtectedInfrastructure() {
    const [catalog, setCatalog] = useState<ProtectedInfrastructureCollection | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        void catalogLoad()
            .then((data) => {
                if (!cancelled) {
                    setCatalog(data);
                    setError(null);
                }
            })
            .catch((err: unknown) => {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : 'Failed to load infrastructure');
                }
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const nameById = useMemo(() => {
        const map = new Map<string, string>();
        if (!catalog) return map;
        for (const feature of catalog.features) {
            map.set(feature.properties.assetId, feature.properties.name);
        }
        return map;
    }, [catalog]);

    return { catalog, nameById, error, attribution: catalog?.attribution ?? null };
}

export function protectedInfrastructureResolveName(assetId: string, nameById: ReadonlyMap<string, string>): string | null {
    const exact = nameById.get(assetId);
    if (exact) return exact;
    const baseId = assetId.includes(':') ? assetId.slice(0, assetId.lastIndexOf(':')) : assetId;
    return nameById.get(baseId) ?? null;
}
