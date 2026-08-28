import type { AisPosition, Anomaly, AnomalyKind, AnomalySeverity, LatLon } from './types';

const EARTH_RADIUS_NM = 3440.065;
const DEG_TO_RAD = Math.PI / 180;

export type KinematicsDetectOpts = {
    simMs?: number;
    recentHeadings?: number[];
    inHighRiskZone?: boolean;
    speedDropThresholdKn?: number;
    speedDropWindowMs?: number;
    zigZagThresholdDeg?: number;
    loiterSogKn?: number;
    impossibleSpeedKn?: number;
};

function anomalyId(mmsi: string, kind: AnomalyKind, simMs: number): string {
    return `${mmsi}:${kind}:${simMs}`;
}

function makeAnomaly(
    mmsi: string,
    kind: AnomalyKind,
    severity: AnomalySeverity,
    title: string,
    summary: string,
    detectedAtSimMs: number,
    evidence: Record<string, unknown>,
): Anomaly {
    return {
        anomalyId: anomalyId(mmsi, kind, detectedAtSimMs),
        mmsi,
        kind,
        severity,
        title,
        summary,
        detectedAtSimMs,
        evidence,
    };
}

export function haversineNm(a: LatLon, b: LatLon): number {
    const dLat = (b.lat - a.lat) * DEG_TO_RAD;
    const dLon = (b.lon - a.lon) * DEG_TO_RAD;
    const lat1 = a.lat * DEG_TO_RAD;
    const lat2 = b.lat * DEG_TO_RAD;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return 2 * EARTH_RADIUS_NM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function pointInPolygon(point: LatLon, ring: LatLon[]): boolean {
    if (ring.length < 3) return false;
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const xi = ring[i]!.lon;
        const yi = ring[i]!.lat;
        const xj = ring[j]!.lon;
        const yj = ring[j]!.lat;
        const intersects = yi > point.lat !== yj > point.lat && point.lon < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;
        if (intersects) inside = !inside;
    }
    return inside;
}

export function aisGapDetect(
    lastPosition: AisPosition,
    nowSimMs: number,
    gapThresholdMs = 10 * 60_000,
    lastPositionSimMs?: number,
): Anomaly | null {
    const lastMs = lastPositionSimMs ?? Date.parse(lastPosition.timestamp);
    if (Number.isNaN(lastMs)) return null;
    const gapMs = nowSimMs - lastMs;
    if (gapMs <= gapThresholdMs) return null;
    return makeAnomaly(
        lastPosition.mmsi,
        'aisDark',
        gapMs > 20 * 60_000 ? 'critical' : 'high',
        'AIS signal lost',
        `No AIS update for ${Math.round(gapMs / 60_000)} minutes since last known position.`,
        nowSimMs,
        {
            lastKnownLat: lastPosition.lat,
            lastKnownLon: lastPosition.lon,
            lastTimestamp: lastPosition.timestamp,
            gapMs,
            gapThresholdMs,
        },
    );
}

function headingDeltaDeg(from: number, to: number): number {
    const d = ((to - from + 540) % 360) - 180;
    return Math.abs(d);
}

export function kinematicsDetect(prev: AisPosition | null, curr: AisPosition, opts: KinematicsDetectOpts = {}): Anomaly[] {
    const anomalies: Anomaly[] = [];
    const simMs = opts.simMs ?? Date.parse(curr.timestamp);
    const speedDropThresholdKn = opts.speedDropThresholdKn ?? 8;
    const speedDropWindowMs = opts.speedDropWindowMs ?? 5 * 60_000;
    const zigZagThresholdDeg = opts.zigZagThresholdDeg ?? 90;
    const loiterSogKn = opts.loiterSogKn ?? 2;
    const impossibleSpeedKn = opts.impossibleSpeedKn ?? 60;

    if (prev) {
        const dtMs = Date.parse(curr.timestamp) - Date.parse(prev.timestamp);
        if (dtMs > 0) {
            const distNm = haversineNm({ lat: prev.lat, lon: prev.lon }, { lat: curr.lat, lon: curr.lon });
            const impliedKn = distNm / (dtMs / 3_600_000);
            if (impliedKn > impossibleSpeedKn) {
                anomalies.push(
                    makeAnomaly(
                        curr.mmsi,
                        'impossibleJump',
                        'critical',
                        'Impossible AIS jump',
                        `Implied speed ${impliedKn.toFixed(0)} kn over ${(dtMs / 60_000).toFixed(1)} min exceeds ${impossibleSpeedKn} kn.`,
                        simMs,
                        {
                            from: { lat: prev.lat, lon: prev.lon, timestamp: prev.timestamp },
                            to: { lat: curr.lat, lon: curr.lon, timestamp: curr.timestamp },
                            distanceNm: distNm,
                            impliedKn,
                            dtMs,
                        },
                    ),
                );
            }

            if (dtMs <= speedDropWindowMs && prev.sog > speedDropThresholdKn && prev.sog - curr.sog >= speedDropThresholdKn) {
                anomalies.push(
                    makeAnomaly(
                        curr.mmsi,
                        'speedDrop',
                        curr.sog < 2 ? 'high' : 'medium',
                        'Sudden speed drop',
                        `SOG fell from ${prev.sog.toFixed(1)} to ${curr.sog.toFixed(1)} kn in ${(dtMs / 60_000).toFixed(1)} min.`,
                        simMs,
                        {
                            prevSog: prev.sog,
                            currSog: curr.sog,
                            dropKn: prev.sog - curr.sog,
                            dtMs,
                        },
                    ),
                );
            }
        }
    }

    const headings = opts.recentHeadings ?? (prev ? [prev.heading, curr.heading] : [curr.heading]);
    if (headings.length >= 3) {
        let cumulative = 0;
        for (let i = 1; i < headings.length; i++) {
            cumulative += headingDeltaDeg(headings[i - 1]!, headings[i]!);
        }
        if (cumulative > zigZagThresholdDeg) {
            anomalies.push(
                makeAnomaly(
                    curr.mmsi,
                    'headingZigZag',
                    cumulative > 150 ? 'high' : 'medium',
                    'Erratic heading changes',
                    `Cumulative heading change ${cumulative.toFixed(0)}° across ${headings.length} samples.`,
                    simMs,
                    { headings, cumulativeDeg: cumulative, thresholdDeg: zigZagThresholdDeg },
                ),
            );
        }
    }

    if (opts.inHighRiskZone && curr.sog <= loiterSogKn) {
        anomalies.push(
            makeAnomaly(
                curr.mmsi,
                'loitering',
                'medium',
                'Loitering in high-risk zone',
                `Vessel holding ${curr.sog.toFixed(1)} kn inside a high-risk zone.`,
                simMs,
                { sog: curr.sog, lat: curr.lat, lon: curr.lon, loiterSogKn },
            ),
        );
    }

    return anomalies;
}
