type VesselIntelligenceCitation = {
    label: string;
    source: string;
};

export type VesselIntelligence = {
    mmsi: string;
    vesselName: string;
    status: string;
    summary: string;
    whyFlagged: string;
    citations: VesselIntelligenceCitation[];
    playbookSteps: string[];
    generatedAt: string;
};

const bySession = new Map<string, Map<string, VesselIntelligence>>();

export function vesselIntelligencePut(sessionId: string, intelligence: VesselIntelligence): void {
    let byMmsi = bySession.get(sessionId);
    if (!byMmsi) {
        byMmsi = new Map();
        bySession.set(sessionId, byMmsi);
    }
    byMmsi.set(intelligence.mmsi, intelligence);
}

export function vesselIntelligenceGet(sessionId: string, mmsi: string): VesselIntelligence | null {
    return bySession.get(sessionId)?.get(mmsi) ?? null;
}

export function vesselIntelligenceClearSession(sessionId: string): void {
    bySession.delete(sessionId);
}
