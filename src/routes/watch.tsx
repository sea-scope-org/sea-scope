import { createFileRoute } from '@tanstack/react-router';
import type { CSSProperties } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useMutation } from 'urql';
import { SidebarInset, SidebarProvider } from '../web/components/base/sidebar';
import {
    AisViewportClearDocument,
    AisViewportReportDocument,
    AlertAcknowledgeDocument,
    MockAisSetEnabledDocument,
    ScenarioResetDocument,
    VesselIntelligenceRequestDocument,
    VesselSelectDocument,
    WatchPageDocument,
} from '../web/graphql/generated';
import type { GqlCWatchFieldsFragment } from '../web/graphql/generated';
import { routeLoaderGraphqlClient } from '../web/graphql/routeLoaderGraphqlClient';
import { IntelligenceSidebar } from '../web/maritime/IntelligenceSidebar';
import { NavalMap } from '../web/maritime/NavalMap';
import type { NavalMapFocusRequest } from '../web/maritime/navalMapFocus';
import { useSessionUpdates } from '../web/maritime/useSessionUpdates';
import type { WatchFiltersState, WatchSearch } from '../web/maritime/watchFilterState';
import {
    vesselPassesQueueShipTypeFilter,
    vesselPassesShipTypeFilter,
    watchFiltersFromSearch,
    watchSearchFromState,
    watchSearchValidate,
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
    validateSearch: (search: Record<string, unknown>) => watchSearchValidate(search),
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

function vesselHasOpenIncident(watch: GqlCWatchFieldsFragment, mmsi: string): boolean {
    return watch.incidents.some((incident) => incident.mmsi === mmsi && incident.status === 'open');
}

function WatchPage() {
    const data = Route.useLoaderData();
    const search = Route.useSearch();
    const navigate = Route.useNavigate();
    const seedWatch = data.currentSession.watch;

    const [, vesselSelect] = useMutation(VesselSelectDocument);
    const [, vesselIntelligenceRequest] = useMutation(VesselIntelligenceRequestDocument);
    const [, alertAcknowledge] = useMutation(AlertAcknowledgeDocument);
    const [, scenarioReset] = useMutation(ScenarioResetDocument);
    const [, mockAisSetEnabled] = useMutation(MockAisSetEnabledDocument);
    const [, aisViewportReport] = useMutation(AisViewportReportDocument);
    const [, aisViewportClear] = useMutation(AisViewportClearDocument);

    const [intelligenceBusy, setIntelligenceBusy] = useState(false);
    const [mockToggleBusy, setMockToggleBusy] = useState(false);
    /** Optimistic Demo pressed state while the mutation is in flight. */
    const [mockEnabledOverride, setMockEnabledOverride] = useState<boolean | null>(null);
    /** Optimistic Case selection (`undefined` = use server). */
    const [selectedMmsiOverride, setSelectedMmsiOverride] = useState<string | null | undefined>(undefined);
    const [selectionBusy, setSelectionBusy] = useState(false);
    const [focusRequest, setFocusRequest] = useState<NavalMapFocusRequest | null>(null);
    const focusGenerationRef = useRef(0);
    const autoSelectedRef = useRef(false);
    const mockToggleGenerationRef = useRef(0);
    /** Sync lock — `mockToggleBusy` state alone can miss a double-click before re-render. */
    const mockToggleBusyRef = useRef(false);
    const selectionGenerationRef = useRef(0);
    /** Sync lock — `selectionBusy` state alone can miss a click before re-render. */
    const selectionBusyRef = useRef(false);
    const selectionHydratedRef = useRef(false);
    const viewportReportTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const aisViewportReportRef = useRef(aisViewportReport);
    aisViewportReportRef.current = aisViewportReport;
    const aisViewportClearRef = useRef(aisViewportClear);
    aisViewportClearRef.current = aisViewportClear;

    const applyWatchRef = useRef<(watch: GqlCWatchFieldsFragment | null) => void>(() => undefined);
    const requestChartFocusRef = useRef<(mmsi: string | null, arrivalPulse: boolean) => void>(() => undefined);
    const replaceWatchSearchRef = useRef<(patch: { mmsi?: string | null; filters?: WatchFiltersState }) => void>(() => undefined);
    const mockEnabledRef = useRef(false);
    const selectedMmsiRef = useRef<string | null>(null);
    const intelligenceBusyRef = useRef(false);
    const vesselsRef = useRef<GqlCWatchFieldsFragment['vessels']>([]);
    const shipTypeCatalogRef = useRef<string[]>([]);
    const filtersRef = useRef<WatchFiltersState>(watchFiltersFromSearch({}, []));

    const requestChartFocus = useCallback((mmsi: string | null, arrivalPulse: boolean) => {
        focusGenerationRef.current += 1;
        setFocusRequest({
            generation: focusGenerationRef.current,
            mmsi,
            arrivalPulse,
        });
    }, []);
    requestChartFocusRef.current = requestChartFocus;

    const replaceWatchSearch = useCallback(
        (patch: { mmsi?: string | null; filters?: WatchFiltersState }) => {
            void navigate({
                replace: true,
                search: (prev: WatchSearch) =>
                    watchSearchFromState({
                        mmsi: patch.mmsi !== undefined ? patch.mmsi : (prev.mmsi ?? null),
                        filters: patch.filters ?? filtersRef.current,
                        catalog: shipTypeCatalogRef.current,
                    }),
            });
        },
        [navigate],
    );
    replaceWatchSearchRef.current = replaceWatchSearch;

    const onAnomalyAppended = useCallback(
        (anomaly: GqlCWatchFieldsFragment['anomalies'][number]) => {
            if (autoSelectedRef.current) return;
            if (anomaly.severity !== 'critical' && anomaly.severity !== 'high') return;
            // Demo narrative only: never steal an open Case, interrupt a briefing / in-flight
            // selection, or select Galaxy Leader when it is not on the board.
            if (!mockEnabledRef.current) return;
            if (selectedMmsiRef.current) return;
            if (selectionBusyRef.current) return;
            if (intelligenceBusyRef.current) return;
            if (!vesselsRef.current.some((vessel) => vessel.mmsi === GALAXY_LEADER_MMSI)) return;

            autoSelectedRef.current = true;
            // Participate in the Case ↔ Queue generation protocol so a late
            // vesselSelect cannot yank the operator back to Galaxy Leader.
            const generation = ++selectionGenerationRef.current;
            replaceWatchSearchRef.current({ mmsi: GALAXY_LEADER_MMSI });
            setSelectedMmsiOverride(GALAXY_LEADER_MMSI);

            void (async () => {
                const result = await vesselSelect({ mmsi: GALAXY_LEADER_MMSI });
                if (generation !== selectionGenerationRef.current) {
                    // Our mutation may have landed after the operator's — repair.
                    const intended = selectedMmsiRef.current;
                    if (intended !== GALAXY_LEADER_MMSI) {
                        void vesselSelect({ mmsi: intended });
                    }
                    return;
                }

                const next = result.data?.session.vesselSelect;
                if (!next?.vessels.some((vessel) => vessel.mmsi === GALAXY_LEADER_MMSI)) {
                    autoSelectedRef.current = false;
                    replaceWatchSearchRef.current({ mmsi: null });
                    setSelectedMmsiOverride(undefined);
                    return;
                }

                applyWatchRef.current(next);
                setSelectedMmsiOverride(undefined);
                requestChartFocusRef.current(GALAXY_LEADER_MMSI, vesselHasOpenIncident(next, GALAXY_LEADER_MMSI));
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
    const serverMockEnabled = liveWatch.dataSources.find((source) => source.id === 'mock')?.enabled ?? false;
    const mockEnabled = mockEnabledOverride ?? serverMockEnabled;
    mockEnabledRef.current = mockEnabled;
    intelligenceBusyRef.current = intelligenceBusy;
    vesselsRef.current = liveWatch.vessels;

    // Demo chrome is driven by effective `mockEnabled` (optimistic override or server).
    // Always strip mock contacts / theater overlays when Demo is off — not only while the
    // mutation is in flight — so a late feeder tick cannot flicker demo content back on.
    // selectedMmsiOverride does the same for Case ↔ Queue so Back to queue is instant.
    const displayWatch = useMemo((): GqlCWatchFieldsFragment => {
        let next: GqlCWatchFieldsFragment = liveWatch;

        const dataSources = liveWatch.dataSources.map((source) =>
            source.id === 'mock'
                ? {
                      ...source,
                      enabled: mockEnabled,
                      status: mockEnabled ? (source.status === 'disabled' ? 'running' : source.status) : 'disabled',
                      vesselCount: mockEnabled ? source.vesselCount : 0,
                  }
                : source,
        );

        if (mockEnabled) {
            next = {
                ...liveWatch,
                title: mockEnabledOverride === true ? 'SeaScope watch — live + demo' : liveWatch.title,
                dataSources,
            };
        } else {
            const selectedWasMock =
                liveWatch.selectedMmsi != null &&
                liveWatch.vessels.some((v) => v.mmsi === liveWatch.selectedMmsi && v.dataSource === 'mock');

            next = {
                ...liveWatch,
                title: 'SeaScope watch — live',
                osintAlerts: [],
                anomalies: [],
                riskEvents: [],
                incidents: [],
                vessels: liveWatch.vessels.filter((vessel) => vessel.dataSource !== 'mock'),
                dataSources,
                selectedMmsi: selectedWasMock ? null : liveWatch.selectedMmsi,
            };
        }

        if (selectedMmsiOverride !== undefined) {
            next = { ...next, selectedMmsi: selectedMmsiOverride };
        }

        return next;
    }, [liveWatch, mockEnabled, mockEnabledOverride, selectedMmsiOverride]);

    selectedMmsiRef.current = displayWatch.selectedMmsi ?? null;

    const shipTypeCatalog = useMemo(() => watchShipTypesFromVessels(displayWatch.vessels), [displayWatch.vessels]);
    shipTypeCatalogRef.current = shipTypeCatalog;
    const filters = useMemo(() => watchFiltersFromSearch(search, shipTypeCatalog), [search, shipTypeCatalog]);
    filtersRef.current = filters;

    const onFiltersChange = useCallback(
        (next: WatchFiltersState) => {
            replaceWatchSearch({ filters: next });
        },
        [replaceWatchSearch],
    );

    const countedVessels = useMemo(
        () => displayWatch.vessels.filter((v) => vesselPassesQueueShipTypeFilter(v, filters)),
        [displayWatch.vessels, filters],
    );

    const mapVessels = useMemo(
        () => displayWatch.vessels.filter((v) => vesselPassesShipTypeFilter(v, filters, displayWatch.selectedMmsi)),
        [displayWatch.selectedMmsi, displayWatch.vessels, filters],
    );

    const selectVessel = useCallback(
        async (mmsi: string, options: { focus: boolean }) => {
            const generation = ++selectionGenerationRef.current;
            selectionBusyRef.current = true;
            replaceWatchSearch({ mmsi });
            setSelectedMmsiOverride(mmsi);
            setSelectionBusy(true);
            clearIntelligence();
            setIntelligenceBusy(false);
            if (options.focus) {
                requestChartFocus(mmsi, vesselHasOpenIncident(liveWatch, mmsi));
            }

            const result = await vesselSelect({ mmsi });
            if (generation !== selectionGenerationRef.current) return;

            const next = result.data?.session.vesselSelect;
            if (!next) {
                selectionBusyRef.current = false;
                replaceWatchSearch({ mmsi: liveWatch.selectedMmsi ?? null });
                setSelectedMmsiOverride(undefined);
                setSelectionBusy(false);
                toast.error('Could not open case.');
                return;
            }

            applyWatch(next);
            selectionBusyRef.current = false;
            setSelectedMmsiOverride(undefined);
            setSelectionBusy(false);
        },
        [applyWatch, clearIntelligence, liveWatch, replaceWatchSearch, requestChartFocus, vesselSelect],
    );

    const onSelectFromQueue = useCallback(
        (mmsi: string) => {
            if (selectionBusyRef.current) return;
            void selectVessel(mmsi, { focus: true });
        },
        [selectVessel],
    );

    const onSelectFromMap = useCallback(
        (mmsi: string) => {
            if (selectionBusyRef.current) return;
            void selectVessel(mmsi, { focus: false });
        },
        [selectVessel],
    );

    const onLocateOnChart = useCallback(() => {
        const mmsi = displayWatch.selectedMmsi;
        if (!mmsi) return;
        requestChartFocus(mmsi, vesselHasOpenIncident(displayWatch, mmsi));
    }, [displayWatch, requestChartFocus]);

    const onClearSelection = useCallback(async () => {
        if (selectionBusyRef.current) return;

        const previousMmsi = selectedMmsiRef.current;
        const generation = ++selectionGenerationRef.current;
        selectionBusyRef.current = true;
        replaceWatchSearch({ mmsi: null });
        setSelectedMmsiOverride(null);
        setSelectionBusy(true);
        clearIntelligence();
        setIntelligenceBusy(false);
        requestChartFocus(null, false);

        const result = await vesselSelect({ mmsi: null });
        if (generation !== selectionGenerationRef.current) return;

        const next = result.data?.session.vesselSelect;
        if (!next) {
            selectionBusyRef.current = false;
            replaceWatchSearch({ mmsi: previousMmsi });
            setSelectedMmsiOverride(undefined);
            setSelectionBusy(false);
            toast.error('Could not return to queue.');
            return;
        }

        applyWatch(next);
        selectionBusyRef.current = false;
        setSelectedMmsiOverride(undefined);
        setSelectionBusy(false);
    }, [applyWatch, clearIntelligence, replaceWatchSearch, requestChartFocus, vesselSelect]);

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
        selectionGenerationRef.current += 1;
        selectionBusyRef.current = false;
        replaceWatchSearch({ mmsi: null });
        setSelectedMmsiOverride(undefined);
        setSelectionBusy(false);
        const result = await scenarioReset({});
        const next = result.data?.session.scenarioReset;
        if (next) {
            applyWatch(next);
            requestChartFocus(null, false);
        }
    }, [applyWatch, clearIntelligence, replaceWatchSearch, requestChartFocus, scenarioReset]);

    const onMockAisToggle = useCallback(
        async (enabled: boolean) => {
            if (mockToggleBusyRef.current) return;
            mockToggleBusyRef.current = true;

            const generation = ++mockToggleGenerationRef.current;
            const selectedWasMock =
                liveWatch.selectedMmsi != null &&
                liveWatch.vessels.some((v) => v.mmsi === liveWatch.selectedMmsi && v.dataSource === 'mock');

            setMockToggleBusy(true);
            setMockEnabledOverride(enabled);

            if (!enabled) {
                clearIntelligence();
                setIntelligenceBusy(false);
                autoSelectedRef.current = false;
                // Only restore overview when Case was on a demo contact — live triage
                // should not get yanked by toggling Demo off.
                if (selectedWasMock) {
                    selectionGenerationRef.current += 1;
                    selectionBusyRef.current = false;
                    replaceWatchSearch({ mmsi: null });
                    setSelectedMmsiOverride(null);
                    setSelectionBusy(false);
                    requestChartFocus(null, false);
                }
            }

            const result = await mockAisSetEnabled({ enabled });
            if (generation !== mockToggleGenerationRef.current) return;

            const next = result.data?.session.mockAisSetEnabled;
            if (result.error || !next) {
                mockToggleBusyRef.current = false;
                setMockEnabledOverride(null);
                setMockToggleBusy(false);
                toast.error(enabled ? 'Could not enable demo stream.' : 'Could not disable demo stream.');
                return;
            }

            applyWatch(next);
            mockToggleBusyRef.current = false;
            setMockEnabledOverride(null);
            setMockToggleBusy(false);
        },
        [
            applyWatch,
            clearIntelligence,
            liveWatch.selectedMmsi,
            liveWatch.vessels,
            mockAisSetEnabled,
            replaceWatchSearch,
            requestChartFocus,
        ],
    );

    const onViewportChange = useCallback((bounds: { southLat: number; westLon: number; northLat: number; eastLon: number }) => {
        if (viewportReportTimerRef.current) {
            clearTimeout(viewportReportTimerRef.current);
        }
        viewportReportTimerRef.current = setTimeout(() => {
            viewportReportTimerRef.current = null;
            void aisViewportReportRef.current(bounds);
        }, 750);
    }, []);

    useEffect(() => {
        return () => {
            if (viewportReportTimerRef.current) {
                clearTimeout(viewportReportTimerRef.current);
                viewportReportTimerRef.current = null;
            }
            void aisViewportClearRef.current({});
        };
    }, []);

    // URL is source of truth for Case ↔ Queue — sync server selection once on load.
    useEffect(() => {
        if (selectionHydratedRef.current) return;
        selectionHydratedRef.current = true;

        const urlMmsi = search.mmsi ?? null;
        const serverMmsi = seedWatch.selectedMmsi ?? null;
        if (urlMmsi === serverMmsi) {
            if (urlMmsi) {
                requestChartFocus(urlMmsi, vesselHasOpenIncident(seedWatch, urlMmsi));
            }
            return;
        }

        if (urlMmsi) {
            void selectVessel(urlMmsi, { focus: true });
            return;
        }

        void (async () => {
            const generation = ++selectionGenerationRef.current;
            selectionBusyRef.current = true;
            setSelectedMmsiOverride(null);
            setSelectionBusy(true);
            const result = await vesselSelect({ mmsi: null });
            if (generation !== selectionGenerationRef.current) return;
            const next = result.data?.session.vesselSelect;
            if (next) applyWatch(next);
            selectionBusyRef.current = false;
            setSelectedMmsiOverride(undefined);
            setSelectionBusy(false);
        })();
    }, [applyWatch, requestChartFocus, search.mmsi, seedWatch, selectVessel, vesselSelect]);

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
        if (intelligence.mmsi === displayWatch.selectedMmsi && intelligence.complete) {
            setIntelligenceBusy(false);
        }
    }, [displayWatch.selectedMmsi, intelligence, intelligenceBusy]);

    useEffect(() => {
        if (!intelligenceBusy) return;
        const timer = window.setTimeout(() => {
            setIntelligenceBusy(false);
            toast.error('Briefing timed out. Try again.');
        }, BRIEFING_TIMEOUT_MS);
        return () => window.clearTimeout(timer);
    }, [intelligenceBusy]);

    const centerLat = displayWatch.centerLat;
    const centerLon = displayWatch.centerLon;
    const zoom = displayWatch.zoom;

    return (
        <div className="h-dvh overflow-hidden bg-background text-foreground">
            <SidebarProvider className="h-full min-h-0!" style={WATCH_SIDEBAR_STYLE}>
                <SidebarInset id="main-content" className="min-h-0 overflow-hidden bg-background">
                    <WatchToolbar
                        watch={displayWatch}
                        countedVessels={countedVessels}
                        filters={filters}
                        shipTypeCatalog={shipTypeCatalog}
                        onFiltersChange={onFiltersChange}
                        onReset={onReset}
                        mockEnabled={mockEnabled}
                        mockBusy={mockToggleBusy}
                        onMockAisToggle={onMockAisToggle}
                    />
                    <div className="relative min-h-0 min-w-0 flex-1">
                        <NavalMap
                            key={displayWatch.scenarioId}
                            centerLat={centerLat}
                            centerLon={centerLon}
                            zoom={zoom}
                            vessels={mapVessels}
                            layers={filters.layers}
                            selectedMmsi={displayWatch.selectedMmsi}
                            focusRequest={focusRequest}
                            onSelect={onSelectFromMap}
                            onViewportChange={onViewportChange}
                        />
                    </div>
                </SidebarInset>

                <IntelligenceSidebar
                    watch={displayWatch}
                    intelligence={intelligence}
                    intelligenceBusy={intelligenceBusy}
                    selectionBusy={selectionBusy}
                    onRequestIntelligence={onRequestIntelligence}
                    onSelectVessel={onSelectFromQueue}
                    onLocateOnChart={onLocateOnChart}
                    onAcknowledgeAlert={onAcknowledgeAlert}
                    onClearSelection={onClearSelection}
                    visibleShipTypes={filters.shipTypes}
                />
            </SidebarProvider>
        </div>
    );
}
