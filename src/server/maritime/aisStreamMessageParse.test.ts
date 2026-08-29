import { describe, expect, it } from 'vitest';

import { aisStreamMessageParse } from './aisStreamMessageParse';

describe('aisStreamMessageParse', () => {
    it('maps a PositionReport into AisPosition + identity', () => {
        const parsed = aisStreamMessageParse({
            MessageType: 'PositionReport',
            MetaData: {
                MMSI: 538090574,
                ShipName: 'GALAXY LEADER@@@',
                time_utc: '2026-08-29T10:00:00.000Z',
            },
            Message: {
                PositionReport: {
                    UserID: 538090574,
                    Valid: true,
                    Latitude: 14.5,
                    Longitude: 42.5,
                    Sog: 12.3,
                    Cog: 90,
                    TrueHeading: 91,
                    NavigationalStatus: 0,
                },
            },
        });

        expect(parsed).toEqual({
            kind: 'position',
            identity: {
                mmsi: '538090574',
                name: 'GALAXY LEADER',
                shipType: 'Unknown',
                flag: 'Marshall Islands',
            },
            position: {
                mmsi: '538090574',
                lat: 14.5,
                lon: 42.5,
                sog: 12.3,
                cog: 90,
                heading: 91,
                timestamp: '2026-08-29T10:00:00.000Z',
                navStatus: 'Under way using engine',
            },
        });
    });

    it('maps ShipStaticData into vessel identity', () => {
        const parsed = aisStreamMessageParse({
            MessageType: 'ShipStaticData',
            MetaData: { MMSI: 477123456 },
            Message: {
                ShipStaticData: {
                    UserID: 477123456,
                    Name: 'PACIFIC HORIZON',
                    ImoNumber: 9123456,
                    CallSign: 'VRAB7',
                    Type: 70,
                },
            },
        });

        expect(parsed).toEqual({
            kind: 'static',
            identity: {
                mmsi: '477123456',
                name: 'PACIFIC HORIZON',
                imo: '9123456',
                callSign: 'VRAB7',
                shipType: 'Cargo',
                flag: 'Hong Kong',
            },
        });
    });

    it('ignores invalid position reports', () => {
        expect(
            aisStreamMessageParse({
                MessageType: 'PositionReport',
                Message: { PositionReport: { Valid: false, UserID: 1 } },
            }),
        ).toEqual({ kind: 'ignored' });
    });
});
