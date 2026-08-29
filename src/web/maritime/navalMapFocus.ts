import type { Map as MapLibreMap, PaddingOptions } from 'maplibre-gl';

/** Client-only chart camera request. `mmsi: null` restores theater overview. */
export type NavalMapFocusRequest = {
    generation: number;
    mmsi: string | null;
    arrivalPulse: boolean;
};

export const NAVAL_MAP_FOCUS_DURATION_MS = 400;

/** Desktop: keep the contact clear of the right Case/Queue rail (~23.75rem) and toolbar. */
const NAVAL_MAP_FOCUS_PADDING: PaddingOptions = {
    top: 64,
    bottom: 24,
    left: 24,
    right: 380,
};

/** Mobile: rail is an overlay — pad only chrome, not a phantom sidebar. */
const NAVAL_MAP_FOCUS_PADDING_MOBILE: PaddingOptions = {
    top: 64,
    bottom: 24,
    left: 24,
    right: 24,
};

/** Ease-out cubic — matches motion.md (no ease-in / bounce). */
export function navalMapFocusEasing(t: number): number {
    return 1 - (1 - t) ** 3;
}

export function navalMapFocusPrefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Prefer ~9–10 for case work; never zoom out if the operator is already closer. */
export function navalMapCaseZoom(theaterZoom: number, currentZoom: number): number {
    const preferred = Math.min(10, Math.max(9, theaterZoom + 1));
    return Math.max(currentZoom, preferred);
}

export function navalMapFocusPadding(isMobile: boolean): PaddingOptions {
    return isMobile ? NAVAL_MAP_FOCUS_PADDING_MOBILE : NAVAL_MAP_FOCUS_PADDING;
}

/**
 * True when the camera should move — vessel outside the padded viewport,
 * or zoom meaningfully below the case target.
 */
export function navalMapFocusNeeded(
    map: MapLibreMap,
    target: { lon: number; lat: number; zoom: number },
    padding: PaddingOptions,
): boolean {
    const currentZoom = map.getZoom();
    if (currentZoom < target.zoom - 0.35) return true;

    const point = map.project([target.lon, target.lat]);
    const canvas = map.getCanvas();
    const left = padding.left ?? 0;
    const right = padding.right ?? 0;
    const top = padding.top ?? 0;
    const bottom = padding.bottom ?? 0;

    return !(point.x >= left && point.x <= canvas.width - right && point.y >= top && point.y <= canvas.height - bottom);
}

export function navalMapFocusApply(
    map: MapLibreMap,
    options: {
        lon: number;
        lat: number;
        zoom: number;
        padding: PaddingOptions;
        reducedMotion: boolean;
    },
): void {
    const { lon, lat, zoom, padding, reducedMotion } = options;
    if (reducedMotion) {
        map.jumpTo({ center: [lon, lat], zoom, padding });
        return;
    }
    map.easeTo({
        center: [lon, lat],
        zoom,
        padding,
        duration: NAVAL_MAP_FOCUS_DURATION_MS,
        easing: navalMapFocusEasing,
    });
}
