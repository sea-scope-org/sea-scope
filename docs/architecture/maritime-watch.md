# Maritime watch board

## Context

SeaScope’s MVP must demonstrate live vessel monitoring, explainable risk, attention prioritization, and Red-alert incidents. The product
loop is **MAP → PRIORITY → WHY → ALERT** (see [`docs/features/seascope.md`](../features/seascope.md)).

## Decision

Run a **fused multi-source watch board** behind one GraphQL `WatchState` + `sessionUpdates` SSE surface:

1. **Mock source (`mock`)** — Galaxy Leader curated AIS replay. Off by default; operators enable it from the watch toolbar
   (`mockAisSetEnabled`) or boot with `AIS_MOCK_ENABLED=true`.
2. **Live source (`aisstream`)** — AISStream WebSocket ingest into the same store + Postgres persistence when `AISSTREAM_API_KEY` is set.
   Always subscribed to `AISSTREAM_BBOX` (default Gibraltar). Watch clients also report chart viewports via `aisViewportReport`; the server
   **unions** eligible session boxes into the same WebSocket subscription (≤1 resubscribe/sec). Spans over 5° lat or lon are
   **hard-skipped** (Gibraltar-only). Stale viewports expire after 60s; `aisViewportClear` on leave.

Shared across sources:

- `vesselTrackStore` — latest identity/position/track tail tagged by source; live wins on MMSI collision for 5 minutes.
- Pure kinematic detectors (`kinematicsDetect`) that emit sticky `Anomaly` records.
- A **rule-based risk engine** (`riskEngine`) over the fused vessel set. Nearest cable/pipeline is **context only** (shown on Case /
  preview) — proximity does not raise score; the ocean is dense with infrastructure.
- **Real protected infrastructure** (`protectedInfrastructureCatalog`) — public TeleGeography submarine cables + EMODnet pipelines at true
  WGS84. Refresh with `npm run infrastructure:import`. Chart loads geometries from `/maritime/protected-infrastructure.geojson` (not watch
  SSE). Never passed through `scenarioOffsetToBbox`. Always on the board. Keep TeleGeography attribution; revisit commercial licensing
  before productizing redistribution of their geocoded routes.
- Galaxy Leader demo overlays (zones, OSINT, simulated radar/EO) **only while Demo is on**. Mock vessel positions and those overlays are
  mapped from Red Sea authoring coords into a **water corridor** inside `AISSTREAM_BBOX` (`aisTheaterMapPoint` / `scenarioOffsetToBbox`) so
  the ~1° Bab el-Mandeb theater fits the narrow Gibraltar channel instead of spilling onto Andalusia/Morocco.
- The LLM Copilot (`vesselIntelligenceRun`) **explains** structured risk evidence only.
- The chart keeps vessel identity and attention independent: normalized ship family controls marker color (tanker burgundy, not risk-red),
  while the existing risk bands control external fixed screen-space halos and AIS dark uses a separate dashed ring. Observed track tails
  stay on for all contacts when enabled (muted, with the focused contact strengthened). Client-only constant-course/speed projections add
  short-horizon context for the focused contact without changing the server risk engine or claiming vessel intent.

### Persistence

| Piece     | Behavior                                                                                                                                                                                                                                                                                                               |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ingest    | Both sources call `aisVesselPositionPersist` (soft-fail on DB errors so memory stays live)                                                                                                                                                                                                                             |
| Tables    | `Vessels` + `AisPositions` with a `source` column (`mock` \| `aisstream`)                                                                                                                                                                                                                                              |
| Throttle  | History append at most once per MMSI per 60s                                                                                                                                                                                                                                                                           |
| Retention | Job `ais-positions-cleanup` deletes `AisPositions` older than 7 days                                                                                                                                                                                                                                                   |
| Env       | `AISSTREAM_API_KEY` / `AISSTREAM_BBOX` (default Gibraltar — Red Sea has little free AISStream coverage; mock tracks are **affine-mapped** into a navigable water corridor inside the live bbox, not center-offset onto land); `AIS_MOCK_ENABLED` (default `false`; boot-only — runtime toggle via `mockAisSetEnabled`) |
| Viewports | `aisViewportRegistry` + `aisViewportReport` / `aisViewportClear` — union of ≤5° chart viewports into AISStream `BoundingBoxes` alongside the env box; 60s TTL; antimeridian wraps rejected                                                                                                                             |

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
| Planet-wide AISStream bbox        | Huge volume; free coastal coverage still sparse      |
| Per-client AISStream connections  | Account/IP limit is 3; stay on one process socket    |

## Consequences

- Operators see live AISStream traffic by default (Gibraltar bbox + any zoomed-in chart viewports under 5°); demo vessels appear only after
  enabling the mock feeder from the toolbar (or `AIS_MOCK_ENABLED=true` at boot).
- Vessel identity + position history survive restarts in Postgres; in-memory risk/anomaly board does not.
- Feature UX: [`watch-console.md`](../features/watch-console.md).

## Key files

| Piece            | Path                                                                                                     |
| ---------------- | -------------------------------------------------------------------------------------------------------- |
| Track store      | `src/server/maritime/vesselTrackStore.ts`                                                                |
| Theater mapping  | `src/server/maritime/aisTheater.ts` (`aisTheaterMapPoint`)                                               |
| Viewport union   | `src/server/maritime/aisViewportRegistry.ts`                                                             |
| Mock feeder      | `src/server/maritime/sources/mockScenarioSource.ts` (run-generation guard on stop)                       |
| AISStream ingest | `src/server/maritime/aisStreamIngest.ts`                                                                 |
| Fused board      | `src/server/maritime/watchBoardRuntime.ts`                                                               |
| Infrastructure   | `src/server/maritime/infrastructure/` (TeleGeography + EMODnet catalog; `npm run infrastructure:import`) |
| Tick driver      | `src/server/maritime/watchBoardTickDriver.ts`                                                            |
| Persist          | `src/server/commands/aisVesselPositionPersist.ts`                                                        |
| Control          | `src/server/commands/scenarioControl.ts`, `aisViewportReport.ts`                                         |
| GraphQL          | `schema.graphqls` (`Vessel.dataSource`, `WatchState.dataSources`)                                        |
| DB               | `Vessels` / `AisPositions`                                                                               |
