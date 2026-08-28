import { createFileRoute, Link } from '@tanstack/react-router';
import { HomePageDocument } from '../web/graphql/generated';
import { routeLoaderGraphqlClient } from '../web/graphql/routeLoaderGraphqlClient';
import { jsonLdScripts } from '../web/seo/jsonLd';
import { seoMeta } from '../web/seo/seoMeta';
import { webPageUrlGet } from '../web/seo/webPageUrlGet';

export const Route = createFileRoute('/')({
    loader: () => routeLoaderGraphqlClient(HomePageDocument)(),
    staleTime: 0,
    head: () => {
        const webPageUrl = webPageUrlGet();
        return {
            ...seoMeta({
                title: 'Maritime security copilot',
                description: 'SeaScope prioritizes the vessels that matter — explainable risk for maritime security operators.',
                path: '/',
                webPageUrl,
            }),
            scripts: jsonLdScripts(webPageUrl).map((script) => ({
                type: script.type,
                children: script.children,
            })),
        };
    },
    component() {
        return (
            <main id="main-content" className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-8 p-8">
                <div className="grid gap-4">
                    <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">SeaScope</h1>
                    <p className="text-lg text-muted-foreground">
                        From thousands of vessel tracks to the one that actually matters — explainable maritime risk prioritization.
                    </p>
                </div>
                <Link
                    to="/watch"
                    className="inline-flex w-fit items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                    Open console / demo
                </Link>
            </main>
        );
    },
});
