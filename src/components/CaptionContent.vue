<template>
  <template v-for="segment in segments" :key="segment.key">
    <SmartLink
      v-if="segment.kind === 'link'"
      :text="segment.text"
      :type="segment.linkType"
      :href="segment.href"
      :lookup-text="segment.lookupText"
    />
    <strong v-else-if="segment.kind === 'bold'" class="font-semibold text-slate-500">
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
  const parts = rawValue.split('|').map(part => part.trim())
  const filledParts = parts.filter(Boolean)

  if (filledParts.length === 2 && isUrl(filledParts[1])) {
    return {
      kind: 'link',
      text: filledParts[0],
      href: filledParts[1],
      lookupText: '',
      linkType: 'Link',
    }
  }

  if (filledParts.length === 2) {
    return {
      kind: 'link',
      text: filledParts[0],
      lookupText: filledParts[0],
      linkType: filledParts[1],
    }
  }

  if (filledParts.length >= 3) {
    if (filledParts[2].toLowerCase() === 'link' || isUrl(filledParts[1])) {
      return {
        kind: 'link',
        text: filledParts[0],
        href: filledParts[1],
        lookupText: '',
        linkType: filledParts[2],
      }
    }

    return {
      kind: 'link',
      text: filledParts[0],
      lookupText: filledParts[1],
      linkType: filledParts[2],
    }
  }

  return createTextSegment('text', fallbackText)
}

function createTextSegment(kind, text) {
  return { kind, text }
}

function isUrl(value) {
  return /^https?:\/\//i.test(value)
}
</script>
