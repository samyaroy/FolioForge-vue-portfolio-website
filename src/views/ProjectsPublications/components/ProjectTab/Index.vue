<template>
  <div class="space-y-8">
    <ResearchProjects :projects="researchProjects" />
    <TechnicalProjects :projects="technicalProjects" />
  </div>
</template>

<script setup>
import { computed, watchEffect } from 'vue'
import TechnicalProjects from './components/TechnicalProjects.vue'
import ResearchProjects from './components/ResearchProjects.vue'

const props = defineProps({
  projects: {
    type: Array,
    default: () => []
  }
})

// Split into categories dynamically
const technicalProjects = computed(() =>
  props.projects.filter(p => p.category === 'Technical')
)
const researchProjects = computed(() =>
  props.projects.filter(p => p.category === 'Research')
)
watchEffect(() => {
  console.log(props.projects)
  console.log("Technical Projects:", technicalProjects.value)
  console.log("Research Projects:", researchProjects.value)
})

</script>