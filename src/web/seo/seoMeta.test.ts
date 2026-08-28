import { describe, expect, it } from 'vitest';

import { seoMeta } from './seoMeta';

const baseInput = {
    title: 'Welcome',
    description: 'A friendly hello.',
    webPageUrl: 'https://example.com',
} as const;

describe('seoMeta', () => {
    it('appends the site name to the title', () => {
        // Arrange — nothing
        // Act
        const output = seoMeta({ ...baseInput, path: '/' });

        // Assert
        const titleEntry = output.meta.find((entry): entry is { title: string } => 'title' in entry);
        expect(titleEntry?.title).toBe('Welcome — SeaScope');
    });

    it('emits an unprefixed canonical for every path', () => {
        // Arrange — nothing
        // Act
        const output = seoMeta({ ...baseInput, path: '/terms' });

        // Assert
        expect(output.links.find((link) => link.rel === 'canonical')?.href).toBe('https://example.com/terms');
    });

    it('collapses the canonical for the home page to the bare origin', () => {
        // Arrange — nothing
        // Act
        const output = seoMeta({ ...baseInput, path: '/' });

        // Assert
        expect(output.links.find((link) => link.rel === 'canonical')?.href).toBe('https://example.com');
    });

    it('emits only a canonical link (no hreflang alternates)', () => {
        // Arrange — nothing
        // Act
        const output = seoMeta({ ...baseInput, path: '/terms' });

        // Assert
        expect(output.links).toEqual([{ rel: 'canonical', href: 'https://example.com/terms' }]);
    });

    it('always emits an explicit robots tag — index,follow by default and noindex,nofollow when requested', () => {
        // Arrange — nothing
        // Act
        const indexable = seoMeta({ ...baseInput, path: '/' });
        const hidden = seoMeta({ ...baseInput, path: '/', noindex: true });

        // Assert
        expect(indexable.meta).toContainEqual({ name: 'robots', content: 'index,follow' });
        expect(hidden.meta).toContainEqual({ name: 'robots', content: 'noindex,nofollow' });
    });

    it('emits og:locale as en_US', () => {
        // Arrange — nothing
        // Act
        const output = seoMeta({ ...baseInput, path: '/' });

        // Assert
        expect(output.meta).toContainEqual({ property: 'og:locale', content: 'en_US' });
        expect(output.meta.some((entry) => 'property' in entry && entry.property === 'og:locale:alternate')).toBe(false);
    });

    it('emits og:image:width and og:image:height for the default share image', () => {
        // Arrange — nothing
        // Act
        const output = seoMeta({ ...baseInput, path: '/' });

        // Assert
        expect(output.meta).toContainEqual({ property: 'og:image:width', content: '512' });
        expect(output.meta).toContainEqual({ property: 'og:image:height', content: '512' });
    });

    it('emits caller-supplied image dimensions when an override image is passed with size', () => {
        // Arrange — nothing
        // Act
        const output = seoMeta({
            ...baseInput,
            path: '/',
            image: '/custom-share.png',
            imageWidth: 1200,
            imageHeight: 630,
        });

        // Assert
        expect(output.meta).toContainEqual({ property: 'og:image:width', content: '1200' });
        expect(output.meta).toContainEqual({ property: 'og:image:height', content: '630' });
    });

    it('omits og:image dimensions when an override image is passed without size', () => {
        // Arrange — nothing
        // Act
        const output = seoMeta({
            ...baseInput,
            path: '/',
            image: '/custom-share.png',
        });

        // Assert
        expect(output.meta.some((entry) => 'property' in entry && entry.property === 'og:image:width')).toBe(false);
        expect(output.meta.some((entry) => 'property' in entry && entry.property === 'og:image:height')).toBe(false);
    });

    it('emits absolute Open Graph and Twitter image URLs', () => {
        // Arrange — nothing
        // Act
        const output = seoMeta({ ...baseInput, path: '/' });

        // Assert
        const ogImage = output.meta.find((entry) => 'property' in entry && entry.property === 'og:image');
        const twitterImage = output.meta.find((entry) => 'name' in entry && entry.name === 'twitter:image');
        expect(ogImage).toEqual({ property: 'og:image', content: 'https://example.com/logo512.png' });
        expect(twitterImage).toEqual({ name: 'twitter:image', content: 'https://example.com/logo512.png' });
    });

    it('passes through an absolute image URL unchanged', () => {
        // Arrange — nothing
        // Act
        const output = seoMeta({
            ...baseInput,
            path: '/',
            image: 'https://cdn.example.com/share.png',
        });

        // Assert
        const ogImage = output.meta.find((entry) => 'property' in entry && entry.property === 'og:image');
        expect(ogImage).toEqual({ property: 'og:image', content: 'https://cdn.example.com/share.png' });
    });

    it('uses og:url that matches the canonical link', () => {
        // Arrange — nothing
        // Act
        const output = seoMeta({ ...baseInput, path: '/terms' });

        // Assert
        const ogUrl = output.meta.find((entry) => 'property' in entry && entry.property === 'og:url');
        const canonical = output.links.find((link) => link.rel === 'canonical');
        expect(ogUrl).toEqual({ property: 'og:url', content: canonical?.href });
    });
});
