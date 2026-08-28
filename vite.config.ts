import { execSync } from 'node:child_process';
import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';

import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';

import { defineConfig } from 'vite';
import type { Plugin } from 'vite';

// Last commit date in ISO-8601 form, injected as `__SITE_LAST_MODIFIED__`
// so SEO JSON-LD (`dateModified`) and other freshness signals reflect when
// the site code last changed. Falls back to now when git is unavailable.
const siteLastModified = (() => {
    try {
        return execSync('git log -1 --format=%cI', { encoding: 'utf8' }).trim();
    } catch {
        return new Date().toISOString();
    }
})();

// Nitro's vite dev middleware classifies a request as a static asset when
// `Sec-Fetch-Dest` is anything other than `document` / `iframe` / `frame`,
// and routes assets through Vite's static pipeline before the Nitro handler
// ever runs. Browsers send `Sec-Fetch-Dest: image` for `<img src=…>`, which
// means our same-origin `/api/attachments/<id>` route gets diverted into the
// asset pipeline and answered with Vite's generic `Cannot GET …` HTML 404.
//
// We strip the header for `/api/*` paths in dev so those requests fall
// through to Nitro and reach our route handler. This plugin only mounts in
// `serve` mode — production builds skip Vite's middleware entirely, so the
// patch isn't shipped.
const apiSecFetchDestStrip = (): Plugin => ({
    name: 'api-sec-fetch-dest-strip',
    apply: 'serve',
    configureServer(server) {
        server.middlewares.use((req, _res, next) => {
            if (req.url && req.url.startsWith('/api/') && req.headers['sec-fetch-dest']) {
                delete req.headers['sec-fetch-dest'];
            }
            next();
        });
    },
});

const config = defineConfig({
    resolve: { tsconfigPaths: true },
    define: {
        __SITE_LAST_MODIFIED__: JSON.stringify(siteLastModified),
    },
    // Test configuration lives in `vitest.config.ts` — Vitest 4 + Vite 8's
    // module runner cannot evaluate React's CJS entry through the full
    // TanStack Start plugin stack, so the test config defines its own
    // server/web projects with disjoint plugin sets.
    //
    // Playwright drives a separately-installed Chromium binary and loads
    // chromium-bidi via internal paths Vite cannot statically resolve. It
    // must stay external on both the dev server (optimizeDeps) and the
    // production nitro bundle (rollup external) — the runtime image
    // installs it as a real `node_modules` dependency. See
    // `docs/architecture/browser-capture.md`.
    optimizeDeps: {
        // maplibre-gl v6 ships a separate worker module that Vite's dep
        // optimizer cannot pre-bundle (`maplibre-gl-worker.mjs` missing).
        exclude: ['playwright', 'playwright-core', 'maplibre-gl'],
    },
    plugins: [
        apiSecFetchDestStrip(),
        // MapLibre's <Source>/<Layer> forward unknown JSX attrs into the style
        // spec — TanStack's data-tsd-source injection then throws
        // `unknown property "data-tsd-source"` and the chart never mounts.
        devtools({
            injectSource: {
                enabled: true,
                ignore: {
                    files: [/NavalMapClient\.tsx$/],
                    components: ['Source', 'Layer'],
                },
            },
        }),
        nitro({
            rollupConfig: {
                external: ['playwright', 'playwright-core'],
            },
        }),
        tailwindcss(),
        tanstackStart(),
        viteReact(),
    ],
});

export default config;
