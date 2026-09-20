<template>
  <!-- Floated so it lands at the right margin of the line the sentence ended
       on, rather than on a row of its own: the reference belongs to that line.
       If the last line has no room left, it drops to the next one, still right.
       Styling matches the "See other Internships" links on the home page, since
       this is the same affordance reached from inside a description. -->
  <component
    :is="reference.internal ? RouterLink : 'a'"
    v-bind="reference.internal
      ? { to: reference.target }
      : { href: reference.target, target: '_blank', rel: 'noopener noreferrer' }"
    class="float-right ml-4 flex items-center gap-1 text-[#1980e6] hover:text-[#0e141b] text-sm font-medium transition-colors duration-200"
  >
    {{ reference.label }}
    <v-icon size="16" class="arrow-jiggle text-[#1980e6]">mdi-arrow-right</v-icon>
  </component>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { CrossReference } from '@/utils/crossReference'

defineProps<{ reference: CrossReference }>()
</script>
