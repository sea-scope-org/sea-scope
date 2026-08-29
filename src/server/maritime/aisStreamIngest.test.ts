import { afterEach, describe, expect, it } from 'vitest';
import { aisStreamBoundingBoxesAssemble } from './aisStreamIngest';
import { DEFAULT_AIS_STREAM_BBOX } from './aisTheater';
import { aisViewportRegistryResetForTests, aisViewportRegistryUpsert } from './aisViewportRegistry';

afterEach(() => {
    aisViewportRegistryResetForTests();
});

describe('aisStreamBoundingBoxesAssemble', () => {
    it('puts the env bbox first then active viewports', () => {
        aisViewportRegistryUpsert('s1', { southLat: 51.4, westLon: 3.0, northLat: 51.6, eastLon: 4.0 });
        const boxes = aisStreamBoundingBoxesAssemble(DEFAULT_AIS_STREAM_BBOX);
        expect(boxes[0]).toEqual([
            [DEFAULT_AIS_STREAM_BBOX.northLat, DEFAULT_AIS_STREAM_BBOX.westLon],
            [DEFAULT_AIS_STREAM_BBOX.southLat, DEFAULT_AIS_STREAM_BBOX.eastLon],
        ]);
        expect(boxes[1]).toEqual([
            [51.6, 3.0],
            [51.4, 4.0],
        ]);
        expect(boxes).toHaveLength(2);
    });

    it('accepts an explicit viewport list without reading the registry', () => {
        const boxes = aisStreamBoundingBoxesAssemble(DEFAULT_AIS_STREAM_BBOX, [{ southLat: 1, westLon: 2, northLat: 3, eastLon: 4 }]);
        expect(boxes).toHaveLength(2);
        expect(boxes[1]).toEqual([
            [3, 2],
            [1, 4],
        ]);
    });
});
