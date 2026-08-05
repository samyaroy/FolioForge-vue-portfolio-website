<template>
  <img
    v-if="faviconSrc && !imageFailed"
    :src="faviconSrc"
    alt=""
    class="mt-0.5 size-4 shrink-0 rounded-sm object-contain"
    loading="lazy"
    @error="imageFailed = true"
    @load="handleImageLoad"
  />
  <v-icon v-else size="16" class="mt-0.5 shrink-0 text-[#1980e6]">
    {{ fallbackIcon }}
  </v-icon>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  url: {
    type: String,
    default: '',
  },
  fallbackIcon: {
    type: String,
    default: 'mdi-link-variant',
  },
})

const imageFailed = ref(false)

// Favicon of the link's domain (e.g. a youtube.com link -> the YouTube mark).
const faviconSrc = computed(() => {
  if (!props.url) return ''
  try {
    const { hostname } = new URL(props.url)
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`
  } catch {
    return ''
  }
})

// Google's favicon service returns a generic 16x16 globe when a domain has no
// real favicon. Detect that undersized result and fall back to the mdi icon.
function handleImageLoad(event) {
  if (event.target?.naturalWidth && event.target.naturalWidth < 32) {
    imageFailed.value = true
  }
}
</script>
