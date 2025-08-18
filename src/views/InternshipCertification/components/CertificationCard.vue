<template>
  <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
    <div class="flex items-start justify-between mb-4">
      <div class="flex-1">
        <h3 class="text-xl font-bold text-[#0e141b] mb-2">{{ certification.title }}</h3>
        <div class="flex items-center gap-2 text-[#4e7397] text-sm mb-1">
          <v-icon size="16">mdi-school</v-icon>
          <span>{{ certification.institution }}</span>
        </div>
        <div class="flex items-center gap-2 text-[#4e7397] text-sm mb-1">
          <v-icon size="16">mdi-account</v-icon>
          <span>{{ certification.instructor }}</span>
        </div>
        <div class="flex items-center gap-2 text-[#4e7397] text-sm mb-3">
          <v-icon size="16">mdi-calendar</v-icon>
          <span>{{ certification.date }} ({{ certification.duration }})</span>
        </div>
      </div>
      <div class="ml-4 flex flex-col gap-2">
        <span class="inline-block px-3 py-1 text-xs font-medium bg-[#1980e6] text-white rounded-full">
          {{ certification.level }}
        </span>
        <span v-if="certification.certificate" class="inline-block px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
          Certificate
        </span>
      </div>
    </div>

    <div class="flex flex-wrap gap-2 mb-4">
      <span 
        v-for="skill in certification.skills" 
        :key="skill"
        class="px-3 py-1 text-xs font-medium bg-gray-100 text-[#4e7397] rounded-full"
      >
        {{ skill }}
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  certification: {
    type: Object,
    required: true
  }
})
</script>
