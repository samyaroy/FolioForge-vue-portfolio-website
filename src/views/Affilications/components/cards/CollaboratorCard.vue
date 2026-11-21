<template>
  <!-- Three short lines: name and dates; role, organisation and place; the
       projects as tags. No photo, so each card stays about as tall as its text. -->
  <article class="bg-white border border-slate-200 rounded-lg px-4 py-3 shadow-sm hover:shadow-md transition-shadow space-y-1">
    <div class="flex flex-wrap items-center justify-between gap-x-4">
      <h3 class="text-lg font-semibold text-slate-900">
        <SmartLink :text="collaborator.name || 'Collaborator'" :type="'Person'" /><AnimatedIcon name="external-link" :size="14" class="text-[#4e7397] ml-2 inline-block align-middle" />
      </h3>
      <span v-if="collaborator.period" class="text-sm text-gray-500 whitespace-nowrap">
        {{ collaborator.period }}
      </span>
    </div>

    <div v-if="role || collaborator.affiliation || collaborator.location" class="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-sm">
      <span v-if="role" class="font-medium text-slate-700">{{ role }}</span>
      <span v-if="collaborator.affiliation" class="inline-flex items-center gap-1 text-gray-600">
        <v-icon size="16" class="text-[#4e7397]">mdi-domain</v-icon>
        {{ collaborator.affiliation }}
      </span>
      <span v-if="collaborator.location" class="inline-flex items-center gap-1 text-gray-500">
        <v-icon size="16" class="text-[#4e7397]">mdi-map-marker</v-icon>
        {{ collaborator.location }}
      </span>
    </div>

    <div v-if="projects.length" class="flex flex-wrap items-center gap-1.5 pt-1">
      <span class="mr-0.5 text-sm text-[#0e141b]">Projects:</span>
      <span
        v-for="(project, index) in projects"
        :key="`${index}-${project}`"
        class="rounded-full bg-blue-100/50 px-2.5 py-0.5 text-[13px] text-slate-600"
      >
        {{ project }}
      </span>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import SmartLink from '@/components/SmartLink.vue'
import AnimatedIcon from '@/components/ui/AnimatedIcon.vue'

const props = defineProps({
  collaborator: {
    type: Object,
    required: true,
  },
})

const text = value => (typeof value === 'string' ? value.trim() : '')

// What the person was to you, in your words: "Thesis supervisor", "Co-author".
const role = computed(() => text(props.collaborator?.role))

// A list of titles; a single title written as plain text is one project.
const projects = computed(() => {
  const value = props.collaborator?.projects
  return (Array.isArray(value) ? value : [value]).map(text).filter(Boolean)
})
</script>
