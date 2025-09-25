<template>
  <div class="border-l-4 border-[#10b981] pl-6 py-4 hover:shadow-lg transition-all duration-300 rounded-lg bg-white hover:bg-green-50">
    <div class="flex items-center justify-between mb-3 pr-4">
  <!-- title + icon group -->
  <div class="flex items-center gap-4">
    <h3 class="text-lg font-semibold text-[#0e141b]">{{ project.title }} <span v-if="project.type" class="text-sm text-blue-600 font-small bg-blue-100 px-2 py-1 rounded">
            {{ project.type }}
        </span></h3>
    
  </div>

  <!-- date -->
  <span v-if="project.time_period"class="text-sm text-gray-500 bg-green-100 px-2 py-1 rounded-full">
    {{ project.time_period }}
  </span>
</div>
    
    <div class="space-y-2 mb-3">
      <p v-if="project.instructor" class="text-gray-600 flex items-center">
        <v-icon size="small" class="mr-2">mdi-account-tie</v-icon>
        <span class="font-medium">Instructor:</span>  {{ project.instructor }}
      </p>
      <p v-if="project.institution" class="text-gray-600 flex items-center">
        <v-icon size="small" class="mr-2">mdi-school</v-icon>
        <span class="font-medium">Institution:</span> {{ project.institution }}
        
      </p>
      <p v-if="project.duration" class="text-gray-600 flex items-center">
        <v-icon size="small" class="mr-2">mdi-clock-outline</v-icon>
        <span class="font-medium">Duration:</span> {{ project.duration }}
        
      </p>
    </div>

    <p v-if="project.description" class="text-gray-700 mb-3 text-sm leading-relaxed">{{ project.description }}</p>

    <div v-if="project.skillsLearned && project.skillsLearned.length" class="flex flex-wrap gap-2 mb-3">
      <!-- <span
        v-for="skill in bootcamp.skillsLearned"
        :key="skill"
        class="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium"
      >
        {{ skill }}
      </span> -->
    </div>
    
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <!-- <span v-if="bootcamp.certificate" class="text-sm text-green-600 font-medium flex items-center">
          <v-icon size="small" class="mr-1">mdi-certificate</v-icon>
          Certificate Received
        </span> -->
        
      </div></div>
      <div class="flex items-center gap-2 mb-4">
        <v-icon class="text-[#4e7397]" size="16">mdi-domain</v-icon>
        <p class="text-[#4e7397] text-sm font-normal leading-normal ">Affiliation: {{project.affiliation }}</p>
      </div>


      <div class="text-sm">
        <span
          v-for="tech in project.tech_stack.split(',').map(item => item.trim())"
          :key="tech"
          class="px-2 py-1 m-1 bg-blue-100 text-blue-800 text-xs rounded-full"
        >
          {{ tech }}
        </span>
      </div>

      <div v-if="project.cred_link.github" class="text-sm">
        <a 
          :href="project.cred_link.github" 
          target="_blank" 
          class="text-[#10b981] hover:text-[#059669] font-medium flex items-center"
        >
          View details
          <v-icon size="small" class="ml-1">mdi-open-in-new</v-icon>
        </a>
      </div>
    </div>

</template>

<script setup>
defineProps({
  project: {
    type: Array,
    required: true
  }
})
</script>

<style scoped>
/* Optional scoped styles */
</style>
