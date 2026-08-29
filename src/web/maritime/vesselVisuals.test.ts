import { describe, expect, it } from 'vitest';
import { vesselFreshness, vesselProjection, vesselTypeNormalize } from './vesselVisuals';
import type { WatchVessel } from './vesselVisuals';

describe('vesselTypeNormalize', () => {
    it.each([
        ['Container Ship', 'cargo'],
        ['Oil Tanker', 'tanker'],
        ['Passenger Ferry', 'passenger'],
        ['Fishing', 'fishing'],
        ['Offshore Supply Ship', 'service'],
        ['Pleasure Craft', 'pleasure'],
        ['Coast Guard', 'government'],
        ['Other', 'unknown'],
    ])('maps %s to %s', (shipType, family) => expect(vesselTypeNormalize(shipType)).toBe(family));
});

describe('vesselFreshness', () => {
    const now = Date.parse('2026-08-29T12:00:00Z');
    it('uses independent discrete freshness states', () => {
        expect(vesselFreshness('2026-08-29T11:59:30Z', now).state).toBe('fresh');
        expect(vesselFreshness('2026-08-29T11:58:30Z', now).state).toBe('aging');
        expect(vesselFreshness('2026-08-29T11:56:00Z', now).state).toBe('stale');
    });
});

describe('vesselProjection', () => {
    const now = Date.parse('2026-08-29T12:00:00Z');
    const vessel = {
        position: { lat: 50, lon: 1, sog: 12, cog: 90, heading: 90, timestamp: '2026-08-29T11:59:30Z' },
    } as WatchVessel;

    it('projects deterministic ten and twenty minute positions', () => {
        const points = vesselProjection(vessel, now);
        expect(points.map((point) => point.minutes)).toEqual([10, 20]);
        expect(points[1]!.lon).toBeGreaterThan(points[0]!.lon);
        expect(points[0]!.lat).toBeCloseTo(50);
    });

    it('suppresses stale and nearly stationary estimates', () => {
        expect(vesselProjection({ ...vessel, position: { ...vessel.position!, sog: 0.2 } }, now)).toEqual([]);
        expect(vesselProjection({ ...vessel, position: { ...vessel.position!, timestamp: '2026-08-29T11:55:00Z' } }, now)).toEqual([]);
    });
});
