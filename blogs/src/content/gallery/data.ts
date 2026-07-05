// Typed accessors and derived values for the blog gallery. Edit data.yml
// and tags.yml to change the gallery content.
import rawItemsContent from './data.yml'
import rawTagContent from './tags.yml'

export type RawGalleryItem = {
  id?: string
  type?: string
  date?: string
  tags?: string[]
  images?: string[]
  image?: string
  alt?: string
  event?: string
  location?: string
  externalUrl?: string
  featured?: boolean
}

export type GalleryItem = RawGalleryItem & {
  id: string
  category: string
  tags: string[]
  filterTags: string[]
  images: string[]
  image: string
  originalIndex: number
}

export type TagOption = {
  id: string
  label: string
}

const rawItems = Array.isArray(
  (rawItemsContent as { items?: RawGalleryItem[] }).items,
)
  ? (rawItemsContent as { items: RawGalleryItem[] }).items
  : []

const configuredTags = Array.isArray((rawTagContent as { tags?: TagOption[] }).tags)
  ? (rawTagContent as { tags: TagOption[] }).tags
  : []

const configuredTagIds = new Set(
  configuredTags
    .map((tag) => tag.id)
    .filter((tagId): tagId is string => Boolean(tagId)),
)

const configuredTagIdLookup = new Map(
  [...configuredTagIds].map((tagId) => [normalizeTagKey(tagId), tagId]),
)

const tagAliases = new Map([
  ['teitter', 'twitter'],
  ['x', 'twitter'],
  ['new role', 'new role'],
  ['new roles', 'new role'],
  ['newroles', 'new role'],
  ['academic milestones', 'academic milestone'],
  ['guest events', 'guest event'],
  ['new publications', 'new publication'],
  ['articles', 'article'],
  ['conferences', 'conference'],
  ['workshops', 'workshop'],
  ['bootcamps', 'bootcamp'],
  ['internships', 'internship'],
  ['meetups', 'meetup'],
])

export const GALLERY_FILTER_OPTIONS: TagOption[] = [
  { id: 'all', label: 'All unlocks' },
].concat(
  configuredTags
    .filter((tag) => tag?.id)
    .map((tag) => ({
      id: tag.id,
      label: tag.label || tag.id,
    })),
)

export const GALLERY_ITEMS: GalleryItem[] = normalizeGalleryItems(rawItems)

function normalizeGalleryItems(items: RawGalleryItem[]): GalleryItem[] {
  const categoryCounts = new Map<string, number>()

  return items.map((item, index) => {
    const tags = normalizeItemTags(item)
    const filterTags = normalizeItemFilterTags(item)
    const category = resolveItemCategory(item, tags)
    const nextCount = (categoryCounts.get(category) || 0) + 1
    categoryCounts.set(category, nextCount)

    const id = item.id || createCategoryId(category, nextCount)
    const images = resolveItemImages(id, item.images)

    return {
      ...item,
      id,
      category,
      tags,
      filterTags,
      images,
      image: images[0] || '',
      originalIndex: index,
    }
  })
}

function normalizeItemTags(item: RawGalleryItem) {
  const rawTags = Array.isArray(item.tags)
    ? item.tags.map(normalizeDisplayTag).filter(Boolean)
    : []

  return dedupeTags(rawTags)
}

function normalizeItemFilterTags(item: RawGalleryItem) {
  const rawTags = Array.isArray(item.tags)
    ? item.tags.map(resolveConfiguredTagId).filter(Boolean)
    : []
  const normalizedTags = dedupeTags(rawTags)

  if (item.featured && !hasTag(normalizedTags, 'featured')) {
    normalizedTags.unshift('Featured')
  }

  return normalizedTags
}

function resolveItemCategory(item: RawGalleryItem, tags: string[] = []) {
  if (hasTag(tags, 'instagram')) return 'instagram'
  if (hasTag(tags, 'linkedin')) return 'linkedin'
  if (hasTag(tags, 'youtube')) return 'youtube'
  if (hasTag(tags, 'zoom')) return 'zoom'
  if (hasTag(tags, 'twitter')) return 'twitter'

  const normalizedType = slugifySegment(item.type)
  if (normalizedType) return normalizedType

  return 'gallery'
}

function createCategoryId(category: string, count: number) {
  return `${category}-${String(count).padStart(2, '0')}`
}

function resolveItemImages(itemId: string, rawImages?: string[]) {
  const explicitImages = Array.isArray(rawImages)
    ? rawImages.map(resolveImageEntry).filter(Boolean)
    : []

  if (explicitImages.length) return explicitImages

  const fallbackImage = getGalleryImageById(itemId)
  return fallbackImage ? [fallbackImage] : []
}

function resolveImageEntry(entry: string) {
  if (typeof entry !== 'string') return ''

  const trimmedEntry = entry.trim()
  if (!trimmedEntry) return ''

  if (/^https?:\/\//i.test(trimmedEntry)) return trimmedEntry

  return getGalleryImageById(trimmedEntry)
}

function getGalleryImageById(itemId: string) {
  if (!itemId) return ''

  return `https://media.samyabrata.codeium.xyz/${encodeURIComponent(itemId)}.jpeg`
}

function hasTag(tags: string[], expectedTag: string) {
  const normalizedExpectedTag = normalizeTagKey(expectedTag)

  return (
    Array.isArray(tags) &&
    tags.some((tag) => normalizeTagKey(tag) === normalizedExpectedTag)
  )
}

function slugifySegment(value: string | undefined) {
  if (typeof value !== 'string') return ''

  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function resolveConfiguredTagId(tag: string) {
  if (typeof tag !== 'string') return ''

  const normalizedTagKey = normalizeTagKey(tag)
  const resolvedTagKey = tagAliases.get(normalizedTagKey) || normalizedTagKey

  return configuredTagIdLookup.get(resolvedTagKey) || ''
}

function normalizeDisplayTag(tag: string) {
  return typeof tag === 'string' ? tag.trim() : ''
}

function dedupeTags(tags: string[]) {
  const seenTags = new Set<string>()

  return tags.filter((tag) => {
    const normalizedTag = normalizeTagKey(tag)

    if (!normalizedTag || seenTags.has(normalizedTag)) return false

    seenTags.add(normalizedTag)
    return true
  })
}

function normalizeTagKey(value: string) {
  return String(value).trim().toLowerCase()
}
