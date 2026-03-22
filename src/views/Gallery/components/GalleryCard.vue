<template>
  <article
    class="group relative flex h-full min-h-[30rem] flex-col overflow-hidden rounded-[12px] bg-white shadow-[0_12px_32px_-4px_rgba(14,20,27,0.08)] ring-1 ring-slate-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_-10px_rgba(14,20,27,0.14)]"
    :class="{ 'ring-primary/20 shadow-[0_18px_42px_-12px_rgba(24,128,230,0.2)]': item.featured }">
    <div class="flex items-center justify-between gap-4 px-4 pt-4">
      <div class="flex min-w-0 items-center gap-2">
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
      <div class="flex shrink-0 flex-col items-end gap-1>
      <span v-if="item.featured" class=" inline-flex rounded-[6px] pr-1.5 py-1.5">
        <v-icon size="16" class="mr-1 text-yellow-500">mdi-star</v-icon>
      </span>
      <span v-if="item.location" class=" inline-flex max-w-[120px] rounded-[6px] font-medium text-slate-600/80 pr-1.5 py-1.5">
        <v-icon size="14" class="mr-1 text-yellow-500">mdi-map-marker</v-icon>{{item.location}}
      </span>
    </div>
    </div>

    <div class="relative mt-5 h-[240px] overflow-hidden bg-slate-100 sm:h-[260px]">
      <img :src="previewImage" :alt="resolvedAlt"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" loading="lazy"
        @error="handleImageError">
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
</template>

<script setup>
import { computed, ref, watch } from 'vue'
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
const imageLoadFailed = ref(false)
const previewImage = computed(() => {
  const remoteImage = typeof props.item.image === 'string'
    ? props.item.image.trim()
    : ''

  return imageLoadFailed.value || !remoteImage
    ? galleryFallbackSample
    : remoteImage
})
const platformKey = computed(() => getPlatformKey(props.item.type))
const platformLabel = computed(() => getPlatformLabel(platformKey.value))

const platformIcon = computed(() => {
  if (platformKey.value === 'instagram') return 'mdi-instagram'
  if (platformKey.value === 'linkedin') return 'mdi-linkedin'
  if (platformKey.value === 'youtube') return 'mdi-youtube'
  if (platformKey.value === 'twitter') return 'mdi-twitter'
  return 'mdi-image-outline'
})

const platformBadgeClass = computed(() => {
  if (platformKey.value === 'instagram') return 'bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]'
  if (platformKey.value === 'linkedin') return 'bg-[#0a66c2]'
  if (platformKey.value === 'youtube') return 'bg-[#ff0000]'
  if (platformKey.value === 'twitter') return 'bg-[#0f172a]'
  return 'bg-[#004f9a]'
})

const resolvedAlt = computed(() => (
  props.item.alt || props.item.title || 'Gallery item preview'
))

const formattedDate = computed(() => formatDate(props.item.date))

watch(() => props.item.image, () => {
  imageLoadFailed.value = false
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
  if (normalizedType === 'twitter') return 'twitter'
  return 'gallery'
}

function getPlatformLabel(value) {
  if (value === 'instagram') return 'Instagram'
  if (value === 'linkedin') return 'LinkedIn'
  if (value === 'youtube') return 'YouTube'
  if (value === 'twitter') return 'Twitter'
  return 'Uploaded'
}

function handleImageError() {
  if (imageLoadFailed.value) return

  imageLoadFailed.value = true
}
</script>
