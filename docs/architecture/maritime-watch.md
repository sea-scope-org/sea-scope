# Maritime watch board

## Context

SeaScope’s MVP must demonstrate live vessel monitoring, explainable risk, attention prioritization, and Red-alert incidents without
production sensor fusion or a maritime database. The product loop is **MAP → PRIORITY → WHY → ALERT** (see
[`docs/features/seascope.md`](../features/seascope.md)).

## Decision

Run an **in-memory, cookie-session scenario player** with:

1. Curated AIS track replay (Galaxy Leader) advanced by a wall-clock tick driver.
2. Pure kinematic detectors (`kinematicsDetect`) that emit sticky `Anomaly` records.
3. A **rule-based risk engine** (`riskEngine`) that recomputes each vessel’s 0–100 score, band, trend, and active factors every tick.
4. GraphQL `WatchState` + `sessionUpdates` SSE so the chart and attention sidebar stay live.
5. Simulated radar/EO observations and `ProtectedAsset` geometry in scenario config (clearly marked simulated).
6. In-memory `Incident` on first Red transition; `alertAcknowledge` / `scenarioReset` for operators and judges.

The LLM Copilot (`vesselIntelligenceRun`) **explains** structured risk evidence only — it must not invent detections or set the score.

## Alternatives considered

| Alternative                         | Why rejected                                        |
| ----------------------------------- | --------------------------------------------------- |
| Live AIS / real radar adapters      | Brittle for demos; out of MVP scope                 |
| PostGIS + persisted maritime tables | Unnecessary while state is session-scoped demo      |
| Black-box ML risk model             | Not explainable; contradicts product principles     |
| Client-only simulation              | Risk/incident logic must be authoritative on server |

## Consequences

- Watch state is lost on process restart (acceptable for MVP demos).
- Risk thresholds and deltas live in `riskEngine` — tune there, not in the UI.
- Anomalies remain the detector layer; risk factors are the operator-facing explanation layer.
- Feature UX docs: [`watch-console.md`](../features/watch-console.md).

## Key files

| Piece           | Path                                                |
| --------------- | --------------------------------------------------- |
| Types           | `src/server/maritime/types.ts`                      |
| Risk engine     | `src/server/maritime/riskEngine.ts`                 |
| Scenario player | `src/server/maritime/scenarioRuntime.ts`            |
| Tick driver     | `src/server/maritime/scenarioTickDriver.ts`         |
| Galaxy Leader   | `src/server/maritime/scenarios/galaxyLeader.ts`     |
| GraphQL         | `src/server/graphql/schema.graphqls` (`WatchState`) |
| Commands        | `src/server/commands/scenarioControl.ts`            |
| Mapper          | `src/server/mappers/toGqlWatch.ts`                  |
