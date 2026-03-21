<template>
  <template v-for="segment in segments" :key="segment.key">
    <SmartLink
      v-if="segment.kind === 'link'"
      :text="segment.text"
      :type="segment.linkType"
      :lookup-text="segment.lookupText"
    />
    <strong v-else-if="segment.kind === 'bold'" class="font-semibold text-slate-700">
      {{ segment.text }}
    </strong>
    <em v-else-if="segment.kind === 'italic'" class="italic">
      {{ segment.text }}
    </em>
    <span v-else>{{ segment.text }}</span>
  </template>
</template>

<script setup>
import { computed } from 'vue'
import SmartLink from './SmartLink.vue'

const props = defineProps({
  text: {
    type: String,
    default: '',
  },
})

const TOKEN_PATTERN = /\[\[([^[\]]+?)\]\]|\*\*([^*]+?)\*\*|\*([^*]+?)\*/g

const segments = computed(() => parseCaption(props.text))

function parseCaption(text) {
  if (!text) return []

  const parsedSegments = []
  let lastIndex = 0

  for (const match of text.matchAll(TOKEN_PATTERN)) {
    const matchIndex = match.index ?? 0

    if (matchIndex > lastIndex) {
      parsedSegments.push(createTextSegment('text', text.slice(lastIndex, matchIndex)))
    }

    if (match[1]) {
      parsedSegments.push(parseLinkSegment(match[1], match[0]))
    } else if (match[2]) {
      parsedSegments.push(createTextSegment('bold', match[2]))
    } else if (match[3]) {
      parsedSegments.push(createTextSegment('italic', match[3]))
    }

    lastIndex = matchIndex + match[0].length
  }

  if (lastIndex < text.length) {
    parsedSegments.push(createTextSegment('text', text.slice(lastIndex)))
  }

  return parsedSegments
    .filter(segment => segment.text)
    .map((segment, index) => ({
      ...segment,
      key: `${segment.kind}-${index}`,
    }))
}

function parseLinkSegment(rawValue, fallbackText) {
  const parts = rawValue.split('|').map(part => part.trim()).filter(Boolean)

  if (parts.length === 2) {
    return {
      kind: 'link',
      text: parts[0],
      lookupText: parts[0],
      linkType: parts[1],
    }
  }

  if (parts.length >= 3) {
    return {
      kind: 'link',
      text: parts[0],
      lookupText: parts[1],
      linkType: parts[2],
    }
  }

  return createTextSegment('text', fallbackText)
}

function createTextSegment(kind, text) {
  return { kind, text }
}
</script>
