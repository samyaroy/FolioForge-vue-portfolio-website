<template>
  <div class="space-y-4">
    <div
      v-if="!sections.current.length && !sections.past.length"
      class="border border-dashed border-slate-300 rounded-lg p-4 text-center text-slate-500 bg-white"
    >
      <span class="inline-flex items-end gap-2 border-b-2 border-slate-300 pb-0.5">
        <AnimatedIcon name="dino" :size="28" class="-mb-0.5 shrink-0" />
        <span>No collaborators listed yet</span>
      </span>
    </div>

    <!-- Current collaborators come first, under no heading of their own. -->
    <div v-if="sections.current.length" class="space-y-5">
      <section
        v-for="group in sections.current"
        :key="`current-${group.kind}`"
        :aria-label="`Current ${group.label.toLowerCase()}`"
      >
        <p v-if="sections.current.length > 1" class="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          {{ group.label }}
        </p>
        <div class="space-y-3">
          <CollaboratorCard
            v-for="(collaborator, index) in group.people"
            :key="`current-${group.kind}-${index}`"
            :collaborator="collaborator"
          />
        </div>
      </section>
    </div>

    <div v-if="sections.past.length" class="pt-2">
      <!-- Divider styled like the year header in WorkshopsAttended -->
      <div class="flex items-center gap-4 mb-5">
        <span class="text-lg font-semibold text-gray-400">Past Collaborators</span>
        <div class="flex-1 h-px bg-gray-200"></div>
      </div>

      <div class="space-y-5">
        <section
          v-for="group in sections.past"
          :key="`past-${group.kind}`"
          :aria-label="`Past ${group.label.toLowerCase()}`"
        >
          <p v-if="sections.past.length > 1" class="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {{ group.label }}
          </p>
          <div class="space-y-3">
            <CollaboratorCard
              v-for="(collaborator, index) in group.people"
              :key="`past-${group.kind}-${index}`"
              :collaborator="collaborator"
            />
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import AnimatedIcon from '@/components/ui/AnimatedIcon.vue'
import { computed } from 'vue'
import CollaboratorCard from '../cards/CollaboratorCard.vue'
import { groupCollaborators } from '@/utils/collaboratorGroups'

const props = defineProps({
  collaborators: {
    type: Array,
    default: () => [],
  }
})

// Current and past, each split into mentors & guides and peers. A section
// labels its groups only when it has both; one with just peers (or just
// mentors) shows its cards with no label over them.
const sections = computed(() => groupCollaborators(props.collaborators))
</script>
