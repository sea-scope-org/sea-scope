import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '../web/components/base/button';
import { EngineComparisonDiagram } from '../web/components/EngineComparisonDiagram';
import { seoMeta } from '../web/seo/seoMeta';
import { webPageUrlGet } from '../web/seo/webPageUrlGet';

const title = 'How SeaScope works';
const description =
    'Typical AIS shows more dots. SeaScope fuses feeds into ranked, explainable Watch and Alerts priorities you can act on.';

export const Route = createFileRoute('/how-it-works')({
    head: () =>
        seoMeta({
            title,
            description,
            path: '/how-it-works',
            webPageUrl: webPageUrlGet(),
        }),
    component() {
        return (
            <main id="main-content" className="mx-auto flex min-h-dvh max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
                <header className="max-w-2xl space-y-3">
                    <p className="text-sm font-medium tracking-wide text-primary uppercase">Architecture</p>
                    <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
                    <p className="text-base text-muted-foreground sm:text-lg">
                        From raw AIS noise to ranked priorities — the same engine that powers the watch console.
                    </p>
                </header>

                <EngineComparisonDiagram />

                <div className="flex flex-wrap items-center gap-3">
                    <Button asChild>
                        <Link to="/watch">Open console / demo</Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link to="/">Back to home</Link>
                    </Button>
                </div>
            </main>
        );
    },
});
