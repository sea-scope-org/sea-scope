import { environmentVariables } from '../env/environmentVariablesCreate';
import { aisStreamIngestIsStarted, aisStreamIngestStatus, aisStreamIngestStatusDetail } from './aisStreamIngest';
import { scenarioOffsetToBbox } from './aisTheater';
import { protectedInfrastructureAssets } from './infrastructure/protectedInfrastructureCatalog';
import { aisGapDetect, kinematicsDetect } from './kinematicsDetect';
import { RISK_BASELINE, riskCompute, riskLevelFromScore, stickyKindsFromAnomalies } from './riskEngine';
import { DEFAULT_SCENARIO_ID, scenarioDefinitionGet } from './scenarioRuntime';
import type { ScenarioPlayerState, ScenarioVesselState } from './scenarioRuntime';
import { mockScenarioSourceIsStarted, mockScenarioSourceSimMs, mockScenarioSourceStatus } from './sources/mockScenarioSource';
import type { Anomaly, Incident, IncidentTimelineEvent, RiskEvent, ScenarioDefinition } from './types';
import { vesselTrackStoreCountBySource, vesselTrackStoreList } from './vesselTrackStore';
import type { TrackedVessel } from './vesselTrackStore';

const AIS_DARK_GAP_MS = 15 * 60_000;

export type WatchDataSourceStatus = {
    id: 'mock' | 'aisstream';
    enabled: boolean;
    status: string;
    vesselCount: number;
};

type SessionUi = {
    selectedMmsi: string | null;
};

type WatchBoard = {
    startedAtMs: number;
    vessels: ScenarioVesselState[];
    anomalies: Anomaly[];
    riskEvents: RiskEvent[];
    incidents: Incident[];
    scoreByMmsi: Map<string, number>;
    anomalyKeys: Set<string>;
    lastTickAnomalies: Anomaly[];
    dirty: boolean;
};

const sessions = new Map<string, SessionUi>();
let board: WatchBoard | null = null;

function boardEnsure(): WatchBoard {
    if (!board) {
        board = {
            startedAtMs: Date.now(),
            vessels: [],
            anomalies: [],
            riskEvents: [],
            incidents: [],
            scoreByMmsi: new Map(),
            anomalyKeys: new Set(),
            lastTickAnomalies: [],
            dirty: true,
        };
    }
    return board;
}

export function watchBoardOverlayScenario(): ScenarioDefinition {
    const scenario = scenarioDefinitionGet(DEFAULT_SCENARIO_ID);
    if (!scenario) throw new Error('Galaxy Leader scenario missing');

    const center = {
        lat: (environmentVariables.aisStreamBoundingBox.southLat + environmentVariables.aisStreamBoundingBox.northLat) / 2,
        lon: (environmentVariables.aisStreamBoundingBox.westLon + environmentVariables.aisStreamBoundingBox.eastLon) / 2,
    };
    const protectedAssets = protectedInfrastructureAssets();

    // Demo geometry (zones, simulated radar, OSINT) only when the mock feeder is
    // running — otherwise live AIS would be scored against Red Sea overlays
    // mapped into the Gibraltar theater. Real cables/pipelines stay WGS84.
    if (!mockScenarioSourceIsStarted()) {
        return {
            ...scenario,
            title: 'SeaScope watch — live',
            description:
                'Live AISStream watch board with real undersea cables and pipelines (TeleGeography + EMODnet). Enable Demo for Galaxy Leader incident tracks and theater overlays.',
            centerLat: center.lat,
            centerLon: center.lon,
            zoom: 9,
            protectedAssets,
            simulatedObservations: [],
            osintAlerts: [],
            vessels: [],
            tracks: {},
        };
    }

    const shifted = scenarioOffsetToBbox(scenario, environmentVariables.aisStreamBoundingBox);
    return {
        ...shifted,
        protectedAssets,
        title: 'SeaScope watch — live + demo',
        description:
            'Fused watch board: Galaxy Leader mock incident tracks (shifted into the live AIS bounding box) stream alongside AISStream positions. Real undersea cables and pipelines (TeleGeography + EMODnet) and OSINT overlay the theater.',
    };
}

/** Drop sticky risk/anomaly/incident state so live vessels do not keep demo scores after Demo is turned off. */
export function watchBoardClearStickyState(): void {
    const state = boardEnsure();
    state.anomalies = [];
    state.riskEvents = [];
    state.incidents = [];
    state.scoreByMmsi = new Map();
    state.anomalyKeys = new Set();
    state.lastTickAnomalies = [];
    state.dirty = true;
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

function vesselFromTrack(tracked: TrackedVessel, wallMs: number): ScenarioVesselState {
    const lastMs = Date.parse(tracked.position.timestamp);
    const aisDark = Number.isFinite(lastMs) && wallMs - lastMs > AIS_DARK_GAP_MS;
    return {
        ...tracked.identity,
        position: tracked.position,
        aisDark,
        riskScore: RISK_BASELINE,
        riskLevel: 'green',
        riskTrend: 'stable',
        activeFactors: [],
        nearestAssetId: null,
        nearestAssetDistanceNm: null,
        trackTail: tracked.trackTail,
        radarPosition: null,
        dataSource: tracked.source,
    };
}

export function watchBoardDataSources(): WatchDataSourceStatus[] {
    return [
        {
            id: 'mock',
            enabled: mockScenarioSourceStatus() !== 'disabled',
            status: mockScenarioSourceStatus(),
            vesselCount: vesselTrackStoreCountBySource('mock'),
        },
        {
            id: 'aisstream',
            enabled: aisStreamIngestIsStarted() || aisStreamIngestStatus() !== 'disabled',
            status: aisStreamIngestStatusDetail(),
            vesselCount: vesselTrackStoreCountBySource('aisstream'),
        },
    ];
}

/** Recompute fused board from the track store. Returns true when something changed. */
export function watchBoardTick(scenario: ScenarioDefinition): boolean {
    const state = boardEnsure();
    const wallMs = Date.now();
    const demoOn = mockScenarioSourceIsStarted();
    const simMs = demoOn ? mockScenarioSourceSimMs() : wallMs - state.startedAtMs;
    const trackedVessels = vesselTrackStoreList();
    const newAnomalies: Anomaly[] = [];

    const vessels: ScenarioVesselState[] = trackedVessels.map((tracked) => {
        const vessel = vesselFromTrack(tracked, wallMs);
        // While Demo is on, live AIS stays map clutter — only mock contacts raise
        // attention flags (four curated narrative ships). Sticky live anomalies from
        // before Demo would otherwise flood Needs attention.
        const raiseAttention = !demoOn || tracked.source === 'mock';
        const prev = tracked.previousPosition;
        const curr = tracked.position;

        if (raiseAttention && prev && prev.timestamp !== curr.timestamp) {
            const detected = kinematicsDetect(prev, curr, {
                simMs,
                recentHeadings: [...tracked.headingHistory],
            });
            for (const anomaly of detected) {
                const key = `${anomaly.mmsi}:${anomaly.kind}`;
                if (!state.anomalyKeys.has(key)) {
                    state.anomalyKeys.add(key);
                    newAnomalies.push(anomaly);
                }
            }
        }

        if (raiseAttention && vessel.aisDark) {
            const dark = aisGapDetect(curr, wallMs, AIS_DARK_GAP_MS, Date.parse(curr.timestamp));
            if (dark) {
                const key = `${dark.mmsi}:${dark.kind}`;
                if (!state.anomalyKeys.has(key)) {
                    state.anomalyKeys.add(key);
                    newAnomalies.push(dark);
                }
            }
        }

        return vessel;
    });

    if (newAnomalies.length > 0) {
        state.anomalies = [...state.anomalies, ...newAnomalies];
        state.dirty = true;
    }
    state.lastTickAnomalies = newAnomalies;

    const newRiskEvents: RiskEvent[] = [];
    const scored: ScenarioVesselState[] = [];

    for (const vessel of vessels) {
        const previousScore = state.scoreByMmsi.get(vessel.mmsi) ?? RISK_BASELINE;
        const raiseAttention = !demoOn || vessel.dataSource === 'mock';

        if (!raiseAttention) {
            if (previousScore !== RISK_BASELINE) state.dirty = true;
            state.scoreByMmsi.set(vessel.mmsi, RISK_BASELINE);
            scored.push({
                ...vessel,
                riskScore: RISK_BASELINE,
                riskLevel: 'green',
                riskTrend: 'stable',
                activeFactors: [],
                nearestAssetId: null,
                nearestAssetDistanceNm: null,
                radarPosition: null,
            });
            continue;
        }

        const position = vessel.position ? { lat: vessel.position.lat, lon: vessel.position.lon } : null;
        const computed = riskCompute({
            mmsi: vessel.mmsi,
            simMs,
            position,
            sogKn: vessel.position?.sog ?? null,
            aisDark: vessel.aisDark,
            stickyKinds: stickyKindsFromAnomalies(state.anomalies, vessel.mmsi),
            protectedAssets: scenario.protectedAssets,
            simulatedObservations: scenario.simulatedObservations,
            previousScore,
        });

        if (computed.riskScore !== previousScore || computed.newEvents.length > 0) {
            state.dirty = true;
        }
        state.scoreByMmsi.set(vessel.mmsi, computed.riskScore);
        newRiskEvents.push(...computed.newEvents);

        const previousLevel = riskLevelFromScore(previousScore);
        if (previousLevel !== 'red' && computed.riskLevel === 'red') {
            const existingOpen = state.incidents.find((i) => i.mmsi === vessel.mmsi && i.status === 'open');
            if (!existingOpen) {
                state.incidents = [
                    ...state.incidents,
                    incidentOpen(vessel.mmsi, simMs, computed.riskScore, [
                        ...computed.newEvents.map(timelineFromRiskEvent),
                        {
                            eventId: `tl:red:${vessel.mmsi}:${simMs}`,
                            detectedAtSimMs: simMs,
                            eventType: 'redThreshold',
                            source: 'risk-engine',
                            explanation: `Risk exceeded Red threshold (${computed.riskScore})`,
                            riskChange: computed.riskScore - previousScore,
                        },
                    ]),
                ];
                state.dirty = true;
            }
        }

        const openIncident = state.incidents.find((i) => i.mmsi === vessel.mmsi && (i.status === 'open' || i.status === 'acknowledged'));
        if (openIncident) {
            openIncident.maxRiskScore = Math.max(openIncident.maxRiskScore, computed.riskScore);
            for (const event of computed.newEvents) {
                openIncident.timeline = [...openIncident.timeline, timelineFromRiskEvent(event)];
            }
        }

        scored.push({
            ...vessel,
            riskScore: computed.riskScore,
            riskLevel: computed.riskLevel,
            riskTrend: computed.riskTrend,
            activeFactors: computed.activeFactors,
            nearestAssetId: computed.nearestAssetId,
            nearestAssetDistanceNm: computed.nearestAssetDistanceNm,
            radarPosition: computed.radarPosition,
        });
    }

    if (newRiskEvents.length > 0) {
        state.riskEvents = [...state.riskEvents, ...newRiskEvents];
    }

    const prevCount = state.vessels.length;
    state.vessels = scored;
    if (scored.length !== prevCount) state.dirty = true;

    const changed = state.dirty || newAnomalies.length > 0 || scored.length > 0;
    state.dirty = false;
    return changed;
}

export function watchBoardSnapshot(sessionId: string, scenario: ScenarioDefinition): ScenarioPlayerState {
    const state = boardEnsure();
    watchBoardTick(scenario);
    const ui = sessions.get(sessionId) ?? { selectedMmsi: null };
    const simMs = mockScenarioSourceIsStarted() ? mockScenarioSourceSimMs() : Date.now() - state.startedAtMs;

    return {
        sessionId,
        scenarioId: DEFAULT_SCENARIO_ID,
        status: 'running',
        simMs,
        vessels: state.vessels,
        anomalies: state.anomalies,
        riskEvents: state.riskEvents,
        incidents: state.incidents,
        selectedMmsi: ui.selectedMmsi,
    };
}

export function watchBoardSessionEnsure(sessionId: string): void {
    boardEnsure();
    if (!sessions.has(sessionId)) {
        sessions.set(sessionId, { selectedMmsi: null });
    }
}

export function watchBoardSessionList(): string[] {
    return [...sessions.keys()];
}

export function watchBoardSessionSelectVessel(sessionId: string, mmsi: string | null): void {
    const ui = sessions.get(sessionId);
    if (!ui) return;
    ui.selectedMmsi = mmsi;
}

export function watchBoardSessionAcknowledgeAlert(sessionId: string, incidentId: string): boolean {
    if (!sessions.has(sessionId)) return false;
    const state = boardEnsure();
    const incident = state.incidents.find((i) => i.incidentId === incidentId);
    if (!incident) return false;
    const simMs = mockScenarioSourceIsStarted() ? mockScenarioSourceSimMs() : Date.now() - state.startedAtMs;
    incident.status = 'acknowledged';
    incident.timeline = [
        ...incident.timeline,
        {
            eventId: `tl:ack:${incidentId}:${simMs}`,
            detectedAtSimMs: simMs,
            eventType: 'acknowledged',
            source: 'operator',
            explanation: 'Operator acknowledged Red alert',
            riskChange: null,
        },
    ];
    state.dirty = true;
    return true;
}

export function watchBoardLastTickAnomalies(): Anomaly[] {
    return board?.lastTickAnomalies ?? [];
}

function watchBoardReset(): void {
    board = {
        startedAtMs: Date.now(),
        vessels: [],
        anomalies: [],
        riskEvents: [],
        incidents: [],
        scoreByMmsi: new Map(),
        anomalyKeys: new Set(),
        lastTickAnomalies: [],
        dirty: true,
    };
}

export function watchBoardSessionReset(sessionId: string): void {
    sessions.set(sessionId, { selectedMmsi: null });
    watchBoardReset();
}
