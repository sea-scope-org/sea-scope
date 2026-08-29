/** Max lat or lon span (°). Larger viewports are hard-skipped (Gibraltar-only feed). */
export const AIS_VIEWPORT_MAX_SPAN_DEG = 5;

/** Drop session contributions that stop reporting (closed tabs). */
export const AIS_VIEWPORT_TTL_MS = 60_000;

export type AisViewportBbox = {
    southLat: number;
    westLon: number;
    northLat: number;
    eastLon: number;
};

type ViewportEntry = AisViewportBbox & { updatedAtMs: number };

const entries = new Map<string, ViewportEntry>();

export type AisViewportUpsertResult = {
    /** False only for malformed coordinates (not hard-skip). */
    ok: boolean;
    /** True when the active box set changed (caller should resubscribe). */
    changed: boolean;
    /** True when the viewport was too large / invalid geometry and contribution cleared. */
    skipped: boolean;
};

function isFiniteNumber(value: number): boolean {
    return typeof value === 'number' && Number.isFinite(value);
}

function isValidCoordinatePair(bbox: AisViewportBbox): boolean {
    if (!isFiniteNumber(bbox.southLat) || !isFiniteNumber(bbox.northLat)) return false;
    if (!isFiniteNumber(bbox.westLon) || !isFiniteNumber(bbox.eastLon)) return false;
    if (bbox.southLat < -90 || bbox.northLat > 90) return false;
    if (bbox.westLon < -180 || bbox.eastLon > 180) return false;
    // Antimeridian wraps report west > east from MapLibre — reject for v1.
    if (!(bbox.southLat < bbox.northLat && bbox.westLon < bbox.eastLon)) return false;
    return true;
}

function exceedsMaxSpan(bbox: AisViewportBbox): boolean {
    return bbox.northLat - bbox.southLat > AIS_VIEWPORT_MAX_SPAN_DEG || bbox.eastLon - bbox.westLon > AIS_VIEWPORT_MAX_SPAN_DEG;
}

function boxesEqual(a: AisViewportBbox, b: AisViewportBbox): boolean {
    return a.southLat === b.southLat && a.westLon === b.westLon && a.northLat === b.northLat && a.eastLon === b.eastLon;
}

/** Remove stale session viewports. Returns whether any entry was dropped. */
export function aisViewportRegistryPrune(nowMs: number = Date.now()): boolean {
    let changed = false;
    for (const [sessionId, entry] of entries) {
        if (nowMs - entry.updatedAtMs > AIS_VIEWPORT_TTL_MS) {
            entries.delete(sessionId);
            changed = true;
        }
    }
    return changed;
}

/**
 * Record a watch-session map viewport. Hard-skips oversized boxes (clears that
 * session’s contribution). Invalid coords return `ok: false`.
 */
export function aisViewportRegistryUpsert(sessionId: string, bbox: AisViewportBbox, nowMs: number = Date.now()): AisViewportUpsertResult {
    aisViewportRegistryPrune(nowMs);

    if (!isValidCoordinatePair(bbox)) {
        return { ok: false, changed: false, skipped: false };
    }

    if (exceedsMaxSpan(bbox)) {
        const had = entries.delete(sessionId);
        return { ok: true, changed: had, skipped: true };
    }

    const previous = entries.get(sessionId);
    entries.set(sessionId, { ...bbox, updatedAtMs: nowMs });
    if (!previous) return { ok: true, changed: true, skipped: false };
    if (!boxesEqual(previous, bbox)) return { ok: true, changed: true, skipped: false };
    return { ok: true, changed: false, skipped: false };
}

export function aisViewportRegistryClear(sessionId: string): { changed: boolean } {
    const changed = entries.delete(sessionId);
    return { changed };
}

/** Active viewport boxes after TTL prune (order is insertion order). */
export function aisViewportRegistryActiveBoxes(nowMs: number = Date.now()): AisViewportBbox[] {
    aisViewportRegistryPrune(nowMs);
    return [...entries.values()].map(({ southLat, westLon, northLat, eastLon }) => ({
        southLat,
        westLon,
        northLat,
        eastLon,
    }));
}

export function aisViewportRegistryCount(nowMs: number = Date.now()): number {
    return aisViewportRegistryActiveBoxes(nowMs).length;
}

/** Test helper — clears process-global registry state. */
export function aisViewportRegistryResetForTests(): void {
    entries.clear();
}
