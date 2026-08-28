import { describe, expect, it } from 'vitest';
import {
    distanceToPolylineNm,
    nearestProtectedAsset,
    RISK_BASELINE,
    riskCompute,
    riskLevelFromScore,
    riskScoreFromFactors,
} from './riskEngine';
import type { ProtectedAsset, RiskFactor } from './types';

describe('riskLevelFromScore', () => {
    it('maps PRD bands', () => {
        expect(riskLevelFromScore(0)).toBe('green');
        expect(riskLevelFromScore(29)).toBe('green');
        expect(riskLevelFromScore(30)).toBe('yellow');
        expect(riskLevelFromScore(59)).toBe('yellow');
        expect(riskLevelFromScore(60)).toBe('orange');
        expect(riskLevelFromScore(79)).toBe('orange');
        expect(riskLevelFromScore(80)).toBe('red');
        expect(riskLevelFromScore(100)).toBe('red');
    });
});

describe('riskScoreFromFactors', () => {
    it('adds baseline and caps at 100', () => {
        const factors: RiskFactor[] = [
            { rule: 'speedDrop', scoreDelta: 18, explanation: 'x', source: 't' },
            { rule: 'aisDark', scoreDelta: 25, explanation: 'x', source: 't' },
            { rule: 'loitering', scoreDelta: 22, explanation: 'x', source: 't' },
            { rule: 'aisRadarMismatch', scoreDelta: 20, explanation: 'x', source: 't' },
            { rule: 'impossibleJump', scoreDelta: 30, explanation: 'x', source: 't' },
        ];
        expect(riskScoreFromFactors([])).toBe(RISK_BASELINE);
        expect(riskScoreFromFactors(factors)).toBe(100);
    });
});

describe('distanceToPolylineNm / nearestProtectedAsset', () => {
    const cable: ProtectedAsset = {
        assetId: 'cable-c17',
        name: 'Cable C17',
        type: 'cable',
        path: [
            { lat: 14.5, lon: 42.2 },
            { lat: 14.5, lon: 42.6 },
        ],
        riskRadiusNm: 0.5,
    };

    it('measures distance to a cable polyline', () => {
        const onLine = distanceToPolylineNm({ lat: 14.5, lon: 42.4 }, cable.path);
        expect(onLine).toBeLessThan(0.05);
        const offLine = distanceToPolylineNm({ lat: 14.7, lon: 42.4 }, cable.path);
        expect(offLine).toBeGreaterThan(5);
    });

    it('returns nearest asset', () => {
        const nearest = nearestProtectedAsset({ lat: 14.5, lon: 42.4 }, [cable]);
        expect(nearest?.asset.assetId).toBe('cable-c17');
    });
});

describe('riskCompute', () => {
    const cable: ProtectedAsset = {
        assetId: 'cable-c17',
        name: 'Cable C17',
        type: 'cable',
        path: [
            { lat: 14.4, lon: 42.3 },
            { lat: 14.4, lon: 42.5 },
        ],
        riskRadiusNm: 5,
    };

    it('starts at baseline green with no factors', () => {
        const result = riskCompute({
            mmsi: '1',
            simMs: 0,
            position: { lat: 14.0, lon: 42.0 },
            sogKn: 12,
            aisDark: false,
            inHighRiskZone: false,
            stickyKinds: new Set(),
            protectedAssets: [cable],
            simulatedObservations: [],
            previousScore: RISK_BASELINE,
        });
        expect(result.riskScore).toBe(RISK_BASELINE);
        expect(result.riskLevel).toBe('green');
        expect(result.newEvents).toHaveLength(0);
    });

    it('emits a risk event when score rises above green', () => {
        const result = riskCompute({
            mmsi: '538090574',
            simMs: 21 * 60_000,
            position: { lat: 14.0, lon: 42.0 },
            sogKn: 5,
            aisDark: false,
            inHighRiskZone: false,
            stickyKinds: new Set(['speedDrop']),
            protectedAssets: [cable],
            simulatedObservations: [],
            previousScore: RISK_BASELINE,
        });
        expect(result.riskLevel).toBe('yellow');
        expect(result.riskScore).toBe(RISK_BASELINE + 18);
        expect(result.newEvents).toHaveLength(1);
        expect(result.newEvents[0]!.previousScore).toBe(RISK_BASELINE);
        expect(result.newEvents[0]!.newScore).toBe(result.riskScore);
        expect(result.riskTrend).toBe('rising');
    });

    it('reaches red with stacked factors including simulated radar mismatch', () => {
        const result = riskCompute({
            mmsi: '538090574',
            simMs: 32 * 60_000,
            position: { lat: 14.4, lon: 42.4 },
            sogKn: 0.2,
            aisDark: true,
            inHighRiskZone: true,
            stickyKinds: new Set(['speedDrop', 'headingZigZag', 'loitering', 'aisDark']),
            protectedAssets: [cable],
            simulatedObservations: [
                {
                    observationId: 'radar-gl-1',
                    mmsi: '538090574',
                    source: 'RADAR',
                    activeFromSimMs: 28 * 60_000,
                    lat: 14.45,
                    lon: 42.48,
                    confidence: 0.92,
                    mismatchFromAisNm: 0.8,
                },
            ],
            previousScore: 65,
        });
        expect(result.riskLevel).toBe('red');
        expect(result.riskScore).toBeGreaterThanOrEqual(80);
        expect(result.activeFactors.some((f) => f.rule === 'aisRadarMismatch')).toBe(true);
        expect(result.radarPosition).toEqual({ lat: 14.45, lon: 42.48 });
    });
});
