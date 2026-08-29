import { describe, expect, it } from 'vitest';
import { protectedInfrastructureAssets, protectedInfrastructureAttribution } from './protectedInfrastructureCatalog';

describe('protectedInfrastructureCatalog', () => {
    it('loads a full public cable and pipeline catalog at true WGS84', () => {
        const assets = protectedInfrastructureAssets();
        const cables = assets.filter((a) => a.type === 'cable');
        const pipelines = assets.filter((a) => a.type === 'pipeline');

        expect(cables.length).toBeGreaterThan(500);
        expect(pipelines.length).toBeGreaterThan(2000);

        const nordStream = pipelines.filter((a) => /nord stream/i.test(a.name));
        expect(nordStream.length).toBeGreaterThan(0);
        const sample = nordStream[0]!.path[0]!;
        expect(sample.lat).toBeGreaterThan(54);
        expect(sample.lon).toBeGreaterThan(10);

        const gibraltarArea = cables.filter((a) => a.path.some((p) => p.lat > 35 && p.lat < 37 && p.lon > -7 && p.lon < -4));
        expect(gibraltarArea.length).toBeGreaterThan(0);
    });

    it('exposes TeleGeography + EMODnet attribution', () => {
        expect(protectedInfrastructureAttribution()).toMatch(/TeleGeography/);
        expect(protectedInfrastructureAttribution()).toMatch(/EMODnet/);
    });
});
