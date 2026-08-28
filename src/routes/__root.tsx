import { createRootRoute, HeadContent, Outlet, Scripts, useLocation } from '@tanstack/react-router';
import { useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import { Provider as GraphQLClientProvider } from 'urql';
import appCss from '../styles.css?url';
import { Toaster } from '../web/components/base/sonner';
import { TooltipProvider } from '../web/components/base/tooltip';
import { NavigationProgress } from '../web/components/NavigationProgress';
import { urqlClient } from '../web/graphql/client';
import { DEFAULT_SHARE_IMAGE, DEFAULT_SHARE_IMAGE_DIMENSIONS, SITE_NAME } from '../web/seo/seoConstants';
import { webPageUrlGet } from '../web/seo/webPageUrlGet';
import { cn } from '../web/utils/cn';

// Site-wide defaults. Every route's `head()` overrides title/description/OG
// per-page via `seoMeta()`; these only matter when a page omits `head()`
// entirely or when a crawler hits a redirect before the page route renders.
const FALLBACK_DESCRIPTION = 'SeaScope — explainable maritime risk prioritization: from thousands of tracks to the vessel that matters.';

export const Route = createRootRoute({
    head: () => {
        const webPageUrl = webPageUrlGet();
        const shareImageAbsolute = `${webPageUrl}${DEFAULT_SHARE_IMAGE}`;
        return {
            meta: [
                { charSet: 'utf-8' },
                // `maximum-scale=1` prevents iOS Safari's auto-zoom on input
                // focus — the page no longer zooms in (and leaves the user
                // horizontally scrolled afterwards) when the chat composer is
                // tapped. We deliberately omit `user-scalable=no` so pinch-
                // zoom stays available for accessibility: iOS Safari overrides
                // `maximum-scale` for genuine user gestures, and Chrome
                // (since v88) does the same.
                // `viewport-fit=cover` lets `env(safe-area-inset-*)` resolve
                // on iOS (PWA / edge-to-edge Safari) so pinned composers can
                // clear the home indicator — see `--chat-composer-pb` in
                // styles.css and docs/styles/chat.md.
                { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover' },
                // Matches brand `--background` — see docs/styles/theme.md.
                { name: 'theme-color', content: '#f4f3ec' },
                // Fallback social-share metadata. Per-page `seoMeta()` calls
                // override these for indexable pages; this block exists so
                // crawlers that hit a redirect or a route without its own
                // `head()` still see a complete card.
                { name: 'description', content: FALLBACK_DESCRIPTION },
                { property: 'og:site_name', content: SITE_NAME },
                { property: 'og:type', content: 'website' },
                { property: 'og:title', content: SITE_NAME },
                { property: 'og:description', content: FALLBACK_DESCRIPTION },
                { property: 'og:image', content: shareImageAbsolute },
                { property: 'og:image:width', content: String(DEFAULT_SHARE_IMAGE_DIMENSIONS.width) },
                { property: 'og:image:height', content: String(DEFAULT_SHARE_IMAGE_DIMENSIONS.height) },
                { name: 'twitter:card', content: 'summary_large_image' },
                { name: 'twitter:title', content: SITE_NAME },
                { name: 'twitter:description', content: FALLBACK_DESCRIPTION },
                { name: 'twitter:image', content: shareImageAbsolute },
                // iOS home-screen / web-app cosmetics. Doesn't affect SEO, but
                // pairs with `manifest.json` for a cohesive PWA install. The
                // standard `mobile-web-app-capable` is the modern equivalent;
                // the `apple-` variant stays for older iOS Safari.
                { name: 'mobile-web-app-capable', content: 'yes' },
                { name: 'apple-mobile-web-app-capable', content: 'yes' },
                { name: 'apple-mobile-web-app-title', content: SITE_NAME },
                { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
            ],
            links: [
                { rel: 'stylesheet', href: appCss },
                // Inter — brand sans; see docs/styles/fonts.md.
                { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
                { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
                {
                    rel: 'stylesheet',
                    href: 'https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..700&display=swap',
                },
                // PWA manifest — declares short_name, theme_color, start_url
                // for the install prompt. The file lives at `public/manifest.json`.
                { rel: 'manifest', href: '/manifest.json' },
                // Single favicon — template ships only `public/favicon.ico`
                // (no dark-mode pair), so we skip the dual media-query icons.
                { rel: 'icon', href: '/favicon.ico', type: 'image/x-icon' },
                { rel: 'shortcut icon', href: '/favicon.ico', type: 'image/x-icon' },
            ],
        };
    },
    component: RootComponent,
    notFoundComponent: NotFound,
    shellComponent: RootDocument,
});

function RootComponent() {
    return <Outlet />;
}

function NotFound() {
    const location = useLocation();

    useEffect(() => {
        console.warn(`[404] Not found: ${location.pathname}`);
    }, [location.pathname]);

    return (
        <main id="main-content" className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold">404</h1>
                <p className="text-muted-foreground mt-2">Page not found</p>
                <a
                    href="/"
                    className="mt-6 inline-block text-sm font-medium underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                    Back to home
                </a>
            </div>
        </main>
    );
}

function RootDocument({ children }: PropsWithChildren) {
    // `/server/*` routes are headless Chromium capture targets (PDF /
    // screenshot) — see docs/architecture/browser-capture.md. They must not
    // inherit site chrome: NavigationProgress and the toaster would pollute
    // screenshots / PDF pages.
    const isBrowserCaptureRoute = useLocation({ select: (location) => location.pathname.startsWith('/server/') });

    return (
        <html lang="en">
            <head>
                <HeadContent />
            </head>
            <body
                className={cn(
                    'font-sans antialiased wrap-anywhere overflow-x-clip',
                    // `!` so this beats the global `body { @apply bg-background }`
                    // rule — capture pages need a true white canvas.
                    isBrowserCaptureRoute && 'bg-white!',
                )}
            >
                {!isBrowserCaptureRoute && (
                    <a
                        href="#main-content"
                        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-100 focus:rounded-md focus:border focus:border-border focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-sm focus:ring-[3px] focus:ring-ring/50 focus:outline-none"
                    >
                        Skip to content
                    </a>
                )}
                {!isBrowserCaptureRoute && <NavigationProgress />}
                <TooltipProvider>
                    <GraphQLClientProvider value={urqlClient}>{children}</GraphQLClientProvider>
                </TooltipProvider>
                {!isBrowserCaptureRoute && <Toaster position="bottom-center" richColors />}
                <Scripts />
            </body>
        </html>
    );
}
