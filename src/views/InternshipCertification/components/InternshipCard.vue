<template>
  <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
    <div class="flex items-start justify-between mb-4">
      <div class="flex-1">
        <div class="flex items-center gap-4">
          <h3 class="text-xl font-bold text-[#0e141b] mb-2">{{ internship.title }}</h3>

        </div>
        <div class="flex items-center gap-2 text-[#4e7397] text-sm mb-1">
          <v-icon size="16">mdi-domain</v-icon>
          <span>{{ internship.organization }}</span>
        </div>
        <div v-if="internship.department" class="flex items-center gap-2 text-[#4e7397] text-sm mb-1">
          <v-icon size="16">mdi-office-building</v-icon>
          <span>{{ internship.department }}</span>
        </div>
        <div class="flex items-center gap-2 text-[#4e7397] text-sm mb-1">
          <v-icon size="16">mdi-map-marker</v-icon>
          <span>{{ internship.location }}</span>
        </div>
        <div class="flex items-center gap-2 text-[#4e7397] text-sm mb-3">
          <v-icon size="16">mdi-calendar</v-icon>
          <span>{{ internship.duration }}</span>
        </div>

        <div v-if="internship.project" class="flex items-center gap-2 text-[#4e7397] text-sm mb-3">
          <v-icon size="16">mdi-folder-outline</v-icon>
          <span><a :href="internship.project">Project: {{ internship.project_title }}</a></span>
        </div>
      </div>
      <div class="ml-4">
        <a v-if="internship.cred_link" :href="internship.cred_link" target="_blank" rel="noopener noreferrer">
          <span class="inline-block px-3 py-1 text-xs font-medium bg-[#1980e6] text-white rounded-full">
            {{ internship.type }}
            <v-icon size="20">mdi-file-document-outline</v-icon>
          </span>


        </a>
      </div>
    </div>

    <p class="text-[#0e141b] text-base leading-relaxed mb-4">
      {{ internship.description }}
    </p>

    <div class="flex flex-wrap gap-2">
      <span v-for="skill in internship.skills" :key="skill"
        class="px-3 py-1 text-xs font-medium bg-gray-100 text-[#4e7397] rounded-full">
        {{ skill }}
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  internship: {
    type: Object,
    required: true
  }
})
</script>
