import { describe, expect, it } from 'vitest';
import { navalMapCaseZoom, navalMapFocusEasing, navalMapFocusNeeded } from './navalMapFocus';

describe('navalMapCaseZoom', () => {
    it('targets at least 9 and at most 10 from a theater overview', () => {
        expect(navalMapCaseZoom(8, 8)).toBe(9);
        expect(navalMapCaseZoom(7, 7)).toBe(9);
        expect(navalMapCaseZoom(9.5, 9.5)).toBe(10);
    });

    it('does not zoom out when the operator is already closer', () => {
        expect(navalMapCaseZoom(8, 12)).toBe(12);
    });
});

describe('navalMapFocusEasing', () => {
    it('is ease-out (starts fast, ends slow)', () => {
        expect(navalMapFocusEasing(0)).toBe(0);
        expect(navalMapFocusEasing(1)).toBe(1);
        expect(navalMapFocusEasing(0.5)).toBeGreaterThan(0.5);
    });
});

describe('navalMapFocusNeeded', () => {
    function mapStub(input: { zoom: number; width: number; height: number; project: { x: number; y: number } }) {
        return {
            getZoom: () => input.zoom,
            project: () => input.project,
            getCanvas: () => ({ width: input.width, height: input.height }),
        } as never;
    }

    const padding = { top: 64, bottom: 24, left: 24, right: 380 };

    it('returns false when the contact is inside the padded viewport at target zoom', () => {
        const map = mapStub({ zoom: 9, width: 1200, height: 800, project: { x: 500, y: 400 } });
        expect(navalMapFocusNeeded(map, { lon: 42, lat: 14, zoom: 9 }, padding)).toBe(false);
    });

    it('returns true when the contact is under the sidebar padding', () => {
        const map = mapStub({ zoom: 9, width: 1200, height: 800, project: { x: 1100, y: 400 } });
        expect(navalMapFocusNeeded(map, { lon: 42, lat: 14, zoom: 9 }, padding)).toBe(true);
    });

    it('returns true when zoom is meaningfully below the case target', () => {
        const map = mapStub({ zoom: 7, width: 1200, height: 800, project: { x: 500, y: 400 } });
        expect(navalMapFocusNeeded(map, { lon: 42, lat: 14, zoom: 9 }, padding)).toBe(true);
    });
});
