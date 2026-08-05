// Canonical origin of the deployed blog. Single source of truth for every
// absolute URL the site emits about itself: the sitemap and RSS feed
// (vite.config.ts) and the per-post structured data (views/Post).
export const SITE_URL = 'https://blogs.samyabrata.codeium.xyz'

/** Resolve a site-relative path (e.g. a post's `cover: /hero.jpg`) to an
    absolute URL; passes through URLs that are already absolute. */
export function absoluteUrl(pathOrUrl: string): string {
  return /^https?:\/\//.test(pathOrUrl) ? pathOrUrl : `${SITE_URL}${pathOrUrl}`
}
