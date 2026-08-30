# How it works page

Public marketing page at `/how-it-works` that renders a coded comparison of a typical AIS map display versus the SeaScope engine flow.

## User behavior

1. Visit `/how-it-works`.
2. Read the short intro, then the diagram: typical AIS (feed → map, “more dots”) above SeaScope (multi-source inputs → engine → Watch +
   Alerts and tasking).
3. Continue to the watch console demo or return home.

## Options considered

| Option                              | Pros                                                   | Cons                                           |
| ----------------------------------- | ------------------------------------------------------ | ---------------------------------------------- |
| Static PNG of the pitch slide       | Fast to drop in                                        | Blurry on retina; not themeable; inaccessible  |
| Coded HTML/CSS/SVG diagram (chosen) | Crisp, responsive, brand tokens, screen-reader caption | More markup to maintain if the story changes   |
| Embed in home hero                  | One less route                                         | Crowds the landing promise; diagram needs room |

## Option chosen

A dedicated public route with `EngineComparisonDiagram` as a figure: Lucide icons, brand primary for SeaScope / Watch chrome, always-horizontal
flow (horizontal scroll on narrow viewports — no stacked mobile variant). Indexed via `seoMeta()` and `SITEMAP_PATHS`.

## Implementation

| Piece         | Path                                             |
| ------------- | ------------------------------------------------ |
| Route         | `src/routes/how-it-works.tsx`                    |
| Diagram       | `src/web/components/EngineComparisonDiagram.tsx` |
| Sitemap entry | `src/web/seo/sitemapRoutes.ts` (`/how-it-works`) |

Labels match the partner-pitch engine comparison (AIS / imagery / public infra → SeaScope Engine → Watch + Alerts + task / drone actions).
Presentation follows [`docs/styles/theme.md`](../styles/theme.md) and [`docs/styles/motion.md`](../styles/motion.md) (`Reveal` on the two
diagram bands).
