import { createFileRoute } from '@tanstack/react-router';
import { environmentVariables } from '../server/env/environmentVariablesCreate';
import { SITEMAP_PATHS } from '../web/seo/sitemapRoutes';
import type { SitemapPath } from '../web/seo/sitemapRoutes';

// Dynamic XML sitemap — emits one `<url>` per path. Source paths come from
// `src/web/seo/sitemapRoutes.ts` so adding a new indexable page is a
// single-line edit.

export const Route = createFileRoute('/sitemap.xml')({
    server: {
        handlers: {
            GET: () =>
                new Response(sitemapXmlBuild(environmentVariables.webPageUrl), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/xml; charset=utf-8',
                        // Cache for an hour at the edge — the content only
                        // changes when the deployed code changes, but a long
                        // TTL means stale-while-revalidate after a deploy.
                        'Cache-Control': 'public, max-age=3600',
                    },
                }),
        },
    },
});

function sitemapXmlBuild(webPageUrl: string): string {
    const urls = SITEMAP_PATHS.map((entry) => sitemapUrlEntry(webPageUrl, entry)).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function sitemapUrlEntry(webPageUrl: string, entry: SitemapPath): string {
    const loc = sitemapUrl(webPageUrl, entry.path);
    const changefreq = entry.changefreq ? `\n    <changefreq>${entry.changefreq}</changefreq>` : '';
    const priority = entry.priority !== undefined ? `\n    <priority>${entry.priority.toFixed(1)}</priority>` : '';
    return `  <url>
    <loc>${loc}</loc>${changefreq}${priority}
  </url>`;
}

function sitemapUrl(webPageUrl: string, path: string): string {
    const suffix = path === '/' ? '' : path;
    return `${webPageUrl}${suffix}` || webPageUrl;
}
