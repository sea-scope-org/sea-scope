import { describe, expect, it } from 'vitest';
import {
    vesselPassesQueueShipTypeFilter,
    vesselPassesShipTypeFilter,
    watchFiltersCreate,
    watchFiltersOffCount,
    watchFiltersReconcile,
    watchShipTypesFromVessels,
} from './watchFilterState';

describe('watchFilterState', () => {
    it('derives sorted unique ship types', () => {
        expect(watchShipTypesFromVessels([{ shipType: 'Tug' }, { shipType: 'Tanker' }, { shipType: 'Tug' }])).toEqual(['Tanker', 'Tug']);
    });

    it('starts with all layers and ship types on', () => {
        const filters = watchFiltersCreate(['Tanker', 'Tug']);
        expect(filters.layers.protectedAssets).toBe(true);
        expect(filters.shipTypes.has('Tanker')).toBe(true);
        expect(watchFiltersOffCount(filters, ['Tanker', 'Tug'])).toBe(0);
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
                protectedAssets: false,
                highRiskZones: true,
                trackTails: false,
                radarContacts: true,
            },
            shipTypes: new Set(['Tug']),
        };
        expect(watchFiltersOffCount(filters, ['Tanker', 'Tug'])).toBe(3);
    });
});
