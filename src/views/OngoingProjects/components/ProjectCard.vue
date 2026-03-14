<template>
  <div
    class="border-l-4 border-[#10b981] pl-6 py-4 hover:shadow-lg transition-all duration-300 rounded-lg bg-white hover:bg-green-50">
    <!-- Header -->
    <div class="flex items-center justify-between mb-3 pr-4">
      <div class="flex items-center gap-4">
        <h3 class="text-lg font-semibold text-[#0e141b]">
          {{ project.title }}
          <span v-if="project.type" class="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
            {{ project.type }}
          </span>
        </h3>
      </div>

      <span v-if="project.time_period" class="text-sm text-gray-500 bg-green-100 px-2 py-1 rounded-full">
        {{ project.time_period }}
      </span>
    </div>

    <!-- Meta Info -->
    <div class="space-y-2 mb-3">
      <p v-if="project.instructor" class="text-gray-600 flex items-center">
        <v-icon size="small" class="mr-2">mdi-account-tie</v-icon>
        <span class="font-medium mr-1">Instructor:</span>
        {{ project.instructor }}
      </p>

      <p v-if="project.institution" class="text-gray-600 flex items-center">
        <v-icon size="small" class="mr-2">mdi-school</v-icon>
        <span class="font-medium mr-1">Institution:</span>
        {{ project.institution }}
      </p>

      <p v-if="project.duration" class="text-gray-600 flex items-center">
        <v-icon size="small" class="mr-2">mdi-clock-outline</v-icon>
        <span class="font-medium mr-1">Duration:</span>
        {{ project.duration }}
      </p>
    </div>

    <!-- Description -->
    <p v-if="project.description" class="text-gray-700 mb-3 text-sm leading-relaxed">
      {{ project.description }}
    </p>

    <!-- Affiliation -->
    <div v-if="project.affiliation" class="flex items-center gap-2 mb-4">
      <v-icon class="text-[#4e7397]" size="16">mdi-domain</v-icon>
      <p class="text-[#4e7397] text-sm">
        Affiliation: {{ project.affiliation }}
      </p>
    </div>

    <!-- Bottom Row: Tech Stack (Left) + Link (Right) -->
    <div class="flex items-center justify-between flex-wrap gap-3">

      <!-- Tech Stack -->
      <div v-if="project.tech_stack" class="text-sm flex flex-wrap">
        <span v-for="tech in project.tech_stack.split(',').map(item => item.trim())" :key="tech"
          class="px-2 py-1 m-1 bg-blue-100 text-blue-800 text-xs rounded-full">
          {{ tech }}
        </span>
      </div>

      <!-- View Details -->
      <div v-if="project.cred_link?.github || project.cred_link?.kaggle"
        class="text-sm mr-6 p-3 rounded-full bg-slate-100">
        <a v-if="project.cred_link.github" :href="project.cred_link.github" target="_blank"
          class="text-[#10b981] hover:text-[#059669] font-medium flex items-center">
          <v-icon size="small">
            mdi-github
          </v-icon>
        </a>
        <a v-if="project.cred_link.kaggle" :href="project.cred_link.kaggle" target="_blank"
          class="text-[#10b981] hover:text-[#059669] font-medium flex items-center">
          <v-icon size="small">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
              <path fill="#1f1f1e"
                d="M464.2 565.5L318.4 384.3L458.2 249C460.8 246.3 459.9 238.5 452.9 238.5L383.7 238.5C380.2 238.5 376.7 240.3 373.2 243.8L240.9 377.5L240.9 71.5C240.9 66.5 238.4 64 233.4 64L181.5 64C176.5 64 174 66.5 174 71.5L174 568.5C174 573.5 176.5 576 181.5 576L233.4 576C238.4 576 240.9 573.5 240.9 568.5L240.9 459.5L271.7 430.2L382.2 570.8C385.2 574.3 388.7 576.1 392.7 576.1L459.6 576.1C463.1 576.1 465.1 575.1 465.6 573.1L464.2 565.5z" />
            </svg>
          </v-icon>
        </a>
      </div>

    </div>
  </div>
</template>

<script setup>
defineProps({
  project: {
    type: Object, // FIXED (was Array — wrong)
    required: true
  }
})
</script>

<style scoped>
/* Optional scoped styles */
</style>