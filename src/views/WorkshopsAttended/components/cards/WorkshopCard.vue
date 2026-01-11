<template>
  <div class="border-l-4 border-[#1980e6] pl-5 py-3 hover:shadow-md transition-shadow duration-200 rounded-lg bg-white">
    <!-- Header -->
    <div class="flex items-center justify-between mb-1.5 pr-4">
      <h3 class="text-lg font-semibold text-[#0e141b]">
        {{ workshop.title }}
        <span v-if="workshop.cred_link" class="inline-block ml-1 align-middle">
          <DocumentViewer :src="workshop.cred_link" />
        </span>
      </h3>

      <span class="text-sm text-gray-500">
        {{ workshop.date }}
      </span>
    </div>

    <!-- Instructor -->
    <p v-if="workshop.instructor" class="text-gray-600 mb-1 flex items-center">
      <v-icon size="16" class="mr-2">mdi-account</v-icon>
      <span class="font-medium">Instructor: </span>
      <SmartLink :text="workshop.instructor" type="Person" />
    </p>
    <!-- Institutions -->
    <div v-if="workshop.institution && workshop.institution.length" class="text-gray-600 mb-1 flex items-start">
      <!-- Icon -->
      <v-icon size="16" class="mr-2 mt-0.5">
        mdi-office-building
      </v-icon>

      <!-- Label + list -->
      <div class="flex-1 flex items-start">
        <!-- Label -->
        <div class="font-medium mb-0.5">
          <span>Institution:</span>
        </div>

        <!-- Institutions list -->
        <div class="ml-2">
          <div v-for="(inst, index) in workshop.institution" :key="index">
            <span v-if="inst.department">
              {{ inst.department }},
            </span>

            <SmartLink :text="inst.name" />

            <span v-if="inst.location">
              , {{ inst.location }}
            </span>

            <span v-if="inst.role">
              ({{ inst.role }})
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Duration -->
    <p v-if="workshop.duration" class="text-gray-600 mb-1 flex items-center">
      <v-icon size="16" class="mr-2">mdi-timer-outline</v-icon>
      <span class="font-medium">Duration: </span>
      <span>{{ workshop.duration }}</span>
    </p>
  </div>
</template>

<script setup>
import SmartLink from '@/components/SmartLink.vue'
import DocumentViewer from '@/components/DocumentViewer.vue'

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