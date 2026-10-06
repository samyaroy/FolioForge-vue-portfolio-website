// A gallery entry's `images` is a list of what each photo is called: a bare
// key on the media host, or a full URL used as it is. The first one is the
// card's cover. With none listed, the card falls back to the entry's own `id`,
// which is how older entries were addressed before `images` was written out.
const MEDIA_BASE = 'https://media.samyabrata.codeium.xyz'

/** Where an image is served from, resolved as the Gallery page resolves it. */
export function galleryImageUrl(image: string): string {
  const value = image.trim()
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) {
    try {
      const parsed = new URL(value)
      if ((parsed.protocol !== 'http:' && parsed.protocol !== 'https:') || parsed.username || parsed.password) return ''
      return parsed.toString()
    } catch {
      return ''
    }
  }
  return `${MEDIA_BASE}/${encodeURIComponent(value)}.jpeg`
}

/** The images an entry lists, as the editor holds them. */
export function galleryImagesDraft(value: unknown): string[] {
  const items = Array.isArray(value) ? value : typeof value === 'string' && value.trim() ? [value] : []
  return items.filter((item): item is string => typeof item === 'string' && Boolean(item.trim())).map(item => item.trim())
}

/** An emptied list is written as no list, so the card falls back to the id. */
export function serializeGalleryImages(images: readonly string[], original: unknown): unknown {
  const kept = images.map(image => image.trim()).filter(Boolean)
  if (kept.length) return kept
  return Array.isArray(original) && !original.length ? original : null
}

/** Keys and URLs pasted together, one per line or separated by spaces. */
export function splitGalleryImages(value: string): string[] {
  return value.split(/[\s,]+/).map(item => item.trim()).filter(Boolean)
}

/** What the card shows first: the first listed image, or the entry's id. */
export function galleryCoverUrl(raw: Record<string, unknown>): string {
  const [first] = galleryImagesDraft(raw.images)
  const id = typeof raw.id === 'string' || typeof raw.id === 'number' ? String(raw.id) : ''
  return galleryImageUrl(first ?? id)
}
