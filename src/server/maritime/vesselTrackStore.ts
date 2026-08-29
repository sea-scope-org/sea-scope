import type { AisPosition, LatLon, VesselIdentity } from './types';

export type VesselDataSourceId = 'mock' | 'aisstream';

export type TrackedVessel = {
    source: VesselDataSourceId;
    identity: VesselIdentity;
    position: AisPosition;
    previousPosition: AisPosition | null;
    trackTail: LatLon[];
    headingHistory: number[];
    lastPersistedAtMs: number;
    updatedAtMs: number;
};

const TRACK_TAIL_LEN = 12;
const HEADING_HISTORY_LEN = 6;
/** Mock must not overwrite a fresher AISStream fix for the same MMSI. */
const LIVE_WINS_MS = 5 * 60_000;

const vesselsByMmsi = new Map<string, TrackedVessel>();

function pushTrackTail(tail: LatLon[], point: LatLon): LatLon[] {
    const last = tail[tail.length - 1];
    if (last && last.lat === point.lat && last.lon === point.lon) return tail;
    const next = [...tail, point];
    while (next.length > TRACK_TAIL_LEN) next.shift();
    return next;
}

function mergeIdentity(identity: VesselIdentity, existing: VesselIdentity | undefined): VesselIdentity {
    return {
        mmsi: identity.mmsi,
        name: identity.name || existing?.name || `MMSI ${identity.mmsi}`,
        imo: identity.imo ?? existing?.imo,
        callSign: identity.callSign ?? existing?.callSign,
        shipType: identity.shipType !== 'Unknown' ? identity.shipType : (existing?.shipType ?? 'Unknown'),
        flag: identity.flag !== 'Unknown' ? identity.flag : (existing?.flag ?? 'Unknown'),
    };
}

function shouldAcceptUpsert(source: VesselDataSourceId, existing: TrackedVessel | undefined): boolean {
    if (!existing) return true;
    if (source === 'aisstream') return true;
    if (existing.source === 'aisstream' && Date.now() - existing.updatedAtMs < LIVE_WINS_MS) {
        return false;
    }
    return true;
}

export function vesselTrackStoreUpsertPosition(
    source: VesselDataSourceId,
    identity: VesselIdentity,
    position: AisPosition,
): TrackedVessel | null {
    const existing = vesselsByMmsi.get(identity.mmsi);
    if (!shouldAcceptUpsert(source, existing)) return null;

    const previousPosition = existing?.position ?? null;
    const headingHistory = [...(existing?.headingHistory ?? []), position.heading];
    while (headingHistory.length > HEADING_HISTORY_LEN) headingHistory.shift();

    const next: TrackedVessel = {
        source,
        identity: mergeIdentity(identity, existing?.identity),
        position,
        previousPosition,
        trackTail: pushTrackTail(existing?.trackTail ?? [], { lat: position.lat, lon: position.lon }),
        headingHistory,
        lastPersistedAtMs: existing?.lastPersistedAtMs ?? 0,
        updatedAtMs: Date.now(),
    };
    vesselsByMmsi.set(identity.mmsi, next);
    return next;
}

export function vesselTrackStoreUpsertIdentity(source: VesselDataSourceId, identity: VesselIdentity): void {
    const existing = vesselsByMmsi.get(identity.mmsi);
    if (!existing) return;
    if (existing.source === 'aisstream' && source === 'mock') return;

    vesselsByMmsi.set(identity.mmsi, {
        ...existing,
        source: source === 'aisstream' ? 'aisstream' : existing.source,
        identity: mergeIdentity(identity, existing.identity),
        updatedAtMs: Date.now(),
    });
}

export function vesselTrackStoreMarkPersisted(mmsi: string, atMs: number = Date.now()): void {
    const existing = vesselsByMmsi.get(mmsi);
    if (!existing) return;
    vesselsByMmsi.set(mmsi, { ...existing, lastPersistedAtMs: atMs });
}

export function vesselTrackStoreList(): TrackedVessel[] {
    return [...vesselsByMmsi.values()].filter((v) => Date.parse(v.position.timestamp) > 0);
}

export function vesselTrackStoreCountBySource(source: VesselDataSourceId): number {
    return vesselTrackStoreList().filter((v) => v.source === source).length;
}
