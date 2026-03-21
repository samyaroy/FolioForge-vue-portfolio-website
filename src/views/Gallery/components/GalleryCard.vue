<template>
  <article
    class="relative flex h-full min-h-[30rem] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    :class="{ 'border-sky-200': item.featured }"
  >
    <div class="relative aspect-[16/10] overflow-hidden bg-slate-100">
      <div
        v-if="platformIcon"
        class="absolute left-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white/90 text-primary shadow-sm backdrop-blur-sm"
      >
        <v-icon size="18">{{ platformIcon }}</v-icon>
      </div>

      <span
        v-if="item.featured"
        class="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-white/90 text-primary shadow-sm backdrop-blur-sm"
      >
        <v-icon size="12">mdi-star</v-icon>
      </span>

      <img
        v-if="previewImage"
        :src="previewImage"
        :alt="resolvedAlt"
        class="h-full w-full object-cover"
        loading="lazy"
      >

      <div
        v-else
        class="flex h-full w-full items-end bg-gradient-to-br from-slate-100 via-white to-sky-50 p-6"
      >
        <div class="max-w-[15rem] rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur-sm">
          <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            {{ platformLabel }}
          </p>
          <p class="mt-2 text-sm font-semibold leading-4 text-base_black">
            {{ item.title }}
          </p>
        </div>
      </div>
    </div>

    <div class="relative flex flex-1 flex-col gap-3 p-6">
      <div class="flex items-center justify-between gap-4">
        <span class="inline-flex w-fit rounded-full bg-sky-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          {{ platformLabel }}
        </span>
        <span v-if="formattedDate" class="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
          {{ formattedDate }}
        </span>
      </div>

      <h2 class="overflow-hidden font-serif text-xl font-bold leading-tight text-base_black [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
        {{ item.title }}
      </h2>
      <p class="overflow-hidden text-sm leading-6 text-slate-500 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4]">
        {{ item.caption }}
      </p>

      <ul v-if="visibleTags.length" class="flex flex-wrap gap-2" aria-label="Gallery item tags">
        <li v-for="tag in visibleTags" :key="tag" class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {{ tag }}
        </li>
      </ul>

      <div class="mt-auto flex items-center justify-end">
        <CardAction
          v-if="showsAction"
          :is-link="hasExternalLink"
          :href="item.externalUrl"
          :label="actionLabel"
          :icon="ctaIcon"
        />
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import CardAction from './GalleryCardAction.vue'

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

const hiddenCardTags = new Set(['featured', 'instagram', 'linkedin', 'youtube', 'twitter'])

const visibleTags = computed(() => (
  Array.isArray(props.item.tags)
    ? props.item.tags
      .filter(tag => !hiddenCardTags.has(String(tag).trim().toLowerCase()))
      .slice(0, 3)
    : []
))
const previewImage = computed(() => props.item.image || '')
const socialPlatform = computed(() => {
  if (hasTag(props.item.tags, 'instagram')) return 'Instagram'
  if (hasTag(props.item.tags, 'linkedin')) return 'LinkedIn'
  if (hasTag(props.item.tags, 'youtube')) return 'YouTube'
  if (hasTag(props.item.tags, 'twitter')) return 'Twitter'
  return ''
})

const platformLabel = computed(() => (
  socialPlatform.value || toDisplayLabel(props.item.category || props.item.type || 'gallery')
))

const platformIcon = computed(() => {
  if (socialPlatform.value === 'Instagram') return 'mdi-instagram'
  if (socialPlatform.value === 'LinkedIn') return 'mdi-linkedin'
  if (socialPlatform.value === 'YouTube') return 'mdi-youtube'
  if (socialPlatform.value === 'Twitter') return 'mdi-twitter'
  return ''
})

const hasExternalLink = computed(() => Boolean(props.item.externalUrl))
const showsAction = computed(() => hasExternalLink.value)

const actionLabel = computed(() => {
  if (socialPlatform.value === 'Instagram') return 'Open on Instagram'
  if (socialPlatform.value === 'LinkedIn') return 'Open on LinkedIn'
  if (socialPlatform.value === 'YouTube') return 'Open on YouTube'
  if (socialPlatform.value === 'Twitter') return 'Open on Twitter'
  return 'Open link'
})

const ctaIcon = computed(() => (
  socialPlatform.value === 'LinkedIn' ? 'mdi-arrow-top-right' : 'mdi-open-in-new'
))

const resolvedAlt = computed(() => (
  props.item.alt || props.item.title || 'Gallery item preview'
))

const formattedDate = computed(() => formatDate(props.item.date))

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

function hasTag(tags, expectedTag) {
  const normalizedExpectedTag = expectedTag.trim().toLowerCase()

  return Array.isArray(tags) && tags.some(tag => (
    typeof tag === 'string' && tag.trim().toLowerCase() === normalizedExpectedTag
  ))
}

function toDisplayLabel(value) {
  if (typeof value !== 'string' || !value.trim()) return 'Gallery'

  return value
    .trim()
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}
</script>
