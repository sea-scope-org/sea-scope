import type {
    GqlSAnomaly,
    GqlSHighRiskZone,
    GqlSIncident,
    GqlSLatLon,
    GqlSOsintAlert,
    GqlSProtectedAsset,
    GqlSRiskEvent,
    GqlSRiskFactor,
    GqlSScenarioSummary,
    GqlSVessel,
    GqlSVesselIntelligence,
    GqlSVesselPosition,
    GqlSWatchDataSourceStatus,
    GqlSWatchState,
} from '../graphql/generated';
import type { ScenarioPlayerState, ScenarioVesselState } from '../maritime/scenarioRuntime';
import type {
    Anomaly,
    HighRiskZone,
    Incident,
    LatLon,
    OsintAlert,
    ProtectedAsset,
    RiskEvent,
    RiskFactor,
    ScenarioDefinition,
} from '../maritime/types';
import type { VesselIntelligence } from '../maritime/vesselIntelligenceStore';
import type { WatchDataSourceStatus } from '../maritime/watchBoardRuntime';

function toGqlLatLon(point: LatLon): GqlSLatLon {
    return { lat: point.lat, lon: point.lon };
}

function toGqlVesselPosition(position: NonNullable<ScenarioVesselState['position']>): GqlSVesselPosition {
    return {
        mmsi: position.mmsi,
        lat: position.lat,
        lon: position.lon,
        sog: position.sog,
        cog: position.cog,
        heading: position.heading,
        timestamp: new Date(position.timestamp),
        navStatus: position.navStatus ?? null,
    };
}

function toGqlRiskFactor(factor: RiskFactor): GqlSRiskFactor {
    return {
        rule: factor.rule,
        scoreDelta: factor.scoreDelta,
        explanation: factor.explanation,
        source: factor.source,
    };
}

function toGqlVessel(vessel: ScenarioVesselState): GqlSVessel {
    return {
        mmsi: vessel.mmsi,
        name: vessel.name,
        imo: vessel.imo ?? null,
        callSign: vessel.callSign ?? null,
        shipType: vessel.shipType,
        flag: vessel.flag,
        aisDark: vessel.aisDark,
        dataSource: vessel.dataSource,
        position: vessel.position ? toGqlVesselPosition(vessel.position) : null,
        riskScore: vessel.riskScore,
        riskLevel: vessel.riskLevel,
        riskTrend: vessel.riskTrend,
        activeFactors: vessel.activeFactors.map(toGqlRiskFactor),
        nearestAssetId: vessel.nearestAssetId,
        nearestAssetDistanceNm: vessel.nearestAssetDistanceNm,
        trackTail: vessel.trackTail.map(toGqlLatLon),
        radarPosition: vessel.radarPosition ? toGqlLatLon(vessel.radarPosition) : null,
    };
}

export function toGqlAnomaly(anomaly: Anomaly): GqlSAnomaly {
    return {
        anomalyId: anomaly.anomalyId,
        mmsi: anomaly.mmsi,
        kind: anomaly.kind,
        severity: anomaly.severity,
        title: anomaly.title,
        summary: anomaly.summary,
        detectedAtSimMs: anomaly.detectedAtSimMs,
        evidence: anomaly.evidence,
    };
}

function toGqlRiskEvent(event: RiskEvent): GqlSRiskEvent {
    return {
        riskEventId: event.riskEventId,
        mmsi: event.mmsi,
        detectedAtSimMs: event.detectedAtSimMs,
        rule: event.rule,
        scoreDelta: event.scoreDelta,
        previousScore: event.previousScore,
        newScore: event.newScore,
        explanation: event.explanation,
        source: event.source,
    };
}

function toGqlIncident(incident: Incident): GqlSIncident {
    return {
        incidentId: incident.incidentId,
        mmsi: incident.mmsi,
        openedAtSimMs: incident.openedAtSimMs,
        closedAtSimMs: incident.closedAtSimMs,
        maxRiskScore: incident.maxRiskScore,
        status: incident.status,
        timeline: incident.timeline.map((e) => ({
            eventId: e.eventId,
            detectedAtSimMs: e.detectedAtSimMs,
            eventType: e.eventType,
            source: e.source,
            explanation: e.explanation,
            riskChange: e.riskChange,
        })),
    };
}

function toGqlOsintAlert(alert: OsintAlert): GqlSOsintAlert {
    return {
        alertId: alert.alertId,
        source: alert.source,
        title: alert.title,
        body: alert.body,
        region: alert.region,
        issuedAt: new Date(alert.issuedAt),
        relevanceTags: alert.relevanceTags,
    };
}

function toGqlHighRiskZone(zone: HighRiskZone): GqlSHighRiskZone {
    return {
        zoneId: zone.zoneId,
        name: zone.name,
        ring: zone.ring.map(toGqlLatLon),
    };
}

function toGqlProtectedAsset(asset: ProtectedAsset): GqlSProtectedAsset {
    return {
        assetId: asset.assetId,
        name: asset.name,
        type: asset.type,
        path: asset.path.map(toGqlLatLon),
        riskRadiusNm: asset.riskRadiusNm,
    };
}

function toGqlWatchDataSourceStatus(status: WatchDataSourceStatus): GqlSWatchDataSourceStatus {
    return {
        id: status.id,
        enabled: status.enabled,
        status: status.status,
        vesselCount: status.vesselCount,
    };
}

export function toGqlWatchState(
    state: ScenarioPlayerState,
    scenario: ScenarioDefinition,
    dataSources: WatchDataSourceStatus[] = [],
): GqlSWatchState {
    return {
        scenarioId: state.scenarioId,
        title: scenario.title,
        description: scenario.description,
        status: state.status,
        simMs: state.simMs,
        centerLat: scenario.centerLat,
        centerLon: scenario.centerLon,
        zoom: scenario.zoom,
        selectedMmsi: state.selectedMmsi,
        vessels: state.vessels.map(toGqlVessel),
        anomalies: state.anomalies.map(toGqlAnomaly),
        riskEvents: state.riskEvents.map(toGqlRiskEvent),
        incidents: state.incidents.map(toGqlIncident),
        osintAlerts: scenario.osintAlerts.map(toGqlOsintAlert),
        highRiskZones: scenario.highRiskZones.map(toGqlHighRiskZone),
        protectedAssets: scenario.protectedAssets.map(toGqlProtectedAsset),
        dataSources: dataSources.map(toGqlWatchDataSourceStatus),
    };
}

export function toGqlScenarioSummary(scenario: ScenarioDefinition): GqlSScenarioSummary {
    return {
        scenarioId: scenario.scenarioId,
        title: scenario.title,
        description: scenario.description,
    };
}

export function toGqlVesselIntelligence(intelligence: VesselIntelligence): GqlSVesselIntelligence {
    return {
        mmsi: intelligence.mmsi,
        vesselName: intelligence.vesselName,
        status: intelligence.status,
        summary: intelligence.summary,
        whyFlagged: intelligence.whyFlagged,
        citations: intelligence.citations.map((c) => ({ label: c.label, source: c.source })),
        playbookSteps: intelligence.playbookSteps,
        generatedAt: new Date(intelligence.generatedAt),
        complete: intelligence.complete,
    };
}
