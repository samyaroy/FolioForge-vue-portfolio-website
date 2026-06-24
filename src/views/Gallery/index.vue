<template>
  <section class="min-h-screen bg-slate-50">
    <div class="container mx-auto flex flex-col gap-8 px-4 py-10">
      <GalleryHero />

      <div class="relative z-30 -my-4 ml-auto flex w-full items-center">
        <div class="flex-1">
          <hr class="border-slate-300">
        </div>
        <div class="flex shrink-0 items-center justify-end gap-3 pl-4">
          <span class="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            {{ totalItemCount }} {{ totalItemCount === 1 ? 'entry' : 'entries' }}
          </span>
          <GalleryFilter
            v-if="filterOptions.length > 1"
            :options="filterOptions.slice(1)"
            :selected-filters="activeFilters"
            @update:selected-filters="activeFilters = $event"
          />
        </div>
      </div>

      <GalleryGrid
        :items="visibleItems"
        :can-load-more="canLoadMore"
        :highlighted-id="highlightedId"
        @load-more="loadMore"
      />
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import galleryContent from '@/content/profile_info/gallery.yml'
import galleryTagMetadata from '@/metadata/galleryTags.yml'
import { GALLERY_ITEM_PARAM, galleryAnchorId } from '@/utils/shareLinks'
import GalleryFilter from './components/GalleryFilter.vue'
import GalleryGrid from './components/GalleryGrid.vue'
import GalleryHero from './components/GalleryHero.vue'

defineOptions({
  name: 'GalleryPage',
})

// scripts/build-boneyard-gallery.mjs loads the page with this flag set so every
// card renders at once and can have its bone captured; the "load more" paging
// would otherwise hide most of them from the capture run.
const shouldExposeAllItemsForCapture = typeof window !== 'undefined' && window.__BONEYARD_BUILD === true

const rawItems = Array.isArray(galleryContent?.items) ? galleryContent.items : []
const configuredTags = Array.isArray(galleryTagMetadata?.tags) ? galleryTagMetadata.tags : []
const configuredTagIds = new Set(
  configuredTags
    .map(tag => tag?.id)
    .filter(Boolean)
)
const configuredTagIdLookup = new Map(
  [...configuredTagIds].map(tagId => [normalizeTagKey(tagId), tagId])
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
const route = useRoute()
const activeFilters = ref([])
const initialVisibleCount = 6
const visibleCount = ref(initialVisibleCount)
// Card a shared link pointed at. The ring is a temporary "here it is" marker,
// not a selection, so it fades on its own.
const highlightedId = ref('')
const HIGHLIGHT_DURATION_MS = 4000
let highlightTimer = null

const normalizedItems = computed(() => normalizeGalleryItems(rawItems))

const filterOptions = computed(() => {
  const configuredOptions = configuredTags
    .filter(tag => tag?.id)
    .map(tag => ({
      id: tag.id,
      label: tag.label || tag.id,
    }))

  return [{ id: 'all', label: 'All unlocks' }].concat(configuredOptions)
})

const sortedItems = computed(() => [...normalizedItems.value].sort((firstItem, secondItem) => {
  const firstTimestamp = getTimestamp(firstItem.date, firstItem.originalIndex)
  const secondTimestamp = getTimestamp(secondItem.date, secondItem.originalIndex)

  return secondTimestamp - firstTimestamp
}))

const filteredItems = computed(() => {
  if (!activeFilters.value.length) return sortedItems.value

  return sortedItems.value.filter(item => (
    Array.isArray(item.filterTags) && activeFilters.value.some(filter => item.filterTags.includes(filter))
  ))
})

const visibleItems = computed(() => (
  shouldExposeAllItemsForCapture
    ? filteredItems.value
    : filteredItems.value.slice(0, visibleCount.value)
))
const canLoadMore = computed(() => (
  !shouldExposeAllItemsForCapture && filteredItems.value.length > visibleCount.value
))
const totalItemCount = computed(() => sortedItems.value.length)

watch(activeFilters, () => {
  visibleCount.value = initialVisibleCount
  clearHighlight()
}, { deep: true })

// Covers a second shared link opened without a full page load, which leaves
// this component mounted and only changes the query.
watch(() => route.query[GALLERY_ITEM_PARAM], focusSharedItem)

onMounted(focusSharedItem)

onBeforeUnmount(clearHighlight)

watch(filterOptions, (nextOptions) => {
  const allowedFilterIds = new Set(nextOptions.map(option => option.id))
  const normalizedFilters = activeFilters.value.filter(filterId => allowedFilterIds.has(filterId))

  if (normalizedFilters.length !== activeFilters.value.length) {
    activeFilters.value = normalizedFilters
  }
}, { immediate: true })

function loadMore() {
  visibleCount.value += 6
}

/**
 * Opens the card named by `?item=`, the link every card's share menu hands out.
 * The card lives in the grid rather than on a page of its own, so "opening" it
 * means making sure it is past the filter and past paging, then scrolling to it.
 */
async function focusSharedItem() {
  const requestedId = route.query[GALLERY_ITEM_PARAM]
  const itemId = Array.isArray(requestedId) ? requestedId[0] : requestedId
  if (!itemId) return

  const itemIndex = sortedItems.value.findIndex(item => item.id === itemId)
  if (itemIndex === -1) return

  // A shared link outranks whatever filter happens to be on: otherwise the card
  // it names is simply not in the DOM to scroll to.
  if (activeFilters.value.length) {
    activeFilters.value = []
    // The filter watcher resets paging; let it run before paging is widened.
    await nextTick()
  }

  visibleCount.value = Math.max(visibleCount.value, itemIndex + 1)

  await nextTick()

  const cardElement = document.getElementById(galleryAnchorId(itemId))
  if (!cardElement) return

  cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' })

  clearHighlight()
  highlightedId.value = itemId
  highlightTimer = setTimeout(clearHighlight, HIGHLIGHT_DURATION_MS)
}

function clearHighlight() {
  if (highlightTimer) {
    clearTimeout(highlightTimer)
    highlightTimer = null
  }

  highlightedId.value = ''
}

function normalizeGalleryItems(items) {
  const categoryCounts = new Map()

  return items.map((item, index) => {
    const tags = normalizeItemTags(item)
    const filterTags = normalizeItemFilterTags(item)
    const category = resolveItemCategory(item, tags)
    const nextCount = (categoryCounts.get(category) || 0) + 1
    categoryCounts.set(category, nextCount)

    const id = item?.id || createCategoryId(category, nextCount)
    const images = resolveItemImages(id, item?.images)

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

function normalizeItemTags(item) {
  const rawTags = Array.isArray(item?.tags)
    ? item.tags
      .map(normalizeDisplayTag)
      .filter(Boolean)
    : []

  return dedupeTags(rawTags)
}

function normalizeItemFilterTags(item) {
  const rawTags = Array.isArray(item?.tags)
    ? item.tags
      .map(resolveConfiguredTagId)
      .filter(Boolean)
    : []
  const normalizedTags = dedupeTags(rawTags)

  if (item?.featured && !hasTag(normalizedTags, 'featured')) {
    normalizedTags.unshift('Featured')
  }

  return normalizedTags
}

function resolveItemCategory(item, tags = []) {
  if (hasTag(tags, 'instagram')) return 'instagram'
  if (hasTag(tags, 'linkedin')) return 'linkedin'
  if (hasTag(tags, 'youtube')) return 'youtube'
  if (hasTag(tags, 'zoom')) return 'zoom'
  if (hasTag(tags, 'twitter')) return 'twitter'

  const normalizedType = slugifySegment(item?.type)
  if (normalizedType) return normalizedType

  return 'gallery'
}

function createCategoryId(category, count) {
  return `${category}-${String(count).padStart(2, '0')}`
}

function resolveItemImages(itemId, rawImages) {
  const explicitImages = Array.isArray(rawImages)
    ? rawImages.map(resolveImageEntry).filter(Boolean)
    : []

  if (explicitImages.length) return explicitImages

  const fallbackImage = getGalleryImageById(itemId)
  return fallbackImage ? [fallbackImage] : []
}

function resolveImageEntry(entry) {
  if (typeof entry !== 'string') return ''

  const trimmedEntry = entry.trim()
  if (!trimmedEntry) return ''

  // Full URLs are used as-is; bare keys resolve through the centralized CDN base.
  if (/^https?:\/\//i.test(trimmedEntry)) return trimmedEntry

  return getGalleryImageById(trimmedEntry)
}

function getGalleryImageById(itemId) {
  if (!itemId) return ''

  // Keep external image resolution centralized here so it can be swapped later.
  return `https://media.samyabrata.codeium.xyz/${encodeURIComponent(itemId)}.jpeg`
}

function getTimestamp(value, fallbackIndex) {
  if (!value) return fallbackIndex

  const timestamp = Date.parse(value)
  return Number.isNaN(timestamp) ? fallbackIndex : timestamp
}

function hasTag(tags, expectedTag) {
  const normalizedExpectedTag = normalizeTagKey(expectedTag)

  return Array.isArray(tags) && tags.some(tag => (
    typeof tag === 'string' && normalizeTagKey(tag) === normalizedExpectedTag
  ))
}

function slugifySegment(value) {
  if (typeof value !== 'string') return ''

  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function resolveConfiguredTagId(tag) {
  if (typeof tag !== 'string') return ''

  const normalizedTagKey = normalizeTagKey(tag)
  const resolvedTagKey = tagAliases.get(normalizedTagKey) || normalizedTagKey

  return configuredTagIdLookup.get(resolvedTagKey) || ''
}

function normalizeDisplayTag(tag) {
  return typeof tag === 'string' ? tag.trim() : ''
}

function dedupeTags(tags) {
  const seenTags = new Set()

  return tags.filter((tag) => {
    const normalizedTag = normalizeTagKey(tag)

    if (!normalizedTag || seenTags.has(normalizedTag)) return false

    seenTags.add(normalizedTag)
    return true
  })
}

function normalizeTagKey(value) {
  return String(value).trim().toLowerCase()
}
</script>
