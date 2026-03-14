<template>
  <div class="space-y-4">
    <div
      v-if="!currentCollaborators.length && !pastCollaborators.length"
      class="border border-dashed border-slate-300 rounded-lg p-4 text-center text-slate-500 bg-white"
    >
      No collaborators listed yet
    </div>

    <div v-if="currentCollaborators.length" class="space-y-4">
      <CollaboratorCard
        v-for="(collaborator, index) in currentCollaborators"
        :key="`current-${index}`"
        :collaborator="collaborator"
      />
    </div>

    <div v-if="pastCollaborators.length" class="pt-2">
      <!-- Divider styled like the year header in WorkshopsAttended -->
      <div class="flex items-center gap-4 mb-6">
        <span class="text-lg font-semibold text-gray-400">Past Collaborators</span>
        <div class="flex-1 h-px bg-gray-200"></div>
      </div>

      <div class="space-y-4">
        <CollaboratorCard
          v-for="(collaborator, index) in pastCollaborators"
          :key="`past-${index}`"
          :collaborator="collaborator"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import CollaboratorCard from '../cards/CollaboratorCard.vue'

const props = defineProps({
  collaborators: {
    type: Array,
    default: () => [],
  }
})

// Filter current collaborators (period contains "Present")
const currentCollaborators = computed(() => {
  return props.collaborators.filter(collaborator => {
    const period = String(collaborator.period || '').toLowerCase()
    return period.includes('present')
  })
})

// Filter past collaborators (period is a date range without "Present")
const pastCollaborators = computed(() => {
  return props.collaborators.filter(collaborator => {
    const period = String(collaborator.period || '').toLowerCase()
    return period && !period.includes('present')
  })
})
</script>

