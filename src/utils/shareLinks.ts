// Canonical links for the things this site lets a visitor share, and the DOM
// ids those links land on. Kept in one file because a share URL and the anchor
// it scrolls to have to agree — the gallery page reads the same query parameter
// GalleryCard writes into the link.

import { SITE_URL } from '@/router/routes'

const LOCAL_HOST_PATTERN = /^(localhost|127\.0\.0\.1|\[::1\])$/

/** Query parameter that deep-links the gallery to a single card. */
export const GALLERY_ITEM_PARAM = 'item'

/**
 * Origin a shared link should point at. The live host wins, so a link shared
 * from the beta deployment opens the beta deployment. Localhost is the one
 * exception: nobody else can open a link to your laptop, so local shares point
 * at production and stay testable.
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
 * Shareable link to a single gallery card. It is a query parameter on the
 * existing page rather than a route of its own, so the card opens in its real
 * context — the full grid, scrolled to it and highlighted.
 */
export function galleryItemShareUrl(itemId: string): string {
  return `${shareOrigin()}/gallery?${GALLERY_ITEM_PARAM}=${encodeURIComponent(itemId)}`
}
