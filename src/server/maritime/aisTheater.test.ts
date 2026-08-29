import { describe, expect, it } from 'vitest';
import { aisTheaterMapPoint, DEFAULT_AIS_STREAM_BBOX, scenarioOffsetToBbox } from './aisTheater';
import type { ScenarioDefinition } from './types';

const GIBRALTAR = DEFAULT_AIS_STREAM_BBOX;

/** Mid-channel water for the default Gibraltar AIS bbox (TSS corridor). */
function expectInGibraltarWater(point: { lat: number; lon: number }) {
    expect(point.lat).toBeGreaterThanOrEqual(35.88);
    expect(point.lat).toBeLessThanOrEqual(36.02);
    expect(point.lon).toBeGreaterThanOrEqual(-6.8);
    expect(point.lon).toBeLessThanOrEqual(-4.7);
}

describe('aisTheaterMapPoint', () => {
    it('maps the scenario origin into the Gibraltar channel', () => {
        const mapped = aisTheaterMapPoint({ lat: 14.5, lon: 42.5 }, GIBRALTAR);
        expectInGibraltarWater(mapped);
        expect(mapped.lat).toBeGreaterThan(35.92);
        expect(mapped.lat).toBeLessThan(35.98);
        expect(mapped.lon).toBeGreaterThan(-5.7);
        expect(mapped.lon).toBeLessThan(-5.4);
    });

    it('keeps Bab el-Mandeb approach traffic in water, not on Spanish or Moroccan land', () => {
        const samples = [
            { lat: 14.05, lon: 42.4 },
            { lat: 14.55, lon: 42.6 },
            { lat: 14.72, lon: 42.38 },
            { lat: 15.15, lon: 42.35 },
            { lat: 14.65, lon: 41.95 },
            { lat: 14.1, lon: 42.9 },
        ];
        for (const sample of samples) {
            expectInGibraltarWater(aisTheaterMapPoint(sample, GIBRALTAR));
        }
    });

    it('clamps a far spoof-jump latitude into the channel while allowing Atlantic longitude', () => {
        // Decoy teleport from galaxyLeader (16.8N 40.2E) — outside authoring bounds.
        const mapped = aisTheaterMapPoint({ lat: 16.8, lon: 40.2 }, GIBRALTAR);
        expect(mapped.lat).toBeGreaterThanOrEqual(35.88);
        expect(mapped.lat).toBeLessThanOrEqual(36.02);
        expect(mapped.lon).toBeLessThan(-5.9);
        expect(mapped.lon).toBeGreaterThanOrEqual(-6.8);
    });

    it('does not use a naive center offset that lands ships inland', () => {
        // Pre-fix behavior: lat 14.05 + (36.0 - 14.5) ≈ 35.55 (Morocco land south of the strait).
        const mapped = aisTheaterMapPoint({ lat: 14.05, lon: 42.4 }, GIBRALTAR);
        expect(mapped.lat).toBeGreaterThan(35.85);
    });
});

describe('scenarioOffsetToBbox', () => {
    it('maps high-risk zone rings and simulated observations into water', () => {
        const scenario: ScenarioDefinition = {
            scenarioId: 'test',
            title: 'test',
            description: 'test',
            centerLat: 14.5,
            centerLon: 42.5,
            zoom: 8,
            startSimMs: 0,
            endSimMs: 60_000,
            tickIntervalMs: 60_000,
            vessels: [],
            tracks: {},
            osintAlerts: [],
            highRiskZones: [
                {
                    zoneId: 'z',
                    name: 'zone',
                    ring: [
                        { lat: 14.9, lon: 42.1 },
                        { lat: 14.9, lon: 42.85 },
                        { lat: 14.15, lon: 42.85 },
                        { lat: 14.15, lon: 42.1 },
                        { lat: 14.9, lon: 42.1 },
                    ],
                },
            ],
            protectedAssets: [],
            simulatedObservations: [
                { observationId: 'o', mmsi: '1', source: 'RADAR', activeFromSimMs: 0, lat: 14.48, lon: 42.52, confidence: 0.9 },
            ],
        };

        const mapped = scenarioOffsetToBbox(scenario, GIBRALTAR);
        expect(mapped.centerLat).toBeCloseTo(36.0, 5);
        expect(mapped.centerLon).toBeCloseTo(-5.5, 5);
        for (const p of mapped.highRiskZones[0]!.ring) {
            expectInGibraltarWater(p);
        }
        expectInGibraltarWater({ lat: mapped.simulatedObservations[0]!.lat, lon: mapped.simulatedObservations[0]!.lon });
    });
});
