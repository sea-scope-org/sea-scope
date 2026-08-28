// Site-wide branding and SEO defaults. Update `SITE_NAME` here once and every
// page's `<title>`, `og:site_name`, and Twitter card text follows.
export const SITE_NAME = 'SeaScope';

// Default Open Graph / Twitter Card image. Root-relative so the `seoMeta()`
// helper turns it into an absolute URL using `webPageUrl`. Replace with your
// actual social-share image (recommended 1200×630).
export const DEFAULT_SHARE_IMAGE = '/logo512.png';

// Intrinsic dimensions of `DEFAULT_SHARE_IMAGE`. Emitted as
// `og:image:width` / `og:image:height` so crawlers (Facebook, LinkedIn) can
// render the share card without an extra probe request. Keep in sync with the
// file in `public/`.
export const DEFAULT_SHARE_IMAGE_DIMENSIONS = { width: 512, height: 512 } as const;

// Open Graph locale tag (IETF / Facebook underscored form).
export const OG_LOCALE = 'en_US';
