import type { ScenarioPlayerState } from './scenarioRuntime';
import { SCENARIO_CATALOG } from './scenarios/galaxyLeader';
import type { OsintAlert, ScenarioDefinition } from './types';

const REGION_TAGS = ['red-sea', 'bab-el-mandeb', 'southern-red-sea', 'piracy'];

function normalize(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

export function osintForVessel(mmsi: string, playerState: ScenarioPlayerState, scenario?: ScenarioDefinition): OsintAlert[] {
    const resolved = scenario ?? SCENARIO_CATALOG[playerState.scenarioId];
    if (!resolved) return [];

    const vessel = playerState.vessels.find((v) => v.mmsi === mmsi) ?? resolved.vessels.find((v) => v.mmsi === mmsi);
    if (!vessel) return [];

    const nameTag = normalize(vessel.name);
    const nameTokens = nameTag.split('-').filter((t) => t.length > 2);

    return resolved.osintAlerts.filter((alert) => {
        const tags = alert.relevanceTags.map((t) => t.toLowerCase());
        const region = alert.region.toLowerCase();

        if (tags.includes(nameTag) || nameTokens.some((t) => tags.includes(t))) return true;
        if (tags.some((t) => REGION_TAGS.includes(t))) return true;
        if (REGION_TAGS.some((t) => region.includes(t.replace(/-/g, ' ')) || region.includes(t))) return true;
        if (tags.includes('piracy') || tags.includes('houthi')) return true;

        return false;
    });
}
