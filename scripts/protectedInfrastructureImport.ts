/**
 * Builds the protected-infrastructure catalog from public datasets:
 * - TeleGeography Submarine Cable Map (global telecom cables)
 * - EMODnet Human Activities pipelines (European undersea pipelines)
 *
 * Writes:
 * - src/server/maritime/infrastructure/protectedInfrastructure.json
 * - public/maritime/protected-infrastructure.geojson
 *
 * Run: npx tsx scripts/protectedInfrastructureImport.ts
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SERVER_OUT = path.join(ROOT, 'src/server/maritime/infrastructure/protectedInfrastructure.json');
const PUBLIC_OUT = path.join(ROOT, 'public/maritime/protected-infrastructure.geojson');

const CABLE_URL = 'https://www.submarinecablemap.com/api/v3/cable/cable-geo.json';
const PIPELINE_WFS =
    'https://ows.emodnet-humanactivities.eu/wfs?service=WFS&version=2.0.0&request=GetFeature&typeNames=emodnet:pipelines&outputFormat=application/json';

type LonLat = [number, number];

type CatalogFeature = {
    type: 'Feature';
    properties: {
        assetId: string;
        name: string;
        type: 'cable' | 'pipeline';
        source: string;
        medium?: string | null;
        pipelineClass?: 'oilGas' | 'other';
    };
    geometry: { type: 'LineString'; coordinates: LonLat[] } | { type: 'MultiLineString'; coordinates: LonLat[][] };
};

type CatalogFeatureCollection = {
    type: 'FeatureCollection';
    attribution: string;
    generatedAt: string;
    features: CatalogFeature[];
};

type SourceFeatureCollection = {
    type: 'FeatureCollection';
    features: Array<{
        type: 'Feature';
        properties: Record<string, unknown> | null;
        geometry: { type: string; coordinates: unknown } | null;
    }>;
};

async function fetchJson(url: string): Promise<SourceFeatureCollection> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }
    return (await response.json()) as SourceFeatureCollection;
}

/** Degrees — ~500–600 m; enough for chart + near-asset risk, keeps the catalog lean. */
const SIMPLIFY_TOLERANCE_DEG = 0.005;
const MAX_POINTS_PER_LINE = 80;

function asLonLatPairs(raw: unknown): LonLat[] {
    if (!Array.isArray(raw)) return [];
    const out: LonLat[] = [];
    for (const pair of raw) {
        if (!Array.isArray(pair) || pair.length < 2) continue;
        const lon = Number(pair[0]);
        const lat = Number(pair[1]);
        if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;
        out.push([lon, lat]);
    }
    return out;
}

function perpendicularDistanceDeg(point: LonLat, start: LonLat, end: LonLat): number {
    const [x, y] = point;
    const [x1, y1] = start;
    const [x2, y2] = end;
    const dx = x2 - x1;
    const dy = y2 - y1;
    if (dx === 0 && dy === 0) return Math.hypot(x - x1, y - y1);
    const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)));
    return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy));
}

function douglasPeucker(points: LonLat[], tolerance: number): LonLat[] {
    if (points.length <= 2) return points;
    let maxDistance = 0;
    let maxIndex = 0;
    const start = points[0]!;
    const end = points[points.length - 1]!;
    for (let i = 1; i < points.length - 1; i++) {
        const distance = perpendicularDistanceDeg(points[i]!, start, end);
        if (distance > maxDistance) {
            maxDistance = distance;
            maxIndex = i;
        }
    }
    if (maxDistance <= tolerance) return [start, end];
    const left = douglasPeucker(points.slice(0, maxIndex + 1), tolerance);
    const right = douglasPeucker(points.slice(maxIndex), tolerance);
    return [...left.slice(0, -1), ...right];
}

function downsample(points: LonLat[], maxPoints: number): LonLat[] {
    if (points.length <= maxPoints) return points;
    const out: LonLat[] = [points[0]!];
    const step = (points.length - 1) / (maxPoints - 1);
    for (let i = 1; i < maxPoints - 1; i++) {
        out.push(points[Math.round(i * step)]!);
    }
    out.push(points[points.length - 1]!);
    return out;
}

function simplifyLine(points: LonLat[]): LonLat[] {
    return downsample(douglasPeucker(points, SIMPLIFY_TOLERANCE_DEG), MAX_POINTS_PER_LINE);
}

function linesFromGeometry(geometry: { type: string; coordinates: unknown } | null): LonLat[][] {
    if (!geometry) return [];
    if (geometry.type === 'LineString') {
        const line = simplifyLine(asLonLatPairs(geometry.coordinates));
        return line.length >= 2 ? [line] : [];
    }
    if (geometry.type === 'MultiLineString' && Array.isArray(geometry.coordinates)) {
        return geometry.coordinates.map((coords) => simplifyLine(asLonLatPairs(coords))).filter((line) => line.length >= 2);
    }
    return [];
}

function geometryFromLines(lines: LonLat[][]): CatalogFeature['geometry'] | null {
    if (lines.length === 0) return null;
    if (lines.length === 1) return { type: 'LineString', coordinates: lines[0]! };
    return { type: 'MultiLineString', coordinates: lines };
}

function slugify(value: string): string {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80);
}

function pipelineClass(medium: string | null): 'oilGas' | 'other' {
    if (!medium) return 'oilGas';
    const value = medium.toLowerCase();
    if (/oil|gas|hydrocarbon|condensate|chemical|methanol|glycol|hydraulic|control/.test(value)) {
        return 'oilGas';
    }
    return 'other';
}

function cableFeatures(collection: SourceFeatureCollection): CatalogFeature[] {
    const features: CatalogFeature[] = [];
    const usedIds = new Set<string>();
    for (const feature of collection.features) {
        const props = feature.properties ?? {};
        const id = String(props.id ?? props.feature_id ?? features.length);
        const name = String(props.name ?? id);
        const lines = linesFromGeometry(feature.geometry);
        const geometry = geometryFromLines(lines);
        if (!geometry) continue;
        let assetId = `cable-tg-${slugify(id) || features.length}`;
        if (usedIds.has(assetId)) assetId = `${assetId}-${features.length}`;
        usedIds.add(assetId);
        features.push({
            type: 'Feature',
            properties: {
                assetId,
                name,
                type: 'cable',
                source: 'TeleGeography Submarine Cable Map',
            },
            geometry,
        });
    }
    return features;
}

function pipelineName(props: Record<string, unknown>, index: number): string {
    const name = typeof props.name === 'string' ? props.name.trim() : '';
    if (name) return name;
    const country = typeof props.country === 'string' ? props.country.trim() : '';
    const medium = typeof props.medium === 'string' ? props.medium.trim() : '';
    const bits = [medium || 'Pipeline', country].filter(Boolean);
    return bits.length > 0 ? `${bits.join(' · ')}` : `Pipeline ${index + 1}`;
}

function pipelineFeatures(collection: SourceFeatureCollection): CatalogFeature[] {
    const features: CatalogFeature[] = [];
    const usedIds = new Set<string>();
    for (const [index, feature] of collection.features.entries()) {
        const props = feature.properties ?? {};
        const lines = linesFromGeometry(feature.geometry);
        const geometry = geometryFromLines(lines);
        if (!geometry) continue;
        const rawId = props.id != null ? String(props.id) : String(index);
        const medium = typeof props.medium === 'string' ? props.medium : null;
        let assetId = `pipeline-emodnet-${slugify(rawId) || index}`;
        if (usedIds.has(assetId)) assetId = `${assetId}-${index}`;
        usedIds.add(assetId);
        features.push({
            type: 'Feature',
            properties: {
                assetId,
                name: pipelineName(props, index),
                type: 'pipeline',
                source: 'EMODnet Human Activities',
                medium,
                pipelineClass: pipelineClass(medium),
            },
            geometry,
        });
    }
    return features;
}

async function main(): Promise<void> {
    console.log('Fetching TeleGeography cables…');
    const cables = await fetchJson(CABLE_URL);
    console.log('Fetching EMODnet pipelines…');
    const pipelines = await fetchJson(PIPELINE_WFS);

    const features = [...cableFeatures(cables), ...pipelineFeatures(pipelines)];
    const catalog: CatalogFeatureCollection = {
        type: 'FeatureCollection',
        attribution:
            'Submarine cables © TeleGeography (submarinecablemap.com). Pipelines © EMODnet Human Activities. Approximate public mapping, not operator as-built plans.',
        generatedAt: new Date().toISOString(),
        features,
    };

    const json = `${JSON.stringify(catalog)}\n`;
    await mkdir(path.dirname(SERVER_OUT), { recursive: true });
    await mkdir(path.dirname(PUBLIC_OUT), { recursive: true });
    await writeFile(SERVER_OUT, json);
    await writeFile(PUBLIC_OUT, json);

    const cableCount = features.filter((f) => f.properties.type === 'cable').length;
    const pipelineCount = features.filter((f) => f.properties.type === 'pipeline').length;
    console.log(`Wrote ${features.length} features (${cableCount} cables, ${pipelineCount} pipelines)`);
    console.log(`  ${SERVER_OUT}`);
    console.log(`  ${PUBLIC_OUT}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
