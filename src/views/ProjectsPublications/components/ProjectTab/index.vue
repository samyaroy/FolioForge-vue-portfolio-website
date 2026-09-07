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
    <OtherProjects
      v-if="showOtherProjectsSection"
      :projects="minorProjects"
    />
    <div
      v-if="!showResearchProjectsSection && !showTechnicalProjectsSection && !showOtherProjectsSection"
      class="bg-white rounded-lg shadow-sm p-4 sm:p-8 text-center text-gray-500 italic"
    >
      No project sections are enabled.
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import TechnicalProjects from './components/TechnicalProjects.vue'
import ResearchProjects from './components/ResearchProjects.vue'
import OtherProjects from './components/OtherProjects.vue'
import { isFeatureEnabled } from '@/config/featureFlags'

defineOptions({
  name: 'ProjectTabSection'
})

const props = defineProps({
  projects: {
    type: [Array, Object],
    default: () => []
  }
})

const toArray = (value) => (Array.isArray(value) ? value : [])
const sectionArray = (...values) => values.find(Array.isArray) || []

const projectSections = computed(() => {
  if (Array.isArray(props.projects)) {
    return {
      research: props.projects.filter(p => p.type === 'Research Project'),
      technical: props.projects.filter(p => p.type === 'Technical Project'),
      other: props.projects.filter(p => p.type === 'Minor Project')
    }
  }

  return {
    research: sectionArray(props.projects?.research_projects, props.projects?.researchProjects),
    technical: sectionArray(props.projects?.technical_projects, props.projects?.technicalProjects),
    other: sectionArray(props.projects?.other_projects, props.projects?.otherProjects, props.projects?.minor_projects, props.projects?.minorProjects)
  }
})

const technicalProjects = computed(() => toArray(projectSections.value.technical))
const researchProjects = computed(() => toArray(projectSections.value.research))
const minorProjects = computed(() => toArray(projectSections.value.other))

const showResearchProjectsSection = isFeatureEnabled('showProjectsPublications.showProjects.showResearchProjects')
const showTechnicalProjectsSection = isFeatureEnabled('showProjectsPublications.showProjects.showTechnicalProjects')
const showOtherProjectsSection = isFeatureEnabled('showProjectsPublications.showProjects.showOtherProjects')

</script>
