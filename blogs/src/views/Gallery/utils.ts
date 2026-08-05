import type { GalleryItem } from '../../content/gallery/data'

// Dates render through the site-wide formatter so every page shows the
// same format.
export { formatDate } from '../../lib/format'

export function getTimestamp(value: string | undefined, fallbackIndex: number) {
  if (!value) return fallbackIndex

  const timestamp = Date.parse(value)
  return Number.isNaN(timestamp) ? fallbackIndex : timestamp
}

export function getPlatformKey(value: string | undefined) {
  const normalizedType =
    typeof value === 'string' ? value.trim().toLowerCase() : ''

  if (normalizedType === 'instagram') return 'instagram'
  if (normalizedType === 'linkedin') return 'linkedin'
  if (normalizedType === 'youtube') return 'youtube'
  if (normalizedType === 'zoom') return 'zoom'
  if (normalizedType === 'twitter') return 'twitter'
  return 'gallery'
}

export function getPlatformIcon(value: string) {
  if (value === 'instagram') return 'mdi-instagram'
  if (value === 'linkedin') return 'mdi-linkedin'
  if (value === 'youtube') return 'mdi-youtube'
  if (value === 'zoom') return 'mdi-video'
  if (value === 'twitter') return 'mdi-twitter'
  return 'mdi-image-outline'
}

export function getPlatformBadgeClass(value: string) {
  if (value === 'instagram') {
    return 'bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]'
  }
  if (value === 'linkedin') return 'bg-[#0a66c2]'
  if (value === 'youtube') return 'bg-[#ff0000]'
  if (value === 'zoom') return 'bg-[#0b5cff]'
  if (value === 'twitter') return 'bg-[#0f172a]'
  return 'bg-[#004f9a]'
}

export function getZoomTitleId(item: GalleryItem) {
  const itemId = item.id || 'item'
  const normalizedId = String(itemId)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `gallery-zoom-title-${normalizedId || 'item'}`
}

export function wrapImageIndex(index: number, total: number) {
  if (!total) return 0

  return ((index % total) + total) % total
}
