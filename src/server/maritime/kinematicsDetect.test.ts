import { describe, expect, it } from 'vitest';

import { aisGapDetect, haversineNm, kinematicsDetect } from './kinematicsDetect';
import type { AisPosition } from './types';

function ais(partial: Partial<AisPosition> & Pick<AisPosition, 'lat' | 'lon' | 'sog' | 'cog' | 'heading' | 'timestamp'>): AisPosition {
    return {
        mmsi: '538090574',
        ...partial,
    };
}

describe('haversineNm', () => {
    it('returns ~0 for identical points', () => {
        expect(haversineNm({ lat: 14.5, lon: 42.5 }, { lat: 14.5, lon: 42.5 })).toBeCloseTo(0, 5);
    });

    it('measures one degree of latitude as roughly 60 nm', () => {
        const nm = haversineNm({ lat: 14, lon: 42 }, { lat: 15, lon: 42 });
        expect(nm).toBeGreaterThan(59);
        expect(nm).toBeLessThan(61);
    });
});

describe('kinematicsDetect', () => {
    it('detects speedDrop when SOG falls more than 8 kn within 5 minutes', () => {
        const prev = ais({
            lat: 14.5,
            lon: 42.5,
            sog: 14,
            cog: 180,
            heading: 180,
            timestamp: '2023-11-19T12:00:00.000Z',
        });
        const curr = ais({
            lat: 14.49,
            lon: 42.5,
            sog: 4,
            cog: 180,
            heading: 180,
            timestamp: '2023-11-19T12:03:00.000Z',
        });

        const anomalies = kinematicsDetect(prev, curr, { simMs: 180_000 });
        expect(anomalies.some((a) => a.kind === 'speedDrop')).toBe(true);
    });

    it('detects headingZigZag when cumulative heading change exceeds 90°', () => {
        const curr = ais({
            lat: 14.5,
            lon: 42.5,
            sog: 2,
            cog: 90,
            heading: 90,
            timestamp: '2023-11-19T12:05:00.000Z',
        });

        const anomalies = kinematicsDetect(null, curr, {
            simMs: 300_000,
            recentHeadings: [0, 45, 90, 140],
        });
        expect(anomalies.some((a) => a.kind === 'headingZigZag')).toBe(true);
    });

    it('detects impossibleJump when implied speed exceeds 60 kn', () => {
        const prev = ais({
            lat: 14.5,
            lon: 42.5,
            sog: 12,
            cog: 180,
            heading: 180,
            timestamp: '2023-11-19T12:00:00.000Z',
        });
        const curr = ais({
            lat: 16.5,
            lon: 40.5,
            sog: 12,
            cog: 180,
            heading: 180,
            timestamp: '2023-11-19T12:01:00.000Z',
        });

        const anomalies = kinematicsDetect(prev, curr, { simMs: 60_000 });
        expect(anomalies.some((a) => a.kind === 'impossibleJump')).toBe(true);
    });
});

describe('aisGapDetect', () => {
    it('detects aisDark when the gap exceeds the threshold', () => {
        const last = ais({
            lat: 14.4,
            lon: 42.45,
            sog: 0.2,
            cog: 220,
            heading: 180,
            timestamp: '2023-11-19T12:30:00.000Z',
        });

        const anomaly = aisGapDetect(last, Date.parse('2023-11-19T12:30:00.000Z') + 15 * 60_000);
        expect(anomaly).not.toBeNull();
        expect(anomaly?.kind).toBe('aisDark');
    });

    it('returns null when the gap is within the threshold', () => {
        const last = ais({
            lat: 14.4,
            lon: 42.45,
            sog: 0.2,
            cog: 220,
            heading: 180,
            timestamp: '2023-11-19T12:30:00.000Z',
        });

        const anomaly = aisGapDetect(last, Date.parse('2023-11-19T12:30:00.000Z') + 5 * 60_000);
        expect(anomaly).toBeNull();
    });
});
