# Maritime watch board

## Context

SeaScope’s MVP must demonstrate live vessel monitoring, explainable risk, attention prioritization, and Red-alert incidents. The product
loop is **MAP → PRIORITY → WHY → ALERT** (see [`docs/features/seascope.md`](../features/seascope.md)).

## Decision

Run a **fused multi-source watch board** behind one GraphQL `WatchState` + `sessionUpdates` SSE surface:

1. **Mock source (`mock`)** — Galaxy Leader curated AIS replay. Off by default; operators enable it from the watch toolbar
   (`mockAisSetEnabled`) or boot with `AIS_MOCK_ENABLED=true`.
2. **Live source (`aisstream`)** — AISStream WebSocket ingest into the same store + Postgres persistence when `AISSTREAM_API_KEY` is set.

Shared across sources:

- `vesselTrackStore` — latest identity/position/track tail tagged by source; live wins on MMSI collision for 5 minutes.
- Pure kinematic detectors (`kinematicsDetect`) that emit sticky `Anomaly` records.
- A **rule-based risk engine** (`riskEngine`) over the fused vessel set.
- Galaxy Leader overlays (Cable C17, zones, OSINT, simulated radar/EO) on the board.
- The LLM Copilot (`vesselIntelligenceRun`) **explains** structured risk evidence only.

### Persistence

| Piece     | Behavior                                                                                                                                                                                                                                     |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ingest    | Both sources call `aisVesselPositionPersist` (soft-fail on DB errors so memory stays live)                                                                                                                                                   |
| Tables    | `Vessels` + `AisPositions` with a `source` column (`mock` \| `aisstream`)                                                                                                                                                                    |
| Throttle  | History append at most once per MMSI per 60s                                                                                                                                                                                                 |
| Retention | Job `ais-positions-cleanup` deletes `AisPositions` older than 7 days                                                                                                                                                                         |
| Env       | `AISSTREAM_API_KEY` / `AISSTREAM_BBOX` (default Gibraltar — Red Sea has little free AISStream coverage; mock tracks are offset into the live bbox); `AIS_MOCK_ENABLED` (default `false`; boot-only — runtime toggle via `mockAisSetEnabled`) |

**Prerequisite:** `DATABASE_URL` must reach Postgres. If the DB times out, GraphQL session/watch returns 500 and the map stays empty even
when AISStream is connected.

**Logging:** AISStream / mock lifecycle lines (`[aisstream] …`, `[mock-ais] …`) print to the **server terminal** running `npm run dev`, not
the browser console. Heartbeats every 15s report message/position counts.

## Alternatives considered

| Alternative                       | Why rejected / deferred                              |
| --------------------------------- | ---------------------------------------------------- |
| Exclusive live vs scenario mode   | Empty map when live is quiet; hid the demo narrative |
| MarineTraffic free / online plans | Web UI only; API is sales-gated                      |
| pg-boss cron as primary ingest    | AISStream is a long-lived WebSocket                  |
| Client-only AISStream             | Forbidden by AISStream; would leak the API key       |

## Consequences

- Operators see live AISStream traffic by default; demo vessels appear only after enabling the mock feeder from the toolbar (or
  `AIS_MOCK_ENABLED=true` at boot).
- Vessel identity + position history survive restarts in Postgres; in-memory risk/anomaly board does not.
- Feature UX: [`watch-console.md`](../features/watch-console.md).

## Key files

| Piece            | Path                                                              |
| ---------------- | ----------------------------------------------------------------- |
| Track store      | `src/server/maritime/vesselTrackStore.ts`                         |
| Mock feeder      | `src/server/maritime/sources/mockScenarioSource.ts`               |
| AISStream ingest | `src/server/maritime/aisStreamIngest.ts`                          |
| Fused board      | `src/server/maritime/watchBoardRuntime.ts`                        |
| Tick driver      | `src/server/maritime/watchBoardTickDriver.ts`                     |
| Persist          | `src/server/commands/aisVesselPositionPersist.ts`                 |
| Control          | `src/server/commands/scenarioControl.ts`                          |
| GraphQL          | `schema.graphqls` (`Vessel.dataSource`, `WatchState.dataSources`) |
| DB               | `Vessels` / `AisPositions`                                        |
