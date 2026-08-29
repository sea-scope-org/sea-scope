import { RadarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../components/base/button';
import { Sidebar, SidebarContent, SidebarHeader } from '../components/base/sidebar';
import type { GqlCVesselIntelligence, GqlCWatchFieldsFragment } from '../graphql/generated';
import { WatchCase } from './WatchCase';
import type { Vessel } from './watchSidebarShared';
import { WatchQueue } from './WatchQueue';

export interface IntelligenceSidebarProps {
    watch: GqlCWatchFieldsFragment | null;
    intelligence: GqlCVesselIntelligence | null;
    intelligenceBusy: boolean;
    /** True while Case ↔ Queue selection mutation is in flight. */
    selectionBusy?: boolean;
    onRequestIntelligence: (mmsi: string) => void;
    onSelectVessel: (mmsi: string) => void;
    onLocateOnChart: () => void;
    onAcknowledgeAlert: (incidentId: string) => void;
    onClearSelection: () => void;
    visibleShipTypes?: ReadonlySet<string>;
    className?: string;
}

export function IntelligenceSidebar({
    watch,
    intelligence,
    intelligenceBusy,
    selectionBusy = false,
    onRequestIntelligence,
    onSelectVessel,
    onLocateOnChart,
    onAcknowledgeAlert,
    onClearSelection,
    visibleShipTypes,
    className,
}: IntelligenceSidebarProps) {
    const selectedMmsi = watch?.selectedMmsi ?? null;
    const liveVessel = selectedMmsi ? (watch?.vessels.find((v) => v.mmsi === selectedMmsi) ?? null) : null;

    const [cachedVessel, setCachedVessel] = useState<Vessel | null>(null);
    const cachedMmsiRef = useRef<string | null>(null);

    useEffect(() => {
        if (liveVessel) {
            cachedMmsiRef.current = liveVessel.mmsi;
            setCachedVessel(liveVessel);
            return;
        }
        if (!selectedMmsi) {
            cachedMmsiRef.current = null;
            setCachedVessel(null);
        }
    }, [liveVessel, selectedMmsi]);

    const vessel =
        liveVessel ?? (selectedMmsi && cachedVessel?.mmsi === selectedMmsi ? cachedVessel : null);
    const contactMissing = Boolean(selectedMmsi && !liveVessel && vessel);
    // Stay in Case whenever a selection exists — never silently dump to Queue.
    const inCase = Boolean(watch && selectedMmsi);

    return (
        <Sidebar side="right" collapsible="offcanvas" className={className}>
            <SidebarHeader className="flex-row items-center gap-2 border-b border-sidebar-border px-4 py-3">
                <RadarIcon className="size-4 text-primary" aria-hidden />
                <h2 className="text-xs font-semibold tracking-[0.14em] text-foreground uppercase">{inCase ? 'Case' : 'Queue'}</h2>
                {inCase ? (
                    <Button
                        type="button"
                        size="xs"
                        variant="ghost"
                        className="ml-auto"
                        onClick={onClearSelection}
                        disabled={selectionBusy}
                        aria-busy={selectionBusy}
                    >
                        Back to queue
                    </Button>
                ) : null}
            </SidebarHeader>

            <SidebarContent className="gap-0 overflow-hidden p-0" aria-busy={selectionBusy && !inCase}>
                {watch && selectedMmsi && vessel ? (
                    <WatchCase
                        key={vessel.mmsi}
                        watch={watch}
                        vessel={vessel}
                        contactMissing={contactMissing}
                        intelligence={intelligence}
                        intelligenceBusy={intelligenceBusy}
                        onRequestIntelligence={onRequestIntelligence}
                        onLocateOnChart={onLocateOnChart}
                        onAcknowledgeAlert={onAcknowledgeAlert}
                    />
                ) : watch && selectedMmsi ? (
                    <CaseContactUnavailable mmsi={selectedMmsi} />
                ) : watch ? (
                    <WatchQueue
                        watch={watch}
                        onSelectVessel={onSelectVessel}
                        visibleShipTypes={visibleShipTypes}
                        disabled={selectionBusy}
                    />
                ) : (
                    <p className="p-4 text-xs text-muted-foreground">Waiting for watch board…</p>
                )}
            </SidebarContent>
        </Sidebar>
    );
}

function CaseContactUnavailable({ mmsi }: { mmsi: string }) {
    return (
        <div className="flex min-h-0 flex-1 flex-col gap-2 p-4">
            <p className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">MMSI {mmsi}</p>
            <p className="text-xs text-muted-foreground">Contact left the live board. Return to the queue or wait for a fresh position.</p>
        </div>
    );
}
