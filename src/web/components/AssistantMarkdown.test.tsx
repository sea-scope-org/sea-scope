import { createMemoryHistory, createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AssistantMarkdown, ExternalLinkConfirmationProvider, isInternalHref } from './AssistantMarkdown';

// Minimal router harness so `useRouter()` inside the markdown anchor resolves.
// A catch-all `$` route lets us start the memory history at any pathname
// without wiring the real route tree.
function renderInRouter(node: React.ReactNode, initialPath = '/') {
    const rootRoute = createRootRoute({ component: () => <>{node}</> });
    const catchAll = createRoute({ getParentRoute: () => rootRoute, path: '$', component: () => null });
    const router = createRouter({
        routeTree: rootRoute.addChildren([catchAll]),
        history: createMemoryHistory({ initialEntries: [initialPath] }),
    });
    // The test router's route tree isn't the registered one; the cast keeps
    // `RouterProvider`'s generic happy without pulling in `routeTree.gen`.
    return render(<RouterProvider router={router as never} />);
}

describe('AssistantMarkdown anchor rendering', () => {
    it('renders an internal link as a same-tab anchor with no target/confirmation', async () => {
        renderInRouter(<AssistantMarkdown text="See the [terms](/terms)." />);

        const link = await screen.findByRole('link', { name: 'terms' });
        expect(link.getAttribute('href')).toBe('/terms');
        expect(link.getAttribute('target')).toBeNull();
    });

    it('keeps an internal link href as-is', async () => {
        renderInRouter(<AssistantMarkdown text="See the [terms](/terms)." />, '/about');

        const link = await screen.findByRole('link', { name: 'terms' });
        expect(link.getAttribute('href')).toBe('/terms');
    });

    it('renders an external link with confirmation enabled as a button (no direct anchor)', async () => {
        renderInRouter(<AssistantMarkdown text="[GitHub](https://github.com/example)" />);

        const button = await screen.findByRole('button', { name: 'GitHub' });
        expect(button).toBeTruthy();
        expect(screen.queryByRole('link', { name: 'GitHub' })).toBeNull();
    });

    it('renders an external link with confirmation disabled as a direct new-tab anchor', async () => {
        renderInRouter(
            <ExternalLinkConfirmationProvider enabled={false}>
                <AssistantMarkdown text="[GitHub](https://github.com/example)" />
            </ExternalLinkConfirmationProvider>,
        );

        const link = await screen.findByRole('link', { name: 'GitHub' });
        expect(link.getAttribute('href')).toBe('https://github.com/example');
        expect(link.getAttribute('target')).toBe('_blank');
    });
});

describe('isInternalHref', () => {
    it('treats single-leading-slash paths as internal', () => {
        expect(isInternalHref('/terms')).toBe(true);
        expect(isInternalHref('/')).toBe(true);
        expect(isInternalHref('/chat?chatId=abc')).toBe(true);
    });

    it('treats absolute URLs and protocol-relative hrefs as external', () => {
        expect(isInternalHref('https://github.com/example')).toBe(false);
        expect(isInternalHref('//evil.example.com')).toBe(false);
        expect(isInternalHref('mailto:hello@example.com')).toBe(false);
    });

    it('treats empty / undefined as not internal', () => {
        expect(isInternalHref(undefined)).toBe(false);
        expect(isInternalHref('')).toBe(false);
    });
});
