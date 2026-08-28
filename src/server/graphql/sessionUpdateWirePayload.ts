// Lean NOTIFY payloads for `sessionUpdates`. Full watch / anomaly /
// intelligence shapes are reloaded in the subscription resolver from the
// in-memory scenario player (and intelligence store). pg_notify is capped
// at 8000 bytes — never put vessel arrays or AI prose on the wire.

export type SessionUpdateWirePayload =
    { kind: 'watchSnapshot' } | { kind: 'anomalyAppended'; anomalyId: string } | { kind: 'intelligence'; mmsi: string };
