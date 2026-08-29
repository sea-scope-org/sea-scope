import { createFileRoute } from '@tanstack/react-router';
import type { CSSProperties } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useMutation } from 'urql';
import { SidebarInset, SidebarProvider } from '../web/components/base/sidebar';
import {
    AlertAcknowledgeDocument,
    ScenarioResetDocument,
    VesselIntelligenceRequestDocument,
    VesselSelectDocument,
    WatchPageDocument,
} from '../web/graphql/generated';
import type { GqlCWatchFieldsFragment } from '../web/graphql/generated';
import { routeLoaderGraphqlClient } from '../web/graphql/routeLoaderGraphqlClient';
import { IntelligenceSidebar } from '../web/maritime/IntelligenceSidebar';
import { NavalMap } from '../web/maritime/NavalMap';
import { useSessionUpdates } from '../web/maritime/useSessionUpdates';
import type { WatchFiltersState } from '../web/maritime/watchFilterState';
import {
    vesselPassesQueueShipTypeFilter,
    vesselPassesShipTypeFilter,
    watchFiltersCreate,
    watchFiltersReconcile,
    watchShipTypesFromVessels,
} from '../web/maritime/watchFilterState';
import { WatchToolbar } from '../web/maritime/WatchToolbar';
import { seoMeta } from '../web/seo/seoMeta';
import { webPageUrlGet } from '../web/seo/webPageUrlGet';

const WATCH_SIDEBAR_STYLE = {
    '--sidebar-width': '23.75rem',
    '--sidebar-width-mobile': '20rem',
} as CSSProperties;

const GALAXY_LEADER_MMSI = '538090574';
const BRIEFING_TIMEOUT_MS = 90_000;

export const Route = createFileRoute('/watch')({
    loader: () => routeLoaderGraphqlClient(WatchPageDocument)(),
    staleTime: 0,
    head: () =>
        seoMeta({
            title: 'Watch console',
            description: 'SeaScope watch console — map-first risk prioritization for maritime security operators.',
            path: '/watch',
            webPageUrl: webPageUrlGet(),
            noindex: true,
        }),
    component: WatchPage,
});

function WatchPage() {
    const data = Route.useLoaderData();
    const seedWatch = data.currentSession.watch;

    const [, vesselSelect] = useMutation(VesselSelectDocument);
    const [, vesselIntelligenceRequest] = useMutation(VesselIntelligenceRequestDocument);
    const [, alertAcknowledge] = useMutation(AlertAcknowledgeDocument);
    const [, scenarioReset] = useMutation(ScenarioResetDocument);

    const [intelligenceBusy, setIntelligenceBusy] = useState(false);
    const autoSelectedRef = useRef(false);

    const applyWatchRef = useRef<(watch: GqlCWatchFieldsFragment | null) => void>(() => undefined);

    const onAnomalyAppended = useCallback(
        (anomaly: GqlCWatchFieldsFragment['anomalies'][number]) => {
            if (autoSelectedRef.current) return;
            if (anomaly.severity !== 'critical' && anomaly.severity !== 'high') return;
            autoSelectedRef.current = true;
            void (async () => {
                const result = await vesselSelect({ mmsi: GALAXY_LEADER_MMSI });
                const next = result.data?.session.vesselSelect;
                if (next) applyWatchRef.current(next);
            })();
        },
        [vesselSelect],
    );

    const { watch, intelligence, applyWatch, clearIntelligence } = useSessionUpdates({
        seedWatch,
        onAnomalyAppended,
    });
    applyWatchRef.current = applyWatch;

    const liveWatch = watch ?? seedWatch;

    const shipTypeCatalog = useMemo(() => watchShipTypesFromVessels(liveWatch.vessels), [liveWatch.vessels]);
    const shipTypeCatalogKey = shipTypeCatalog.join('\0');
    const previousCatalogRef = useRef<string[]>(shipTypeCatalog);
    const [filters, setFilters] = useState<WatchFiltersState>(() => watchFiltersCreate(shipTypeCatalog));

    useEffect(() => {
        const previous = previousCatalogRef.current;
        const catalog = shipTypeCatalogKey.length > 0 ? shipTypeCatalogKey.split('\0') : [];
        setFilters((current) => watchFiltersReconcile(current, catalog, previous));
        previousCatalogRef.current = catalog;
    }, [shipTypeCatalogKey]);

    const countedVessels = useMemo(
        () => liveWatch.vessels.filter((v) => vesselPassesQueueShipTypeFilter(v, filters)),
        [filters, liveWatch.vessels],
    );

    const mapVessels = useMemo(
        () => liveWatch.vessels.filter((v) => vesselPassesShipTypeFilter(v, filters, liveWatch.selectedMmsi)),
        [filters, liveWatch.selectedMmsi, liveWatch.vessels],
    );

    const onSelect = useCallback(
        async (mmsi: string) => {
            clearIntelligence();
            setIntelligenceBusy(false);
            const result = await vesselSelect({ mmsi });
            const next = result.data?.session.vesselSelect;
            if (next) applyWatch(next);
        },
        [applyWatch, clearIntelligence, vesselSelect],
    );

    const onClearSelection = useCallback(async () => {
        clearIntelligence();
        setIntelligenceBusy(false);
        const result = await vesselSelect({ mmsi: null });
        const next = result.data?.session.vesselSelect;
        if (next) applyWatch(next);
    }, [applyWatch, clearIntelligence, vesselSelect]);

    const onAcknowledgeAlert = useCallback(
        async (incidentId: string) => {
            const result = await alertAcknowledge({ incidentId });
            const next = result.data?.session.alertAcknowledge;
            if (next) applyWatch(next);
        },
        [alertAcknowledge, applyWatch],
    );

    const onReset = useCallback(async () => {
        clearIntelligence();
        setIntelligenceBusy(false);
        autoSelectedRef.current = false;
        const result = await scenarioReset({});
        const next = result.data?.session.scenarioReset;
        if (next) applyWatch(next);
    }, [applyWatch, clearIntelligence, scenarioReset]);

    // Mutation only ACKs that Gemini work started; busy stays until SessionUpdateIntelligence.
    const onRequestIntelligence = useCallback(
        async (mmsi: string) => {
            clearIntelligence();
            setIntelligenceBusy(true);
            const result = await vesselIntelligenceRequest({ mmsi });
            if (result.error || result.data?.session.vesselIntelligenceRequest.success === false) {
                setIntelligenceBusy(false);
                toast.error('Could not start the briefing. Try again.');
            }
        },
        [clearIntelligence, vesselIntelligenceRequest],
    );

    useEffect(() => {
        if (!intelligenceBusy || !intelligence) return;
        if (intelligence.mmsi === liveWatch.selectedMmsi) {
            setIntelligenceBusy(false);
        }
    }, [intelligence, intelligenceBusy, liveWatch.selectedMmsi]);

    useEffect(() => {
        if (!intelligenceBusy) return;
        const timer = window.setTimeout(() => {
            setIntelligenceBusy(false);
            toast.error('Briefing timed out. Try again.');
        }, BRIEFING_TIMEOUT_MS);
        return () => window.clearTimeout(timer);
    }, [intelligenceBusy]);

    const centerLat = liveWatch.centerLat;
    const centerLon = liveWatch.centerLon;
    const zoom = liveWatch.zoom;

    return (
        <div className="h-dvh overflow-hidden bg-background text-foreground">
            <SidebarProvider className="h-full min-h-0!" style={WATCH_SIDEBAR_STYLE}>
                <SidebarInset id="main-content" className="min-h-0 overflow-hidden bg-background">
                    <WatchToolbar
                        watch={liveWatch}
                        countedVessels={countedVessels}
                        filters={filters}
                        shipTypeCatalog={shipTypeCatalog}
                        onFiltersChange={setFilters}
                        onReset={onReset}
                    />
                    <div className="relative min-h-0 min-w-0 flex-1">
                        <NavalMap
                            key={liveWatch.scenarioId}
                            centerLat={centerLat}
                            centerLon={centerLon}
                            zoom={zoom}
                            vessels={mapVessels}
                            highRiskZones={liveWatch.highRiskZones}
                            protectedAssets={liveWatch.protectedAssets}
                            layers={filters.layers}
                            selectedMmsi={liveWatch.selectedMmsi}
                            onSelect={onSelect}
                        />
                    </div>
                </SidebarInset>

                <IntelligenceSidebar
                    watch={liveWatch}
                    intelligence={intelligence}
                    intelligenceBusy={intelligenceBusy}
                    onRequestIntelligence={onRequestIntelligence}
                    onSelectVessel={onSelect}
                    onAcknowledgeAlert={onAcknowledgeAlert}
                    onClearSelection={onClearSelection}
                    visibleShipTypes={filters.shipTypes}
                />
            </SidebarProvider>
        </div>
    );
}
