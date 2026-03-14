<template>
  <div class="border-l-4 border-[#1d67fd] pl-5 py-3 hover:shadow-md transition-shadow duration-200 rounded-lg bg-white">
    <!-- HEADER -->
    <div class="flex pr-4">
      <!-- LEFT (80%) -->
      <div class="w-[85%]">
        <div>
          <h3 class="text-lg font-semibold text-[#0e141b]">
            {{ workshop.title }}
            <span v-if="workshop.cred_link" class="inline-block ml-1 align-middle">
              <DocumentViewer :src="workshop.cred_link" />
            </span>
          </h3>
        </div>
        <div>
          <!-- INSTRUCTOR -->
          <p v-if="workshop.instructor" class="text-gray-600 mb-1 mt-2 flex items-center">
            <v-icon size="16" class="mr-2">mdi-account</v-icon>
            <span class="font-medium">Instructor:&nbsp;</span>
            <SmartLink :text="workshop.instructor" type="Person" />
          </p>

          <!-- INSTITUTIONS -->
          <div v-if="workshop.institution && workshop.institution.length" class="text-gray-600 mb-1 flex items-start">
            <v-icon size="16" class="mr-2 mt-0.5">
              mdi-office-building
            </v-icon>

            <div class="flex-1 flex items-start">
              <div class="font-medium mb-0.5">
                <span>Institution:</span>
              </div>

              <div class="ml-2">
                <div v-for="(inst, index) in workshop.institution" :key="index">
                  <span v-if="inst.department">
                    {{ inst.department }},
                  </span>

                  <SmartLink :text="inst.name" />

                  <span v-if="inst.role">
                    ({{ inst.role }})
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- DURATION -->
          <p v-if="workshop.duration" class="text-gray-600 mb-1 flex items-center">
            <v-icon size="16" class="mr-2">mdi-timer-outline</v-icon>
            <span class="font-medium">Duration:&nbsp;</span>
            <span>{{ workshop.duration }}</span>
          </p>
        </div>
      </div>

      <!-- RIGHT (20%) -->
      <div class="w-[15%] text-sm text-gray-500 flex flex-col items-start">
        <!-- Date -->
        <span>{{ workshop.date }}</span>

        <!-- Mode + Location -->
        <div class="flex flex-col items-start mt-1">
          <span class="flex items-center gap-1">
            <v-icon v-if="workshop.mode === 'Online'" size="14">mdi-web</v-icon>

            <v-img v-else-if="workshop.mode === 'Offline'" :src="inPersonIcon" alt="In-Person Icon"
              width="14" height="14" class="d-inline-block" contain />

            <v-icon v-else-if="workshop.mode === 'Hybrid'" size="14">mdi-source-branch</v-icon>

            {{ workshop.mode }}
          </span>

          <span v-if="workshop.institution?.length">
            <v-icon size="14">mdi-map-marker</v-icon> {{ workshop.institution[0].location }}
          </span>
        </div>
      </div>
    </div>


  </div>
</template>

<script setup>
import SmartLink from '@/components/SmartLink.vue'
import DocumentViewer from '@/components/DocumentViewer.vue'

import inPersonIcon from '@/assets/icons/persons-in-a-class-by-flaticon.png'

defineProps({
  workshop: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
/* intentionally empty */
</style>