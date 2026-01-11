<template>
  <div class="border-l-4 border-green-500 pl-6 py-4">
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-lg font-semibold text-[#0e141b]">
        {{ volunteering.role }}
        <span v-if="volunteering.cred_link" class="inline-block ml-1 align-middle">
          <DocumentViewer :src="volunteering.cred_link" />
        </span>
      </h3>

      <div class="text-sm text-gray-500 flex flex-col items-end">
        <span v-for="(period, index) in volunteering.time_period.split(';')" :key="index">
          {{ period.trim() }}
        </span>
      </div>
    </div>
    <p class="text-gray-600 mb-2">{{ volunteering.field }}</p>
    <p class="text-gray-700 mb-3">{{ volunteering.organization }}</p>
    <div>
      <div class="flex flex-wrap gap-2 mb-1">
        <span v-for="skill in volunteering.skills.split(',').map(item => item.trim())" :key="skill"
          class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
          {{ skill }}
        </span>
      </div>
      <div v-if="volunteering.details_cred" class="text-right">
        <a :href="volunteering.details_cred" target="_blank" class="text-[#1980e6] hover:underline text-sm">
          See Details →
        </a>
      </div>

    </div>
  </div>


</template>

<script setup>
import DocumentViewer from '@/components/DocumentViewer.vue'

defineProps({
  volunteering: Array
})

</script>