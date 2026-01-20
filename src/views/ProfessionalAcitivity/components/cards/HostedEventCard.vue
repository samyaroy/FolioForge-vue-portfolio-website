<template>
  <div class="border-l-4 border-purple-500 pl-5 py-3 hover:shadow-md transition-shadow duration-200 rounded-lg bg-white">
    <!-- HEADER -->
    <div class="flex pr-4">
      <!-- LEFT (80%) -->
      <div class="w-[85%]">
        <div>
          <h3 class="text-lg font-semibold text-[#0e141b]">
            {{ event.title }}
            <span v-if="event.cred_link" class="inline-block ml-1 align-middle">
              <DocumentViewer :src="event.cred_link" />
            </span>
          </h3>
        </div>
        <div>
          <!-- ROLE -->
          <p v-if="event.role" class="text-gray-600 mb-1 mt-2 flex items-center">
            <v-icon size="16" class="mr-2">mdi-account-tie</v-icon>
            <span class="font-medium">Role:&nbsp;</span>
            <span>{{ event.role }}</span>
          </p>
          
          <!-- INSTITUTIONS -->
          <div v-if="event.institution && event.institution.length" class="text-gray-600 mb-1 flex items-start">
            <v-icon size="16" class="mr-2 mt-0.5">
              mdi-office-building
            </v-icon>

            <div class="flex-1 flex items-start">
              <div class="font-medium mb-0.5">
                <span>Institution:</span>
              </div>

              <div class="ml-2">
                <div v-for="(inst, index) in event.institution" :key="index">
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
        </div>
      </div>

      <!-- RIGHT (20%) -->
      <div class="w-[15%] text-sm text-gray-500 flex flex-col items-start">
        <!-- Date -->
        <span>{{ event.date }}</span>

        <!-- Mode + Location -->
        <div class="flex flex-col items-start mt-1">
          <span class="flex items-center gap-1">
            <v-icon v-if="event.mode === 'Online'" size="14">mdi-web</v-icon>

            <v-img v-else-if="event.mode === 'Offline'" :src="inPersonIcon" alt="In-Person Icon"
              width="14" height="14" class="d-inline-block" contain />

            <v-icon v-else-if="event.mode === 'Hybrid'" size="14">mdi-source-branch</v-icon>

            {{ event.mode }}
          </span>

          <span v-if="event.institution?.length">
            <v-icon size="14">mdi-map-marker</v-icon> {{ event.institution[0].location }}
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
  event: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
/* intentionally empty */
</style>
