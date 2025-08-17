<template>
  <div class="bg-slate-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 h-full">
    <div class="flex flex-col items-center justify-center text-center h-full">
      <v-icon class="text-[#1980e6] mb-2" size="20">{{ icon }}</v-icon>
      <h3 class="text-[#0e141b] text-sm font-bold leading-tight">{{ name }}</h3>
    </div>
  </div>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
/* Custom styles if needed */
</style>

