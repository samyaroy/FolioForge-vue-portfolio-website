<template>
    <div class="bg-white rounded-lg shadow-sm p-8">
        <h2 class="text-2xl font-bold text-[#0e141b] mb-6">Technical Projects</h2>
        <div v-if="projects && projects.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="project in projects" :key="project.id"
                class="relative  border rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-[#0e141b]">{{ project.title }}</h3>
                    <span class="text-sm text-gray-500">{{ project.time_period }}</span>
                </div>
                <div class="text-sm"><v-icon size="16">mdi-attachment</v-icon> {{ project.type }}</div>
                <br />
                <div class="flex flex-wrap gap-2 mb-4">
                    <span v-for="tech in project.technologies" :key="tech"
                        class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {{ tech }}
                    </span>
                </div>
                <p class="text-gray-600 mb-4">{{ project.description }}</p>

                <!-- Bottom-right buttons -->
                 <br/>
  <div class="absolute bottom-4 right-4 flex space-x-2">
    <a
      v-if="project.github"
      :href="project.github"
      target="_blank"
      class="border border-[#1980e6] text-[#1980e6] w-10 h-10 rounded-full flex items-center justify-center shadow hover:bg-[#1980e6] hover:text-white transition"
    >
      <v-icon>mdi-github</v-icon>
    </a>
    <a
      v-if="project.demo"
      :href="project.demo"
      target="_blank"
      class="border border-[#01070d] text-[#000000] w-10 h-10 rounded-full flex items-center justify-center shadow hover:bg-[#000000] hover:text-white transition"
    >
      <v-icon>mdi-web</v-icon>
    </a>
  </div>
            </div>
        </div>
        <div v-else class="text-center text-gray-500 italic">
            No Applied Projects Yet
        </div>
    </div>
</template>

<script setup>
defineProps({
    projects: {
        type: Array,
        default: () => []
    }
})
</script>