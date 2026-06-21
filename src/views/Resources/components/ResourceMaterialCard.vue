<template>
  <component
    :is="material.url ? 'a' : 'div'"
    :href="material.url || undefined"
    :target="material.url ? '_blank' : undefined"
    :rel="material.url ? 'noopener noreferrer' : undefined"
    class="group grid grid-cols-[3rem_minmax(0,1fr)] gap-4 border-b border-slate-200 pb-4 no-underline last:border-b-0 sm:grid-cols-[10%_minmax(0,1fr)]"
  >
    <div class="flex justify-center pt-1">
      <div class="flex size-10 items-center justify-center rounded-full bg-[#1980e6]/10 text-[#1980e6]">
        <v-icon size="20">{{ materialIcon }}</v-icon>
      </div>
    </div>

    <div class="min-w-0">
      <div class="flex items-start justify-between gap-3">
        <h3
          class="font-semibold text-[#0e141b]"
          :class="material.url ? 'group-hover:text-[#1980e6]' : ''"
        >
          {{ material.title }}
          <v-icon
            v-if="material.url"
            size="14"
            class="ml-1 text-slate-400 group-hover:text-[#1980e6]"
          >
            mdi-open-in-new
          </v-icon>
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
  </component>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  material: {
    type: Object,
    required: true,
  },
})

const materialIcon = computed(() => {
  const normalizedMeta = String(props.material.meta || '').trim().toLowerCase()

  const iconsByMeta = {
    book: 'mdi-book-open-variant',
    course: 'mdi-school-outline',
    guide: 'mdi-map-outline',
    tutorial: 'mdi-lightbulb-on-outline',
    video: 'mdi-play-circle-outline',
    'video series': 'mdi-play-box-multiple-outline',
  }

  return iconsByMeta[normalizedMeta] || 'mdi-file-document-outline'
})
</script>
