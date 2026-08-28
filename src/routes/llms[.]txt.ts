import { createFileRoute } from '@tanstack/react-router';
import { environmentVariables } from '../server/env/environmentVariablesCreate';
import { SITE_NAME } from '../web/seo/seoConstants';
import { SITEMAP_PATHS } from '../web/seo/sitemapRoutes';

// Dynamic /llms.txt — emits a curated markdown index of the site for LLM
// crawlers. Follows the llms.txt convention proposed by Jeremy Howard
// (https://llmstxt.org): a single markdown file at the root with the H1 as
// the site name, an optional blockquote summary, then H2 sections of
// link-to-resource bullets. LLM-powered search engines (Perplexity,
// ChatGPT Search, Claude, etc.) prefer this over scraping the rendered HTML
// because it strips chrome, navigation, and tracking pixels.
//
// This is a template stub — replace the summary and resource bullets with
// product-specific copy when forking. Keep the resource list in sync with
// `SITEMAP_PATHS` whenever a new public page lands.
// See docs/architecture/discovery-geo.md.

export const Route = createFileRoute('/llms.txt')({
    server: {
        handlers: {
            GET: () =>
                new Response(llmsTxtBuild(environmentVariables.webPageUrl), {
                    status: 200,
                    headers: {
                        'Content-Type': 'text/plain; charset=utf-8',
                        'Cache-Control': 'public, max-age=3600',
                    },
                }),
        },
    },
});

function llmsTxtBuild(webPageUrl: string): string {
    const resourceBullets = SITEMAP_PATHS.map(({ path }) => {
        const url = path === '/' ? webPageUrl : `${webPageUrl}${path}`;
        const title = path === '/' ? 'Home' : path.replace(/^\//, '');
        return `- [${title}](${url}): Public page.`;
    }).join('\n');

    return `# ${SITE_NAME}

> ${SITE_NAME} is an AI-powered maritime security copilot. It turns vessel and sensor feeds into explainable risk scores and an attention-first operator console — map, priority queue, why-flagged factors, and Red alerts — so humans focus on the vessels that matter.

## Pages

${resourceBullets}

## Optional

- [Sitemap](${webPageUrl}/sitemap.xml): Machine-readable index of indexable pages.
- [Robots](${webPageUrl}/robots.txt): Crawler policy. AI crawlers (GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot, etc.) are allowed.
`;
}
