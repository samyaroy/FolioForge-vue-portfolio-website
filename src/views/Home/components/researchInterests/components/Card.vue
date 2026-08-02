<template>
  <div
    class="bg-slate-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 h-full"
    @mouseenter="animatedIcon?.startAnimation()"
    @mouseleave="animatedIcon?.stopAnimation()"
  >
    <div class="flex flex-col items-center justify-center text-center h-full">
      <!-- `icon` is an mdi glyph name, or "anim:<name>" for an animated icon. -->
      <AnimatedIcon
        v-if="animatedName"
        ref="animatedIcon"
        :name="animatedName"
        :size="20"
        class="text-[#1980e6] mb-2"
      />
      <v-icon v-else class="text-[#1980e6] mb-2" size="20">{{ icon }}</v-icon>
      <h3 class="text-[#0e141b] text-sm font-bold leading-tight">{{name}}</h3>
    </div>
  </div>
</template>

<script setup>
import { computed, useTemplateRef } from 'vue'
import AnimatedIcon from '@/components/ui/AnimatedIcon.vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  }
})

const ANIM_PREFIX = 'anim:'

const animatedName = computed(() =>
  props.icon.startsWith(ANIM_PREFIX) ? props.icon.slice(ANIM_PREFIX.length) : null
)

// Hovering the whole card drives the icon animation — the 20px glyph is too
// small to be a comfortable hover target on its own.
const animatedIcon = useTemplateRef('animatedIcon')
</script>

<style scoped>
/* Custom styles if needed */
</style>
