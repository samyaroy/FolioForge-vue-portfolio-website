<template>
  <component
    :is="material.url ? 'a' : 'div'"
    :href="material.url || undefined"
    :target="material.url ? '_blank' : undefined"
    :rel="material.url ? 'noopener noreferrer' : undefined"
    class="group flex items-stretch gap-4 border-b border-slate-200 pb-4 no-underline last:border-b-0"
  >
    <div class="flex w-12 shrink-0 justify-center pt-1">
      <div class="flex size-10 items-center justify-center overflow-hidden rounded-full bg-[#1980e6]/10 text-[#1980e6]">
        <img
          v-if="showImage"
          :src="logoSrc"
          :alt="material.distributor || ''"
          class="size-5 object-contain"
          loading="lazy"
          @error="imageFailed = true"
          @load="handleImageLoad"
        />
        <v-icon v-else size="20">{{ fallbackIcon }}</v-icon>
      </div>
    </div>

    <div class="min-w-0 flex-1">
      <div class="flex items-start justify-between gap-3">
        <h3
          class="font-semibold text-[#0e141b]"
          :class="material.url ? 'group-hover:text-[#1980e6]' : ''"
        >
          {{ material.title }}
        </h3>
      </div>
      <p v-if="material.description" class="content-justify mt-2 text-sm leading-6 text-gray-600">
        {{ material.description }}
      </p>
      <p
        v-if="material.instructor || material.distributor"
        class="mt-2 text-xs leading-5 text-gray-500"
      >
        <span v-if="material.instructor">{{ material.instructor }}</span>
        <span v-if="material.instructor && material.distributor"> · </span>
        <span v-if="material.distributor">{{ material.distributor }}</span>
      </p>
    </div>

    <div v-if="material.url" class="flex shrink-0 items-center">
      <span class="inline-flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-[#1980e6]">
        Visit
        <v-icon size="16" class="transition-transform group-hover:translate-x-1">
          mdi-arrow-right
        </v-icon>
      </span>
    </div>
  </component>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  material: {
    type: Object,
    required: true,
  },
})

// Set when a logo image fails to load (or resolves to a generic default),
// so we fall back to an mdi icon.
const imageFailed = ref(false)

const normalizedMeta = computed(() => String(props.material.meta || '').trim().toLowerCase())

// mdi icon chosen from `meta` — the final fallback when no logo image renders.
const metaIcon = computed(() => {
  const iconsByMeta = {
    book: 'mdi-book-open-variant',
    course: 'mdi-school-outline',
    guide: 'mdi-map-outline',
    tutorial: 'mdi-lightbulb-on-outline',
    video: 'mdi-play-circle-outline',
    'video series': 'mdi-play-box-multiple-outline',
  }

  return iconsByMeta[normalizedMeta.value] || 'mdi-file-document-outline'
})

// Optional `logo` from content overrides the auto source icon. It accepts an
// mdi-* token, a full URL, an absolute path, or a bare /logo/<name>.png name.
const overrideLogo = computed(() => String(props.material.logo || '').trim())
const overrideIsMdi = computed(() => overrideLogo.value.startsWith('mdi-'))

// Favicon of the link's domain (e.g. a youtube.com link -> the YouTube mark).
const faviconSrc = computed(() => {
  if (!props.material.url) return ''
  try {
    const { hostname } = new URL(props.material.url)
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`
  } catch {
    return ''
  }
})

// The image shown in the badge: an explicit logo wins; otherwise the favicon,
// except for books which always fall back to their mdi icon.
const logoSrc = computed(() => {
  const override = overrideLogo.value
  if (override) {
    if (overrideIsMdi.value) return ''
    if (/^https?:\/\//.test(override) || override.startsWith('/')) return override
    return `/logo/${override}.png`
  }

  if (normalizedMeta.value === 'book') return ''
  return faviconSrc.value
})

const usingFavicon = computed(() => Boolean(logoSrc.value) && logoSrc.value === faviconSrc.value)

const showImage = computed(() => Boolean(logoSrc.value) && !imageFailed.value)
const fallbackIcon = computed(() => (overrideIsMdi.value ? overrideLogo.value : metaIcon.value))

// Google's favicon service returns a generic 16x16 globe when a domain has no
// real favicon. Detect that undersized result and fall back to the mdi icon
// instead. Only applies to the auto favicon, never to explicit `logo` overrides.
function handleImageLoad(event) {
  if (!usingFavicon.value) return
  if (event.target?.naturalWidth && event.target.naturalWidth < 32) {
    imageFailed.value = true
  }
}
</script>
