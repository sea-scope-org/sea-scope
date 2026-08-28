# SEO

## Context

Public-facing pages need consistent, correct metadata so search engines and social platforms can discover, index, and link them. Without a
shared building block every new page silently inherits poor defaults: a placeholder `<title>`, no description, no canonical, no Open
Graph/Twitter cards. Drift across pages becomes a maintenance burden once there are more than a few of them.

## Decision

A single `seoMeta()` helper produces the full set of meta and link tags from a small per-page input. Each page route calls it from TanStack
Router's `head()` callback. Sitemap and robots are served dynamically so the absolute URLs reflect the deployed environment.

The pieces:

| Concern             | Where                                                                                                                         |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Per-page meta+links | `src/web/seo/seoMeta.ts` — pure helper; tests in `seoMeta.test.ts`                                                            |
| Site-wide constants | `src/web/seo/seoConstants.ts` — `SITE_NAME`, default share image (+ optional dimensions), `OG_LOCALE` (`en_US`)               |
| Root-level defaults | `src/routes/__root.tsx` — fallback OG/Twitter card, theme-color, and related chrome when a page omits `head()`                |
| Absolute origin     | `WEB_PAGE_URL` env var → `EnvironmentVariables.webPageUrl`; resolved on the client via `webPageUrlGet()`                      |
| Sitemap             | Dynamic route `src/routes/sitemap[.]xml.ts`; entries in `src/web/seo/sitemapRoutes.ts`                                        |
| Robots              | Dynamic route `src/routes/robots[.]txt.ts` — includes explicit AI crawler groups (see [discovery-geo.md](./discovery-geo.md)) |
| LLM index           | Dynamic route `src/routes/llms[.]txt.ts` — see [discovery-geo.md](./discovery-geo.md)                                         |
| Structured data     | `src/web/seo/jsonLd.ts` — `WebSite` + `Organization` (+ optional `FAQPage`); wire via `head().scripts`                        |

Optional structured data (JSON-LD) is available via `src/web/seo/jsonLd.ts` (`WebSite` + `Organization`, optional `FAQPage`) — emit from a
route's `head().scripts` when needed. AI-search / GEO layers (`/llms.txt`, AI crawler policy, freshness) live in
[discovery-geo.md](./discovery-geo.md). Locale stance (English only) lives in [i18n.md](./i18n.md).

## Alternatives considered

1. **Static `public/sitemap.xml` and `public/robots.txt`.** Rejected: every new page requires editing two files, and sitemap URLs are
   brittle across environments (one file can't carry both prod and preview origins).
2. **Walk the generated `routeTree` to build the sitemap.** Rejected: `routeTree.gen.ts` is `@ts-nocheck` and its runtime shape isn't part
   of the router's public contract — coupling to it is fragile. An explicit `SITEMAP_PATHS` list is one extra line per page and makes
   "what's indexable?" obvious.
3. **Read the request `Host` header for the absolute origin.** Rejected per the project decision: the env var is the single source of truth
   and survives prerender, tests, and proxy variation.
4. **Multi-locale `hreflang` clusters.** Rejected for SeaScope: the product is English-only. Legacy `/en/…` URLs redirect to unprefixed
   paths — see [i18n.md](./i18n.md).

## Consequences

- One mandatory env var (`WEB_PAGE_URL`) — see `docs/infrastructure.md`.
- Adding a new public page is two lines: a `head:` block in the route file and an entry in `src/web/seo/sitemapRoutes.ts`.
- `seoMeta()` **always** emits an explicit `<meta name="robots">` — `index,follow` by default, `noindex,nofollow` when `noindex: true` is
  passed. There is no implicit-default state; every public page declares its indexability.
- Pages using a default share image should also set `og:image:width` / `og:image:height` (via `seoConstants` or per-call `imageWidth` /
  `imageHeight`) so social crawlers do not guess dimensions.
- Logged-in / transactional pages set `noindex: true` on `seoMeta()` and are omitted from `SITEMAP_PATHS`. The chat route is the canonical
  example.
- The root route may emit site-wide fallbacks (OG/Twitter card, `theme-color`, etc.). Per-page `head()` overrides these for every indexable
  route, but the fallback exists for crawlers that hit a redirect, a bare 404, or a route that omits `head()` entirely.
- The helper is pure and isomorphic; client-side navigation updates the head correctly via TanStack Router's standard mechanism.

## Canonical URL strategy

Canonicals are unprefixed English URLs:

| Path on the site | Canonical                                          |
| ---------------- | -------------------------------------------------- |
| `/`, `/terms`    | `https://example.com`, `https://example.com/terms` |

`seoMeta()` emits one `<link rel="canonical">` per page. `og:locale` is fixed to `en_US`.

## How to add SEO to a new page

1. Pick a `title` (≤ 60 chars before the ` — SeaScope` suffix) and a `description` (50–160 chars) in English.
2. In your route file, import `seoMeta` and `webPageUrlGet`, then add a `head:` callback to the route options:

   ```tsx
   import { seoMeta } from '../web/seo/seoMeta';
   import { webPageUrlGet } from '../web/seo/webPageUrlGet';

   export const Route = createFileRoute('/about')({
     head: () =>
       seoMeta({
         title: 'About us',
         description: 'Who we are and what we do.',
         path: '/about',
         webPageUrl: webPageUrlGet(),
       }),
     component: AboutPage,
   });
   ```

3. If the page is logged-in, transactional, or otherwise non-indexable, pass `noindex: true` to `seoMeta()` and skip step 4.
4. Add an entry to `SITEMAP_PATHS` in `src/web/seo/sitemapRoutes.ts`:

   ```ts
   { path: '/about', changefreq: 'monthly', priority: 0.5 },
   ```

5. Run `npm run check` and `npm test`. Visit `/sitemap.xml` locally to confirm the new path is present.

### Parameterized routes (`/foo/$id`)

Don't add parameterized paths to `SITEMAP_PATHS` — the sitemap can't enumerate their values at build time. If those pages should be indexed,
generate a per-row sitemap from the database in a separate route (e.g. `src/routes/sitemap-posts[.]xml.ts`) and reference it from
`robots.txt`. Until that exists, parameterized pages still get correct `<head>` tags via their own `head:` callback; they just don't appear
in the sitemap.

## Implementation notes

- `seoMeta()` takes `webPageUrl` as an argument (rather than reading a global). This keeps it pure and trivially testable. The route layer
  plumbs the value via `webPageUrlGet()`, an isomorphic helper that returns `EnvironmentVariables.webPageUrl` server-side and
  `window.location.origin` client-side. The client fallback only matters during client-side navigation; SSR (the version crawlers see)
  always uses the configured value.
- The OG locale tag uses the underscored code `en_US` (`OG_LOCALE` in `src/web/seo/seoConstants.ts`).
- The dynamic sitemap lives at `/sitemap.xml` and the robots file at `/robots.txt` — both are real route handlers
  (`src/routes/sitemap[.]xml.ts` and `src/routes/robots[.]txt.ts`) and the corresponding files in `public/` were removed so there's no
  precedence conflict.
- `Cache-Control: public, max-age=3600` on both endpoints — long enough to amortize cost, short enough that a deploy propagates new pages
  within an hour.
- Optional build-time `__SITE_LAST_MODIFIED__` (from `git log -1 --format=%cI` in `vite.config.ts`) can feed JSON-LD `dateModified`
  freshness when a project emits structured data.

## AI-search (GEO)

Classical SEO covers crawlers that rank pages. AI-search systems that extract and cite benefit from an adjacent layer (`robots.txt` AI bot
allowlist, `/llms.txt`, JSON-LD entity / FAQ schemas, optional chat deep-links, `dateModified` freshness) documented in
[discovery-geo.md](./discovery-geo.md). When adding a new public page, mirror the SEO checklist with the AI-search one when those surfaces
exist — add a bullet to `/llms.txt` and consider whether the page warrants structured data.
