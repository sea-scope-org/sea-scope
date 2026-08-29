import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ServerRuntime } from '../../domain/ServerRuntime';
import { DEFAULT_AIS_STREAM_BBOX } from '../aisTheater';
import { vesselTrackStoreCountBySource, vesselTrackStoreRemoveBySource } from '../vesselTrackStore';

let persistWaiters: Array<() => void> = [];

vi.mock('../../commands/aisVesselPositionPersist', () => ({
    aisVesselPositionPersist: vi.fn(
        async () =>
            new Promise<boolean>((resolve) => {
                persistWaiters.push(() => resolve(true));
            }),
    ),
}));

vi.mock('../../env/environmentVariablesCreate', () => ({
    environmentVariables: {
        aisStreamBoundingBox: { ...DEFAULT_AIS_STREAM_BBOX },
        aisMockEnabled: false,
    },
}));

// Import after mocks so the feeder binds to the stubbed persist + env.
const { mockScenarioSourceIsStarted, mockScenarioSourceSetEnabled, mockScenarioSourceStatus } = await import('./mockScenarioSource');

function runtimeStub(): ServerRuntime {
    return {
        log: {
            info: vi.fn(),
            error: vi.fn(),
            warn: vi.fn(),
            debug: vi.fn(),
        },
    } as unknown as ServerRuntime;
}

function releaseAllPersists(): void {
    const waiters = persistWaiters;
    persistWaiters = [];
    for (const release of waiters) release();
}

beforeEach(() => {
    vi.useFakeTimers();
    persistWaiters = [];
    mockScenarioSourceSetEnabled(runtimeStub(), false);
    vesselTrackStoreRemoveBySource('mock');
});

afterEach(() => {
    releaseAllPersists();
    mockScenarioSourceSetEnabled(runtimeStub(), false);
    vesselTrackStoreRemoveBySource('mock');
    vi.useRealTimers();
});

describe('mockScenarioSource', () => {
    it('does not resurrect mock vessels when an in-flight tick finishes after stop', async () => {
        const runtime = runtimeStub();
        mockScenarioSourceSetEnabled(runtime, true);
        expect(mockScenarioSourceIsStarted()).toBe(true);
        expect(vesselTrackStoreCountBySource('mock')).toBeGreaterThan(0);

        // First interval tick starts async work and parks on persist.
        await vi.advanceTimersByTimeAsync(500);
        expect(persistWaiters.length).toBeGreaterThan(0);

        mockScenarioSourceSetEnabled(runtime, false);
        expect(mockScenarioSourceStatus()).toBe('disabled');
        expect(vesselTrackStoreCountBySource('mock')).toBe(0);

        releaseAllPersists();
        await Promise.resolve();
        await Promise.resolve();

        expect(mockScenarioSourceStatus()).toBe('disabled');
        expect(vesselTrackStoreCountBySource('mock')).toBe(0);
    });
});
