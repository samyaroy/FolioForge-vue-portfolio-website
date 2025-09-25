<template>
  <div class="min-h-screen bg-slate-50 py-8">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-black text-[#0e141b] mb-4 tracking-[-0.033em]">
          Ongoing Projects
        </h1>
         <p class="text-lg text-gray-600 max-w-4xl mx-auto"> 
          List of all projects I'm currently working on, including personal, academic, and collaborative projects.
        </p>
        </div>
      <!-- Workshops Section -->
      <div class="mb-16 max-w-4xl mx-auto">
        <!-- <h2 class="text-3xl font-bold text-[#0e141b] mb-6">Workshops Attended</h2> -->
        <!-- <p class="text-gray-600">Academic and professional workshops I've participated in</p> -->

        <div class="space-y-6">
          <ProjectCard v-for="(project, index) in ongoingProjects" :key="index" :project="project" />
        </div>
      </div>


    </div>
  </div>
</template>

<script setup>
import ProjectCard from './components/ProjectCard.vue'

import config from '@/profile_info.yml'
const { ongoing_projects } = config
const ongoingProjects = ongoing_projects || []
</script>

<style scoped>
/* Optional styles */
</style>