import type { AisPosition, OsintAlert, ProtectedAsset, ScenarioDefinition, SimulatedObservation, VesselIdentity } from '../types';

const SCENARIO_ID = 'galaxy-leader';
const TICK_MS = 60_000;
const START_MS = 0;
const END_MS = 55 * 60_000;
const BASE_ISO = '2023-11-19T12:00:00.000Z';

const GALAXY_MMSI = '538090574';
const DECOY_MMSI = '477123456';

function simIso(simMs: number): string {
    return new Date(Date.parse(BASE_ISO) + simMs).toISOString();
}

function pos(
    mmsi: string,
    simMs: number,
    lat: number,
    lon: number,
    sog: number,
    cog: number,
    heading: number,
    navStatus = 'Under way using engine',
): AisPosition {
    return { mmsi, lat, lon, sog, cog, heading, timestamp: simIso(simMs), navStatus };
}

function advance(lat: number, lon: number, sogKn: number, cogDeg: number, dtMs: number): { lat: number; lon: number } {
    const hours = dtMs / 3_600_000;
    const distNm = sogKn * hours;
    const rad = (cogDeg * Math.PI) / 180;
    const dLat = (distNm * Math.cos(rad)) / 60;
    const dLon = (distNm * Math.sin(rad)) / (60 * Math.cos((lat * Math.PI) / 180));
    return { lat: lat + dLat, lon: lon + dLon };
}

function trackTransit(
    mmsi: string,
    startSimMs: number,
    endSimMs: number,
    startLat: number,
    startLon: number,
    sog: number,
    cog: number,
    headingJitter = 0,
): AisPosition[] {
    const out: AisPosition[] = [];
    let lat = startLat;
    let lon = startLon;
    for (let t = startSimMs; t <= endSimMs; t += TICK_MS) {
        const jitter = headingJitter === 0 ? 0 : Math.sin(t / TICK_MS) * headingJitter;
        const hdg = (cog + jitter + 360) % 360;
        out.push(pos(mmsi, t, lat, lon, sog, cog, hdg));
        const next = advance(lat, lon, sog, cog, TICK_MS);
        lat = next.lat;
        lon = next.lon;
    }
    return out;
}

const vessels: VesselIdentity[] = [
    {
        mmsi: GALAXY_MMSI,
        name: 'GALAXY LEADER',
        imo: '9237307',
        callSign: 'C6F82',
        shipType: 'Vehicle Carrier',
        flag: 'Bahamas',
    },
    {
        mmsi: DECOY_MMSI,
        name: 'PACIFIC HORIZON',
        imo: '9123456',
        callSign: 'VRAB7',
        shipType: 'Bulk Carrier',
        flag: 'Hong Kong',
    },
    { mmsi: '636019001', name: 'RED SEA TRADER', shipType: 'General Cargo', flag: 'Liberia', callSign: 'D5AB1' },
    { mmsi: '538008201', name: 'BAB MANDAB EXPRESS', shipType: 'Container Ship', flag: 'Marshall Islands', callSign: 'V7YZ2' },
    { mmsi: '311000441', name: 'ADEN STAR', shipType: 'Tanker', flag: 'Bahamas', callSign: 'C6XY3' },
    { mmsi: '636092118', name: 'HODEIDAH SPIRIT', shipType: 'Oil Tanker', flag: 'Liberia', callSign: 'A8PQ4' },
    { mmsi: '249000771', name: 'SUEZ BOUND', shipType: 'Container Ship', flag: 'Malta', callSign: '9HA5K' },
    { mmsi: '563000882', name: 'SINGAPORE BRIDGE', shipType: 'Container Ship', flag: 'Singapore', callSign: '9V8L2' },
    { mmsi: '477334001', name: 'ORIENT PEARL', shipType: 'Bulk Carrier', flag: 'Hong Kong', callSign: 'VRCD9' },
    { mmsi: '538071122', name: 'MARSHALL GLORY', shipType: 'Vehicle Carrier', flag: 'Marshall Islands', callSign: 'V7MM8' },
    { mmsi: '636015533', name: 'LIBERIA WAVE', shipType: 'General Cargo', flag: 'Liberia', callSign: 'D5LW6' },
    { mmsi: '311001992', name: 'CARIBBEAN TRADER', shipType: 'Ro-Ro', flag: 'Bahamas', callSign: 'C6RT1' },
    { mmsi: '235089441', name: 'BRITANNIA GULF', shipType: 'Tanker', flag: 'United Kingdom', callSign: 'MAFG7' },
    { mmsi: '366998221', name: 'PACIFIC WATCH', shipType: 'Research Vessel', flag: 'United States', callSign: 'WDPW2' },
    { mmsi: '710000331', name: 'ATLANTICO SUL', shipType: 'Bulk Carrier', flag: 'Brazil', callSign: 'PPAS3' },
    { mmsi: '419001556', name: 'MUMBAI MARINER', shipType: 'General Cargo', flag: 'India', callSign: 'VTMM5' },
    { mmsi: '622121001', name: 'CAIRO VOYAGER', shipType: 'Passenger', flag: 'Egypt', callSign: 'SUCV1' },
    { mmsi: '470001882', name: 'GULF FALCON', shipType: 'Tug', flag: 'UAE', callSign: 'A6GF8' },
];

function buildGalaxyLeaderTrack(): AisPosition[] {
    const out: AisPosition[] = [];
    let lat = 14.72;
    let lon = 42.38;
    const normalEnd = 20 * 60_000;
    const dropEnd = 28 * 60_000;
    const lastAis = 30 * 60_000;

    for (let t = START_MS; t <= normalEnd; t += TICK_MS) {
        out.push(pos(GALAXY_MMSI, t, lat, lon, 14.2, 168, 170));
        const next = advance(lat, lon, 14.2, 168, TICK_MS);
        lat = next.lat;
        lon = next.lon;
    }

    const dropPhases: Array<{ sog: number; cog: number; heading: number }> = [
        { sog: 5.5, cog: 140, heading: 120 },
        { sog: 2.1, cog: 95, heading: 55 },
        { sog: 1.2, cog: 40, heading: 350 },
        { sog: 0.8, cog: 10, heading: 280 },
        { sog: 0.6, cog: 320, heading: 210 },
        { sog: 0.4, cog: 290, heading: 150 },
        { sog: 0.3, cog: 250, heading: 90 },
        { sog: 0.2, cog: 220, heading: 40 },
    ];

    let phase = 0;
    for (let t = normalEnd + TICK_MS; t <= dropEnd; t += TICK_MS) {
        const p = dropPhases[Math.min(phase, dropPhases.length - 1)]!;
        out.push(pos(GALAXY_MMSI, t, lat, lon, p.sog, p.cog, p.heading));
        const next = advance(lat, lon, Math.max(p.sog, 0.2), p.cog, TICK_MS);
        lat = next.lat;
        lon = next.lon;
        phase += 1;
    }

    for (let t = dropEnd + TICK_MS; t <= lastAis; t += TICK_MS) {
        out.push(pos(GALAXY_MMSI, t, lat, lon, 0.2, 220, 180, 'Not under command'));
        const next = advance(lat, lon, 0.2, 220, TICK_MS);
        lat = next.lat;
        lon = next.lon;
    }

    return out;
}

function buildDecoyTrack(): AisPosition[] {
    const jumpMs = 35 * 60_000;
    const transit = trackTransit(DECOY_MMSI, START_MS, 34 * 60_000, 14.9, 42.15, 11.5, 175, 2);
    const afterJump = trackTransit(DECOY_MMSI, jumpMs, END_MS, 16.8, 40.2, 12, 180, 1);
    return [...transit, ...afterJump];
}

function buildBackgroundTracks(): Record<string, AisPosition[]> {
    const specs: Array<{ mmsi: string; lat: number; lon: number; sog: number; cog: number }> = [
        { mmsi: '636019001', lat: 14.55, lon: 42.6, sog: 12.0, cog: 350 },
        { mmsi: '538008201', lat: 14.2, lon: 42.7, sog: 16.5, cog: 5 },
        { mmsi: '311000441', lat: 14.85, lon: 42.45, sog: 13.2, cog: 172 },
        { mmsi: '636092118', lat: 14.4, lon: 42.2, sog: 10.8, cog: 155 },
        { mmsi: '249000771', lat: 15.05, lon: 42.55, sog: 15.0, cog: 185 },
        { mmsi: '563000882', lat: 14.1, lon: 42.9, sog: 17.2, cog: 355 },
        { mmsi: '477334001', lat: 14.65, lon: 41.95, sog: 11.0, cog: 95 },
        { mmsi: '538071122', lat: 14.95, lon: 42.8, sog: 14.5, cog: 200 },
        { mmsi: '636015533', lat: 14.3, lon: 42.5, sog: 9.5, cog: 340 },
        { mmsi: '311001992', lat: 14.75, lon: 42.1, sog: 13.8, cog: 160 },
        { mmsi: '235089441', lat: 15.15, lon: 42.35, sog: 12.4, cog: 178 },
        { mmsi: '366998221', lat: 14.5, lon: 42.85, sog: 6.0, cog: 270 },
        { mmsi: '710000331', lat: 14.05, lon: 42.4, sog: 10.2, cog: 15 },
        { mmsi: '419001556', lat: 14.88, lon: 42.65, sog: 11.8, cog: 190 },
        { mmsi: '622121001', lat: 14.35, lon: 42.15, sog: 8.5, cog: 80 },
        { mmsi: '470001882', lat: 14.6, lon: 42.55, sog: 4.2, cog: 220 },
    ];

    const tracks: Record<string, AisPosition[]> = {};
    for (const s of specs) {
        tracks[s.mmsi] = trackTransit(s.mmsi, START_MS, END_MS, s.lat, s.lon, s.sog, s.cog, 1.5);
    }
    return tracks;
}

const osintAlerts: OsintAlert[] = [
    {
        alertId: 'ukmto-2023-11-19-a',
        source: 'UKMTO',
        title: 'UKMTO Advisory — Southern Red Sea Threat',
        body: 'Masters are advised of heightened risk of attack in the southern Red Sea and approaches to Bab el-Mandeb. Maintain heightened vigilance and report suspicious approaches immediately.',
        region: 'Red Sea / Bab el-Mandeb',
        issuedAt: '2023-11-19T08:30:00.000Z',
        relevanceTags: ['red-sea', 'piracy', 'houthi', 'ukmto', 'bab-el-mandeb'],
    },
    {
        alertId: 'ukmto-2023-11-19-b',
        source: 'UKMTO',
        title: 'Incident Warning — Vessel Boarding Reported',
        body: 'Reports received of an attempted or successful boarding of a commercial vessel in the southern Red Sea. Vessels in the area should divert if safe and practicable and contact UKMTO / coalition authorities.',
        region: 'Southern Red Sea',
        issuedAt: '2023-11-19T14:10:00.000Z',
        relevanceTags: ['red-sea', 'piracy', 'boarding', 'galaxy-leader', 'ukmto'],
    },
    {
        alertId: 'met-red-sea-2023-11-19',
        source: 'METAREA VIII',
        title: 'Weather Note — Moderate NW Winds',
        body: 'NW winds 15–20 kn, seas 1–1.5 m in the southern Red Sea. Visibility good. No tropical cyclone activity. Conditions allow small-craft operations near the Yemeni coast.',
        region: 'Red Sea',
        issuedAt: '2023-11-19T06:00:00.000Z',
        relevanceTags: ['red-sea', 'weather'],
    },
];

/** Undersea cable corridor through the approach — demo protected infrastructure. */
const protectedAssets: ProtectedAsset[] = [
    {
        assetId: 'cable-c17',
        name: 'Cable C17',
        type: 'cable',
        path: [
            { lat: 14.85, lon: 42.15 },
            { lat: 14.55, lon: 42.35 },
            { lat: 14.35, lon: 42.55 },
            { lat: 14.2, lon: 42.75 },
        ],
        riskRadiusNm: 3,
    },
];

/**
 * Simulated radar track for Galaxy Leader — diverges from AIS during loiter,
 * then persists as a dark contact after AIS drops. Clearly mock sensor input.
 */
const simulatedObservations: SimulatedObservation[] = [
    {
        observationId: 'sim-radar-galaxy-loiter',
        mmsi: GALAXY_MMSI,
        source: 'RADAR',
        activeFromSimMs: 26 * 60_000,
        lat: 14.48,
        lon: 42.52,
        heading: 95,
        speed: 0.4,
        confidence: 0.94,
        mismatchFromAisNm: 0.85,
    },
    {
        observationId: 'sim-eo-galaxy-type',
        mmsi: GALAXY_MMSI,
        source: 'EO',
        activeFromSimMs: 27 * 60_000,
        lat: 14.48,
        lon: 42.52,
        vesselType: 'Tanker',
        confidence: 0.71,
    },
];

const galaxyLeaderScenario: ScenarioDefinition = {
    scenarioId: SCENARIO_ID,
    title: 'Galaxy Leader — Southern Red Sea',
    description:
        'Historical-style AIS replay of the November 2023 Galaxy Leader hijacking near Bab el-Mandeb: normal transit, sudden speed drop and heading changes, then AIS dark, with a sanctions-related decoy jump and UKMTO-style OSINT. Includes protected Cable C17 and simulated radar/EO observations for contradiction demos.',
    centerLat: 14.5,
    centerLon: 42.5,
    zoom: 8,
    startSimMs: START_MS,
    endSimMs: END_MS,
    tickIntervalMs: TICK_MS,
    vessels,
    tracks: {
        [GALAXY_MMSI]: buildGalaxyLeaderTrack(),
        [DECOY_MMSI]: buildDecoyTrack(),
        ...buildBackgroundTracks(),
    },
    osintAlerts,
    highRiskZones: [
        {
            zoneId: 'bab-el-mandeb-approach',
            name: 'Bab el-Mandeb southern approach',
            ring: [
                { lat: 14.9, lon: 42.1 },
                { lat: 14.9, lon: 42.85 },
                { lat: 14.15, lon: 42.85 },
                { lat: 14.15, lon: 42.1 },
                { lat: 14.9, lon: 42.1 },
            ],
        },
    ],
    protectedAssets,
    simulatedObservations,
};

export const SCENARIO_CATALOG: Record<string, ScenarioDefinition> = {
    [galaxyLeaderScenario.scenarioId]: galaxyLeaderScenario,
};
