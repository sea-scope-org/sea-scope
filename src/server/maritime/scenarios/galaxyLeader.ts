import type { AisPosition, OsintAlert, ScenarioDefinition, SimulatedObservation, VesselIdentity } from '../types';

const SCENARIO_ID = 'galaxy-leader';
const TICK_MS = 60_000;
const START_MS = 0;
const END_MS = 55 * 60_000;
const BASE_ISO = '2023-11-19T12:00:00.000Z';

const GALAXY_MMSI = '538090574';
const DECOY_MMSI = '477123456';
/** Supporting Yellow contacts — keep Demo Needs attention at four flagged ships. */
const SPEED_DROP_MMSI = '636019001';
const ZIGZAG_MMSI = '538008201';

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
    { mmsi: SPEED_DROP_MMSI, name: 'RED SEA TRADER', shipType: 'General Cargo', flag: 'Liberia', callSign: 'D5AB1' },
    { mmsi: ZIGZAG_MMSI, name: 'BAB MANDAB EXPRESS', shipType: 'Container Ship', flag: 'Marshall Islands', callSign: 'V7YZ2' },
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

/** Sudden SOG collapse — Yellow attention without competing with Galaxy Leader. */
function buildSpeedDropTrack(): AisPosition[] {
    const dropMs = 22 * 60_000;
    const before = trackTransit(SPEED_DROP_MMSI, START_MS, dropMs, 14.55, 42.6, 12.0, 350, 0);
    const last = before[before.length - 1]!;
    const after = trackTransit(SPEED_DROP_MMSI, dropMs + TICK_MS, END_MS, last.lat, last.lon, 2.5, 350, 0);
    return [...before, ...after];
}

/** Erratic headings plus a speed collapse — Yellow without competing with Galaxy Leader. */
function buildZigZagTrack(): AisPosition[] {
    const dropMs = 24 * 60_000;
    const out: AisPosition[] = [];
    let lat = 14.45;
    let lon = 42.7;
    const headings = [5, 95, 185, 275, 20, 140, 250, 40];
    let phase = 0;
    for (let t = START_MS; t <= END_MS; t += TICK_MS) {
        const heading = headings[phase % headings.length]!;
        const sog = t >= dropMs ? 3.0 : 16.5;
        out.push(pos(ZIGZAG_MMSI, t, lat, lon, sog, heading, heading));
        const next = advance(lat, lon, Math.max(sog, 0.5), heading, TICK_MS);
        lat = next.lat;
        lon = next.lon;
        phase += 1;
    }
    return out;
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
        'Historical-style AIS replay of the November 2023 Galaxy Leader hijacking near Bab el-Mandeb: normal transit, sudden speed drop and heading changes, then AIS dark, with a sanctions-related decoy jump, two supporting Yellow contacts (speed drop; zigzag + speed drop), and UKMTO-style OSINT. Four demo ships raise attention flags; live AIS supplies the rest of the traffic. Includes simulated radar/EO observations for contradiction demos. Protected cables/pipelines come from the real-WGS84 infrastructure catalog on the fused watch board.',
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
        [SPEED_DROP_MMSI]: buildSpeedDropTrack(),
        [ZIGZAG_MMSI]: buildZigZagTrack(),
    },
    osintAlerts,
    protectedAssets: [],
    simulatedObservations,
};

export const SCENARIO_CATALOG: Record<string, ScenarioDefinition> = {
    [galaxyLeaderScenario.scenarioId]: galaxyLeaderScenario,
};
