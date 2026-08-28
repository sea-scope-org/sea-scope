import { createFileRoute, Link } from '@tanstack/react-router';
import { seoMeta } from '../web/seo/seoMeta';
import { webPageUrlGet } from '../web/seo/webPageUrlGet';

export const Route = createFileRoute('/terms')({
    head: () =>
        seoMeta({
            title: 'Terms of Service',
            description: 'Terms of use for SeaScope — maritime security copilot.',
            path: '/terms',
            webPageUrl: webPageUrlGet(),
        }),
    component() {
        return (
            <main id="main-content" className="mx-auto max-w-2xl space-y-6 p-8">
                <h1 className="text-2xl font-semibold">Terms of Service</h1>
                <p className="text-muted-foreground">
                    SeaScope is an AI-powered maritime security copilot for operators. This page is a provisional stub. Full terms of
                    service will be published before production use.
                </p>
                <p className="text-muted-foreground">
                    By using the demo or console you acknowledge that the software is provided for demonstration and evaluation purposes,
                    without warranty.
                </p>
                <Link to="/" className="text-sm underline underline-offset-4">
                    Back to home
                </Link>
            </main>
        );
    },
});
