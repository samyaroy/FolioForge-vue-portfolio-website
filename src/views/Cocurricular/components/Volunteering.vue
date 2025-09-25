<template>
  <div class="border-l-4 border-green-500 pl-6 py-4">
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-lg font-semibold text-[#0e141b]">{{ volunteering.role }}</h3>
      <span class="text-sm text-gray-500">{{ volunteering.time_period }}</span>
    </div>
    <p class="text-gray-600 mb-2">{{ volunteering.field }}</p>
    <p class="text-gray-700 mb-3">{{ volunteering.organization }}</p>
    <div class="flex flex-wrap gap-2">
      <span v-for="skill in volunteering.skills.split(',').map(item => item.trim())" :key="skill"
        class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
        {{ skill }}
      </span>
    </div>
  </div>


</template>

<script setup>
defineProps({
  volunteering: Array
})

</script>