<template>
  <div class="bg-white rounded-lg shadow-sm p-8">
    <h2 class="text-2xl font-bold text-[#0e141b] mb-6 flex items-center">
      <svg class="w-6 h-6 mr-3 text-[#1980e6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z">
        </path>
      </svg>
      Leadership & Organizations
    </h2>
    <div class="space-y-6">
      <div class="border-l-4 border-[#1980e6] pl-6 py-4">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-lg font-semibold text-[#0e141b]">{{ leadership.role }}</h3>
          <span class="text-sm text-gray-500">{{ leadership.time_period }}</span>
        </div>
        <div class="flex items-center space-x-4 mb-2">
          <div class="flex items-center space-x-1">
            <v-icon small class="text-[#1980e6]">mdi-office-building</v-icon>
            <span class="text-gray-600">{{ leadership.organization }}</span>
            <a :href="leadership.web_link" target="_blank" v-if="leadership.web_link"
              class="text-[#1980e6] hover:underline text-sm">
              <span v-if="leadership.web_link"><v-icon size="16" class="text-gray-500">mdi-open-in-new</v-icon></span>
            </a>
          </div>
          <div v-if="leadership.host" class="flex items-center space-x-1">
            <v-icon small class="text-[#1980e6]">mdi-home</v-icon>
            <span class="text-gray-700">{{ leadership.host }}</span>
          </div>
          <div class="flex items-center space-x-1">
            <v-icon small class="text-[#1980e6]">mdi-map-marker</v-icon>
            <span class="text-gray-700">{{ leadership.location }}</span>
          </div>
        </div>
        <p class="text-gray-700 mb-3">{{ leadership.description }}</p>
        <div class="flex flex-wrap gap-2">
          <span v-for="skill in leadership.skills.split(',').map(item => item.trim())" :key="skill"
            class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
            {{ skill }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>


defineProps({
  leadership: Object
})

</script>