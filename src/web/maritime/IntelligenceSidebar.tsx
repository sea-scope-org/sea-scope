import { RadarIcon } from 'lucide-react';
import { Button } from '../components/base/button';
import { Sidebar, SidebarContent, SidebarHeader } from '../components/base/sidebar';
import type { GqlCVesselIntelligence, GqlCWatchFieldsFragment } from '../graphql/generated';
import { WatchCase } from './WatchCase';
import { WatchQueue } from './WatchQueue';

export interface IntelligenceSidebarProps {
    watch: GqlCWatchFieldsFragment | null;
    intelligence: GqlCVesselIntelligence | null;
    intelligenceBusy: boolean;
    onRequestIntelligence: (mmsi: string) => void;
    onSelectVessel: (mmsi: string) => void;
    onAcknowledgeAlert: (incidentId: string) => void;
    onClearSelection: () => void;
    visibleShipTypes?: ReadonlySet<string>;
    className?: string;
}

export function IntelligenceSidebar({
    watch,
    intelligence,
    intelligenceBusy,
    onRequestIntelligence,
    onSelectVessel,
    onAcknowledgeAlert,
    onClearSelection,
    visibleShipTypes,
    className,
}: IntelligenceSidebarProps) {
    const selectedMmsi = watch?.selectedMmsi ?? null;
    const vessel = selectedMmsi ? (watch?.vessels.find((v) => v.mmsi === selectedMmsi) ?? null) : null;
    const inCase = Boolean(watch && vessel);

    return (
        <Sidebar side="right" collapsible="offcanvas" className={className}>
            <SidebarHeader className="flex-row items-center gap-2 border-b border-sidebar-border px-4 py-3">
                <RadarIcon className="size-4 text-primary" aria-hidden />
                <h2 className="text-xs font-semibold tracking-[0.14em] text-foreground uppercase">{inCase ? 'Case' : 'Queue'}</h2>
                {inCase ? (
                    <Button type="button" size="xs" variant="ghost" className="ml-auto" onClick={onClearSelection}>
                        Back to queue
                    </Button>
                ) : null}
            </SidebarHeader>

            <SidebarContent className="gap-0 overflow-hidden p-0">
                {watch && vessel ? (
                    <WatchCase
                        key={vessel.mmsi}
                        watch={watch}
                        vessel={vessel}
                        intelligence={intelligence}
                        intelligenceBusy={intelligenceBusy}
                        onRequestIntelligence={onRequestIntelligence}
                        onAcknowledgeAlert={onAcknowledgeAlert}
                    />
                ) : watch ? (
                    <WatchQueue watch={watch} onSelectVessel={onSelectVessel} visibleShipTypes={visibleShipTypes} />
                ) : (
                    <p className="p-4 text-xs text-muted-foreground">Waiting for watch board…</p>
                )}
            </SidebarContent>
        </Sidebar>
    );
}
