import { describe, expect, it } from 'vitest';
import {
    vesselPassesQueueShipTypeFilter,
    vesselPassesShipTypeFilter,
    watchFiltersCreate,
    watchFiltersFromSearch,
    watchFiltersOffCount,
    watchFiltersReconcile,
    watchInfrastructureLayersVisible,
    watchSearchFromState,
    watchSearchValidate,
    watchShipTypesFromVessels,
} from './watchFilterState';

describe('watchFilterState', () => {
    it('derives sorted unique ship types', () => {
        expect(watchShipTypesFromVessels([{ shipType: 'Tug' }, { shipType: 'Tanker' }, { shipType: 'Tug' }])).toEqual(['Tanker', 'Tug']);
    });

    it('starts with all layers and ship types on', () => {
        const filters = watchFiltersCreate(['Tanker', 'Tug']);
        expect(filters.layers.cables).toBe(true);
        expect(filters.layers.pipelinesOilGas).toBe(true);
        expect(filters.layers.pipelinesOther).toBe(true);
        expect(filters.shipTypes.has('Tanker')).toBe(true);
        expect(watchFiltersOffCount(filters, ['Tanker', 'Tug'])).toBe(0);
        expect(watchInfrastructureLayersVisible(filters.layers)).toBe(true);
    });

    it('reconciles: keeps unchecked, adds new types as checked', () => {
        let filters = watchFiltersCreate(['Tanker', 'Tug']);
        filters = { ...filters, shipTypes: new Set(['Tug']) };
        const next = watchFiltersReconcile(filters, ['Tanker', 'Tug', 'Ro-Ro'], ['Tanker', 'Tug']);
        expect(next.shipTypes.has('Tanker')).toBe(false);
        expect(next.shipTypes.has('Tug')).toBe(true);
        expect(next.shipTypes.has('Ro-Ro')).toBe(true);
    });

    it('map keeps selected vessel when ship type is filtered out', () => {
        const filters = { ...watchFiltersCreate(['Tanker']), shipTypes: new Set<string>() };
        expect(vesselPassesShipTypeFilter({ mmsi: '1', shipType: 'Tanker' }, filters, '1')).toBe(true);
        expect(vesselPassesShipTypeFilter({ mmsi: '2', shipType: 'Tanker' }, filters, '1')).toBe(false);
        expect(vesselPassesQueueShipTypeFilter({ shipType: 'Tanker' }, filters)).toBe(false);
    });

    it('counts layer and ship-type offs', () => {
        const filters = {
            layers: {
                cables: false,
                pipelinesOilGas: true,
                pipelinesOther: false,
                trackTails: false,
                radarContacts: true,
            },
            shipTypes: new Set(['Tug']),
        };
        expect(watchFiltersOffCount(filters, ['Tanker', 'Tug'])).toBe(4);
        expect(watchInfrastructureLayersVisible(filters.layers)).toBe(true);
    });

    it('validates search: keeps mmsi and known layer offs, drops junk', () => {
        expect(
            watchSearchValidate({
                mmsi: ' 538090574 ',
                layersOff: 'cables,notALayer,trackTails',
                shipTypesOff: 'Tanker, Tug',
                extra: true,
            }),
        ).toEqual({
            mmsi: '538090574',
            layersOff: 'cables,trackTails',
            shipTypesOff: 'Tanker,Tug',
        });
        expect(watchSearchValidate({})).toEqual({});
    });

    it('round-trips filters through search (defaults omitted)', () => {
        const catalog = ['Tanker', 'Tug'];
        const filters = {
            layers: {
                ...watchFiltersCreate(catalog).layers,
                cables: false,
                radarContacts: false,
            },
            shipTypes: new Set(['Tug']),
        };
        const search = watchSearchFromState({ mmsi: '1', filters, catalog });
        expect(search).toEqual({
            mmsi: '1',
            layersOff: 'cables,radarContacts',
            shipTypesOff: 'Tanker',
        });
        expect(watchFiltersFromSearch(search, catalog)).toEqual(filters);
        expect(watchSearchFromState({ mmsi: null, filters: watchFiltersCreate(catalog), catalog })).toEqual({});
    });

    it('search offs keep new catalog types checked', () => {
        const filters = watchFiltersFromSearch({ shipTypesOff: 'Tanker' }, ['Tanker', 'Tug', 'Ro-Ro']);
        expect(filters.shipTypes.has('Tanker')).toBe(false);
        expect(filters.shipTypes.has('Tug')).toBe(true);
        expect(filters.shipTypes.has('Ro-Ro')).toBe(true);
    });
});
