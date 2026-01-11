<template>
  <div
    class="border-l-4 border-[#10b981] pl-6 py-4 hover:shadow-lg transition-all duration-300 rounded-lg bg-white hover:bg-green-50">
    <div class="flex items-center justify-between mb-3 pr-4">
      <!-- title + icon group -->
      <div class="flex items-center gap-4">
        <h3 class="text-lg font-semibold text-[#0e141b]">
          {{ bootcamp.title }}
          <span v-if="bootcamp.cred_link" class="inline-block ml-1 align-middle">
            <DocumentViewer :src="bootcamp.cred_link" />
          </span>
        </h3>

      </div>

      <!-- date -->
      <span class="text-sm text-gray-500 px-2 py-1 rounded-full">
        {{ bootcamp.date }}
      </span>
    </div>

    <div class="space-y-2 mb-3">
      <p v-if="bootcamp.instructor" class="text-gray-600 items-center">
        <v-icon size="small" class="mr-2">mdi-account-tie</v-icon>
        <span class="font-medium">Instructor: </span><span>
          <SmartLink :text="bootcamp.instructor" :type="'Person'"></SmartLink>
        </span>
      </p>
      <p v-if="bootcamp.institution" class="text-gray-600 items-center">
        <v-icon size="small" class="mr-2">mdi-school</v-icon>
        <span class="font-medium">Institution: </span><span style="white-space: pre"
          v-if="bootcamp.institution.Department"> {{ bootcamp.institution.Department }}</span><span>, <SmartLink
            :text="bootcamp.institution.Name"></SmartLink></span>
      </p>
      <p v-if="bootcamp.duration" class="text-gray-600  items-center">
        <v-icon size="small" class="mr-2">mdi-clock-outline</v-icon>
        <span class="font-medium">Duration: </span> {{ bootcamp.duration }}
      </p>
    </div>

    <p v-if="bootcamp.description" class="text-gray-700 mb-3 text-sm leading-relaxed">{{ bootcamp.description }}</p>

    <div v-if="bootcamp.skillsLearned && bootcamp.skillsLearned.length" class="flex flex-wrap gap-2 mb-3">
      <span v-for="skill in bootcamp.skillsLearned" :key="skill"
        class="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
        {{ skill }}
      </span>
    </div>

    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <span v-if="bootcamp.certificate" class="text-sm text-green-600 font-medium flex items-center">
          <v-icon size="small" class="mr-1">mdi-certificate</v-icon>
          Certificate Received
        </span>
        <span v-if="bootcamp.level" class="text-sm text-blue-600 font-medium bg-blue-100 px-2 py-1 rounded">
          {{ bootcamp.level }}
        </span>
      </div>
      <div v-if="bootcamp.link" class="text-sm">
        <a :href="bootcamp.link" target="_blank"
          class="text-[#10b981] hover:text-[#059669] font-medium flex items-center">
          View Certificate
          <v-icon size="small" class="ml-1">mdi-open-in-new</v-icon>
        </a>
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
