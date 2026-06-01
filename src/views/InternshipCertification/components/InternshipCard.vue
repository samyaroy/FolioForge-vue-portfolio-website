<template>
  <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
    <div class="flex items-start justify-between mb-2">
      <div class="flex-1">
        <div class="flex items-center gap-4">
          <h3 class="text-xl font-bold text-[#0e141b] mb-2">
            {{ internship.role }}
            <span v-if="hasCurriculum" class="inline-block ml-2 align-middle">
              <v-tooltip text="View Curriculum" location="top">
                <template #activator="{ props: tooltipProps }">
                  <v-icon
                    v-bind="tooltipProps"
                    size="16"
                    class="cursor-pointer text-[#4e7397] hover:text-[#1980e6] transition-colors"
                    @click="showCurriculumModal = true"
                  >
                    mdi-information-variant-circle-outline
                  </v-icon>
                </template>
              </v-tooltip>
            </span>
          </h3>
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
    <div class="flex items-start text-[#4e7397] text-sm mb-1">
      <v-icon size="16">mdi-domain</v-icon>
      <span class="ml-2 inline-flex flex-wrap items-center gap-x-2 gap-y-1">
        <template v-for="(company, index) in companyList" :key="`${company}-${index}`">
          <SmartLink :type="'Institute'" :text="company" />
          <span v-if="index < companyList.length - 1" class="text-xs font-semibold text-[#4e7397]">X</span>
        </template>
      </span>
    </div>
    <div v-if="internship.department" class="flex items-start gap-2 text-[#4e7397] text-sm mb-1">
      <v-icon size="16">mdi-office-building</v-icon>
      <span>{{ internship.department }}</span>
    </div>
    <div v-if="internship.guide" class="flex items-start gap-1 text-[#4e7397] text-sm mb-1">
      <v-icon size="16">mdi-account-tie</v-icon>
      <span>Supervisor:</span>
      <span>
        <SmartLink :type="'Person'" :text="internship.guide.name" />
        <span v-if="internship.guide.designation"></span>
        <span v-if="internship.guide.designation">, {{ internship.guide.designation }}</span>
      </span>
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

    <p v-if="internship.description" class="content-justify text-[#0e141b] text-base leading-relaxed mb-4">
      {{ internship.description }}
    </p>
    <div class="flex flex-wrap gap-2">
      <span v-for="skill in internship.skills" :key="skill"
        class="px-3 py-1 text-xs font-medium bg-gray-100 text-[#4e7397] rounded-full">
        {{ skill }}
      </span>
    </div>

    <CourseCirriculumModal
      v-model="showCurriculumModal"
      :cirriculum="internship.cirriculum"
      :degree-name="internship.role"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import SmartLink from '@/components/SmartLink.vue'
import DocumentViewer from '@/components/DocumentViewer.vue'
import CourseCirriculumModal from '@/views/Home/components/education/components/CourseCirriculumModal.vue'

const props = defineProps({
  internship: {
    type: Object,
    required: true
  }
})

const showCurriculumModal = ref(false)

const hasCurriculum = computed(() => {
  const curriculum = props.internship.cirriculum
  if (Array.isArray(curriculum)) return curriculum.length > 0
  return curriculum && Object.keys(curriculum).some(k => k !== 'link')
})

const projectList = computed(() => {
  const p = props.internship.project
  if (!p) return []
  return Array.isArray(p) ? p : [p]
})

const companyList = computed(() => {
  const company = props.internship.company
  if (!company) return []
  return Array.isArray(company) ? company.filter(Boolean) : [company]
})
</script>
