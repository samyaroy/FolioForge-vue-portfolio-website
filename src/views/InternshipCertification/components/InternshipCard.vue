<template>
  <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
    <div class="flex items-start justify-between mb-4">
      <div class="flex-1">
        <div class="flex items-center gap-4">
          <h3 class="text-xl font-bold text-[#0e141b] mb-2">{{ internship.role }}</h3>

        </div>
        <div class="flex items-start gap-2 text-[#4e7397] text-sm mb-1">
          <v-icon size="16">mdi-domain</v-icon>
          <span>
            <SmartLink :type="'Institute'" :text="internship.company" />
          </span>
        </div>
        <div v-if="internship.department" class="flex items-start gap-2 text-[#4e7397] text-sm mb-1">
          <v-icon size="16">mdi-office-building</v-icon>
          <span>{{ internship.department }}</span>
        </div>
        <div v-if="internship.guide" class="flex items-start gap-2 text-[#4e7397] text-sm mb-1">
          <v-icon size="16">mdi-account-tie</v-icon>
          <span>Supervisor:
            <SmartLink :type="'Person'" :text="internship.guide.name" /><span v-if="internship.guide.designation">,
            </span>
          </span><span v-if="internship.guide.designation">{{ internship.guide.designation }}</span>
        </div>
        <div class="flex items-start gap-2 text-[#4e7397] text-sm mb-1">
          <v-icon size="16">mdi-map-marker</v-icon>
          <span>{{ internship.location }}</span>
        </div>
        <div class="flex items-start gap-2 text-[#4e7397] text-sm mb-1">
          <v-icon size="16">mdi-calendar</v-icon>
          <span>{{ internship.time_period }}</span>
        </div>

        <div v-if="projectList.length"
          class="grid grid-cols-[auto,auto,1fr] gap-x-2 text-[#4e7397] text-sm mb-3 items-start">
          <v-icon size="16" class="mt-[2px]">mdi-puzzle-outline</v-icon>
          <span class="font-medium whitespace-nowrap">Project(s):</span>
          <ul class="grid">
            <li v-for="(project, index) in projectList" :key="index" class="leading-tight">
              <span v-if="projectList.length > 1">&bull; </span>
              <a v-if="project.cred_link" :href="project.cred_link" target="_blank" rel="noopener">{{ project.title
                }}</a>
              <span v-else>{{ project.title }}</span>
            </li>
          </ul>
        </div>
      </div>
      <div class="ml-4 flex items-start gap-2">
        <span v-if="internship.type"
          class="inline-block px-3 py-1 text-xs font-medium bg-[#1980e6] text-white rounded-full">
          {{ internship.type }}
        </span>
        <DocumentViewer :src="internship.cred_link" />
      </div>
    </div>

    <p v-if="internship.description" class="content-justify text-[#0e141b] text-base leading-relaxed mb-4">
      {{ internship.description }}
    </p>

    <div class="flex flex-wrap gap-2">
      <span v-for="skill in internship.skills" :key="skill"
        class="px-3 py-1 text-xs font-medium bg-gray-100 text-[#4e7397] rounded-full">
        {{ skill }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import SmartLink from '@/components/SmartLink.vue'
import DocumentViewer from '@/components/DocumentViewer.vue'

const props = defineProps({
  internship: {
    type: Object,
    required: true
  }
})

const projectList = computed(() => {
  const p = props.internship.project
  if (!p) return []
  return Array.isArray(p) ? p : [p]
})
</script>
