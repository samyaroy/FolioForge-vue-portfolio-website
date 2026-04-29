<template>
  <div class="min-h-screen bg-slate-50 py-8">
    <div class="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h1 class="text-3xl sm:text-4xl font-black text-[#0e141b] tracking-[-0.033em]"
          :class="{ 'mb-4': showPageDescription }">
          Ongoing Projects
        </h1>
         <p v-if="showPageDescription" class="content-justify text-base sm:text-lg text-gray-600 max-w-4xl mx-auto">
          {{ pageDescription }}
        </p>
        </div>
      <!-- Workshops Section -->
      <div class="mb-16 max-w-[1280px] mx-auto">
        <!-- <h2 class="text-3xl font-bold text-[#0e141b] mb-6">Workshops Attended</h2> -->
        <!-- <p class="text-gray-600">Academic and professional workshops I've participated in</p> -->

        <div v-if="ongoingProjects" class="space-y-6">
          <ProjectCard v-for="(project, index) in ongoingProjects" :key="index" :project="project" />
        </div>
        <div v-else class="text-gray-600">
          <span class="inline-flex items-end gap-2 border-b-2 border-slate-300 pb-0.5">
            <AnimatedIcon name="dino" :size="28" class="-mb-0.5 shrink-0" />
            <span>No information regarding ongoing projects available.</span>
          </span>
        </div>
      </div>


    </div>
  </div>
</template>

<script setup>
import AnimatedIcon from '@/components/ui/AnimatedIcon.vue'
import ProjectCard from './components/ProjectCard.vue'

import config from '@/content/profile_info'
import descriptions from '@/content/profile_info/description.yml'
import { isPageDescriptionEnabled } from '@/config/featureFlags'
const { ongoing_projects } = config
const ongoingProjects = ongoing_projects
const pageDescription = descriptions.ongoingProjects
const showPageDescription = isPageDescriptionEnabled('ongoingProjects')
</script>

<style scoped>
/* Optional styles */
</style>
