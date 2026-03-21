<template>
  <section class="min-h-screen bg-slate-50">
    <div class="container mx-auto flex flex-col gap-8 px-4 py-10">
      <GalleryHero
        :view-mode="viewMode"
        :view-options="viewOptions"
        @update:view-mode="viewMode = $event"
      />

      <div class="relative z-30 -mt-2 flex justify-end">
        <GalleryFilter
          v-if="filterOptions.length > 1"
          :options="filterOptions.slice(1)"
          :selected-filters="activeFilters"
          @update:selected-filters="activeFilters = $event"
        />
      </div>

      <GalleryGrid
        v-if="viewMode === 'grid'"
        :items="visibleItems"
        :can-load-more="canLoadMore"
        @load-more="loadMore"
      />

      <GalleryScrolls
        v-else
        :items="visibleItems"
        :can-load-more="canLoadMore"
        @load-more="loadMore"
      />
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import galleryContent from '@/content/gallery.yml'
import galleryTagMetadata from '@/metadata/galleryTags.yml'
import GalleryFilter from './components/GalleryFilter.vue'
import GalleryGrid from './components/GalleryGrid.vue'
import GalleryHero from './components/GalleryHero.vue'
import GalleryScrolls from './components/GalleryScrolls.vue'

defineOptions({
  name: 'GalleryPage',
})

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
])
const activeFilters = ref([])
const viewMode = ref('grid')
const initialVisibleCount = 5
const visibleCount = ref(initialVisibleCount)

const viewOptions = Object.freeze([
  { id: 'grid', label: 'Grid', icon: 'mdi-view-grid-outline' },
  { id: 'scrolls', label: 'Scrolls', icon: 'mdi-book-open-page-variant-outline' },
])

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
    Array.isArray(item.tags) && activeFilters.value.every(filter => item.tags.includes(filter))
  ))
})

const visibleItems = computed(() => filteredItems.value.slice(0, visibleCount.value))
const canLoadMore = computed(() => filteredItems.value.length > visibleCount.value)

watch(activeFilters, () => {
  visibleCount.value = initialVisibleCount
}, { deep: true })

watch(filterOptions, (nextOptions) => {
  const allowedFilterIds = new Set(nextOptions.map(option => option.id))
  const normalizedFilters = activeFilters.value.filter(filterId => allowedFilterIds.has(filterId))

  if (normalizedFilters.length !== activeFilters.value.length) {
    activeFilters.value = normalizedFilters
  }
}, { immediate: true })

function loadMore() {
  visibleCount.value += 3
}

function normalizeGalleryItems(items) {
  const categoryCounts = new Map()

  return items.map((item, index) => {
    const tags = normalizeItemTags(item)
    const category = resolveItemCategory(item, tags)
    const nextCount = (categoryCounts.get(category) || 0) + 1
    categoryCounts.set(category, nextCount)

    const id = item?.id || createCategoryId(category, nextCount)

    return {
      ...item,
      id,
      category,
      tags,
      image: resolveItemImage(id),
      originalIndex: index,
    }
  })
}

function normalizeItemTags(item) {
  const rawTags = Array.isArray(item?.tags)
    ? item.tags
      .map(resolveConfiguredTagId)
      .filter(Boolean)
    : []
  const normalizedTags = [...new Set(rawTags)]

  if (item?.featured && !hasTag(normalizedTags, 'featured')) {
    normalizedTags.unshift('Featured')
  }

  return normalizedTags
}

function resolveItemCategory(item, tags = []) {
  if (hasTag(tags, 'instagram')) return 'instagram'
  if (hasTag(tags, 'linkedin')) return 'linkedin'
  if (hasTag(tags, 'youtube')) return 'youtube'
  if (hasTag(tags, 'twitter')) return 'twitter'

  const normalizedType = slugifySegment(item?.type)
  if (normalizedType) return normalizedType

  return 'gallery'
}

function createCategoryId(category, count) {
  return `${category}-${String(count).padStart(2, '0')}`
}

function resolveItemImage(itemId) {
  return getGalleryImageById(itemId)
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

function normalizeTagKey(value) {
  return String(value).trim().toLowerCase()
}
</script>
