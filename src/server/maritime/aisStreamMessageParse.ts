import type { AisPosition, VesselIdentity } from './types';

type AisStreamMetaData = {
    MMSI?: number;
    ShipName?: string;
    latitude?: number;
    longitude?: number;
    Latitude?: number;
    Longitude?: number;
    time_utc?: string;
};

type PositionReportBody = {
    UserID?: number;
    Latitude?: number;
    Longitude?: number;
    Sog?: number;
    Cog?: number;
    TrueHeading?: number;
    NavigationalStatus?: number;
    Valid?: boolean;
};

type ShipStaticDataBody = {
    UserID?: number;
    Name?: string;
    ImoNumber?: number;
    CallSign?: string;
    Type?: number;
    Dimension?: unknown;
};

export type AisStreamParsed =
    | { kind: 'position'; identity: VesselIdentity; position: AisPosition }
    | { kind: 'static'; identity: VesselIdentity }
    | { kind: 'ignored' };

const NAV_STATUS: Record<number, string> = {
    0: 'Under way using engine',
    1: 'At anchor',
    2: 'Not under command',
    3: 'Restricted manoeuvrability',
    4: 'Constrained by her draught',
    5: 'Moored',
    6: 'Aground',
    7: 'Engaged in fishing',
    8: 'Under way sailing',
    14: 'AIS-SART',
    15: 'Not defined',
};

function mmsiFrom(value: number | undefined): string | null {
    if (value === undefined || !Number.isFinite(value)) return null;
    return String(Math.trunc(value)).padStart(9, '0');
}

function cleanName(raw: string | undefined): string {
    return (raw ?? '').replace(/@+$/g, '').trim();
}

function shipTypeLabel(typeCode: number | undefined): string {
    if (typeCode === undefined) return 'Unknown';
    if (typeCode >= 70 && typeCode <= 79) return 'Cargo';
    if (typeCode >= 80 && typeCode <= 89) return 'Tanker';
    if (typeCode >= 60 && typeCode <= 69) return 'Passenger';
    if (typeCode >= 40 && typeCode <= 49) return 'High-speed craft';
    if (typeCode >= 30 && typeCode <= 39) return 'Fishing';
    if (typeCode === 36 || typeCode === 37) return 'Pleasure craft';
    return `Type ${typeCode}`;
}

function midToFlag(mmsi: string): string {
    // MID (first 3 digits) → coarse flag label; full ITU table is out of scope.
    const mid = mmsi.slice(0, 3);
    const known: Record<string, string> = {
        '211': 'Germany',
        '218': 'Germany',
        '232': 'United Kingdom',
        '233': 'United Kingdom',
        '234': 'United Kingdom',
        '235': 'United Kingdom',
        '244': 'Netherlands',
        '245': 'Netherlands',
        '246': 'Netherlands',
        '247': 'Italy',
        '249': 'Malta',
        '256': 'Malta',
        '257': 'Norway',
        '258': 'Norway',
        '259': 'Norway',
        '273': 'Russia',
        '308': 'Bahamas',
        '309': 'Bahamas',
        '311': 'Bahamas',
        '319': 'Cayman Islands',
        '338': 'United States',
        '366': 'United States',
        '367': 'United States',
        '368': 'United States',
        '369': 'United States',
        '477': 'Hong Kong',
        '538': 'Marshall Islands',
        '563': 'Singapore',
        '564': 'Singapore',
        '565': 'Singapore',
        '566': 'Singapore',
        '636': 'Liberia',
    };
    return known[mid] ?? 'Unknown';
}

export function aisStreamMessageParse(raw: unknown): AisStreamParsed {
    if (!raw || typeof raw !== 'object') return { kind: 'ignored' };
    const envelope = raw as {
        MessageType?: string;
        MetaData?: AisStreamMetaData;
        Message?: Record<string, unknown>;
    };

    const messageType = envelope.MessageType;
    const meta = envelope.MetaData ?? {};
    const message = envelope.Message ?? {};

    if (
        messageType === 'PositionReport' ||
        messageType === 'StandardClassBPositionReport' ||
        messageType === 'ExtendedClassBPositionReport'
    ) {
        const bodyKey =
            messageType === 'PositionReport'
                ? 'PositionReport'
                : messageType === 'StandardClassBPositionReport'
                  ? 'StandardClassBPositionReport'
                  : 'ExtendedClassBPositionReport';
        const body = (message[bodyKey] ?? {}) as PositionReportBody;
        if (body.Valid === false) return { kind: 'ignored' };

        const mmsi = mmsiFrom(body.UserID ?? meta.MMSI);
        if (!mmsi) return { kind: 'ignored' };

        const lat = body.Latitude ?? meta.Latitude ?? meta.latitude;
        const lon = body.Longitude ?? meta.Longitude ?? meta.longitude;
        if (lat === undefined || lon === undefined || !Number.isFinite(lat) || !Number.isFinite(lon)) {
            return { kind: 'ignored' };
        }
        // AIS uses 91 / 181 as "not available".
        if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return { kind: 'ignored' };

        const headingRaw = body.TrueHeading ?? 511;
        const heading = headingRaw >= 360 ? (body.Cog ?? 0) : headingRaw;
        const sog = body.Sog ?? 0;
        const cog = body.Cog ?? 0;
        const timestamp = meta.time_utc ? new Date(meta.time_utc).toISOString() : new Date().toISOString();

        const identity: VesselIdentity = {
            mmsi,
            name: cleanName(meta.ShipName) || `MMSI ${mmsi}`,
            shipType: 'Unknown',
            flag: midToFlag(mmsi),
        };

        const position: AisPosition = {
            mmsi,
            lat,
            lon,
            sog: Number.isFinite(sog) ? sog : 0,
            cog: Number.isFinite(cog) ? cog : 0,
            heading: Number.isFinite(heading) ? heading : 0,
            timestamp,
            navStatus: NAV_STATUS[body.NavigationalStatus ?? 15] ?? 'Not defined',
        };

        return { kind: 'position', identity, position };
    }

    if (messageType === 'ShipStaticData' || messageType === 'StaticDataReport') {
        const body = (message.ShipStaticData ?? message.StaticDataReport ?? {}) as ShipStaticDataBody;
        const mmsi = mmsiFrom(body.UserID ?? meta.MMSI);
        if (!mmsi) return { kind: 'ignored' };

        const identity: VesselIdentity = {
            mmsi,
            name: cleanName(body.Name) || cleanName(meta.ShipName) || `MMSI ${mmsi}`,
            imo: body.ImoNumber && body.ImoNumber > 0 ? String(body.ImoNumber) : undefined,
            callSign: cleanName(body.CallSign) || undefined,
            shipType: shipTypeLabel(body.Type),
            flag: midToFlag(mmsi),
        };
        return { kind: 'static', identity };
    }

    return { kind: 'ignored' };
}
