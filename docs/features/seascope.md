# SeaScope product

AI-powered maritime security copilot for harbor / VTS / maritime security operators. SeaScope converts vessel and sensor feeds into
**site-specific, explainable threat prioritization** so humans focus on vessels that actually matter.

## Product promise

> From thousands of vessel tracks to the one that actually matters.

Traditional VTS answers “what is happening?” Global intel answers “what do we know about this vessel?” SeaScope answers:

> Which vessel matters most right now, why is it abnormal, what protected asset may be affected, and does a human need to investigate?

## Operating loop (MVP)

**MAP → PRIORITY → WHY → ALERT**

| Pillar   | Behavior                                                                                          |
| -------- | ------------------------------------------------------------------------------------------------- |
| MAP      | Full-screen maritime chart; quiet Green traffic; louder Orange/Red markers; protected assets      |
| PRIORITY | Sidebar **Needs attention** ranks Yellow+ by band then score                                      |
| WHY      | Every score shows contributing factors; risk evolution; Copilot explains structured evidence only |
| ALERT    | Red opens an incident timeline and requests operator acknowledgement                              |

## Product principles (MVP stance)

1. **Map first** — the chart is the primary workspace.
2. **Attention over traffic viz** — normal vessels stay quiet; risk rises in visual prominence.
3. **Software monitors first** — humans focus on Orange/Red.
4. **Explain every risk** — no black-box-only scores.
5. **Human in the loop** — recommend and prioritize; never dispatch or interdict autonomously.
6. **Sensor-agnostic model** — AIS today; simulated radar/EO plug into the same factor model.
7. **Demo credibility** — real-shaped AIS replay; simulated sensors clearly marked in scenario config.

## User behavior

1. Land on SeaScope home; open the watch console.
2. Live AISStream traffic fills the map when a key is configured. Real undersea cables and pipelines (TeleGeography + EMODnet) overlay at
   true WGS84. Optionally enable the **Galaxy Leader** demo stream from the toolbar (**Demo**) for dense curated AIS, kinematic anomalies,
   simulated radar mismatch, then AIS dark.
3. Vessels carry a live **0–100 risk score** (Green 0–29 / Yellow 30–59 / Orange 60–79 / Red 80–100). The sidebar **Needs attention** queue
   ranks Yellow+.
4. On Red, SeaScope opens an incident timeline and requests operator acknowledgement.
5. Selecting a vessel shows why it matters (active risk factors), risk evolution, and optional AI briefing.
6. **Reset** clears the watch session; toggle **Demo** off/on to restart the curated narrative.

## Options considered

| Option                         | Pros                          | Cons                                          |
| ------------------------------ | ----------------------------- | --------------------------------------------- |
| Live AIS APIs (AISStream)      | Realism; free WebSocket       | Needs bbox + reconnect; coastal coverage only |
| Curated historical replay      | Deterministic pitch narrative | Not live                                      |
| Black-box ML risk              | Fancy                         | Not explainable; wrong for MVP                |
| Rule-based risk + factors      | Transparent; demo-friendly    | Threshold tuning                              |
| Auth-gated operators           | Multi-user accountability     | Out of MVP scope                              |
| Anonymous cookie sessions only | Fast demo, no login friction  | Identity is infra-only (Operator binding)     |

## Option chosen

**Dual source fused board:** optional AISStream live ingest + opt-in Galaxy Leader mock feeder share one track store, risk engine, GraphQL
`WatchState`, and Postgres tables tagged by `source`. Mock defaults off (`AIS_MOCK_ENABLED` / toolbar `mockAisSetEnabled`). Anonymous cookie
sessions + `sessionUpdates` SSE. Chat remains under `Mutation.session` (silent Operator user for authorship FKs). No login/signup product
surface. MapLibre chart kept (warm-tinted Carto Positron — bronze land / muted sea); risk styling and real protected-infrastructure overlays
(cables / pipelines) layered on top without geography rewrite.

## Out of scope (MVP)

Production radar/EO, satellite processing, sanctions DB, trained ML anomaly models, legally admissible evidence chain, automatic patrol
dispatch, mobile app, complex user management, Kubernetes / microservices.

## Implementation

| Piece                   | Path                                                                     |
| ----------------------- | ------------------------------------------------------------------------ |
| Product / watch UX      | [`watch-console.md`](./watch-console.md)                                 |
| Maritime watch ADR      | [`../architecture/maritime-watch.md`](../architecture/maritime-watch.md) |
| Scenario + kinematics   | `src/server/maritime/`                                                   |
| Risk engine             | `src/server/maritime/riskEngine.ts`                                      |
| Watch GraphQL + pub/sub | `schema.graphqls` `sessionUpdates`, `SessionMutation`                    |
| Intelligence (Gemini)   | `src/server/commands/vesselIntelligenceRun.ts`                           |

Default conversation model: `gemini-3.6-flash`.
