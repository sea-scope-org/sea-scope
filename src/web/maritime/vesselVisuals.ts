import type { GqlCWatchFieldsFragment } from '../graphql/generated';

export type WatchVessel = GqlCWatchFieldsFragment['vessels'][number];
export type VesselFamily = 'cargo' | 'tanker' | 'passenger' | 'fishing' | 'service' | 'pleasure' | 'government' | 'unknown';

export const VESSEL_FAMILY_COLORS: Record<VesselFamily, { label: string; color: string }> = {
    cargo: { label: 'Cargo', color: '#2563eb' },
    tanker: { label: 'Tanker', color: '#9f1239' },
    passenger: { label: 'Passenger', color: '#7c3aed' },
    fishing: { label: 'Fishing', color: '#16a34a' },
    service: { label: 'Tug / service', color: '#ea580c' },
    pleasure: { label: 'Pleasure', color: '#06b6d4' },
    government: { label: 'Government', color: '#111827' },
    unknown: { label: 'Unknown', color: '#64748b' },
};

export function vesselTypeNormalize(shipType: string): VesselFamily {
    const type = shipType.toLowerCase();
    if (/tanker|lng|lpg|chemical|oil/.test(type)) return 'tanker';
    if (/passenger|ferry|cruise/.test(type)) return 'passenger';
    if (/fishing|trawler/.test(type)) return 'fishing';
    if (/tug|tow|pilot|service|supply|offshore|dredger|research/.test(type)) return 'service';
    if (/pleasure|yacht|sailing|leisure/.test(type)) return 'pleasure';
    if (/military|navy|government|law enforcement|patrol|coast guard/.test(type)) return 'government';
    if (/cargo|container|bulk|freight|carrier/.test(type)) return 'cargo';
    return 'unknown';
}

export function vesselTypeColor(shipType: string) {
    return VESSEL_FAMILY_COLORS[vesselTypeNormalize(shipType)].color;
}

export type Freshness = 'fresh' | 'aging' | 'stale';

export function vesselFreshness(timestamp: string, nowMs: number): { state: Freshness; ageMs: number; opacity: number } {
    const ageMs = Math.max(0, nowMs - new Date(timestamp).getTime());
    if (ageMs >= 3 * 60_000) return { state: 'stale', ageMs, opacity: 0.48 };
    if (ageMs >= 60_000) return { state: 'aging', ageMs, opacity: 0.72 };
    return { state: 'fresh', ageMs, opacity: 1 };
}

export function freshnessLabel(timestamp: string, nowMs: number) {
    const freshness = vesselFreshness(timestamp, nowMs);
    const seconds = Math.floor(freshness.ageMs / 1000);
    const age = seconds < 60 ? `${seconds} sec ago` : `${Math.floor(seconds / 60)}m ago`;
    return freshness.state === 'stale' ? `AIS stale · last update ${age}` : `Updated ${age}`;
}

export interface ProjectedPoint {
    minutes: 10 | 20;
    lat: number;
    lon: number;
}

export function vesselProjection(vessel: WatchVessel, nowMs: number): ProjectedPoint[] {
    const position = vessel.position;
    if (!position || vesselFreshness(position.timestamp, nowMs).state === 'stale' || position.sog < 0.8) return [];
    const course = Number.isFinite(position.cog) && position.cog >= 0 && position.cog <= 360 ? position.cog : position.heading;
    if (!Number.isFinite(course) || course < 0 || course > 360) return [];

    return ([10, 20] as const).map((minutes) => {
        const distanceNm = position.sog * (minutes / 60);
        const bearing = (course * Math.PI) / 180;
        const northNm = distanceNm * Math.cos(bearing);
        const eastNm = distanceNm * Math.sin(bearing);
        return {
            minutes,
            lat: position.lat + northNm / 60,
            lon: position.lon + eastNm / (60 * Math.max(0.1, Math.cos((position.lat * Math.PI) / 180))),
        };
    });
}
