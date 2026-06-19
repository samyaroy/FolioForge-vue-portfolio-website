<template>
  <article
    class="group relative flex h-full min-h-[30rem] flex-col overflow-hidden rounded-[12px] bg-white shadow-[0_12px_32px_-4px_rgba(14,20,27,0.08)] ring-1 ring-slate-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_-10px_rgba(14,20,27,0.14)]"
    :class="{ 'ring-primary/20 shadow-[0_18px_42px_-12px_rgba(24,128,230,0.2)]': item.featured }">
    <div class="flex items-start justify-between gap-4 px-4 pt-4">
      <div class="flex min-w-0 w-3/10 items-center gap-2">
        <div v-if="platformIcon"
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] text-white shadow-[0_10px_24px_-16px_rgba(14,20,27,0.75)]"
          :class="platformBadgeClass">
          <v-icon size="18">{{ platformIcon }}</v-icon>
        </div>

        <div class="min-w-0">
          <p class="truncate leading-tight text-xs font-semibold text-base_black block">
            <span class="block">{{ platformLabel }}</span>
            <span v-if="formattedDate" class="text-[11px] font-medium text-slate-600/80">
              {{ formattedDate }}
            </span>
          </p>
        </div>
      </div>
      <div class="flex w-7/10 shrink-0 self-stretch flex-col items-end justify-end gap-1">
        <span v-if="item.event" class="inline-flex w-full items-center justify-end rounded-[6px] text-[11px] text-right text-slate-600/80">
          <v-icon size="14" class="mr-1 shrink-0 text-grey-500">mdi-pillar</v-icon>
          <span class="truncate">{{ item.event }}</span>
        </span>
        <span v-if="item.location" class="inline-flex w-full items-center justify-end rounded-[6px] text-[11px] text-right text-slate-600/80">
          <v-icon size="14" class="mr-1 shrink-0 text-grey-500">mdi-map-marker</v-icon>
          <span class="truncate">{{ item.location }}</span>
        </span>
      </div>
    </div>

    <div class="relative mt-5 h-[240px] overflow-hidden bg-slate-100 sm:h-[260px]">
      <span
        v-if="item.featured"
        class="absolute right-3 top-3 z-10 inline-flex items-center justify-center rounded-[8px] bg-white/90 p-2 shadow-[0_12px_24px_-14px_rgba(14,20,27,0.65)] ring-1 ring-slate-900/10 backdrop-blur-sm">
        <v-icon size="16" class="text-yellow-500">mdi-star</v-icon>
      </span>
      <button
        type="button"
        class="absolute bottom-3 right-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-[8px] border border-white/70 bg-white/90 p-0 text-slate-700 shadow-[0_12px_24px_-14px_rgba(14,20,27,0.65)] backdrop-blur-sm transition-colors hover:border-white hover:bg-white hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        :aria-label="`Zoom image: ${item.title || 'gallery item'}`"
        @click="openZoom"
      >
        <v-icon size="20">mdi-magnify-plus-outline</v-icon>
      </button>
      <img :src="currentImage" :alt="resolvedAlt"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" loading="lazy"
        @error="handleImageError">

      <template v-if="hasMultipleImages">
        <button
          type="button"
          class="absolute left-3 top-1/2 z-10 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 p-0 text-slate-700 shadow-[0_12px_24px_-14px_rgba(14,20,27,0.65)] backdrop-blur-sm transition-colors hover:border-white hover:bg-white hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Previous image"
          @click="showPrevImage"
        >
          <v-icon size="22">mdi-chevron-left</v-icon>
        </button>
        <button
          type="button"
          class="absolute right-3 top-1/2 z-10 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 p-0 text-slate-700 shadow-[0_12px_24px_-14px_rgba(14,20,27,0.65)] backdrop-blur-sm transition-colors hover:border-white hover:bg-white hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Next image"
          @click="showNextImage"
        >
          <v-icon size="22">mdi-chevron-right</v-icon>
        </button>
        <div class="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-slate-950/40 px-2 py-1 backdrop-blur-sm">
          <button
            v-for="(image, index) in images"
            :key="index"
            type="button"
            class="h-1.5 rounded-full p-0 transition-all"
            :class="index === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/60 hover:bg-white/80'"
            :aria-label="`Show image ${index + 1} of ${images.length}`"
            :aria-current="index === currentIndex"
            @click="showImageAt(index)"
          />
        </div>
      </template>
    </div>

    <div class="relative flex flex-1 flex-col gap-4 p-6">
      <h2 class="font-serif text-[1.25rem] font-semibold leading-tight tracking-[-0.02em] text-base_black">
        {{ item.title }}
      </h2>

      <div v-if="hasCaption" class="text-[0.90rem] leading-7 text-slate-500">
        <CaptionContent :text="item.caption" />
      </div>
      <div v-if="visibleTags.length || item.externalUrl" class="mt-auto flex w-full items-end gap-4">
        <div class="w-[90%]">
          <ul v-if="visibleTags.length" class="flex flex-wrap gap-2" aria-label="Gallery item tags">
            <li v-for="tag in visibleTags" :key="tag"
              class="rounded-[5px] bg-blue-100/50 px-1.5 py-1 text-[10px] font-semibold uppercase tracking-[0.10em] text-slate-600">
              {{ tag }}
            </li>
          </ul>
        </div>

        <div class="flex w-[10%] justify-end">
          <a v-if="item.externalUrl" :href="item.externalUrl" target="_blank" rel="noopener noreferrer"
            class="inline-flex h-10 w-10 shrink-0 items-center justify-center text-blue-500 no-underline hover:text-blue-800"
            aria-label="Open milestone">
            <v-icon size="18">mdi-open-in-new</v-icon>
          </a>
        </div>
      </div>
    </div>
  </article>

  <Teleport to="body">
    <Transition name="gallery-zoom-fade">
      <div
        v-if="isZoomOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="zoomTitleId"
        @click.self="closeZoom"
      >
        <div class="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-lg bg-slate-950 shadow-2xl">
          <header class="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3">
            <h2 :id="zoomTitleId" class="truncate text-base font-semibold text-white">
              {{ item.title || 'Gallery image' }}
            </h2>

            <button
              type="button"
              class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] bg-white/10 p-0 text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/70"
              aria-label="Close image zoom"
              @click="closeZoom"
            >
              <v-icon size="22">mdi-close</v-icon>
            </button>
          </header>

          <div class="relative flex min-h-0 flex-1 items-center justify-center bg-black">
            <img
              :src="currentImage"
              :alt="resolvedAlt"
              class="max-h-[82vh] w-full object-contain"
            >

            <template v-if="hasMultipleImages">
              <button
                type="button"
                class="absolute left-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 p-0 text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/70"
                aria-label="Previous image"
                @click="showPrevImage"
              >
                <v-icon size="26">mdi-chevron-left</v-icon>
              </button>
              <button
                type="button"
                class="absolute right-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 p-0 text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/70"
                aria-label="Next image"
                @click="showNextImage"
              >
                <v-icon size="26">mdi-chevron-right</v-icon>
              </button>
              <div class="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
                {{ currentIndex + 1 }} / {{ images.length }}
              </div>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import CaptionContent from '@/components/CaptionContent.vue'
import galleryFallbackSample from '../assets/gallery-fallback-sample.svg'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
})

const formatter = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const visibleTags = computed(() => (
  Array.isArray(props.item.tags)
    ? props.item.tags
      .filter(tag => typeof tag === 'string' && tag.trim())
    : []
))
const hasCaption = computed(() => (
  typeof props.item.caption === 'string' && props.item.caption.trim().length > 0
))
const failedIndices = ref(new Set())
const currentIndex = ref(0)
const isZoomOpen = ref(false)
const images = computed(() => {
  if (Array.isArray(props.item.images) && props.item.images.length) {
    return props.item.images
  }

  const remoteImage = typeof props.item.image === 'string'
    ? props.item.image.trim()
    : ''

  return remoteImage ? [remoteImage] : []
})
const hasMultipleImages = computed(() => images.value.length > 1)
const currentImage = computed(() => {
  const source = images.value[currentIndex.value]

  return !source || failedIndices.value.has(currentIndex.value)
    ? galleryFallbackSample
    : source
})
const platformKey = computed(() => getPlatformKey(props.item.type))
const platformLabel = computed(() => getPlatformLabel(platformKey.value))

const platformIcon = computed(() => {
  if (platformKey.value === 'instagram') return 'mdi-instagram'
  if (platformKey.value === 'linkedin') return 'mdi-linkedin'
  if (platformKey.value === 'youtube') return 'mdi-youtube'
  if (platformKey.value === 'zoom') return 'mdi-video'
  if (platformKey.value === 'twitter') return 'mdi-twitter'
  return 'mdi-image-outline'
})

const platformBadgeClass = computed(() => {
  if (platformKey.value === 'instagram') return 'bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]'
  if (platformKey.value === 'linkedin') return 'bg-[#0a66c2]'
  if (platformKey.value === 'youtube') return 'bg-[#ff0000]'
  if (platformKey.value === 'zoom') return 'bg-[#0b5cff]'
  if (platformKey.value === 'twitter') return 'bg-[#0f172a]'
  return 'bg-[#004f9a]'
})

const resolvedAlt = computed(() => (
  props.item.alt || props.item.title || 'Gallery item preview'
))
const zoomTitleId = computed(() => {
  const itemId = props.item.id || props.item.title || 'item'
  const normalizedId = String(itemId)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `gallery-zoom-title-${normalizedId || 'item'}`
})

const formattedDate = computed(() => formatDate(props.item.date))

watch(() => props.item.id, () => {
  currentIndex.value = 0
  failedIndices.value = new Set()
  closeZoom()
})

watch(isZoomOpen, (isOpen) => {
  if (typeof document === 'undefined') return

  if (isOpen) {
    document.addEventListener('keydown', handleZoomKeydown)
    document.body.style.overflow = 'hidden'
    return
  }

  document.removeEventListener('keydown', handleZoomKeydown)
  document.body.style.overflow = ''
})

onBeforeUnmount(() => {
  if (typeof document === 'undefined') return

  document.removeEventListener('keydown', handleZoomKeydown)
  document.body.style.overflow = ''
})

function formatDate(value) {
  if (!value) return ''

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number)
    return formatter.format(new Date(year, month - 1, day))
  }

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) return value

  return formatter.format(parsedDate)
}

function getPlatformKey(value) {
  const normalizedType = typeof value === 'string'
    ? value.trim().toLowerCase()
    : ''

  if (normalizedType === 'instagram') return 'instagram'
  if (normalizedType === 'linkedin') return 'linkedin'
  if (normalizedType === 'youtube') return 'youtube'
  if (normalizedType === 'zoom') return 'zoom'
  if (normalizedType === 'twitter') return 'twitter'
  return 'gallery'
}

function getPlatformLabel(value) {
  if (value === 'instagram') return 'Instagram'
  if (value === 'linkedin') return 'LinkedIn'
  if (value === 'youtube') return 'YouTube'
  if (value === 'zoom') return 'Zoom'
  if (value === 'twitter') return 'Twitter'
  return 'Uploaded'
}

function handleImageError() {
  if (failedIndices.value.has(currentIndex.value)) return

  const nextFailedIndices = new Set(failedIndices.value)
  nextFailedIndices.add(currentIndex.value)
  failedIndices.value = nextFailedIndices
}

function showImageAt(index) {
  const total = images.value.length
  if (total === 0) return

  currentIndex.value = ((index % total) + total) % total
}

function showPrevImage() {
  showImageAt(currentIndex.value - 1)
}

function showNextImage() {
  showImageAt(currentIndex.value + 1)
}

function openZoom() {
  isZoomOpen.value = true
}

function closeZoom() {
  isZoomOpen.value = false
}

function handleZoomKeydown(event) {
  if (event.key === 'Escape') {
    closeZoom()
    return
  }

  if (!hasMultipleImages.value) return

  if (event.key === 'ArrowRight') showNextImage()
  else if (event.key === 'ArrowLeft') showPrevImage()
}
</script>

<style scoped>
.gallery-zoom-fade-enter-active,
.gallery-zoom-fade-leave-active {
  transition: opacity 160ms ease;
}

.gallery-zoom-fade-enter-from,
.gallery-zoom-fade-leave-to {
  opacity: 0;
}
</style>
