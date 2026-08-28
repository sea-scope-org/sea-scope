import { createFileRoute, redirect } from '@tanstack/react-router';

// Exact `/en` (and `/en/`) from the bilingual era → home.
export const Route = createFileRoute('/en/')({
    beforeLoad: () => {
        throw redirect({ href: '/', statusCode: 301 });
    },
});
