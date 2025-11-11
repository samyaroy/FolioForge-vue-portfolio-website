<template>
  <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
    <div class="flex items-start justify-between mb-2">
      <div class="flex-1">
        <h3 class="text-xl font-bold text-[#0e141b] mb-2">{{ certification.title }}</h3>
        <div class="flex items-center gap-2 text-[#4e7397] text-sm mb-1">
          <v-icon size="16">mdi-school</v-icon>
          <span><SmartLink :type="'Institute'" :text="certification.issuer.Institution" /></span><span v-if="certification.issuer.Platform">- <SmartLink :type="'Institute'" :text="certification.issuer.Platform" /></span>
        </div>
        <div v-if="certification.instructor" class="flex items-center gap-2 text-[#4e7397] text-sm mb-1">
          <v-icon size="16">mdi-account</v-icon>
          <span><SmartLink :type="'Person'" :text="certification.instructor" /></span>
        </div>
        <div class="flex items-center gap-2 text-[#4e7397] text-sm mb-3">
          <v-icon size="16">mdi-calendar</v-icon>
          <span>{{ certification.date }} <span v-if="certification.duration">({{ certification.duration
          }})</span></span>
        </div>
      </div>
      <div class="ml-4 flex flex-col gap-2">
        <a :href="certification.cred_link" target="_blank" rel="noopener noreferrer">
          <span v-if="certification.cred_link"
            class="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
            <v-icon size="14" class="mr-1">mdi-file-document-outline</v-icon>
          </span>
        </a>
      </div>
    </div>

    <div v-if="certification.skills && certification.skills.length" class="flex flex-wrap gap-2 mb-4">
      <span v-for="skill in certification.skills" :key="skill"
        class="px-3 py-1 text-xs font-medium bg-gray-100 text-[#4e7397] rounded-full">
        {{ skill }}
      </span>
    </div>
  </div>
</template>

<script setup>
import SmartLink from '@/components/SmartLink.vue'

defineProps({
  certification: {
    type: Object,
    required: true
  }
})
</script>
