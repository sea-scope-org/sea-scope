# Watch console

Operator console for the SeaScope demo — live maritime chart, scored risk feed, Queue ↔ Case sidebar, and vessel intelligence.

## User behavior

1. From the home page, **Open console / demo** navigates to `/watch`.
2. The page is full-viewport, `noindex`, and not in the sitemap. Shell chrome follows the light brand tokens; the MapLibre chart uses Carto
   Positron retinted to warm bronze land and muted sea (see [`theme.md`](../styles/theme.md)).
3. The fused watch board is live on load with **live AISStream** positions when `AISSTREAM_API_KEY` is set (always the configured
   `AISSTREAM_BBOX`, plus any connected operators’ chart viewports under 5° via `aisViewportReport`). The **Galaxy Leader demo** stream is
   **off by default** — enable it with the toolbar **Demo** button (`mockAisSetEnabled`). The button flips immediately (optimistic pressed
   state + in-flight lock). While Demo is off — including after the mutation settles — the client always hides mock contacts and theater
   overlays so a late feeder tick cannot flicker demo content back on. Turning Demo off only restores chart overview when Case was on a demo
   contact. Real undersea cables and pipelines (TeleGeography + EMODnet, true WGS84) stay on the chart either way. While Demo is off,
   simulated radar and theater OSINT are hidden so live traffic is not scored against demo-only geometry. Demo injects **four** curated
   contacts that raise attention flags (Galaxy Leader, decoy jump, speed-drop, zigzag + speed-drop); live AIS stays on the map as quiet
   Green clutter (no attention scores while Demo is on). Toolbar badges show live (and demo, when on) vessel counts. **Reset** clears
   selection / risk stickies for the session.
4. Toolbar **Filters** toggles infrastructure types (submarine cables, oil & gas pipelines, other pipelines), chart layers (track tails,
   radar contacts), and vessel `shipType`s. Filters are shared by the chart, Queue, and toolbar band counts (all on by default; **Show all**
   resets). They live in the `/watch` query string (`layersOff`, `shipTypesOff`) so reload and share preserve the lens. A vessel already in
   **Case** stays on the map if its type is unchecked; Queue still hides unchecked types.
5. Vessel marker color identifies the vessel family while an independent, discrete halo communicates elevated risk (none for Green, subtle
   Yellow, stronger Orange, and a slow pulsing Red). Heading, selection outline, and freshness opacity remain separate encodings. Protected
   assets are drawn (muted slate solid cables, dashed bronze pipelines, with name labels from zoom 5+). Selecting a vessel opens **Case**
   mode in the right rail and writes `mmsi` into the URL; **Back to queue** / **Reset** clear it. Reload with `?mmsi=` re-opens that Case
   (URL wins over leftover session selection).
6. A shadcn `HoverCard` (`openDelay` 200 ms) on each vessel marker opens a read-only preview on hover or keyboard focus — identity, textual
   risk score/trend, navigation data, freshness (or AIS dark), available sensor context when present, the top Why now factor, and
   protected-asset relationship. Content portals above the chart (`side="top"`); the hovered (or selected) MapLibre marker still raises its
   container `z-index` so the trigger stays discoverable among neighbors. With track tails on, all contacts keep muted observed tails; hover
   or selection strengthens the focused tail and, when AIS is fresh and speed/course are usable, a dashed deterministic +10/+20 minute
   projection explicitly labeled as calculated rather than declared intent.
7. **Chart focus:** Queue selection, demo auto-select, and Case **Locate on chart** soft-ease the camera to the contact (sidebar padding,
   modest case zoom). Map marker clicks select without panning. Clear Case / Reset restore the theater overview. Already-in-view contacts
   only strengthen the marker highlight. Open-incident focus gets a one-shot arrival ring. The camera never tracks live AIS ticks.
8. Live ticks / anomalies / AI briefs arrive over `sessionUpdates` (imperative URQL subscription).
9. Sidebar **Queue** (no selection): one ranked attention list (open Red incidents first, then red → orange → yellow), respecting ship-type
   filters. Each row shows risk level + score with the trend arrow inside the same pill (rising ↑ / falling ↓ / stable →). Theater OSINT is
   a collapsed disclosure at the bottom. Band counts live in the toolbar, not the rail.
10. Sidebar **Case** (vessel selected): sticky on `selectedMmsi` — if the contact drops off the live board, Case keeps the last-known vessel
    (with a short note) instead of silently returning to Queue. Sticky identity + risk pill (level, score, trend) + Why now (top factors) +
    primary **Request briefing** / Acknowledge / Locate on chart. The **Intelligence** stage sits below the actions (always visible): empty
    CTA, shimmer skeleton while waiting, then progressive structured fields as they stream. Evidence tabs below are Timeline | Anomalies
    only. Timeline merges risk-score changes and incident events. OSINT is not shown in Case. **Back to queue** clears selection
    optimistically (Queue appears immediately; chart overview restores without waiting on `vesselSelect`) and locks queue picks until the
    mutation settles.
11. **Request briefing** ACKs via `vesselIntelligenceRequest`, then streams partial `SessionUpdateIntelligence` payloads (`complete: false`)
    until the final brief (`complete: true`). One shimmer status in the Intelligence stage (no header/button spinners). Toast on start
    failure / timeout; Gemini failures may still publish a stub brief.
12. When the demo stream is on, the first high/critical anomaly auto-selects Galaxy Leader (`538090574`) once and focuses the chart — only
    when Demo is on, no Case is open, no Case ↔ Queue mutation is in flight, no briefing is in flight, and Galaxy Leader is present on the
    board. Auto-select joins the same selection-generation protocol as Queue/Case picks: if the operator selects another contact or returns
    to Queue before it settles, the late auto `vesselSelect` is ignored (and the server selection is repaired) so Red alert cannot yank Case
    or the chart back.
13. When the demo scenario reaches the end, it loops so the board stays live.

## Options considered

| Option                                        | Pros                                                   | Cons                                                                    |
| --------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------- |
| Auto-live on watch resolve (chosen)           | Always-on live feed                                    | Query has a mild side effect (ensures tick driver)                      |
| Mock off by default + Demo toggle (chosen)    | Live map uncluttered; opt-in demo                      | Judges must click Demo once                                             |
| Mock on by default                            | Instant narrative                                      | Hides live contacts among demo clutter                                  |
| Reset mutation (chosen)                       | Judges can replay session state                        | Minimal chrome                                                          |
| `useSubscription`                             | Less code                                              | Duplicate events under concurrent React — rejected (same as chat)       |
| Marketing card layout                         | Familiar                                               | Wrong density for an ops console                                        |
| Navy/cyan full-dark chrome                    | Ops-console cliché                                     | Breaks the light-only brand in [`theme.md`](../styles/theme.md)         |
| Light brand chrome + dark chart               | Chart contrast                                         | Chart is a dark island inside light chrome                              |
| Stock Positron (no tint)                      | Free light basemap                                     | Washed-out white land; feels unfinished next to cream chrome            |
| Warm-tinted Positron chart (chosen)           | Bronze land / muted sea; one brand                     | Runtime paint overrides tied to Positron layer ids                      |
| Always-expanded section dump                  | Everything visible                                     | Noisy; no progressive disclosure — replaced by Queue ↔ Case             |
| Queue ↔ Case + Intelligence stage (chosen)    | AI brief is the Case hero; evidence stays secondary    | Timeline / Anomalies require a tab switch below the brief               |
| Queue ↔ Case + Brief as peer tab              | Symmetric evidence panels                              | Buried the core AI feature under Timeline / Anomalies                   |
| Sidebar-driven chart focus (chosen)           | Answers “where is this?” once                          | Must not fight manual pans / map clicks                                 |
| Pan on every selection incl. map click        | Consistent camera                                      | Yanks when the vessel is already under the cursor                       |
| Continuous vessel tracking                    | Always framed                                          | Steals operator agency during live AIS                                  |
| Auto-focus when Red opens                     | Demo drama                                             | Steals focus mid-triage                                                 |
| Auto-select once + generation cancel (chosen) | Demo opens Galaxy Leader without fighting the operator | Must repair server if a late auto mutation lands after an operator pick |
| URL lens in search (chosen)                   | Reload / share preserve Case + filters                 | Defaults must omit keys                                                 |
| Client-only filter `useState`                 | Simple                                                 | Lost on reload — rejected                                               |

## Option chosen

Always-live fused board (optional AISStream + opt-in Galaxy Leader mock) via `scenarioEnsureLive` on `Session.watch` + imperative
`executeSubscription` + light brand chrome (toolbar / sidebar / shell) with Queue ↔ Case attention rail. Chart basemap is Carto Positron
with `navalChartTintApply` (bronze land `#c4a882`, muted sea `#8fa3ab`). Client-only MapLibre mount so SSR does not load GL. Mock feeder
defaults off; toolbar **Demo** calls `mockAisSetEnabled` with optimistic UI (immediate pressed state; client hides mock overlays whenever
Demo is off — not only while the mutation is in flight — so late feeder ticks cannot flicker demo content back; server returns the new
`WatchState` before fan-out NOTIFY). The mock feeder uses a run-generation guard so in-flight async ticks abort after stop. Mock loops on
completion; `scenarioReset` clears fused board session state. Chart focus is sidebar-driven (`navalMapFocus.ts`): Queue / auto-select /
Locate ease the camera; map clicks do not; live ticks never chase. Disabling Demo restores overview only when Case was on a mock contact.
Debounced `aisViewportReport` unions each session’s ≤5° viewport into the shared AISStream subscription alongside `AISSTREAM_BBOX`. Case
selection (`mmsi`) and filter offs (`layersOff`, `shipTypesOff`) persist in the `/watch` search string — defaults omit keys — so reload and
shared links restore the same lens (see [Filter state in the URL](../architecture/api-layer.md#filter-state-in-the-url)).

Product framing and risk principles: [`seascope.md`](./seascope.md). In-memory player + risk engine:
[`maritime-watch.md`](../architecture/maritime-watch.md).

## Implementation

| Piece              | Path                                                                                                                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Route + SEO        | `src/routes/watch.tsx`                                                                                                                                                                                  |
| Operations         | `src/routes/WatchPage.graphql`                                                                                                                                                                          |
| Live state         | `src/web/maritime/useSessionUpdates.ts`                                                                                                                                                                 |
| Chart              | `src/web/maritime/NavalMap.tsx` + `NavalMapClient.tsx` + `VesselMarker.tsx` + `VesselPreview.tsx` + `vesselVisuals.ts` + `navalChartTint.ts` + `navalMapFocus.ts`                                       |
| Toolbar            | `src/web/maritime/WatchToolbar.tsx` (risk bands, alerts, Demo toggle, Filters)                                                                                                                          |
| Filters            | `src/web/maritime/WatchFilters.tsx` + `watchFilterState.ts` (infrastructure types + chart layers + ship types; URL search owned in `watch.tsx`)                                                         |
| Attention rail     | `src/web/maritime/IntelligenceSidebar.tsx` + `WatchQueue.tsx` + `WatchCase.tsx` (fixed-width Queue ↔ Case; no resize rail)                                                                              |
| Shared rail bits   | `src/web/maritime/watchSidebarShared.tsx`                                                                                                                                                               |
| Layout shell       | `SidebarProvider` + `SidebarInset` in `watch.tsx`                                                                                                                                                       |
| Server watch board | `src/server/maritime/*`, session mutations in schema                                                                                                                                                    |
| Protected assets   | `src/server/maritime/infrastructure/` — TeleGeography cables + EMODnet pipelines (`npm run infrastructure:import`); chart loads `/maritime/protected-infrastructure.geojson`; never theater-offset      |
| Multi-source AIS   | `vesselTrackStore.ts`, `sources/mockScenarioSource.ts`, `aisStreamIngest.ts`, `aisViewportRegistry.ts`, `watchBoardRuntime.ts`, `aisTheater.ts` (water-corridor map); tables `Vessels` / `AisPositions` |

Basemap: Carto Positron (`basemaps.cartocdn.com/gl/positron-gl-style`) + warm chart tint on load. Scenario id: `galaxy-leader`. Protected
asset geometries © TeleGeography (submarinecablemap.com) and EMODnet Human Activities; approximate public mapping, not operator as-built
plans.

Risk bands: Green 0–29, Yellow 30–59, Orange 60–79, Red 80–100. Red opens an in-memory `Incident`; `alertAcknowledge` clears the active
alert. Mutations: `vesselSelect`, `vesselIntelligenceRequest`, `alertAcknowledge`, `scenarioReset`. Vessel intelligence streams via
`streamText` + `Output.object` (`partialOutputStream`); the store holds the latest partial with `complete: false` until the final put.
Citations render the human `label` in the rail; raw `source` ids stay on the row `title`.

Chart gotchas (MapLibre v6 + Vite):

- Register the worker via `setWorkerUrl(…?worker&url)` in `NavalMapClient.tsx` and keep `maplibre-gl` in `optimizeDeps.exclude` — otherwise
  the canvas mounts but vector tiles never load.
- `@tanstack/devtools-vite` must ignore `NavalMapClient` / MapLibre `Source`+`Layer` for `data-tsd-source` injection (see `vite.config.ts`)
  — otherwise MapLibre rejects the attribute and the chart fails to mount.

### Chart visual encoding

The centralized vessel-family palette is Cargo blue (`#2563eb`), Tanker burgundy (`#9f1239`), Passenger purple (`#7c3aed`), Fishing green
(`#16a34a`), Tug/service orange (`#ea580c`), Pleasure cyan (`#06b6d4`), Government black (`#111827`), and Unknown gray (`#64748b`). Tanker
burgundy stays distinct from risk-red halos. Risk never changes that marker color. The heading glyph is an SVG AIS-style chevron (pointed
bow, notched stern) with a hard dark outer stroke and cream inner outline — not a CSS border-triangle or soft drop-shadow — so edges stay
crisp on the chart. Yellow, Orange, and Red use increasingly strong fixed-size screen-space halos; Green has no halo. Only Red has a
2.4-second opacity pulse, with a strong static halo retained when reduced motion is requested. AIS dark adds an independent dashed ring
(separate from risk). These HTML markers keep critical risk discoverable across zoom levels. Freshness fades the marker at one and three
minutes and is also stated explicitly in the preview.

When track tails are enabled, every contact with a usable tail is drawn muted; the hovered or selected contact is strengthened. The MVP
projection is constant course and speed over 10 and 20 minutes for the focused contact only. It is suppressed for positions at least three
minutes old, speeds below 0.8 knots, or invalid course/heading. True-scale hulls, destination/ETA (not present on the Watch model — omitted
from the preview rather than shown as “Not received”), track-gap segmentation (track-tail points have no timestamps), and calculated
protected-zone intersection/CPA are intentionally deferred rather than fabricated.
