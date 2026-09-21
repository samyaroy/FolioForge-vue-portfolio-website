import galleryTagMetadata from '../../../src/metadata/galleryTags.yml'

export type GalleryTag = { id: string; label: string }

/**
 * The filter chips the Gallery page draws, in the order it draws them.
 *
 * An entry may carry a tag this file does not define — the card still renders
 * it — but that tag reaches no chip, so nothing filters to the entry. Hence the
 * editor asks for at least one defined tag rather than only defined tags.
 */
export const galleryTags: GalleryTag[] = (() => {
  const tags = (galleryTagMetadata as { tags?: unknown }).tags
  if (!Array.isArray(tags)) return []
  return tags.flatMap(tag => {
    if (!tag || typeof tag !== 'object') return []
    const { id, label } = tag as Record<string, unknown>
    const value = typeof id === 'string' ? id.trim() : ''
    return value ? [{ id: value, label: typeof label === 'string' && label.trim() ? label.trim() : value }] : []
  })
})()

/** The site compares tags case-insensitively, so the editor has to as well. */
export function tagKey(tag: string): string {
  return tag.trim().toLowerCase()
}

/** Whether these tags include one the gallery filter actually offers. */
export function hasDefinedTag(tags: readonly string[], options: readonly GalleryTag[]): boolean {
  const defined = new Set(options.map(option => tagKey(option.id)))
  return tags.some(tag => defined.has(tagKey(tag)))
}
