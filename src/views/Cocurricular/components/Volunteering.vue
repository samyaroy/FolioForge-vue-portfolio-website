<template>
  <div class="bg-white rounded-lg shadow-sm p-8">
    <h2 class="text-2xl font-bold text-[#0e141b] mb-6 flex items-center">
      <svg class="w-6 h-6 mr-3 text-[#1980e6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z">
        </path>
      </svg>
      Volunteering
    </h2>
    <div class="space-y-6">
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
    </div>
  </div>
</template>

<script setup>
defineProps({
  volunteering: Array
})

</script>