import type { EnvironmentVariables } from './EnvironmentVariables';

const requiredEnvironmentVariables = ['DATABASE_URL', 'sessionCookieName', 'WEB_PAGE_URL', 'VISITOR_IP_HASH_SALT'] as const;

/** Red Sea / Bab el-Mandeb — matches the Galaxy Leader demo theater. */
const DEFAULT_AIS_STREAM_BBOX = {
    southLat: 12,
    westLon: 41,
    northLat: 16,
    eastLon: 44,
} as const;

function aisStreamBoundingBoxParse(raw: string | undefined): EnvironmentVariables['aisStreamBoundingBox'] {
    if (!raw?.trim()) return { ...DEFAULT_AIS_STREAM_BBOX };
    const parts = raw.split(',').map((part) => Number(part.trim()));
    if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) {
        throw new Error('AISSTREAM_BBOX must be four comma-separated numbers: southLat,westLon,northLat,eastLon');
    }
    const [southLat, westLon, northLat, eastLon] = parts as [number, number, number, number];
    if (southLat >= northLat || westLon >= eastLon) {
        throw new Error('AISSTREAM_BBOX requires southLat < northLat and westLon < eastLon');
    }
    return { southLat, westLon, northLat, eastLon };
}

function aisMockEnabledParse(raw: string | undefined): boolean {
    if (raw === undefined || raw === '') return true;
    if (raw === 'true') return true;
    if (raw === 'false') return false;
    throw new Error('AIS_MOCK_ENABLED must be "true" or "false"');
}

export function environmentVariablesCreate(source: NodeJS.ProcessEnv = process.env): EnvironmentVariables {
    const missing = requiredEnvironmentVariables.filter((name) => !source[name]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    const aisStreamApiKey = source.AISSTREAM_API_KEY || undefined;

    return {
        databaseUrl: source.DATABASE_URL!,
        sessionCookie: {
            name: source.sessionCookieName!,
            secure: source.sessionCookieSecure === 'true',
            domainScope: source.sessionCookieDomainScope,
        },
        buildSha: source.BUILD_SHA ?? source.VERCEL_GIT_COMMIT_SHA ?? 'unknown',
        webPageUrl: source.WEB_PAGE_URL!.replace(/\/$/, ''),
        // Capability-specific — validated by whoever consumes it (see
        // `serverRuntimeCreate`'s Google client wiring), not at boot.
        googleGenerativeAiApiKey: source.GOOGLE_GENERATIVE_AI_API_KEY,
        // Capability-specific — required only by features that authenticate
        // server-side renders via `serverToken.ts`. Validated at the call
        // site, not at boot. See `docs/architecture/browser-capture.md`.
        serverTokenSecret: source.SERVER_TOKEN_SECRET,
        // Capability-specific — AISStream ingest starts only when this is set.
        aisStreamApiKey,
        aisStreamBoundingBox: aisStreamBoundingBoxParse(source.AISSTREAM_BBOX),
        aisMockEnabled: aisMockEnabledParse(source.AIS_MOCK_ENABLED),
        visitorIpHashSalt: source.VISITOR_IP_HASH_SALT!,
    };
}

let cachedEnvironmentVariables: EnvironmentVariables | undefined;

export const environmentVariables: EnvironmentVariables = new Proxy({} as EnvironmentVariables, {
    get(_target, property) {
        cachedEnvironmentVariables ??= environmentVariablesCreate();
        return cachedEnvironmentVariables[property as keyof EnvironmentVariables];
    },
});
