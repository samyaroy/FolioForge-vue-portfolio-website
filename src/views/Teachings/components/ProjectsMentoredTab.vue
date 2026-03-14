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
          <div
            v-for="project in semesterBlock.projects"
            :key="project.title"
            class="border-l-4 border-slate-300 pl-6 py-4 bg-slate-50 rounded-md"
          >
            <!-- Header -->
            <div class="mb-2">
              <h4 class="text-lg font-semibold text-[#0e141b]">
                {{ project.title }}
              </h4>
            </div>

            <!-- Meta -->
            <div class="space-y-1 text-slate-600 text-sm">
              <p v-if="project.course" class="flex items-center">
                <v-icon size="16" class="mr-2">mdi-book-open-variant</v-icon>
                <span class="font-medium">Course:</span>&nbsp;{{ project.course }}
              </p>

              <p
                v-if="project.students && project.students.length"
                class="flex items-start"
              >
                <v-icon size="16" class="mr-2 mt-0.5">mdi-account-multiple</v-icon>
                <span>
                  <span class="font-medium">Students:</span>&nbsp;
                  <span
                    v-for="(student, index) in project.students"
                    :key="student"
                  >
                    <SmartLink :text="student.name" type="person" :href="student.linkedin"/><span v-if="index < project.students.length - 1">, </span>
                  </span>
                </span>
              </p>

              <p v-if="project.registrationNumber" class="flex items-center">
                <v-icon size="16" class="mr-2">mdi-identifier</v-icon>
                <span class="font-medium">Registration No.:</span>&nbsp;
                {{ project.registrationNumber }}
              </p>

              <p v-if="project.affiliation" class="flex items-center">
                <v-icon size="16" class="mr-2">mdi-school</v-icon>
                <span class="font-medium">Affiliation:</span>&nbsp;
                <SmartLink :text="project.affiliation"/>
              </p>
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
</script>