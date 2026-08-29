import { lt } from 'drizzle-orm';

import { aisPositions } from '../../db/schema';
import type { RecurringJobDefinition } from '../types';

const RETENTION_DAYS = 7;

export const aisPositionsCleanup: RecurringJobDefinition = {
    kind: 'recurring',
    name: 'ais-positions-cleanup',
    cron: '15 * * * *',
    handler: async ({ serverRuntime }) => {
        const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60_000);
        try {
            const deleted = await serverRuntime.db.delete(aisPositions).where(lt(aisPositions.reportedAt, cutoff)).returning({
                aisPositionId: aisPositions.aisPositionId,
            });
            serverRuntime.log.info(`AIS position retention deleted ${deleted.length} rows older than ${RETENTION_DAYS}d`);
        } catch (error) {
            serverRuntime.log.error(error);
            throw error;
        }
    },
    options: {
        retryLimit: 2,
        expireInSeconds: 300,
    },
};
