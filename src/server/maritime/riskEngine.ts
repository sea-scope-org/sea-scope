import { haversineNm } from './kinematicsDetect';
import type {
    Anomaly,
    AnomalyKind,
    LatLon,
    ProtectedAsset,
    RiskEvent,
    RiskFactor,
    RiskLevel,
    RiskRule,
    RiskTrend,
    SimulatedObservation,
} from './types';

export const RISK_BASELINE = 12;

/** Configurable rule deltas — capped total score at 100. */
const RISK_RULE_DELTAS: Record<Exclude<RiskRule, 'baseline'>, number> = {
    speedDrop: 18,
    headingZigZag: 12,
    aisDark: 25,
    impossibleJump: 30,
    nearProtectedAsset: 18,
    aisRadarMismatch: 20,
};

const RULE_EXPLANATIONS: Record<Exclude<RiskRule, 'baseline'>, string> = {
    speedDrop: 'Sudden speed reduction detected on AIS',
    headingZigZag: 'Erratic heading changes on AIS track',
    aisDark: 'AIS transmission interrupted',
    impossibleJump: 'Impossible AIS position jump',
    nearProtectedAsset: 'Within risk radius of protected asset',
    aisRadarMismatch: 'AIS and simulated radar positions disagree',
};

export function riskLevelFromScore(score: number): RiskLevel {
    if (score >= 80) return 'red';
    if (score >= 60) return 'orange';
    if (score >= 30) return 'yellow';
    return 'green';
}

function riskScoreCap(score: number): number {
    return Math.max(0, Math.min(100, Math.round(score)));
}

export function distanceToPolylineNm(point: LatLon, path: LatLon[]): number {
    if (path.length === 0) return Number.POSITIVE_INFINITY;
    if (path.length === 1) return haversineNm(point, path[0]!);
    let min = Number.POSITIVE_INFINITY;
    for (let i = 1; i < path.length; i++) {
        const a = path[i - 1]!;
        const b = path[i]!;
        min = Math.min(min, distanceToSegmentNm(point, a, b));
    }
    return min;
}

function distanceToSegmentNm(point: LatLon, a: LatLon, b: LatLon): number {
    const ab = haversineNm(a, b);
    if (ab < 1e-9) return haversineNm(point, a);
    // Project lon by cos(midLat) for a local closest-point approximation on the segment.
    const midLat = ((a.lat + b.lat) / 2) * (Math.PI / 180);
    const ax = a.lon * Math.cos(midLat);
    const bx = b.lon * Math.cos(midLat);
    const px = point.lon * Math.cos(midLat);
    const ay = a.lat;
    const by = b.lat;
    const py = point.lat;
    const dx = bx - ax;
    const dy = by - ay;
    const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1)));
    const closest: LatLon = {
        lat: a.lat + t * (b.lat - a.lat),
        lon: a.lon + t * (b.lon - a.lon),
    };
    return haversineNm(point, closest);
}

/** Rough degree pad for risk-radius bbox rejection (~1° ≈ 60 nm). */
function assetWithinSearchBox(point: LatLon, path: ReadonlyArray<LatLon>, searchNm: number): boolean {
    if (path.length === 0) return false;
    const padDeg = searchNm / 60 + 0.05;
    let minLat = path[0]!.lat;
    let maxLat = path[0]!.lat;
    let minLon = path[0]!.lon;
    let maxLon = path[0]!.lon;
    for (let i = 1; i < path.length; i++) {
        const p = path[i]!;
        if (p.lat < minLat) minLat = p.lat;
        if (p.lat > maxLat) maxLat = p.lat;
        if (p.lon < minLon) minLon = p.lon;
        if (p.lon > maxLon) maxLon = p.lon;
    }
    return point.lat >= minLat - padDeg && point.lat <= maxLat + padDeg && point.lon >= minLon - padDeg && point.lon <= maxLon + padDeg;
}

export function nearestProtectedAsset(
    point: LatLon,
    assets: ReadonlyArray<ProtectedAsset>,
): { asset: ProtectedAsset; distanceNm: number } | null {
    let best: { asset: ProtectedAsset; distanceNm: number } | null = null;
    for (const asset of assets) {
        const searchNm = Math.max(asset.riskRadiusNm * 2, 30);
        if (!assetWithinSearchBox(point, asset.path, searchNm)) continue;
        const distanceNm = distanceToPolylineNm(point, asset.path);
        if (!best || distanceNm < best.distanceNm) {
            best = { asset, distanceNm };
        }
    }
    return best;
}

export type RiskComputeInput = {
    mmsi: string;
    simMs: number;
    position: LatLon | null;
    sogKn: number | null;
    aisDark: boolean;
    stickyKinds: ReadonlySet<AnomalyKind>;
    protectedAssets: ReadonlyArray<ProtectedAsset>;
    simulatedObservations: ReadonlyArray<SimulatedObservation>;
    previousScore: number;
};

export type RiskComputeResult = {
    riskScore: number;
    riskLevel: RiskLevel;
    riskTrend: RiskTrend;
    activeFactors: RiskFactor[];
    nearestAssetId: string | null;
    nearestAssetDistanceNm: number | null;
    radarPosition: LatLon | null;
    newEvents: RiskEvent[];
};

function factor(rule: Exclude<RiskRule, 'baseline'>, source: string, explanation?: string): RiskFactor {
    return {
        rule,
        scoreDelta: RISK_RULE_DELTAS[rule],
        explanation: explanation ?? RULE_EXPLANATIONS[rule],
        source,
    };
}

function riskFactorsCompute(input: RiskComputeInput): {
    factors: RiskFactor[];
    nearestAssetId: string | null;
    nearestAssetDistanceNm: number | null;
    radarPosition: LatLon | null;
} {
    const factors: RiskFactor[] = [];
    let nearestAssetId: string | null = null;
    let nearestAssetDistanceNm: number | null = null;
    let radarPosition: LatLon | null = null;

    if (input.stickyKinds.has('speedDrop')) {
        factors.push(factor('speedDrop', 'ais:kinematics'));
    }
    if (input.stickyKinds.has('headingZigZag')) {
        factors.push(factor('headingZigZag', 'ais:kinematics'));
    }
    if (input.stickyKinds.has('impossibleJump')) {
        factors.push(factor('impossibleJump', 'ais:kinematics'));
    }
    if (input.aisDark) {
        factors.push(factor('aisDark', 'ais:gap'));
    }

    if (input.position) {
        // Nearest cable/pipeline is chart context only — oceans are dense with infra,
        // so proximity alone must not raise risk. Combine with abnormal behavior later if needed.
        const nearest = nearestProtectedAsset(input.position, input.protectedAssets);
        if (nearest) {
            nearestAssetId = nearest.asset.assetId;
            nearestAssetDistanceNm = nearest.distanceNm;
        }
    }

    const radarObs = input.simulatedObservations.find(
        (o) => o.mmsi === input.mmsi && o.source === 'RADAR' && o.activeFromSimMs <= input.simMs,
    );
    if (radarObs) {
        radarPosition = { lat: radarObs.lat, lon: radarObs.lon };
        if (input.position) {
            const mismatchNm = radarObs.mismatchFromAisNm ?? haversineNm(input.position, { lat: radarObs.lat, lon: radarObs.lon });
            if (mismatchNm >= 0.3) {
                factors.push(
                    factor(
                        'aisRadarMismatch',
                        `sim:${radarObs.observationId}`,
                        `AIS/radar positions differ by ~${mismatchNm.toFixed(2)} nm (simulated radar)`,
                    ),
                );
            }
        } else if (input.aisDark) {
            factors.push(
                factor('aisRadarMismatch', `sim:${radarObs.observationId}`, 'Simulated radar contact without matching AIS (DARK CONTACT)'),
            );
        }
    }

    return { factors, nearestAssetId, nearestAssetDistanceNm, radarPosition };
}

export function riskScoreFromFactors(factors: ReadonlyArray<RiskFactor>): number {
    const raw = RISK_BASELINE + factors.reduce((sum, f) => sum + f.scoreDelta, 0);
    return riskScoreCap(raw);
}

function riskTrendFromScores(previousScore: number, nextScore: number): RiskTrend {
    const delta = nextScore - previousScore;
    if (delta >= 3) return 'rising';
    if (delta <= -3) return 'falling';
    return 'stable';
}

export function riskCompute(input: RiskComputeInput): RiskComputeResult {
    const { factors, nearestAssetId, nearestAssetDistanceNm, radarPosition } = riskFactorsCompute(input);
    const riskScore = riskScoreFromFactors(factors);
    const riskLevel = riskLevelFromScore(riskScore);
    const riskTrend = riskTrendFromScores(input.previousScore, riskScore);
    const previousLevel = riskLevelFromScore(input.previousScore);

    const newEvents: RiskEvent[] = [];
    if (riskScore !== input.previousScore || riskLevel !== previousLevel) {
        const added = factors.filter((f) => f.scoreDelta > 0);
        const primary = added[added.length - 1];
        const rule: RiskRule = primary?.rule ?? 'baseline';
        const explanation =
            primary?.explanation ??
            (riskScore > input.previousScore
                ? `Risk rose to ${riskScore}`
                : riskScore < input.previousScore
                  ? `Risk fell to ${riskScore}`
                  : `Risk band ${riskLevel}`);
        newEvents.push({
            riskEventId: `${input.mmsi}:${input.simMs}:${rule}`,
            mmsi: input.mmsi,
            detectedAtSimMs: input.simMs,
            rule,
            scoreDelta: riskScore - input.previousScore,
            previousScore: input.previousScore,
            newScore: riskScore,
            explanation,
            source: primary?.source ?? 'risk-engine',
        });
    }

    return {
        riskScore,
        riskLevel,
        riskTrend,
        activeFactors: factors,
        nearestAssetId,
        nearestAssetDistanceNm,
        radarPosition,
        newEvents,
    };
}

/** Map sticky anomaly list → kinds set for scoring. */
export function stickyKindsFromAnomalies(anomalies: ReadonlyArray<Anomaly>, mmsi: string): Set<AnomalyKind> {
    const set = new Set<AnomalyKind>();
    for (const a of anomalies) {
        if (a.mmsi === mmsi) set.add(a.kind);
    }
    return set;
}
