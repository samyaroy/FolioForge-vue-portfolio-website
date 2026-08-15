<template>
  <div class="bg-white rounded-lg shadow-sm p-4 sm:p-8 text-sm">
    <h2 class="text-2xl font-bold text-[#0e141b] mb-6">
      Projects Mentored
    </h2>

    <div v-if="projects && projects.length" class="space-y-10">
      <!-- Semester Loop -->
      <div v-for="semesterBlock in visibleProjects" :key="semesterBlock.semester">
        <!-- Semester Heading -->
        <div class="mb-4 flex items-center justify-between border-b pb-2">
          <h3 class="text-lg font-semibold text-[#0e141b]">
            {{ semesterBlock.semester }}
          </h3>
          <button type="button"
            class="flex items-center justify-center focus:outline-none"
            :aria-expanded="!isCollapsed(semesterBlock.semester)"
            :aria-label="isCollapsed(semesterBlock.semester) ? 'Expand semester' : 'Collapse semester'"
            @click="toggleSemester(semesterBlock.semester)">
            <v-icon class="text-[#0e141b]">
              {{ isCollapsed(semesterBlock.semester) ? 'mdi-unfold-more-horizontal' : 'mdi-unfold-less-horizontal' }}
            </v-icon>
          </button>
        </div>

        <!-- Projects -->
        <div class="space-y-6">
          <div v-for="project in semesterBlock.projects" :key="project.title"
            class="border-l-4 border-slate-300 pl-5 py-3 pr-4 bg-slate-50 rounded-lg transition-colors"
            :class="isCollapsed(semesterBlock.semester) ? 'cursor-pointer hover:bg-slate-100' : ''"
            :role="isCollapsed(semesterBlock.semester) ? 'button' : undefined"
            :tabindex="isCollapsed(semesterBlock.semester) ? 0 : undefined"
            :aria-label="isCollapsed(semesterBlock.semester) ? 'Expand semester' : undefined"
            @click="expandSemester(semesterBlock.semester)"
            @keydown.enter="expandSemester(semesterBlock.semester)"
            @keydown.space.prevent="expandSemester(semesterBlock.semester)">
            <div class="flex flex-col gap-4 md:flex-row md:items-start">
              <div class="w-full md:w-[92%]">
                <!-- Header -->
                <div :class="isCollapsed(semesterBlock.semester) ? '' : 'mb-2'">
                  <h4 class="text-md font-semibold text-[#0e141b]">
                    {{ project.title }}
                    <v-tooltip v-if="project.description" location="top">
                      <template #activator="{ props }">
                        <button v-bind="props" type="button"
                          class="ml-1 inline-flex h-5 w-5 shrink-0 translate-y-[2px] items-center justify-center rounded-full text-[#1980e6] transition hover:bg-[#1980e6]/10 focus:outline-none"
                          aria-label="Project description"
                          @click.stop="openDescription(project)">
                          <v-icon size="16">mdi-information-outline</v-icon>
                        </button>
                      </template>
                      <span>Project description</span>
                    </v-tooltip>
                  </h4>
                </div>

                <!-- Meta -->
                <div v-if="!isCollapsed(semesterBlock.semester)" class="space-y-1 text-slate-600">
                  <p v-if="project.students && project.students.length" class="flex items-start">
                    <v-icon size="16" class="mr-2 mt-0.5">mdi-account-multiple</v-icon>
                    <span>
                      <span class="font-medium">Students:</span>&nbsp;
                        <span v-for="(student, index) in project.students" :key="getStudentKey(student, index)">
                          <span>{{ student.name }}</span>
                          <span v-if="student.email" class="ml-1">
                            <a :href="`mailto:${student.email}`" target="_blank" rel="noopener noreferrer"
                              aria-label="Email student" title="Email student">
                            <v-icon size="16" class="text-[#1980e6]">mdi-email-outline</v-icon>
                            </a>
                          </span>
                          <span v-if="getStudentLinkedInUrl(student)" class="ml-1">
                            <a :href="getStudentLinkedInUrl(student)" target="_blank" rel="noopener noreferrer"
                              aria-label="Open student LinkedIn profile" title="Open student LinkedIn profile">
                              <v-icon size="16" class="text-[#1980e6]">mdi-linkedin</v-icon>
                            </a>
                          </span>
                          <span
                          v-if="index < project.students.length - 1">, &nbsp;</span>
                          </span>
                      </span>
                  </p>
                  <p v-if="project.course" class="flex items-center">
                    <v-icon size="16" class="mr-2">mdi-book-open-variant</v-icon>
                    <span class="font-medium">Course / Paper:</span>&nbsp;{{ project.course }}
                  </p>
                  <p v-if="project.registration_number" class="flex items-center mt-2">
                    <v-icon size="16" class="mr-2">mdi-identifier</v-icon>
                    <span class="font-medium">Registration No.:</span>&nbsp;
                    {{ project.registration_number }}
                  </p>
                </div>
              </div>

              <div v-if="!isCollapsed(semesterBlock.semester)"
                class="flex w-full justify-start gap-2 md:w-[8%] md:justify-end">
                <v-tooltip v-for="link in getProjectActionLinks(project)" :key="link.type" location="top">
                  <template #activator="{ props }">
                    <a v-bind="props" :href="link.href" target="_blank"
                      rel="noopener noreferrer"
                      class="flex h-8 w-8 items-center justify-center rounded-full border border-[#1980e6] text-[#1980e6] transition hover:bg-[#1980e6] hover:text-white"
                      :aria-label="link.ariaLabel">
                      <v-icon size="16">{{ link.icon }}</v-icon>
                    </a>
                  </template>
                  <span>{{ link.label }}</span>
                </v-tooltip>
              </div>
            </div>
            <div v-if="getAffiliationName(project) || getAffiliationLocation(project)"
              class="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 text-slate-600 mt-1">
              <div>
                <p v-if="getAffiliationName(project)" class="flex min-w-0 items-center">
                  <v-icon size="16" class="mr-2">mdi-school</v-icon>
                  <span class="font-medium">Affiliation:</span>&nbsp;
                  <SmartLink :text="getAffiliationName(project)" />
                </p>
              </div>
              <div v-if="getAffiliationLocation(project)"
                class="flex items-center justify-self-end text-slate-500">
                <v-icon size="16" class="mr-1">mdi-map-marker</v-icon>
                <span>
                  {{ getAffiliationLocation(project) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="hasMoreProjects" class="flex justify-end">
        <button
          type="button"
          class="text-sm font-semibold text-[#1980e6] transition hover:text-[#0e64b8] focus:outline-none"
          @click="showMoreProjects"
        >
          See more
        </button>
      </div>
    </div>

    <div v-else class="text-center text-gray-500 italic">
      No projects mentored
    </div>

    <ProjectDescriptionModal
      v-model="isDescriptionModalOpen"
      :title="activeProject.title"
      :description="activeProject.description"
    />
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import SmartLink from '@/components/SmartLink.vue'
import ProjectDescriptionModal from './ProjectDescriptionModal.vue'

const props = defineProps({
  projects: {
    type: Array,
    default: () => []
  }
})

const PROJECTS_PER_PAGE = 5
const visibleProjectCount = ref(PROJECTS_PER_PAGE)
const isDescriptionModalOpen = ref(false)
const activeProject = ref({ title: '', description: '' })

const flattenedProjects = computed(() => (
  props.projects.flatMap((semesterBlock) => (
    (semesterBlock.projects || []).map((project) => ({
      semester: semesterBlock.semester,
      project
    }))
  ))
))

const effectiveVisibleProjectCount = computed(() => {
  const flattened = flattenedProjects.value

  if (flattened.length <= visibleProjectCount.value) {
    return flattened.length
  }

  let count = visibleProjectCount.value
  const boundarySemester = flattened[count - 1]?.semester

  while (count < flattened.length && flattened[count]?.semester === boundarySemester) {
    count += 1
  }

  return count
})

const visibleProjects = computed(() => {
  const visibleItems = flattenedProjects.value.slice(0, effectiveVisibleProjectCount.value)
  const groupedProjects = []

  visibleItems.forEach(({ semester, project }) => {
    const currentBlock = groupedProjects[groupedProjects.length - 1]

    if (currentBlock?.semester === semester) {
      currentBlock.projects.push(project)
      return
    }

    groupedProjects.push({
      semester,
      projects: [project]
    })
  })

  return groupedProjects
})

const hasMoreProjects = computed(() => (
  effectiveVisibleProjectCount.value < flattenedProjects.value.length
))

const showMoreProjects = () => {
  visibleProjectCount.value = effectiveVisibleProjectCount.value + PROJECTS_PER_PAGE
}

const openDescription = (project) => {
  activeProject.value = {
    title: project?.title || '',
    description: project?.description || ''
  }
  isDescriptionModalOpen.value = true
}

const collapsedSemesters = reactive({})

// Semesters are collapsed by default; expanded only when explicitly toggled open.
const isCollapsed = (semester) => collapsedSemesters[semester] !== false

const toggleSemester = (semester) => {
  collapsedSemesters[semester] = !collapsedSemesters[semester]
}

// Clicking anywhere on a card while its semester is collapsed opens that semester.
// Expanded cards stay inert so their inner links keep working.
const expandSemester = (semester) => {
  if (isCollapsed(semester)) {
    collapsedSemesters[semester] = false
  }
}

const normalizeLink = (link) => (
  typeof link === 'string' && link.trim() && link !== '#' ? link : ''
)

const getStudentLinkedInValue = (student) => (
  normalizeLink(student?.linkedin) ||
  normalizeLink(student?.Linkedin) ||
  normalizeLink(student?.LinkedIn)
)

const getStudentLinkedInUrl = (student) => {
  const linkedIn = getStudentLinkedInValue(student)

  if (!linkedIn) return ''
  if (/^https?:\/\//i.test(linkedIn)) return linkedIn
  if (/^www\./i.test(linkedIn)) return `https://${linkedIn}`
  if (/^linkedin\.com\//i.test(linkedIn)) return `https://www.${linkedIn}`

  return `https://www.linkedin.com/in/${linkedIn.replace(/^@/, '')}`
}

const getProjectActionLinks = (project) => {
  const credLink = project?.cred_link

  if (typeof credLink === 'string') {
    const report = normalizeLink(credLink)
    return report ? [{
      type: 'report',
      href: report,
      icon: 'mdi-file-document-outline',
      label: 'Project Report',
      ariaLabel: 'Open project report'
    }] : []
  }

  if (!credLink || typeof credLink !== 'object') {
    return []
  }

  return [
    {
      type: 'report',
      href: normalizeLink(credLink.report),
      icon: 'mdi-file-document-outline',
      label: 'Project Report',
      ariaLabel: 'Open project report'
    },
    {
      type: 'github',
      href: normalizeLink(credLink.github),
      icon: 'mdi-github',
      label: 'GitHub Repository',
      ariaLabel: 'Open GitHub repository'
    }
  ].filter(link => link.href)
}

const getStudentKey = (student, index) => {
  if (student?.email) return student.email
  if (getStudentLinkedInUrl(student)) return getStudentLinkedInUrl(student)
  if (student?.name) return student.name
  return `student-${index}`
}

const getAffiliationName = (project) => {
  const affiliation = project?.affiliation

  if (typeof affiliation === 'string') return affiliation
  if (affiliation && typeof affiliation === 'object' && typeof affiliation.name === 'string') {
    return affiliation.name
  }

  return NaN
}

const getAffiliationLocation = (project) => {
  const affiliation = project?.affiliation

  if (affiliation && typeof affiliation === 'object' && typeof affiliation.location === 'string') {
    return affiliation.location
  }

  return NaN
}
</script>
