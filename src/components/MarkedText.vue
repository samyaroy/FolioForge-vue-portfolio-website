<template>
  <!-- One tag per mark, nested, so combined marks need no special case. The
       text is interpolated rather than set as HTML: authored strings can carry
       angle brackets and must never become markup.

       Bold is set to 550 rather than the browser's 700: it is emphasis inside
       running body text, not a heading, and 700 sat too heavy beside it. Body
       text here resolves to system-ui, which is variable on macOS and Windows,
       so 550 renders as asked; where the family only ships fixed cuts, CSS
       rounds it up to the next one it has. -->
  <component :is="tags[0]" v-if="tags.length" :class="tags[0] === 'strong' ? 'font-[550]' : undefined">
    <MarkedText :text="text" :tags="tags.slice(1)" />
  </component>
  <template v-else>{{ text }}</template>
</template>

<script setup lang="ts">
defineProps<{
  text: string
  /** Element names, outermost first, from emphasisTags(). */
  tags: string[]
}>()
</script>
