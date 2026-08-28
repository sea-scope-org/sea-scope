import { createFileRoute, redirect } from '@tanstack/react-router';

// Legacy `/en` and `/en/...` URLs from the bilingual era — permanent redirect
// to the unprefixed English-only paths.
export const Route = createFileRoute('/en/$')({
    beforeLoad: ({ params }) => {
        const splat = params._splat;
        throw redirect({
            href: splat ? `/${splat}` : '/',
            statusCode: 301,
        });
    },
});
