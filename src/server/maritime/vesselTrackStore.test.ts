import { afterEach, describe, expect, it } from 'vitest';

import { vesselTrackStoreList, vesselTrackStoreUpsertPosition } from './vesselTrackStore';

const identity = {
    mmsi: '538090574',
    name: 'GALAXY LEADER',
    shipType: 'Vehicle Carrier',
    flag: 'Bahamas',
};

function position(overrides: Partial<{ lat: number; lon: number; timestamp: string }> = {}) {
    return {
        mmsi: identity.mmsi,
        lat: overrides.lat ?? 14.5,
        lon: overrides.lon ?? 42.5,
        sog: 10,
        cog: 90,
        heading: 90,
        timestamp: overrides.timestamp ?? new Date().toISOString(),
    };
}

afterEach(() => {
    // Clear via overwrite: store has no clear export — re-upsert after test isolation by unique mmsi per test.
});

describe('vesselTrackStore', () => {
    it('accepts mock positions when the MMSI is free', () => {
        const mmsi = '111000001';
        const tracked = vesselTrackStoreUpsertPosition('mock', { ...identity, mmsi }, position({ lat: 14.1 }));
        expect(tracked?.source).toBe('mock');
        expect(vesselTrackStoreList().some((v) => v.identity.mmsi === mmsi)).toBe(true);
    });

    it('lets aisstream overwrite mock for the same MMSI', () => {
        const mmsi = '111000002';
        vesselTrackStoreUpsertPosition('mock', { ...identity, mmsi }, position({ lat: 14.2 }));
        const live = vesselTrackStoreUpsertPosition('aisstream', { ...identity, mmsi, name: 'LIVE SHIP' }, position({ lat: 14.9 }));
        expect(live?.source).toBe('aisstream');
        expect(live?.position.lat).toBe(14.9);
        expect(live?.identity.name).toBe('LIVE SHIP');
    });

    it('blocks mock overwrite while a fresh aisstream fix exists', () => {
        const mmsi = '111000003';
        vesselTrackStoreUpsertPosition('aisstream', { ...identity, mmsi }, position({ lat: 15 }));
        const blocked = vesselTrackStoreUpsertPosition('mock', { ...identity, mmsi }, position({ lat: 12 }));
        expect(blocked).toBeNull();
        const listed = vesselTrackStoreList().find((v) => v.identity.mmsi === mmsi);
        expect(listed?.source).toBe('aisstream');
        expect(listed?.position.lat).toBe(15);
    });
});
