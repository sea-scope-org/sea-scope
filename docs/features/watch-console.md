# Watch console

Operator console for the SeaScope demo — live maritime chart, scored risk feed, Queue ↔ Case sidebar, and vessel intelligence.

## User behavior

1. From the home page, **Open console / demo** navigates to `/watch`.
2. The page is full-viewport, `noindex`, and not in the sitemap. Shell chrome follows the light brand tokens; the MapLibre chart uses Carto
   Positron retinted to warm bronze land and muted sea (see [`theme.md`](../styles/theme.md)).
3. The default **Galaxy Leader** scenario is live on load (mocked AIS) — use toolbar **Reset** to replay.
4. Vessels appear on the chart colored by risk band; track tails and Cable C17 are drawn; selecting one opens **Case** mode in the right
   rail.
5. Live ticks / anomalies / AI briefs arrive over `sessionUpdates` (imperative URQL subscription).
6. Sidebar **Queue** (no selection): one ranked attention list (open Red incidents first, then red → orange → yellow). Theater OSINT is a
   collapsed disclosure at the bottom. Band counts live in the toolbar, not the rail.
7. Sidebar **Case** (vessel selected): sticky identity + Why now (top factors) + Acknowledge / Request briefing; evidence is one panel at a
   time (Timeline | Anomalies | Brief). Timeline merges risk-score changes and incident events. OSINT is not shown in Case.
8. **Request briefing** ACKs via `vesselIntelligenceRequest` then shows progress until `SessionUpdateIntelligence` (toast on start failure /
   timeout; Gemini failures may still publish a stub brief).
9. On the first high/critical anomaly, the console auto-selects Galaxy Leader (`538090574`) once for the demo.
10. When the scenario reaches the end, it loops so the board stays live.

## Options considered

| Option                                     | Pros                               | Cons                                                              |
| ------------------------------------------ | ---------------------------------- | ----------------------------------------------------------------- |
| Auto-live on watch resolve (chosen)        | Always-on demo feed                | Query has a mild side effect (ensures player + tick driver)       |
| Start / pause buttons                      | Operator controls the beat         | Extra friction; contradicts “always live”                         |
| Reset mutation (chosen)                    | Judges can replay                  | Minimal chrome                                                    |
| `useSubscription`                          | Less code                          | Duplicate events under concurrent React — rejected (same as chat) |
| Marketing card layout                      | Familiar                           | Wrong density for an ops console                                  |
| Navy/cyan full-dark chrome                 | Ops-console cliché                 | Breaks the light-only brand in [`theme.md`](../styles/theme.md)   |
| Light brand chrome + dark chart            | Chart contrast                     | Chart is a dark island inside light chrome                        |
| Stock Positron (no tint)                   | Free light basemap                 | Washed-out white land; feels unfinished next to cream chrome      |
| Warm-tinted Positron chart (chosen)        | Bronze land / muted sea; one brand | Runtime paint overrides tied to Positron layer ids                |
| Always-expanded section dump               | Everything visible                 | Noisy; no progressive disclosure — replaced by Queue ↔ Case       |
| Queue ↔ Case + one evidence panel (chosen) | Clear triage then investigate      | Deep evidence requires an explicit panel switch                   |

## Option chosen

Always-live default scenario (`scenarioEnsureLive` on `Session.watch`) + imperative `executeSubscription` + light brand chrome (toolbar /
sidebar / shell) with Queue ↔ Case attention rail. Chart basemap is Carto Positron with `navalChartTintApply` (bronze land `#c4a882`, muted
sea `#8fa3ab`). Client-only MapLibre mount so SSR does not load GL. Scenario loops on completion; `scenarioReset` restarts for demos.

Product framing and risk principles: [`seascope.md`](./seascope.md). In-memory player + risk engine:
[`maritime-watch.md`](../architecture/maritime-watch.md).

## Implementation

| Piece              | Path                                                                                                                       |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Route + SEO        | `src/routes/watch.tsx`                                                                                                     |
| Operations         | `src/routes/WatchPage.graphql`                                                                                             |
| Live state         | `src/web/maritime/useSessionUpdates.ts`                                                                                    |
| Chart              | `src/web/maritime/NavalMap.tsx` + `NavalMapClient.tsx` + `navalChartTint.ts`                                               |
| Toolbar            | `src/web/maritime/WatchToolbar.tsx` (live, sim time, band counts, alerts)                                                  |
| Attention rail     | `src/web/maritime/IntelligenceSidebar.tsx` + `WatchQueue.tsx` + `WatchCase.tsx` (fixed-width Queue ↔ Case; no resize rail) |
| Shared rail bits   | `src/web/maritime/watchSidebarShared.tsx`                                                                                  |
| Layout shell       | `SidebarProvider` + `SidebarInset` in `watch.tsx`                                                                          |
| Server watch board | `src/server/maritime/*`, session mutations in schema                                                                       |

Basemap: Carto Positron (`basemaps.cartocdn.com/gl/positron-gl-style`) + warm chart tint on load. Scenario id: `galaxy-leader`.

Risk bands: Green 0–29, Yellow 30–59, Orange 60–79, Red 80–100. Red opens an in-memory `Incident`; `alertAcknowledge` clears the active
alert. Mutations: `vesselSelect`, `vesselIntelligenceRequest`, `alertAcknowledge`, `scenarioReset`.

Chart gotchas (MapLibre v6 + Vite):

- Register the worker via `setWorkerUrl(…?worker&url)` in `NavalMapClient.tsx` and keep `maplibre-gl` in `optimizeDeps.exclude` — otherwise
  the canvas mounts but vector tiles never load.
- `@tanstack/devtools-vite` must ignore `NavalMapClient` / MapLibre `Source`+`Layer` for `data-tsd-source` injection (see `vite.config.ts`)
  — otherwise MapLibre rejects the attribute and the chart fails to mount.
