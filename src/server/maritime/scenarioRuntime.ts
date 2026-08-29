import { aisGapDetect, kinematicsDetect } from './kinematicsDetect';
import { RISK_BASELINE, riskCompute, riskLevelFromScore, stickyKindsFromAnomalies } from './riskEngine';
import { SCENARIO_CATALOG } from './scenarios/galaxyLeader';
import type {
    AisPosition,
    Anomaly,
    Incident,
    IncidentTimelineEvent,
    LatLon,
    RiskEvent,
    RiskFactor,
    RiskLevel,
    RiskTrend,
    ScenarioDefinition,
    VesselIdentity,
} from './types';

export type ScenarioVesselState = VesselIdentity & {
    position: AisPosition | null;
    aisDark: boolean;
    riskScore: number;
    riskLevel: RiskLevel;
    riskTrend: RiskTrend;
    activeFactors: RiskFactor[];
    nearestAssetId: string | null;
    nearestAssetDistanceNm: number | null;
    trackTail: LatLon[];
    radarPosition: LatLon | null;
    /** Ingest source when fused; scenario-only players default to mock. */
    dataSource: 'mock' | 'aisstream';
};

type ScenarioPlayerStatus = 'running' | 'completed';

export const DEFAULT_SCENARIO_ID = 'galaxy-leader';

export type ScenarioPlayerState = {
    sessionId: string;
    scenarioId: string;
    status: ScenarioPlayerStatus;
    simMs: number;
    vessels: ScenarioVesselState[];
    anomalies: Anomaly[];
    riskEvents: RiskEvent[];
    incidents: Incident[];
    selectedMmsi: string | null;
};

type InternalPlayer = {
    state: ScenarioPlayerState;
    scenario: ScenarioDefinition;
    previousByMmsi: Map<string, AisPosition>;
    lastKnownByMmsi: Map<string, AisPosition>;
    headingHistoryByMmsi: Map<string, number[]>;
    trackTailByMmsi: Map<string, LatLon[]>;
    scoreByMmsi: Map<string, number>;
    anomalyKeys: Set<string>;
    lastTickAnomalies: Anomaly[];
};

const players = new Map<string, InternalPlayer>();

const HEADING_HISTORY_LEN = 6;
const TRACK_TAIL_LEN = 12;
const AIS_DARK_GAP_MS = 10 * 60_000;

function toSimMs(scenario: ScenarioDefinition, iso: string): number {
    const firstTrack = Object.values(scenario.tracks).find((t) => t.length > 0);
    const first = firstTrack?.[0];
    const base = first ? Date.parse(first.timestamp) - scenario.startSimMs : 0;
    return Date.parse(iso) - base;
}

function livePositionAt(track: AisPosition[], simMs: number, tickIntervalMs: number, scenario: ScenarioDefinition): AisPosition | null {
    const half = tickIntervalMs / 2;
    for (const p of track) {
        const t = toSimMs(scenario, p.timestamp);
        if (Math.abs(t - simMs) <= half) return p;
        if (t > simMs + half) break;
    }
    return null;
}

function lastKnownAt(track: AisPosition[], simMs: number, scenario: ScenarioDefinition): AisPosition | null {
    let best: AisPosition | null = null;
    for (const p of track) {
        const t = toSimMs(scenario, p.timestamp);
        if (t <= simMs) best = p;
        else break;
    }
    return best;
}

function anomalyDedupeKey(mmsi: string, kind: Anomaly['kind']): string {
    return `${mmsi}:${kind}`;
}

function vesselDefaults(v: VesselIdentity): ScenarioVesselState {
    return {
        ...v,
        position: null,
        aisDark: false,
        riskScore: RISK_BASELINE,
        riskLevel: 'green',
        riskTrend: 'stable',
        activeFactors: [],
        nearestAssetId: null,
        nearestAssetDistanceNm: null,
        trackTail: [],
        radarPosition: null,
        dataSource: 'mock',
    };
}

function snapshotVessels(scenario: ScenarioDefinition, simMs: number, lastKnownByMmsi: Map<string, AisPosition>): ScenarioVesselState[] {
    return scenario.vessels.map((v) => {
        const track = scenario.tracks[v.mmsi] ?? [];
        const live = livePositionAt(track, simMs, scenario.tickIntervalMs, scenario);
        const lastKnown = live ?? lastKnownAt(track, simMs, scenario) ?? lastKnownByMmsi.get(v.mmsi) ?? null;
        const lastSim = lastKnown ? toSimMs(scenario, lastKnown.timestamp) : null;
        const aisDark = lastSim !== null && simMs - lastSim > AIS_DARK_GAP_MS;
        return { ...vesselDefaults(v), position: live ?? lastKnown, aisDark };
    });
}

function emptyState(sessionId: string, scenario: ScenarioDefinition): ScenarioPlayerState {
    return {
        sessionId,
        scenarioId: scenario.scenarioId,
        status: 'running',
        simMs: scenario.startSimMs,
        vessels: scenario.vessels.map(vesselDefaults),
        anomalies: [],
        riskEvents: [],
        incidents: [],
        selectedMmsi: null,
    };
}

function pushTrackTail(map: Map<string, LatLon[]>, mmsi: string, point: LatLon): LatLon[] {
    const prev = map.get(mmsi) ?? [];
    const last = prev[prev.length - 1];
    if (last && last.lat === point.lat && last.lon === point.lon) {
        return prev;
    }
    const next = [...prev, point];
    while (next.length > TRACK_TAIL_LEN) next.shift();
    map.set(mmsi, next);
    return next;
}

function incidentOpen(mmsi: string, simMs: number, score: number, seedEvents: IncidentTimelineEvent[]): Incident {
    return {
        incidentId: `inc:${mmsi}:${simMs}`,
        mmsi,
        openedAtSimMs: simMs,
        closedAtSimMs: null,
        maxRiskScore: score,
        status: 'open',
        timeline: seedEvents,
    };
}

function timelineFromRiskEvent(event: RiskEvent): IncidentTimelineEvent {
    return {
        eventId: `tl:${event.riskEventId}`,
        detectedAtSimMs: event.detectedAtSimMs,
        eventType: event.rule,
        source: event.source,
        explanation: event.explanation,
        riskChange: event.scoreDelta,
    };
}

export function scenarioPositionSample(scenario: ScenarioDefinition, mmsi: string, simMs: number): AisPosition | null {
    const track = scenario.tracks[mmsi] ?? [];
    return livePositionAt(track, simMs, scenario.tickIntervalMs, scenario) ?? lastKnownAt(track, simMs, scenario);
}

export function scenarioPlayerGet(sessionId: string): ScenarioPlayerState | null {
    return players.get(sessionId)?.state ?? null;
}

export function scenarioPlayerStart(sessionId: string, scenarioId: string = DEFAULT_SCENARIO_ID): ScenarioPlayerState {
    const scenario = SCENARIO_CATALOG[scenarioId];
    if (!scenario) {
        throw new Error(`Unknown scenario: ${scenarioId}`);
    }
    const lastKnownByMmsi = new Map<string, AisPosition>();
    const scoreByMmsi = new Map<string, number>();
    const trackTailByMmsi = new Map<string, LatLon[]>();
    const state = emptyState(sessionId, scenario);
    state.vessels = snapshotVessels(scenario, state.simMs, lastKnownByMmsi);
    for (const v of state.vessels) {
        if (v.position) {
            lastKnownByMmsi.set(v.mmsi, v.position);
            v.trackTail = pushTrackTail(trackTailByMmsi, v.mmsi, { lat: v.position.lat, lon: v.position.lon });
        }
        scoreByMmsi.set(v.mmsi, RISK_BASELINE);
    }
    // Score initial tick (baseline only).
    applyRiskToVessels(state, scenario, scoreByMmsi, trackTailByMmsi, []);
    players.set(sessionId, {
        state,
        scenario,
        previousByMmsi: new Map(),
        lastKnownByMmsi,
        headingHistoryByMmsi: new Map(),
        trackTailByMmsi,
        scoreByMmsi,
        anomalyKeys: new Set(),
        lastTickAnomalies: [],
    });
    return state;
}

/** Returns the live player for a session, creating/restarting the default scenario when needed. */
export function scenarioPlayerEnsure(sessionId: string, scenarioId: string = DEFAULT_SCENARIO_ID): ScenarioPlayerState {
    const existing = players.get(sessionId);
    if (existing && existing.state.status === 'running') {
        return existing.state;
    }
    return scenarioPlayerStart(sessionId, scenarioId);
}

export function scenarioPlayerReset(sessionId: string, scenarioId: string = DEFAULT_SCENARIO_ID): ScenarioPlayerState {
    return scenarioPlayerStart(sessionId, scenarioId);
}

export function scenarioPlayerLastTickAnomalies(sessionId: string): Anomaly[] {
    return players.get(sessionId)?.lastTickAnomalies ?? [];
}

export function scenarioDefinitionGet(scenarioId: string): ScenarioDefinition | null {
    return SCENARIO_CATALOG[scenarioId] ?? null;
}

export function scenarioCatalogList(): ScenarioDefinition[] {
    return Object.values(SCENARIO_CATALOG);
}

export function scenarioPlayerSelectVessel(sessionId: string, mmsi: string | null): ScenarioPlayerState | null {
    const player = players.get(sessionId);
    if (!player) return null;
    player.state.selectedMmsi = mmsi;
    return player.state;
}

export function scenarioPlayerAcknowledgeAlert(sessionId: string, incidentId: string): ScenarioPlayerState | null {
    const player = players.get(sessionId);
    if (!player) return null;
    const incident = player.state.incidents.find((i) => i.incidentId === incidentId);
    if (!incident) return null;
    incident.status = 'acknowledged';
    incident.timeline = [
        ...incident.timeline,
        {
            eventId: `tl:ack:${incidentId}:${player.state.simMs}`,
            detectedAtSimMs: player.state.simMs,
            eventType: 'acknowledged',
            source: 'operator',
            explanation: 'Operator acknowledged Red alert',
            riskChange: null,
        },
    ];
    return player.state;
}

function applyRiskToVessels(
    state: ScenarioPlayerState,
    scenario: ScenarioDefinition,
    scoreByMmsi: Map<string, number>,
    trackTailByMmsi: Map<string, LatLon[]>,
    newRiskEventsOut: RiskEvent[],
): void {
    const vessels: ScenarioVesselState[] = [];
    for (const vessel of state.vessels) {
        const position = vessel.position ? { lat: vessel.position.lat, lon: vessel.position.lon } : null;
        const previousScore = scoreByMmsi.get(vessel.mmsi) ?? RISK_BASELINE;
        const computed = riskCompute({
            mmsi: vessel.mmsi,
            simMs: state.simMs,
            position,
            sogKn: vessel.position?.sog ?? null,
            aisDark: vessel.aisDark,
            stickyKinds: stickyKindsFromAnomalies(state.anomalies, vessel.mmsi),
            protectedAssets: scenario.protectedAssets,
            simulatedObservations: scenario.simulatedObservations,
            previousScore,
        });

        scoreByMmsi.set(vessel.mmsi, computed.riskScore);
        newRiskEventsOut.push(...computed.newEvents);

        const previousLevel = riskLevelFromScore(previousScore);
        if (previousLevel !== 'red' && computed.riskLevel === 'red') {
            const existingOpen = state.incidents.find((i) => i.mmsi === vessel.mmsi && i.status === 'open');
            if (!existingOpen) {
                const seed: IncidentTimelineEvent[] = [
                    ...state.riskEvents
                        .filter((e) => e.mmsi === vessel.mmsi)
                        .slice(-8)
                        .map(timelineFromRiskEvent),
                    ...computed.newEvents.map(timelineFromRiskEvent),
                    {
                        eventId: `tl:red:${vessel.mmsi}:${state.simMs}`,
                        detectedAtSimMs: state.simMs,
                        eventType: 'redThreshold',
                        source: 'risk-engine',
                        explanation: `Risk exceeded Red threshold (${computed.riskScore})`,
                        riskChange: computed.riskScore - previousScore,
                    },
                ];
                state.incidents = [...state.incidents, incidentOpen(vessel.mmsi, state.simMs, computed.riskScore, seed)];
            }
        }

        const openIncident = state.incidents.find((i) => i.mmsi === vessel.mmsi && (i.status === 'open' || i.status === 'acknowledged'));
        if (openIncident) {
            openIncident.maxRiskScore = Math.max(openIncident.maxRiskScore, computed.riskScore);
            for (const event of computed.newEvents) {
                openIncident.timeline = [...openIncident.timeline, timelineFromRiskEvent(event)];
            }
        }

        vessels.push({
            ...vessel,
            riskScore: computed.riskScore,
            riskLevel: computed.riskLevel,
            riskTrend: computed.riskTrend,
            activeFactors: computed.activeFactors,
            nearestAssetId: computed.nearestAssetId,
            nearestAssetDistanceNm: computed.nearestAssetDistanceNm,
            trackTail: trackTailByMmsi.get(vessel.mmsi) ?? vessel.trackTail,
            radarPosition: computed.radarPosition,
        });
    }
    state.vessels = vessels;
    if (newRiskEventsOut.length > 0) {
        state.riskEvents = [...state.riskEvents, ...newRiskEventsOut];
    }
}

export function scenarioPlayerTick(sessionId: string): ScenarioPlayerState | null {
    const player = players.get(sessionId);
    if (!player) return null;
    if (player.state.status !== 'running') return player.state;

    const { scenario, previousByMmsi, lastKnownByMmsi, headingHistoryByMmsi, anomalyKeys, trackTailByMmsi, scoreByMmsi } = player;
    const nextSimMs = Math.min(player.state.simMs + scenario.tickIntervalMs, scenario.endSimMs);

    if (nextSimMs === player.state.simMs) {
        player.state.status = 'completed';
        return player.state;
    }

    player.state.simMs = nextSimMs;
    const vessels = snapshotVessels(scenario, nextSimMs, lastKnownByMmsi);
    const newAnomalies: Anomaly[] = [];

    for (const vessel of vessels) {
        const track = scenario.tracks[vessel.mmsi] ?? [];
        const live = livePositionAt(track, nextSimMs, scenario.tickIntervalMs, scenario);
        const prev = previousByMmsi.get(vessel.mmsi) ?? null;

        if (live) {
            lastKnownByMmsi.set(vessel.mmsi, live);
            vessel.trackTail = pushTrackTail(trackTailByMmsi, vessel.mmsi, { lat: live.lat, lon: live.lon });
            const history = headingHistoryByMmsi.get(vessel.mmsi) ?? [];
            history.push(live.heading);
            while (history.length > HEADING_HISTORY_LEN) history.shift();
            headingHistoryByMmsi.set(vessel.mmsi, history);

            const detected = kinematicsDetect(prev, live, {
                simMs: nextSimMs,
                recentHeadings: [...history],
            });
            for (const a of detected) {
                const key = anomalyDedupeKey(a.mmsi, a.kind);
                if (!anomalyKeys.has(key)) {
                    anomalyKeys.add(key);
                    newAnomalies.push(a);
                }
            }
            previousByMmsi.set(vessel.mmsi, live);
        } else {
            const lastKnown = lastKnownByMmsi.get(vessel.mmsi) ?? lastKnownAt(track, nextSimMs, scenario);
            if (lastKnown) {
                vessel.trackTail = pushTrackTail(trackTailByMmsi, vessel.mmsi, { lat: lastKnown.lat, lon: lastKnown.lon });
                const lastSim = toSimMs(scenario, lastKnown.timestamp);
                const dark = aisGapDetect(lastKnown, nextSimMs, AIS_DARK_GAP_MS, lastSim);
                if (dark) {
                    const key = anomalyDedupeKey(dark.mmsi, dark.kind);
                    if (!anomalyKeys.has(key)) {
                        anomalyKeys.add(key);
                        newAnomalies.push(dark);
                    }
                }
            }
        }
    }

    player.state.vessels = vessels;
    player.lastTickAnomalies = newAnomalies;
    if (newAnomalies.length > 0) {
        player.state.anomalies = [...player.state.anomalies, ...newAnomalies];
    }

    const newRiskEvents: RiskEvent[] = [];
    applyRiskToVessels(player.state, scenario, scoreByMmsi, trackTailByMmsi, newRiskEvents);

    if (nextSimMs >= scenario.endSimMs) {
        player.state.status = 'completed';
    }

    return player.state;
}
