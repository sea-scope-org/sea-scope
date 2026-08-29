import { lazy, Suspense, useEffect, useState } from 'react';
import { Spinner } from '../components/base/spinner';
import type { GqlCWatchFieldsFragment } from '../graphql/generated';
import { cn } from '../utils/cn';
import type { NavalMapClientProps } from './NavalMapClient';
import type { NavalMapFocusRequest } from './navalMapFocus';
import type { WatchLayerFilters } from './watchFilterState';

const NavalMapClient = lazy(async () => {
    const mod = await import('./NavalMapClient');
    return { default: mod.NavalMapClient };
});

type WatchState = GqlCWatchFieldsFragment;
type Vessel = WatchState['vessels'][number];
type HighRiskZone = WatchState['highRiskZones'][number];
type ProtectedAsset = WatchState['protectedAssets'][number];

export interface NavalMapProps {
    centerLat: number;
    centerLon: number;
    zoom: number;
    vessels: ReadonlyArray<Vessel>;
    highRiskZones: ReadonlyArray<HighRiskZone>;
    protectedAssets: ReadonlyArray<ProtectedAsset>;
    layers: WatchLayerFilters;
    selectedMmsi: string | null | undefined;
    focusRequest: NavalMapFocusRequest | null;
    onSelect: (mmsi: string) => void;
    onViewportChange?: (bounds: { southLat: number; westLon: number; northLat: number; eastLon: number }) => void;
    className?: string;
}

/** SSR-safe shell — MapLibre only mounts after `window` exists. */
export function NavalMap(props: NavalMapProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <MapPlaceholder className={props.className} />;
    }

    const clientProps: NavalMapClientProps = props;

    return (
        <Suspense fallback={<MapPlaceholder className={props.className} />}>
            <NavalMapClient {...clientProps} />
        </Suspense>
    );
}

function MapPlaceholder({ className }: { className?: string }) {
    return (
        <div
            className={cn('grid size-full place-items-center gap-2 bg-muted text-xs tracking-wide text-muted-foreground', className)}
            role="status"
            aria-label="Loading chart"
        >
            <Spinner className="size-5 text-muted-foreground" aria-hidden />
            <span>Loading chart…</span>
        </div>
    );
}
