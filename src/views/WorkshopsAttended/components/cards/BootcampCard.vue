<template>
  <div
    class="border-l-4 border-[#32e4ff] pl-5 py-3 rounded-lg bg-white
           hover:bg-green-50 hover:shadow-lg transition-all duration-300"
  >
    <!-- PARENT -->
    <div class="flex gap-4">

      <!-- LEFT: 80% -->
      <div class="w-[75%] space-y-2">

        <!-- Header -->
        <div class="flex items-start gap-2">
          <h3 class="text-lg font-semibold text-[#0e141b]">
            {{ bootcamp.title }}
            <span v-if="bootcamp.cred_link" class="inline-block ml-1 align-middle">
              <DocumentViewer :src="bootcamp.cred_link" />
            </span>
          </h3>
        </div>

        <!-- Meta -->
        <div class="space-y-1">

          <p v-if="bootcamp.instructor" class="text-gray-600 flex items-center">
            <v-icon size="small" class="mr-2">mdi-account-tie</v-icon>
            <span class="font-medium mr-1">Instructor:</span>
            <SmartLink :text="bootcamp.instructor" type="Person" />
          </p>

          <!-- Institution (array) -->
          <template v-if="Array.isArray(bootcamp.institution)">
            <div
              v-for="(inst, index) in bootcamp.institution"
              :key="index"
              class="text-gray-600 flex items-start"
            >
              <v-icon size="small" class="mr-2 mt-0.5">mdi-school</v-icon>
              <span>
                <span v-if="index === 0" class="font-medium">Institution: </span>
                <span v-if="inst.department"> {{ inst.department }}, </span>
                <SmartLink v-if="inst.name" :text="inst.name" />
                <span v-if="inst.location">, {{ inst.location }}</span>
              </span>
            </div>
          </template>

          <!-- Institution (object – legacy) -->
          <template v-else-if="bootcamp.institution">
            <p class="text-gray-600 flex items-start">
              <v-icon size="small" class="mr-2 mt-0.5">mdi-school</v-icon>
              <span>
                <span class="font-medium mr-2">Institution:</span>
                <span v-if="bootcamp.institution.Department">
                  {{ bootcamp.institution.Department }},
                </span>
                <SmartLink
                  v-if="bootcamp.institution.Name"
                  :text="bootcamp.institution.Name"
                />
              </span>
            </p>
          </template>

          <p v-if="bootcamp.duration" class="text-gray-600 flex items-center">
            <v-icon size="small" class="mr-2">mdi-clock-outline</v-icon>
            <span class="font-medium mr-1">Duration:</span>
            {{ bootcamp.duration }}
          </p>
        </div>

        <div
          v-if="bootcamp.skillsLearned?.length"
          class="flex flex-wrap gap-1.5"
        >
          <span
            v-for="skill in bootcamp.skillsLearned"
            :key="skill"
            class="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full font-medium"
          >
            {{ skill }}
          </span>
        </div>

        <!-- Footer -->
        <div class="flex items-center gap-4 pt-1">
          <span
            v-if="bootcamp.certificate"
            class="text-sm text-green-600 font-medium flex items-center"
          >
            <v-icon size="small" class="mr-1">mdi-certificate</v-icon>
            Certificate Received
          </span>

          <span
            v-if="bootcamp.level"
            class="text-sm text-blue-600 font-medium bg-blue-100 px-2 py-1 rounded"
          >
            {{ bootcamp.level }}
          </span>
        </div>
      </div>

      <!-- RIGHT: 15% -->
      <div class="w-[25%] text-right text-sm text-gray-500 space-y-1 mr-4">

        <div
          v-if="bootcamp.date"
          class="flex items-center justify-end gap-1"
        >
          <v-icon size="14">mdi-calendar</v-icon>
          <span>{{ bootcamp.date }}</span>
        </div>

        <div
          v-if="bootcamp.location"
          class="flex items-center justify-end gap-1"
        >
          <v-icon size="14">mdi-map-marker</v-icon>
          <span>{{ bootcamp.location }}</span>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import SmartLink from '@/components/SmartLink.vue'
import DocumentViewer from '@/components/DocumentViewer.vue'

defineProps({
  bootcamp: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
/* Optional scoped styles */
</style>
