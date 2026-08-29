import type { LatLon, ProtectedAsset } from '../types';
import catalog from './protectedInfrastructure.json' with { type: 'json' };

type CatalogGeometry = { type: 'LineString'; coordinates: number[][] } | { type: 'MultiLineString'; coordinates: number[][][] };

type CatalogFeature = {
    type: 'Feature';
    properties: {
        assetId: string;
        name: string;
        type: 'cable' | 'pipeline';
    };
    geometry: CatalogGeometry;
};

type CatalogFeatureCollection = {
    type: 'FeatureCollection';
    features: CatalogFeature[];
    attribution?: string;
};

const RISK_RADIUS_NM: Record<'cable' | 'pipeline', number> = {
    cable: 3,
    pipeline: 5,
};

function lineToPath(coordinates: number[][]): LatLon[] {
    return coordinates.map(([lon, lat]) => ({ lat: lat!, lon: lon! }));
}

function linesFromGeometry(geometry: CatalogGeometry): LatLon[][] {
    if (geometry.type === 'LineString') {
        return [lineToPath(geometry.coordinates)];
    }
    return geometry.coordinates.map(lineToPath);
}

function assetsFromCatalog(collection: CatalogFeatureCollection): ProtectedAsset[] {
    const assets: ProtectedAsset[] = [];

    for (const feature of collection.features) {
        const { assetId, name, type } = feature.properties;
        const lines = linesFromGeometry(feature.geometry).filter((path) => path.length >= 2);
        const riskRadiusNm = RISK_RADIUS_NM[type];

        if (lines.length === 1) {
            assets.push({ assetId, name, type, path: lines[0]!, riskRadiusNm });
            continue;
        }

        for (const [index, path] of lines.entries()) {
            assets.push({
                assetId: `${assetId}:${index}`,
                name,
                type,
                path,
                riskRadiusNm,
            });
        }
    }

    return assets;
}

const cachedAssets = assetsFromCatalog(catalog as CatalogFeatureCollection);

/** Real-WGS84 protected infrastructure — never pass through `scenarioOffsetToBbox`. */
export function protectedInfrastructureAssets(): ProtectedAsset[] {
    return cachedAssets;
}

export function protectedInfrastructureAttribution(): string {
    const collection = catalog as CatalogFeatureCollection;
    return (
        collection.attribution ??
        'Submarine cables © TeleGeography. Pipelines © EMODnet Human Activities. Approximate public mapping, not operator as-built plans.'
    );
}
