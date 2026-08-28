export type AisPosition = {
    mmsi: string;
    lat: number;
    lon: number;
    sog: number;
    cog: number;
    heading: number;
    timestamp: string;
    navStatus?: string;
};

export type VesselIdentity = {
    mmsi: string;
    name: string;
    imo?: string;
    callSign?: string;
    shipType: string;
    flag: string;
};

export type AnomalyKind = 'speedDrop' | 'headingZigZag' | 'loitering' | 'aisDark' | 'impossibleJump';

export type AnomalySeverity = 'low' | 'medium' | 'high' | 'critical';

export type Anomaly = {
    anomalyId: string;
    mmsi: string;
    kind: AnomalyKind;
    severity: AnomalySeverity;
    title: string;
    summary: string;
    detectedAtSimMs: number;
    evidence: Record<string, unknown>;
};

export type RiskLevel = 'green' | 'yellow' | 'orange' | 'red';

export type RiskTrend = 'rising' | 'stable' | 'falling';

export type RiskRule =
    | 'baseline'
    | 'speedDrop'
    | 'headingZigZag'
    | 'loitering'
    | 'aisDark'
    | 'impossibleJump'
    | 'zoneEntry'
    | 'nearProtectedAsset'
    | 'aisRadarMismatch';

export type RiskFactor = {
    rule: RiskRule;
    scoreDelta: number;
    explanation: string;
    source: string;
};

export type RiskEvent = {
    riskEventId: string;
    mmsi: string;
    detectedAtSimMs: number;
    rule: RiskRule;
    scoreDelta: number;
    previousScore: number;
    newScore: number;
    explanation: string;
    source: string;
};

type ProtectedAssetType = 'cable' | 'pipeline' | 'harbor' | 'windFarm' | 'restrictedZone';

export type ProtectedAsset = {
    assetId: string;
    name: string;
    type: ProtectedAssetType;
    /** Polyline for cables/pipelines, or closed ring for zones. */
    path: LatLon[];
    riskRadiusNm: number;
};

type IncidentStatus = 'open' | 'acknowledged' | 'closed';

export type IncidentTimelineEvent = {
    eventId: string;
    detectedAtSimMs: number;
    eventType: string;
    source: string;
    explanation: string;
    riskChange: number | null;
};

export type Incident = {
    incidentId: string;
    mmsi: string;
    openedAtSimMs: number;
    closedAtSimMs: number | null;
    maxRiskScore: number;
    status: IncidentStatus;
    timeline: IncidentTimelineEvent[];
};

export type OsintAlert = {
    alertId: string;
    source: string;
    title: string;
    body: string;
    region: string;
    issuedAt: string;
    relevanceTags: string[];
};

export type LatLon = {
    lat: number;
    lon: number;
};

export type HighRiskZone = {
    zoneId: string;
    name: string;
    ring: LatLon[];
};

/** Simulated non-AIS observation (radar / EO). Marked simulated in scenario data. */
export type SimulatedObservation = {
    observationId: string;
    mmsi: string;
    source: 'RADAR' | 'EO';
    /** Sim time when this observation becomes active. */
    activeFromSimMs: number;
    lat: number;
    lon: number;
    heading?: number;
    speed?: number;
    vesselType?: string;
    confidence: number;
    /** When set, used for AIS/radar position mismatch distance checks. */
    mismatchFromAisNm?: number;
};

export type ScenarioDefinition = {
    scenarioId: string;
    title: string;
    description: string;
    centerLat: number;
    centerLon: number;
    zoom: number;
    startSimMs: number;
    endSimMs: number;
    tickIntervalMs: number;
    vessels: VesselIdentity[];
    tracks: Record<string, AisPosition[]>;
    osintAlerts: OsintAlert[];
    highRiskZones: HighRiskZone[];
    protectedAssets: ProtectedAsset[];
    /** Clearly simulated multi-sensor inputs for demo credibility. */
    simulatedObservations: SimulatedObservation[];
};
