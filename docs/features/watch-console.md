# Watch console

Operator console for the SeaScope demo — live maritime chart, scored risk feed, attention-first sidebar, and vessel intelligence.

## User behavior

1. From the home page, **Open console / demo** navigates to `/watch`.
2. The page is full-viewport, `noindex`, and not in the sitemap. Shell chrome follows the light brand tokens; the MapLibre chart stays on
   Carto Dark Matter for contrast (see [`theme.md`](../styles/theme.md)).
3. The default **Galaxy Leader** scenario is live on load (mocked AIS) — use toolbar **Reset** to replay.
4. Vessels appear on the chart colored by risk band; track tails and Cable C17 are drawn; selecting one opens detail mode in the right rail.
5. Live ticks / anomalies / AI briefs arrive over `sessionUpdates` (imperative URQL subscription).
6. Sidebar default: **Needs attention** (Yellow+), **Active alerts** (unacknowledged Red incidents), **System summary**.
7. Detail mode: why-flagged factors, risk evolution, incident timeline, anomalies, Request briefing, OSINT. **Request briefing** ACKs via
   `vesselIntelligenceRequest` then shows progress until `SessionUpdateIntelligence` (toast on start failure / timeout; Gemini failures may
   still publish a stub brief).
8. On the first high/critical anomaly, the console auto-selects Galaxy Leader (`538090574`) once for the demo.
9. When the scenario reaches the end, it loops so the board stays live.

## Options considered

| Option                                   | Pros                             | Cons                                                              |
| ---------------------------------------- | -------------------------------- | ----------------------------------------------------------------- |
| Auto-live on watch resolve (chosen)      | Always-on demo feed              | Query has a mild side effect (ensures player + tick driver)       |
| Start / pause buttons                    | Operator controls the beat       | Extra friction; contradicts “always live”                         |
| Reset mutation (chosen)                  | Judges can replay                | Minimal chrome                                                    |
| `useSubscription`                        | Less code                        | Duplicate events under concurrent React — rejected (same as chat) |
| Marketing card layout                    | Familiar                         | Wrong density for an ops console                                  |
| Navy/cyan full-dark chrome               | Ops-console cliché               | Breaks the light-only brand in [`theme.md`](../styles/theme.md)   |
| Light brand chrome + dark chart (chosen) | One identity with chart contrast | Chart is a dark island inside light chrome                        |

## Option chosen

Always-live default scenario (`scenarioEnsureLive` on `Session.watch`) + imperative `executeSubscription` + light brand chrome (toolbar /
sidebar / shell) with attention-first sidebar. Chart basemap stays Carto Dark Matter. Client-only MapLibre mount so SSR does not load GL.
Scenario loops on completion; `scenarioReset` restarts for demos.

Product framing and risk principles: [`seascope.md`](./seascope.md). In-memory player + risk engine:
[`maritime-watch.md`](../architecture/maritime-watch.md).

## Implementation

| Piece              | Path                                                                 |
| ------------------ | -------------------------------------------------------------------- |
| Route + SEO        | `src/routes/watch.tsx`                                               |
| Operations         | `src/routes/WatchPage.graphql`                                       |
| Live state         | `src/web/maritime/useSessionUpdates.ts`                              |
| Chart              | `src/web/maritime/NavalMap.tsx`                                      |
| Toolbar            | `src/web/maritime/WatchToolbar.tsx`                                  |
| Attention rail     | `src/web/maritime/IntelligenceSidebar.tsx` (queue + detail + alerts) |
| Layout shell       | `SidebarProvider` + `SidebarInset` in `watch.tsx`                    |
| Server watch board | `src/server/maritime/*`, session mutations in schema                 |

Basemap: Carto Dark Matter (`basemaps.cartocdn.com/gl/dark-matter-gl-style`). Scenario id: `galaxy-leader`.

Risk bands: Green 0–29, Yellow 30–59, Orange 60–79, Red 80–100. Red opens an in-memory `Incident`; `alertAcknowledge` clears the active
alert. Mutations: `vesselSelect`, `vesselIntelligenceRequest`, `alertAcknowledge`, `scenarioReset`.

Chart gotchas (MapLibre v6 + Vite):

- Register the worker via `setWorkerUrl(…?worker&url)` in `NavalMapClient.tsx` and keep `maplibre-gl` in `optimizeDeps.exclude` — otherwise
  the canvas mounts but vector tiles never load.
- `@tanstack/devtools-vite` must ignore `NavalMapClient` / MapLibre `Source`+`Layer` for `data-tsd-source` injection (see `vite.config.ts`)
  — otherwise MapLibre rejects the attribute and the chart fails to mount.
