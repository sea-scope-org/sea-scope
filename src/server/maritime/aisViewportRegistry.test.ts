import { afterEach, describe, expect, it } from 'vitest';
import {
    AIS_VIEWPORT_MAX_SPAN_DEG,
    AIS_VIEWPORT_TTL_MS,
    aisViewportRegistryActiveBoxes,
    aisViewportRegistryClear,
    aisViewportRegistryResetForTests,
    aisViewportRegistryUpsert,
} from './aisViewportRegistry';

afterEach(() => {
    aisViewportRegistryResetForTests();
});

describe('aisViewportRegistry', () => {
    it('accepts a small viewport and returns it in activeBoxes', () => {
        const result = aisViewportRegistryUpsert('s1', {
            southLat: 35.8,
            westLon: -5.5,
            northLat: 36.1,
            eastLon: -5.1,
        });
        expect(result).toEqual({ ok: true, changed: true, skipped: false });
        expect(aisViewportRegistryActiveBoxes()).toEqual([{ southLat: 35.8, westLon: -5.5, northLat: 36.1, eastLon: -5.1 }]);
    });

    it('unions viewports from multiple sessions', () => {
        aisViewportRegistryUpsert('s1', { southLat: 35.8, westLon: -5.5, northLat: 36.0, eastLon: -5.2 });
        aisViewportRegistryUpsert('s2', { southLat: 51.4, westLon: 3.0, northLat: 51.6, eastLon: 4.2 });
        expect(aisViewportRegistryActiveBoxes()).toHaveLength(2);
    });

    it('hard-skips oversized viewports and clears that session contribution', () => {
        aisViewportRegistryUpsert('s1', { southLat: 35.8, westLon: -5.5, northLat: 36.0, eastLon: -5.2 });
        const skipped = aisViewportRegistryUpsert('s1', {
            southLat: 30,
            westLon: -10,
            northLat: 30 + AIS_VIEWPORT_MAX_SPAN_DEG + 0.1,
            eastLon: -5,
        });
        expect(skipped).toEqual({ ok: true, changed: true, skipped: true });
        expect(aisViewportRegistryActiveBoxes()).toEqual([]);
    });

    it('hard-skips without changed when session had no prior contribution', () => {
        const skipped = aisViewportRegistryUpsert('s1', {
            southLat: 0,
            westLon: 0,
            northLat: AIS_VIEWPORT_MAX_SPAN_DEG + 1,
            eastLon: 1,
        });
        expect(skipped).toEqual({ ok: true, changed: false, skipped: true });
    });

    it('rejects antimeridian wraps and malformed coords', () => {
        expect(aisViewportRegistryUpsert('s1', { southLat: 10, westLon: 170, northLat: 12, eastLon: -170 })).toEqual({
            ok: false,
            changed: false,
            skipped: false,
        });
        expect(aisViewportRegistryUpsert('s1', { southLat: 12, westLon: -5, northLat: 10, eastLon: -4 })).toEqual({
            ok: false,
            changed: false,
            skipped: false,
        });
        expect(aisViewportRegistryActiveBoxes()).toEqual([]);
    });

    it('same bbox refreshes TTL without marking changed', () => {
        const bbox = { southLat: 35.8, westLon: -5.5, northLat: 36.0, eastLon: -5.2 };
        aisViewportRegistryUpsert('s1', bbox, 1_000);
        expect(aisViewportRegistryUpsert('s1', bbox, 2_000)).toEqual({ ok: true, changed: false, skipped: false });
    });

    it('clears a session contribution', () => {
        aisViewportRegistryUpsert('s1', { southLat: 35.8, westLon: -5.5, northLat: 36.0, eastLon: -5.2 });
        expect(aisViewportRegistryClear('s1')).toEqual({ changed: true });
        expect(aisViewportRegistryActiveBoxes()).toEqual([]);
        expect(aisViewportRegistryClear('s1')).toEqual({ changed: false });
    });

    it('drops stale entries after TTL', () => {
        aisViewportRegistryUpsert('s1', { southLat: 35.8, westLon: -5.5, northLat: 36.0, eastLon: -5.2 }, 1_000);
        expect(aisViewportRegistryActiveBoxes(1_000 + AIS_VIEWPORT_TTL_MS + 1)).toEqual([]);
    });
});
