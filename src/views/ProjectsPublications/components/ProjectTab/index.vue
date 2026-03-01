<template>
  <div class="space-y-8">
    <ResearchProjects
      v-if="showResearchProjectsSection"
      :projects="researchProjects"
    />
    <TechnicalProjects
      v-if="showTechnicalProjectsSection"
      :projects="technicalProjects"
    />
    <div
      v-if="!showResearchProjectsSection && !showTechnicalProjectsSection"
      class="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500 italic"
    >
      No project sections are enabled.
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import TechnicalProjects from './components/TechnicalProjects.vue'
import ResearchProjects from './components/ResearchProjects.vue'
import { isFeatureEnabled } from '@/config/featureFlags'

const props = defineProps({
  projects: {
    type: Array,
    default: () => []
  }
})

// Split into categories dynamically
const technicalProjects = computed(() =>
  props.projects.filter(p => p.type === 'Technical Project')
)
const researchProjects = computed(() =>
  props.projects.filter(p => p.type === 'Research Project')
)

const showResearchProjectsSection = isFeatureEnabled('showProjectsPublications.showProjects.showResearchProjects')
const showTechnicalProjectsSection = isFeatureEnabled('showProjectsPublications.showProjects.showTechnicalProjects')

</script>
