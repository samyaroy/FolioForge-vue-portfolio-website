<template>
  <div class="bg-white rounded-lg shadow-sm p-8">
    <h2 class="text-2xl font-bold text-[#0e141b] mb-6">
      Projects Mentored
    </h2>

    <div v-if="projects && projects.length" class="space-y-10">
      <!-- Semester Loop -->
      <div v-for="semesterBlock in projects" :key="semesterBlock.semester">
        <!-- Semester Heading -->
        <h3 class="text-xl font-semibold text-[#0e141b] mb-4 border-b pb-2">
          {{ semesterBlock.semester }}
        </h3>

        <!-- Projects -->
        <div class="space-y-6">
          <div v-for="project in semesterBlock.projects" :key="project.title"
            class="border-l-4 border-slate-300 pl-6 py-4 pr-4 bg-slate-50 rounded-md">
            <div class="flex flex-col gap-4 md:flex-row md:items-start">
              <div class="w-full md:w-[92%]">
                <!-- Header -->
                <div class="mb-2">
                  <h4 class="text-lg font-semibold text-[#0e141b]">
                    {{ project.title }}
                  </h4>
                </div>

                <!-- Meta -->
                <div class="space-y-1 text-slate-600 text-sm">
                  <p v-if="project.students && project.students.length" class="flex items-start">
                    <v-icon size="16" class="mr-2 mt-0.5">mdi-account-multiple</v-icon>
                    <span>
                      <span class="font-medium">Students:</span>&nbsp;
                      <span v-for="(student, index) in project.students" :key="getStudentKey(student, index)">
                        <SmartLink :text="student.name" type="person" :href="student.linkedin" /><span
                          v-if="student.email" class="ml-1"><a :href="`mailto:${student.email}`" target="_blank"
                            rel="noopener noreferrer"><v-icon size="16"
                              class="text-blue-700/70">mdi-email</v-icon></a></span><span
                          v-if="index < project.students.length - 1">, </span>
                      </span>
                    </span>
                  </p>
                  <p v-if="project.course" class="flex items-center">
                    <v-icon size="16" class="mr-2">mdi-book-open-variant</v-icon>
                    <span class="font-medium">Course/Paper:</span>&nbsp;{{ project.course }}
                  </p>
                  <p v-if="project.registration_number" class="flex items-center">
                    <v-icon size="16" class="mr-2">mdi-identifier</v-icon>
                    <span class="font-medium">Registration No.:</span>&nbsp;
                    {{ project.registration_number }}
                  </p>
                </div>
              </div>

              <div class="flex w-full justify-start md:w-[8%] md:justify-end">
                <a v-if="getProjectReportLink(project)" :href="getProjectReportLink(project)" target="_blank"
                  rel="noopener noreferrer"
                  class="flex h-14 w-14 items-center justify-center rounded-full border border-[#1980e6] text-[#1980e6] transition hover:bg-[#1980e6] hover:text-white"
                  aria-label="Open project report" title="Open project report">
                  <v-icon size="20">mdi-file-document-outline</v-icon>
                </a>
              </div>
            </div>
            <div v-if="getAffiliationName(project) || getAffiliationLocation(project)"
              class="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 text-sm text-slate-600">
              <div>
                <p v-if="getAffiliationName(project)" class="flex min-w-0 items-center">
                  <v-icon size="16" class="mr-2">mdi-school</v-icon>
                  <span class="font-medium">Affiliation:</span>&nbsp;
                  <SmartLink :text="getAffiliationName(project)" />
                </p>
              </div>
              <div v-if="getAffiliationLocation(project)"
                class="flex items-center justify-self-end text-sm text-slate-500">
                <v-icon size="16" class="mr-1">mdi-map-marker</v-icon>
                <span>
                  {{ getAffiliationLocation(project) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center text-gray-500 italic">
      No projects mentored
    </div>
  </div>
</template>

<script setup>
import SmartLink from '@/components/SmartLink.vue'

defineProps({
  projects: {
    type: Array,
    default: () => []
  }
})

const getProjectReportLink = (project) => {
  const credLink = project?.cred_link

  if (typeof credLink === 'string') {
    return credLink && credLink !== '#' ? credLink : ''
  }

  if (credLink && typeof credLink === 'object' && typeof credLink.report === 'string') {
    return credLink.report && credLink.report !== '#' ? credLink.report : ''
  }

  return ''
}

const getStudentKey = (student, index) => {
  if (student?.email) return student.email
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
