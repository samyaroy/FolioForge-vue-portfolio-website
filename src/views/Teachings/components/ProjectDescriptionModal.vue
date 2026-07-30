<template>
  <v-dialog v-model="isOpen" max-width="720" scrollable>
    <v-card>
      <!-- Header -->
      <div class="px-6 pt-5 pb-4">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-[#0e141b] text-lg font-bold leading-tight">Project Description</p>
            <p v-if="title" class="text-[#4e7397] text-sm mt-0.5">{{ title }}</p>
          </div>
          <v-btn icon variant="text" density="compact" @click="isOpen = false">
            <v-icon size="20">mdi-close</v-icon>
          </v-btn>
        </div>
      </div>

      <v-divider :style="{ borderColor: '#3b82f6' }" />

      <!-- Description -->
      <v-card-text class="px-6 py-4 overflow-y-auto" style="max-height: 62vh;">
        <p class="content-justify text-sm text-slate-600 whitespace-pre-line">
          <template v-for="segment in segments" :key="segment.key">
            <a v-if="segment.href" :href="segment.href" target="_blank" rel="noopener noreferrer"
              class="text-[#1980e6] hover:underline">{{ segment.text }}</a>
            <SmartLink v-else-if="segment.smart" :text="segment.text" />
            <span v-else>{{ segment.text }}</span>
          </template>
        </p>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from 'vue'
import SmartLink from '@/components/SmartLink.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  description: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// Matches, in order: [label](url) · `Name` (resolved via hyperlink metadata) · a bare URL.
const TOKEN_PATTERN = /\[([^\]]+)\]\(\s*([^\s)]+)\s*\)|`([^`]+)`|((?:https?:\/\/|www\.)[^\s<>]+)/g

// A bare URL greedily swallows trailing sentence punctuation and the ")" of a
// parenthetical it sits inside; hand those characters back to the surrounding text.
const trimBareUrl = (url) => {
  let end = url.length

  while (end > 0) {
    const char = url[end - 1]

    if (/[.,;:!?'"]/.test(char)) {
      end -= 1
      continue
    }

    if (char === ')') {
      const candidate = url.slice(0, end)
      const opened = (candidate.match(/\(/g) || []).length
      const closed = (candidate.match(/\)/g) || []).length

      if (closed > opened) {
        end -= 1
        continue
      }
    }

    break
  }

  return url.slice(0, end)
}

const normalizeHref = (url) => {
  const trimmed = (url || '').trim()

  if (/^(https?:\/\/|mailto:)/i.test(trimmed)) return trimmed
  if (/^www\./i.test(trimmed)) return `https://${trimmed}`

  return ''
}

const segments = computed(() => {
  const text = props.description || ''
  const parsed = []
  let lastIndex = 0

  const pushText = (value) => {
    if (value) parsed.push({ text: value, href: '', smart: false })
  }

  for (const match of text.matchAll(TOKEN_PATTERN)) {
    const [token, label, url, smartName, bareUrl] = match
    pushText(text.slice(lastIndex, match.index))

    if (label !== undefined) {
      const href = normalizeHref(url)
      // An unsupported scheme (javascript:, data:, …) degrades to plain text.
      if (href) parsed.push({ text: label, href, smart: false })
      else pushText(token)
    } else if (smartName !== undefined) {
      parsed.push({ text: smartName, href: '', smart: true })
    } else {
      const cleanUrl = trimBareUrl(bareUrl)
      parsed.push({ text: cleanUrl, href: normalizeHref(cleanUrl), smart: false })
      pushText(bareUrl.slice(cleanUrl.length))
    }

    lastIndex = match.index + token.length
  }

  pushText(text.slice(lastIndex))

  return parsed.map((segment, index) => ({ ...segment, key: `segment-${index}` }))
})
</script>
