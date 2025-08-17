<template>
  <div class="border-l-4 border-[#1980e6] pl-6 py-4 hover:shadow-md transition-shadow duration-200 rounded-lg bg-white">
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-lg font-semibold text-[#0e141b]">{{ workshop.title }}</h3>
      <span class="text-sm text-gray-500">{{ workshop.date }}</span>
    </div>
    <p class="text-gray-600 mb-2">{{ workshop.instructor }}</p>
    <p class="text-gray-600 mb-2">{{ workshop.institution }}</p>
    <p class="text-gray-700 mb-3">{{ workshop.description }}</p>
    <div class="flex flex-wrap gap-2 mb-3">
      <span
        v-for="skill in workshop.skillsLearned"
        :key="skill"
        class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
      >
        {{ skill }}
      </span>
    </div>
    <!-- <div class="flex items-center space-x-4">
      <span class="text-sm text-[#1980e6] font-medium">{{ workshop.duration }}</span>
      <span v-if="workshop.certificate" class="text-sm text-green-600 font-medium">Certificate Received</span>
    </div> -->
  </div>
</template>

<script setup>
defineProps({
  workshop: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
/* Optional scoped styles */
</style>