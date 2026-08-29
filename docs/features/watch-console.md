# Watch console

Operator console for the SeaScope demo — live maritime chart, scored risk feed, Queue ↔ Case sidebar, and vessel intelligence.

## User behavior

1. From the home page, **Open console / demo** navigates to `/watch`.
2. The page is full-viewport, `noindex`, and not in the sitemap. Shell chrome follows the light brand tokens; the MapLibre chart uses Carto
   Positron retinted to warm bronze land and muted sea (see [`theme.md`](../styles/theme.md)).
3. The fused watch board is live on load with **live AISStream** positions when `AISSTREAM_API_KEY` is set. The **Galaxy Leader demo**
   stream is **off by default** — enable it with the toolbar **Demo** button (`mockAisSetEnabled`). Toolbar badges show live (and demo, when
   on) vessel counts. **Reset** clears selection / risk stickies for the session.
4. Toolbar **Filters** toggles chart layers (protected assets / Cable C17, high-risk zones, track tails, radar contacts) and vessel
   `shipType`s. Filters are client-only and shared by the chart, Queue, and toolbar band counts (all on by default; **Show all** resets). A
   vessel already in **Case** stays on the map if its type is unchecked; Queue still hides unchecked types.
5. Vessels appear on the chart colored by risk band; track tails and Cable C17 are drawn; selecting one opens **Case** mode in the right
   rail.
6. **Chart focus:** Queue selection, demo auto-select, and Case **Locate on chart** soft-ease the camera to the contact (sidebar padding,
   modest case zoom). Map marker clicks select without panning. Clear Case / Reset restore the theater overview. Already-in-view contacts
   only strengthen the marker highlight. Open-incident focus gets a one-shot arrival ring. The camera never tracks live AIS ticks.
7. Live ticks / anomalies / AI briefs arrive over `sessionUpdates` (imperative URQL subscription).
8. Sidebar **Queue** (no selection): one ranked attention list (open Red incidents first, then red → orange → yellow), respecting ship-type
   filters. Theater OSINT is a collapsed disclosure at the bottom. Band counts live in the toolbar, not the rail.
9. Sidebar **Case** (vessel selected): sticky identity + Why now (top factors) + Acknowledge / Locate on chart / Request briefing; evidence
   is one panel at a time (Timeline | Anomalies | Brief). Timeline merges risk-score changes and incident events. OSINT is not shown in
   Case.
10. **Request briefing** ACKs via `vesselIntelligenceRequest` then shows progress until `SessionUpdateIntelligence` (toast on start failure
    / timeout; Gemini failures may still publish a stub brief).
11. When the demo stream is on, the first high/critical anomaly auto-selects Galaxy Leader (`538090574`) once and focuses the chart.
12. When the demo scenario reaches the end, it loops so the board stays live.

## Options considered

| Option                                     | Pros                               | Cons                                                              |
| ------------------------------------------ | ---------------------------------- | ----------------------------------------------------------------- |
| Auto-live on watch resolve (chosen)        | Always-on live feed                | Query has a mild side effect (ensures tick driver)                |
| Mock off by default + Demo toggle (chosen) | Live map uncluttered; opt-in demo  | Judges must click Demo once                                       |
| Mock on by default                         | Instant narrative                  | Hides live contacts among demo clutter                            |
| Reset mutation (chosen)                    | Judges can replay session state    | Minimal chrome                                                    |
| `useSubscription`                          | Less code                          | Duplicate events under concurrent React — rejected (same as chat) |
| Marketing card layout                      | Familiar                           | Wrong density for an ops console                                  |
| Navy/cyan full-dark chrome                 | Ops-console cliché                 | Breaks the light-only brand in [`theme.md`](../styles/theme.md)   |
| Light brand chrome + dark chart            | Chart contrast                     | Chart is a dark island inside light chrome                        |
| Stock Positron (no tint)                   | Free light basemap                 | Washed-out white land; feels unfinished next to cream chrome      |
| Warm-tinted Positron chart (chosen)        | Bronze land / muted sea; one brand | Runtime paint overrides tied to Positron layer ids                |
| Always-expanded section dump               | Everything visible                 | Noisy; no progressive disclosure — replaced by Queue ↔ Case       |
| Queue ↔ Case + one evidence panel (chosen) | Clear triage then investigate      | Deep evidence requires an explicit panel switch                   |
| Sidebar-driven chart focus (chosen)        | Answers “where is this?” once      | Must not fight manual pans / map clicks                           |
| Pan on every selection incl. map click     | Consistent camera                  | Yanks when the vessel is already under the cursor                 |
| Continuous vessel tracking                 | Always framed                      | Steals operator agency during live AIS                            |
| Auto-focus when Red opens                  | Demo drama                         | Steals focus mid-triage                                           |

## Option chosen

Always-live fused board (optional AISStream + opt-in Galaxy Leader mock) via `scenarioEnsureLive` on `Session.watch` + imperative
`executeSubscription` + light brand chrome (toolbar / sidebar / shell) with Queue ↔ Case attention rail. Chart basemap is Carto Positron
with `navalChartTintApply` (bronze land `#c4a882`, muted sea `#8fa3ab`). Client-only MapLibre mount so SSR does not load GL. Mock feeder
defaults off; toolbar **Demo** calls `mockAisSetEnabled`. Mock loops on completion; `scenarioReset` clears fused board session state. Chart
focus is sidebar-driven (`navalMapFocus.ts`): Queue / auto-select / Locate ease the camera; map clicks do not; live ticks never chase.

Product framing and risk principles: [`seascope.md`](./seascope.md). In-memory player + risk engine:
[`maritime-watch.md`](../architecture/maritime-watch.md).

## Implementation

| Piece              | Path                                                                                                                                    |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| Route + SEO        | `src/routes/watch.tsx`                                                                                                                  |
| Operations         | `src/routes/WatchPage.graphql`                                                                                                          |
| Live state         | `src/web/maritime/useSessionUpdates.ts`                                                                                                 |
| Chart              | `src/web/maritime/NavalMap.tsx` + `NavalMapClient.tsx` + `navalChartTint.ts` + `navalMapFocus.ts`                                       |
| Toolbar            | `src/web/maritime/WatchToolbar.tsx` (risk bands, alerts, Demo toggle, Filters)                                                          |
| Filters            | `src/web/maritime/WatchFilters.tsx` + `watchFilterState.ts` (layers + ship types; owned in `watch.tsx`)                                 |
| Attention rail     | `src/web/maritime/IntelligenceSidebar.tsx` + `WatchQueue.tsx` + `WatchCase.tsx` (fixed-width Queue ↔ Case; no resize rail)              |
| Shared rail bits   | `src/web/maritime/watchSidebarShared.tsx`                                                                                               |
| Layout shell       | `SidebarProvider` + `SidebarInset` in `watch.tsx`                                                                                       |
| Server watch board | `src/server/maritime/*`, session mutations in schema                                                                                    |
| Multi-source AIS   | `vesselTrackStore.ts`, `sources/mockScenarioSource.ts`, `aisStreamIngest.ts`, `watchBoardRuntime.ts`; tables `Vessels` / `AisPositions` |

Basemap: Carto Positron (`basemaps.cartocdn.com/gl/positron-gl-style`) + warm chart tint on load. Scenario id: `galaxy-leader`.

Risk bands: Green 0–29, Yellow 30–59, Orange 60–79, Red 80–100. Red opens an in-memory `Incident`; `alertAcknowledge` clears the active
alert. Mutations: `vesselSelect`, `vesselIntelligenceRequest`, `alertAcknowledge`, `scenarioReset`.

Chart gotchas (MapLibre v6 + Vite):

- Register the worker via `setWorkerUrl(…?worker&url)` in `NavalMapClient.tsx` and keep `maplibre-gl` in `optimizeDeps.exclude` — otherwise
  the canvas mounts but vector tiles never load.
- `@tanstack/devtools-vite` must ignore `NavalMapClient` / MapLibre `Source`+`Layer` for `data-tsd-source` injection (see `vite.config.ts`)
  — otherwise MapLibre rejects the attribute and the chart fails to mount.
