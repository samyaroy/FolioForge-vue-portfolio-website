<template>
  <div class="bg-white  shadow-sm p-8">
    <h2 class="text-2xl font-bold text-[#0e141b] mb-6">
      Courses Taught
    </h2>

    <div v-if="courses && courses.length" class="space-y-10">
      <!-- Semester Loop -->
      <div v-for="semesterBlock in courses" :key="semesterBlock.semester">
        <!-- Semester Heading -->
        <h3 class="text-xl font-semibold text-[#0e141b] mb-4 border-b pb-2">
          {{ semesterBlock.semester }}
        </h3>

        <!-- Courses -->
        <div class="space-y-6">
          <div
            v-for="course in semesterBlock.courses"
            :key="course.title"
            class="border-l-4 border-slate-300 pl-6 py-4 bg-slate-50 rounded-md"
          >
            <!-- Header -->
            <div class="flex items-start justify-between mb-2">
              <h4 class="text-lg font-semibold text-[#0e141b]">
                {{ course.title }}
              </h4>

              <span
                v-if="course.role"
                class="text-xs font-medium bg-slate-200 text-slate-700 px-2 py-1 rounded"
              >
                {{ course.role }}
              </span>
            </div>

            <!-- Meta -->
            <div class="space-y-1 text-slate-600 text-sm">
              <p v-if="course.institution" class="flex items-center">
                <v-icon size="16" class="mr-2">mdi-school</v-icon>
                {{ course.institution }}
              </p>

              <p
                v-if="course.collaborators && course.collaborators.length"
                class="flex items-start"
              >
                <v-icon size="16" class="mr-2 mt-0.5">mdi-account-multiple</v-icon>
                <span>
                  <span class="font-medium">Collaborators:</span>
                  <span
                    v-for="(collab, index) in course.collaborators"
                    :key="collab"
                  >
                    {{ collab }}<span v-if="index < course.collaborators.length - 1">, </span>
                  </span>
                </span>
              </p>

              <p v-if="course.students" class="flex items-center">
                <v-icon size="16" class="mr-2">mdi-account-group</v-icon>
                {{ course.students }} students enrolled
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center text-gray-500 italic">
      No teaching experience listed
    </div>
  </div>
</template>

<script setup>
// import SmartLink from '@/components/SmartLink.vue'

defineProps({
  courses: {
    type: Array,
    default: () => []
  }
})
</script>