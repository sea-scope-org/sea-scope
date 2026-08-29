import { aisPositions, vessels } from '../db/schema';
import type { AisPositionCreate, VesselCreate } from '../db/schema';
import type { ServerRuntime } from '../domain/ServerRuntime';
import type { AisPosition, VesselIdentity } from '../maritime/types';
import type { VesselDataSourceId } from '../maritime/vesselTrackStore';

export type AisVesselPositionPersistInput = {
    source: VesselDataSourceId;
    identity: VesselIdentity;
    position: AisPosition;
    /** When false, only upsert the vessel row (no history append). */
    persistHistory: boolean;
};

let lastPersistErrorLogAtMs = 0;

/**
 * Upsert vessel latest-fix and optionally append a throttled history row.
 * Soft-fails on DB errors (rate-limited log) so ingest keeps updating memory.
 */
export async function aisVesselPositionPersist(serverRuntime: ServerRuntime, input: AisVesselPositionPersistInput): Promise<boolean> {
    const reportedAt = new Date(input.position.timestamp);
    const now = new Date();

    const vesselUpsert: VesselCreate = {
        mmsi: input.identity.mmsi,
        name: input.identity.name,
        imo: input.identity.imo,
        callSign: input.identity.callSign,
        shipType: input.identity.shipType,
        flag: input.identity.flag,
        source: input.source,
        lastLat: input.position.lat,
        lastLon: input.position.lon,
        lastSog: input.position.sog,
        lastCog: input.position.cog,
        lastHeading: input.position.heading,
        lastNavStatus: input.position.navStatus,
        lastReportedAt: reportedAt,
        updatedAt: now,
    };

    const positionInsert: AisPositionCreate | null = input.persistHistory
        ? {
              aisPositionId: crypto.randomUUID(),
              mmsi: input.position.mmsi,
              source: input.source,
              lat: input.position.lat,
              lon: input.position.lon,
              sog: input.position.sog,
              cog: input.position.cog,
              heading: input.position.heading,
              navStatus: input.position.navStatus,
              reportedAt,
          }
        : null;

    const conflictSet = {
        name: vesselUpsert.name,
        imo: vesselUpsert.imo,
        callSign: vesselUpsert.callSign,
        shipType: vesselUpsert.shipType,
        flag: vesselUpsert.flag,
        source: vesselUpsert.source,
        lastLat: vesselUpsert.lastLat,
        lastLon: vesselUpsert.lastLon,
        lastSog: vesselUpsert.lastSog,
        lastCog: vesselUpsert.lastCog,
        lastHeading: vesselUpsert.lastHeading,
        lastNavStatus: vesselUpsert.lastNavStatus,
        lastReportedAt: vesselUpsert.lastReportedAt,
        updatedAt: vesselUpsert.updatedAt,
    };

    try {
        if (!positionInsert) {
            await serverRuntime.db.insert(vessels).values(vesselUpsert).onConflictDoUpdate({
                target: vessels.mmsi,
                set: conflictSet,
            });
            return true;
        }

        await serverRuntime.db.transaction(async (transaction) => {
            await transaction.insert(vessels).values(vesselUpsert).onConflictDoUpdate({
                target: vessels.mmsi,
                set: conflictSet,
            });
            await transaction.insert(aisPositions).values(positionInsert);
        });
        return true;
    } catch (error) {
        const nowMs = Date.now();
        if (nowMs - lastPersistErrorLogAtMs > 60_000) {
            lastPersistErrorLogAtMs = nowMs;
            console.error('[ais-persist] soft-fail (will retry on next fix)', error);
            serverRuntime.log.error(error);
        }
        return false;
    }
}
