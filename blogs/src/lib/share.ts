// Canonical links for the things this blog lets a visitor share, and the DOM
// ids those links land on. The portfolio has a mirror of this file at
// src/utils/shareLinks.ts; both feed the same shared/shareTargets.ts.

import { SITE_URL } from './seo'

const LOCAL_HOST_PATTERN = /^(localhost|127\.0\.0\.1|\[::1\])$/

/** Query parameter that deep-links the gallery to a single card. */
export const GALLERY_ITEM_PARAM = 'item'

/**
 * Origin a shared link should point at. The live host wins, so a link shared
 * from a preview deployment opens that deployment. Localhost is the exception:
 * nobody else can open a link to your laptop, so local shares point at the
 * published site and stay testable.
 */
export function shareOrigin(): string {
  if (typeof window === 'undefined') return SITE_URL

  const { origin, hostname } = window.location

  return !origin || LOCAL_HOST_PATTERN.test(hostname) ? SITE_URL : origin
}

/** DOM id of one card in the gallery grid; the target of a deep link. */
export function galleryAnchorId(itemId: string): string {
  return `gallery-item-${itemId}`
}

/**
 * Shareable link to a single gallery card. A query parameter on the existing
 * page rather than a route of its own, so the card opens in its real context —
 * the full grid, scrolled to it and highlighted.
 */
export function galleryItemShareUrl(itemId: string): string {
  return `${shareOrigin()}/gallery?${GALLERY_ITEM_PARAM}=${encodeURIComponent(itemId)}`
}

/**
 * Shareable link to a post. Unlike a gallery card this is a real page, and
 * vite.config.ts prerenders its <head> with the post's own title, description
 * and cover image — which is what LinkedIn and X read to build their preview.
 */
export function postShareUrl(slug: string): string {
  return `${shareOrigin()}/posts/${encodeURIComponent(slug)}`
}
