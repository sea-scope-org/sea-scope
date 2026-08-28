import { generateText, Output } from 'ai';
import { z } from 'zod';
import { googleAgentProviderOptionsFor } from '../agents/agentScaffolding';
import type { ServerRuntime } from '../domain/ServerRuntime';
import type { GqlSSession } from '../graphql/generated';
import { osintForVessel } from '../maritime/osintForVessel';
import { scenarioDefinitionGet, scenarioPlayerGet } from '../maritime/scenarioRuntime';
import { vesselIntelligencePut } from '../maritime/vesselIntelligenceStore';
import type { VesselIntelligence } from '../maritime/vesselIntelligenceStore';

const MARITIME_MODEL_ID = 'gemini-3.6-flash';

const vesselIntelligenceOutputSchema = z.object({
    status: z.string().describe('One-line vessel status for the operator'),
    summary: z.string().describe('Who the ship is and what is happening now'),
    whyFlagged: z.string().describe('Why kinematics/OSINT flagged this vessel, citing evidence'),
    citations: z
        .array(
            z.object({
                label: z.string(),
                source: z.string().describe('OSINT alert id, anomaly id, or AIS field name'),
            }),
        )
        .min(1),
    playbookSteps: z.array(z.string()).min(2).max(6).describe('Numbered actionable response steps'),
});

export function vesselIntelligenceRunDetached(args: {
    sessionId: string;
    mmsi: string;
    requestingSession: GqlSSession;
    serverRuntime: ServerRuntime;
}): void {
    void vesselIntelligenceRun(args).catch((error) => {
        args.serverRuntime.log.error(error, args.requestingSession);
    });
}

async function vesselIntelligenceRun({
    sessionId,
    mmsi,
    requestingSession,
    serverRuntime,
}: {
    sessionId: string;
    mmsi: string;
    requestingSession: GqlSSession;
    serverRuntime: ServerRuntime;
}): Promise<void> {
    const state = scenarioPlayerGet(sessionId);
    if (!state) throw new Error(`No watch state for session ${sessionId}`);
    const scenario = scenarioDefinitionGet(state.scenarioId);
    if (!scenario) throw new Error(`Unknown scenario ${state.scenarioId}`);

    const vessel = state.vessels.find((v) => v.mmsi === mmsi);
    if (!vessel) throw new Error(`Unknown vessel ${mmsi}`);

    const anomalies = state.anomalies.filter((a) => a.mmsi === mmsi);
    const osint = osintForVessel(mmsi, state, scenario);
    const riskEvents = state.riskEvents.filter((e) => e.mmsi === mmsi);
    const incident = state.incidents.find((i) => i.mmsi === mmsi);
    const nearestAsset = vessel.nearestAssetId ? scenario.protectedAssets.find((a) => a.assetId === vessel.nearestAssetId) : null;
    const simObs = scenario.simulatedObservations.filter((o) => o.mmsi === mmsi && o.activeFromSimMs <= state.simMs);

    const prompt = [
        'You are SeaScope, a maritime security copilot for operators.',
        'Respond ONLY via the structured schema. Never invent AIS facts, coordinates, risk scores, or alert ids.',
        'The deterministic risk engine owns the score — explain it; do not invent detections.',
        'Phrase playbookSteps as recommended verification steps (never order interdiction or dispatch).',
        'Every citation.source must be one of the provided anomaly ids, risk event ids, OSINT alert ids, asset ids, observation ids, or literal AIS field names from the packet.',
        '',
        `Simulated time offset (ms): ${state.simMs}`,
        `Vessel: ${JSON.stringify({
            mmsi: vessel.mmsi,
            name: vessel.name,
            imo: vessel.imo,
            callSign: vessel.callSign,
            shipType: vessel.shipType,
            flag: vessel.flag,
            aisDark: vessel.aisDark,
            position: vessel.position,
            riskScore: vessel.riskScore,
            riskLevel: vessel.riskLevel,
            riskTrend: vessel.riskTrend,
            activeFactors: vessel.activeFactors,
            nearestAssetDistanceNm: vessel.nearestAssetDistanceNm,
            radarPosition: vessel.radarPosition,
        })}`,
        `Risk events: ${JSON.stringify(riskEvents)}`,
        `Incident: ${JSON.stringify(incident ?? null)}`,
        `Anomalies: ${JSON.stringify(anomalies)}`,
        `OSINT: ${JSON.stringify(osint)}`,
        `Protected assets: ${JSON.stringify(scenario.protectedAssets.map((a) => ({ assetId: a.assetId, name: a.name, type: a.type })))}`,
        `Nearest asset: ${JSON.stringify(nearestAsset ? { assetId: nearestAsset.assetId, name: nearestAsset.name } : null)}`,
        `Simulated observations (mock sensors): ${JSON.stringify(simObs)}`,
        `High-risk zones: ${JSON.stringify(scenario.highRiskZones.map((zone) => ({ zoneId: zone.zoneId, name: zone.name })))}`,
    ].join('\n');

    let intelligence: VesselIntelligence;
    try {
        const result = await generateText({
            model: serverRuntime.ai.userConversationModel(MARITIME_MODEL_ID),
            providerOptions: googleAgentProviderOptionsFor(MARITIME_MODEL_ID),
            output: Output.object({ schema: vesselIntelligenceOutputSchema }),
            prompt,
        });

        const output = result.output;
        intelligence = {
            mmsi,
            vesselName: vessel.name,
            status: output.status,
            summary: output.summary,
            whyFlagged: output.whyFlagged,
            citations: output.citations,
            playbookSteps: output.playbookSteps,
            generatedAt: new Date().toISOString(),
        };
    } catch (error) {
        serverRuntime.log.error(error, requestingSession);
        intelligence = {
            mmsi,
            vesselName: vessel.name,
            status: 'Unavailable',
            summary: 'Intelligence briefing could not be completed. Try requesting again.',
            whyFlagged: 'The analysis did not finish successfully.',
            citations: [{ label: 'System', source: 'seascope' }],
            playbookSteps: ['Retry Request briefing from this investigation panel', 'Keep the contact under visual and kinematic watch'],
            generatedAt: new Date().toISOString(),
        };
    }

    vesselIntelligencePut(sessionId, intelligence);
    await serverRuntime.publish.sessionUpdates({
        sessionId,
        payload: { kind: 'intelligence', mmsi },
    });
}
