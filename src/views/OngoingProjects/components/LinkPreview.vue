<template>
  <!-- A chat-app style unfurl of one link: the page's image, title and
       description, then the site and an open-in-new-tab icon. The whole card is
       the link. Preview data comes from src/content/linkPreviews.json (see
       scripts/build-link-previews.mjs); a link with none, such as a private
       repository, gets a plain card built from the URL. -->
  <a
    :href="url"
    target="_blank"
    rel="noopener noreferrer"
    :aria-label="`Open ${heading} on ${siteLabel} in a new tab`"
    :title="description || undefined"
    class="group flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-slate-50 transition-colors duration-200 hover:border-[#10b981] hover:bg-white"
  >
    <!-- The open icon sits on the image's corner so the text below needs only
         two short rows. A preview image is cropped a little shorter than its
         usual 1.91:1 to keep the preview level with the project text. -->
    <div class="relative border-b border-slate-200 bg-slate-100">
      <div v-if="image && !imageFailed" class="aspect-[2.4/1] w-full overflow-hidden">
        <img
          :src="image"
          alt=""
          loading="lazy"
          decoding="async"
          referrerpolicy="no-referrer"
          class="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          @error="imageFailed = true"
        />
      </div>
      <div v-else class="flex h-16 items-center justify-center text-slate-400">
        <svg v-if="kind === 'kaggle'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" class="size-10" aria-hidden="true">
          <path fill="currentColor" :d="KAGGLE_PATH" />
        </svg>
        <v-icon v-else size="36">{{ kind === 'github' ? 'mdi-github' : 'mdi-link-variant' }}</v-icon>
      </div>
      <span
        class="absolute right-1.5 top-1.5 inline-flex size-6 items-center justify-center rounded-full border border-[#10b981] bg-white/95 text-[#10b981] shadow-sm transition-colors duration-200 group-hover:bg-[#10b981] group-hover:text-white"
        aria-hidden="true"
      >
        <v-icon size="13">mdi-open-in-new</v-icon>
      </span>
    </div>

    <!-- Title and site only: the card beside it already describes the work,
         so the page's own description would repeat it and stretch the preview
         far past the project text. It stays available as the tooltip. -->
    <div class="flex flex-col gap-1 px-2.5 py-2">
      <p class="line-clamp-2 break-words text-xs font-semibold leading-snug text-[#0e141b]">{{ heading }}</p>
      <span class="flex min-w-0 items-center gap-1 text-[11px] text-gray-500">
        <svg v-if="kind === 'kaggle'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" class="size-3 shrink-0" aria-hidden="true">
          <path fill="currentColor" :d="KAGGLE_PATH" />
        </svg>
        <v-icon v-else size="12" class="shrink-0">{{ kind === 'github' ? 'mdi-github' : 'mdi-web' }}</v-icon>
        <span class="truncate">{{ host }}</span>
      </span>
    </div>
  </a>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import linkPreviews from '@/content/linkPreviews.json'

interface StoredPreview {
  title?: string
  description?: string
  image?: string
  siteName?: string
}

const props = defineProps<{
  url: string
  /** The `cred_link` key the link came from; picks the fallback icon. */
  kind: string
}>()

const KAGGLE_PATH =
  'M464.2 565.5L318.4 384.3L458.2 249C460.8 246.3 459.9 238.5 452.9 238.5L383.7 238.5C380.2 238.5 376.7 240.3 373.2 243.8L240.9 377.5L240.9 71.5C240.9 66.5 238.4 64 233.4 64L181.5 64C176.5 64 174 66.5 174 71.5L174 568.5C174 573.5 176.5 576 181.5 576L233.4 576C238.4 576 240.9 573.5 240.9 568.5L240.9 459.5L271.7 430.2L382.2 570.8C385.2 574.3 388.7 576.1 392.7 576.1L459.6 576.1C463.1 576.1 465.1 575.1 465.6 573.1L464.2 565.5z'

const FALLBACK_SITE: Record<string, string> = { github: 'GitHub', kaggle: 'Kaggle' }

const stored = computed<StoredPreview>(() => (linkPreviews as Record<string, StoredPreview>)[props.url] ?? {})

const parsedUrl = computed(() => {
  try {
    return new URL(props.url)
  } catch {
    return null
  }
})

const host = computed(() => parsedUrl.value?.hostname.replace(/^www\./, '') ?? props.url)

const siteLabel = computed(() => stored.value.siteName || FALLBACK_SITE[props.kind] || host.value)

// Without a stored title, the path names the page well enough: `owner/repo`
// for a repository, the last segment for anything else.
const heading = computed(() => {
  if (stored.value.title) return stored.value.title
  const segments = parsedUrl.value?.pathname.split('/').filter(Boolean) ?? []
  if (props.kind === 'github' && segments.length >= 2) return `${segments[0]}/${segments[1]}`
  const last = segments.at(-1)
  if (!last) return host.value
  try {
    return decodeURIComponent(last).replace(/[-_]+/g, ' ')
  } catch {
    return last
  }
})

const description = computed(() => stored.value.description ?? '')

const image = computed(() => {
  const value = stored.value.image
  return value && /^https?:\/\//i.test(value) ? value : ''
})

// A preview image can disappear (a deleted repository, an expired header);
// the card then falls back to the icon tile rather than a broken image.
const imageFailed = ref(false)
watch(image, () => {
  imageFailed.value = false
})
</script>
