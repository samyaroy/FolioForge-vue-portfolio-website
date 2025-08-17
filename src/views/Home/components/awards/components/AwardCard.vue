<template>
  <div
    class="flex items-start space-x-4 p-4 border rounded-lg hover:shadow-md transition-shadow duration-200"
  >
    <!-- Icon Circle -->
    <div class="flex-shrink-0">
      <div class="w-12 h-12 bg-[#ffffff] rounded-full flex items-center justify-center">
        <v-icon :class="iconColor" color="#1980e6" size="24"> mdi-decagram</v-icon>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-lg font-semibold text-[#0e141b]">{{ title }}</h3>
        <span class="text-sm text-gray-500">{{ year }}</span>
      </div>
      <p class="text-gray-600 mb-2">{{ organization }}</p>
      <p class="text-gray-700 mb-3">{{ description }}</p>
      <div class="flex items-center space-x-4">
        <span class="text-sm font-medium text-[#1980e6]">{{ category }}</span>
        <span
          v-if="prize"
          class="text-sm text-green-600 font-medium"
        >{{ prize }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  year: String,
  organization: String,
  description: String,
  category: String,
  prize: String,
});
</script>