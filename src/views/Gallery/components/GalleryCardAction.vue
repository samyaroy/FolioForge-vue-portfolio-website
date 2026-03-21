<template>
  <a
    v-if="isLink"
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    class="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white no-underline transition-colors duration-200 hover:bg-primary-700 hover:text-white"
    :aria-label="label"
  >
    <span>{{ label }}</span>
    <v-icon size="16">{{ icon }}</v-icon>
  </a>

  <span
    v-else
    class="inline-flex cursor-default items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-400"
    aria-live="polite"
  >
    <span>{{ pendingLabel }}</span>
    <v-icon size="16">mdi-clock-outline</v-icon>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isLink: {
    type: Boolean,
    default: false,
  },
  href: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: 'Open item',
  },
  icon: {
    type: String,
    default: 'mdi-open-in-new',
  },
})

const pendingLabel = computed(() => {
  if (props.label.includes('Instagram')) return 'Instagram link coming soon'
  if (props.label.includes('LinkedIn')) return 'LinkedIn link coming soon'
  if (props.label.includes('YouTube')) return 'YouTube link coming soon'
  if (props.label.includes('Twitter')) return 'Twitter link coming soon'
  return 'Link coming soon'
})
</script>
