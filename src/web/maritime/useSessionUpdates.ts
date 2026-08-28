import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dispatch, RefObject, SetStateAction } from 'react';
import { createRequest, useClient } from 'urql';
import { pipe, subscribe } from 'wonka';
import { SessionUpdatesDocument } from '../graphql/generated';
import type {
    GqlCSessionUpdatesSubscription,
    GqlCVesselIntelligence,
    GqlCWatchFieldsFragment,
    GqlCWatchPageQuery,
} from '../graphql/generated';

type SessionUpdate = GqlCSessionUpdatesSubscription['sessionUpdates'];
type WatchState = GqlCWatchFieldsFragment;
type Anomaly = WatchState['anomalies'][number];
type SeedWatch = GqlCWatchPageQuery['currentSession']['watch'];

export interface SessionUpdatesState {
    watch: WatchState | null;
    intelligence: GqlCVesselIntelligence | null;
    /** Apply a WatchState returned from a mutation immediately (subscription may lag). */
    applyWatch: (watch: WatchState | null) => void;
    /** Clear the AI brief (e.g. when selection changes). */
    clearIntelligence: () => void;
}

/**
 * Live watch-console session stream.
 *
 * Drives `sessionUpdates` imperatively via `client.executeSubscription` + wonka
 * (same rationale as `useChatLiveUpdates` — never `useSubscription`). Seeds
 * from the route loader; replaces on `SessionUpdateWatchSnapshot`; appends
 * anomalies; stores intelligence briefs.
 */
export function useSessionUpdates(options: { seedWatch: SeedWatch; onAnomalyAppended?: (anomaly: Anomaly) => void }): SessionUpdatesState {
    const { seedWatch, onAnomalyAppended } = options;
    const [watch, setWatch] = useState<WatchState | null>(seedWatch);
    const [intelligence, setIntelligence] = useState<GqlCVesselIntelligence | null>(null);

    const onAnomalyRef = useRef(onAnomalyAppended);
    useEffect(() => {
        onAnomalyRef.current = onAnomalyAppended;
    }, [onAnomalyAppended]);

    const applyWatch = useCallback((next: WatchState | null) => {
        setWatch(next);
    }, []);

    const clearIntelligence = useCallback(() => {
        setIntelligence(null);
    }, []);

    const client = useClient();
    useEffect(() => {
        const request = createRequest(SessionUpdatesDocument, {});
        const operation = client.executeSubscription<GqlCSessionUpdatesSubscription>(request);
        const { unsubscribe } = pipe(
            operation,
            subscribe((result) => {
                const update = result.data?.sessionUpdates;
                if (!update) return;
                handleUpdate(update, setWatch, setIntelligence, onAnomalyRef);
            }),
        );
        return unsubscribe;
    }, [client]);

    return { watch, intelligence, applyWatch, clearIntelligence };
}

function handleUpdate(
    update: SessionUpdate,
    setWatch: Dispatch<SetStateAction<WatchState | null>>,
    setIntelligence: Dispatch<SetStateAction<GqlCVesselIntelligence | null>>,
    onAnomalyRef: RefObject<((anomaly: Anomaly) => void) | undefined>,
) {
    if (update.__typename === 'SessionUpdateWatchSnapshot') {
        setWatch(update.watch);
        return;
    }

    if (update.__typename === 'SessionUpdateAnomalyAppended') {
        const anomaly = update.anomaly;
        setWatch((prev) => {
            if (!prev) return prev;
            if (prev.anomalies.some((a) => a.anomalyId === anomaly.anomalyId)) return prev;
            return { ...prev, anomalies: [...prev.anomalies, anomaly] };
        });
        onAnomalyRef.current?.(anomaly);
        return;
    }

    // SessionUpdateIntelligence
    setIntelligence(update.intelligence);
}
