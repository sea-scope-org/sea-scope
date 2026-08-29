import { describe, expect, it } from 'vitest';
import { protectedInfrastructureAssets, protectedInfrastructureAttribution } from './protectedInfrastructureCatalog';

describe('protectedInfrastructureCatalog', () => {
    it('loads real-WGS84 cables and pipelines without theater offset', () => {
        const assets = protectedInfrastructureAssets();
        const names = new Set(assets.map((a) => a.name));

        expect(names.has('Nord Stream')).toBe(true);
        expect(names.has('Nord Stream 2')).toBe(true);
        expect(names.has('FLAG Europe-Asia')).toBe(true);
        expect(names.has('Gibraltar Strait submarine cables')).toBe(true);

        const nordStream = assets.filter((a) => a.name === 'Nord Stream');
        expect(nordStream.length).toBeGreaterThan(0);
        expect(nordStream.every((a) => a.type === 'pipeline')).toBe(true);

        // Baltic — must not sit near Gibraltar after a mistaken theater offset.
        const sample = nordStream[0]!.path[0]!;
        expect(sample.lat).toBeGreaterThan(54);
        expect(sample.lon).toBeGreaterThan(10);

        const gibraltarCables = assets.filter((a) => a.name === 'Gibraltar Strait submarine cables');
        expect(gibraltarCables.length).toBeGreaterThan(0);
        const g = gibraltarCables[0]!.path[0]!;
        expect(g.lat).toBeGreaterThan(35);
        expect(g.lat).toBeLessThan(37);
        expect(g.lon).toBeGreaterThan(-7);
        expect(g.lon).toBeLessThan(-4);
    });

    it('exposes OSM attribution', () => {
        expect(protectedInfrastructureAttribution()).toMatch(/OpenStreetMap/);
    });
});
