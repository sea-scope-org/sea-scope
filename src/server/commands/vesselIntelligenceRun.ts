import { Output, streamText } from 'ai';
import { z } from 'zod';
import { googleAgentProviderOptionsFor } from '../agents/agentScaffolding';
import type { ServerRuntime } from '../domain/ServerRuntime';
import type { GqlSSession } from '../graphql/generated';
import { osintForVessel } from '../maritime/osintForVessel';
import type { ScenarioPlayerState } from '../maritime/scenarioRuntime';
import type { ScenarioDefinition } from '../maritime/types';
import { vesselIntelligencePut } from '../maritime/vesselIntelligenceStore';
import type { VesselIntelligence } from '../maritime/vesselIntelligenceStore';
import { watchBoardOverlayScenario, watchBoardSessionEnsure, watchBoardSnapshot } from '../maritime/watchBoardRuntime';

const MARITIME_MODEL_ID = 'gemini-3.6-flash';
const PARTIAL_PUBLISH_MIN_MS = 120;

const vesselIntelligenceOutputSchema = z.object({
    status: z.string().describe('One-line vessel status for the operator'),
    summary: z.string().describe('Who the ship is and what is happening now'),
    whyFlagged: z
        .string()
        .describe(
            'Why kinematics/OSINT flagged this vessel in operator language. Cite evidence by human label, not raw internal ids in parentheses.',
        ),
    citations: z
        .array(
            z.object({
                label: z.string().describe('Short human-readable evidence title'),
                source: z.string().describe('OSINT alert id, anomaly id, or AIS field name'),
            }),
        )
        .min(1),
    playbookSteps: z.array(z.string()).min(2).max(6).describe('Numbered actionable response steps'),
});

type VesselIntelligencePartial = {
    status?: string;
    summary?: string;
    whyFlagged?: string;
    citations?: Array<{ label?: string; source?: string }>;
    playbookSteps?: Array<string | undefined>;
};

function watchPacketForIntelligence(sessionId: string): { state: ScenarioPlayerState; scenario: ScenarioDefinition } {
    watchBoardSessionEnsure(sessionId);
    const scenario = watchBoardOverlayScenario();
    return { state: watchBoardSnapshot(sessionId, scenario), scenario };
}

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
    const { state, scenario } = watchPacketForIntelligence(sessionId);

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
        'Write whyFlagged for operators: plain language, no parenthetical raw ids — use citation labels for evidence references.',
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
        `Nearest protected asset: ${JSON.stringify(
            nearestAsset
                ? {
                      assetId: nearestAsset.assetId,
                      name: nearestAsset.name,
                      type: nearestAsset.type,
                      distanceNm: vessel.nearestAssetDistanceNm,
                  }
                : null,
        )}`,
        `Simulated observations (mock sensors): ${JSON.stringify(simObs)}`,
        `High-risk zones: ${JSON.stringify(scenario.highRiskZones.map((zone) => ({ zoneId: zone.zoneId, name: zone.name })))}`,
    ].join('\n');

    const generatedAt = new Date().toISOString();
    const base = {
        mmsi,
        vesselName: vessel.name,
        generatedAt,
    };

    const publishIntelligence = async (intelligence: VesselIntelligence) => {
        vesselIntelligencePut(sessionId, intelligence);
        await serverRuntime.publish.sessionUpdates({
            sessionId,
            payload: { kind: 'intelligence', mmsi },
        });
    };

    try {
        const result = streamText({
            model: serverRuntime.ai.userConversationModel(MARITIME_MODEL_ID),
            providerOptions: googleAgentProviderOptionsFor(MARITIME_MODEL_ID),
            output: Output.object({ schema: vesselIntelligenceOutputSchema }),
            prompt,
        });

        let lastPublishAt = 0;
        let lastFingerprint = '';

        for await (const partial of result.partialOutputStream) {
            const intelligence = intelligenceFromPartial(base, partial as VesselIntelligencePartial, false);
            const fingerprint = intelligenceFingerprint(intelligence);
            if (fingerprint === lastFingerprint) continue;

            const now = Date.now();
            if (now - lastPublishAt < PARTIAL_PUBLISH_MIN_MS) continue;

            lastPublishAt = now;
            lastFingerprint = fingerprint;
            await publishIntelligence(intelligence);
        }

        const output = await result.output;
        await publishIntelligence({
            ...base,
            status: output.status,
            summary: output.summary,
            whyFlagged: output.whyFlagged,
            citations: output.citations,
            playbookSteps: output.playbookSteps,
            complete: true,
        });
    } catch (error) {
        serverRuntime.log.error(error, requestingSession);
        await publishIntelligence({
            ...base,
            status: 'Unavailable',
            summary: 'Intelligence briefing could not be completed. Try requesting again.',
            whyFlagged: 'The analysis did not finish successfully.',
            citations: [{ label: 'System', source: 'seascope' }],
            playbookSteps: ['Retry Request briefing from this investigation panel', 'Keep the contact under visual and kinematic watch'],
            complete: true,
        });
    }
}

function intelligenceFromPartial(
    base: { mmsi: string; vesselName: string; generatedAt: string },
    partial: VesselIntelligencePartial,
    complete: boolean,
): VesselIntelligence {
    const citations =
        partial.citations
            ?.filter((c): c is { label: string; source: string } => Boolean(c.label && c.source))
            .map((c) => ({ label: c.label, source: c.source })) ?? [];
    const playbookSteps = partial.playbookSteps?.filter((step): step is string => typeof step === 'string' && step.length > 0) ?? [];

    return {
        ...base,
        status: partial.status ?? '',
        summary: partial.summary ?? '',
        whyFlagged: partial.whyFlagged ?? '',
        citations,
        playbookSteps,
        complete,
    };
}

function intelligenceFingerprint(intelligence: VesselIntelligence): string {
    return JSON.stringify({
        status: intelligence.status,
        summary: intelligence.summary,
        whyFlagged: intelligence.whyFlagged,
        citations: intelligence.citations,
        playbookSteps: intelligence.playbookSteps,
        complete: intelligence.complete,
    });
}
