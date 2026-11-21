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

        <div v-if="ongoingProjects.length" class="space-y-6">
          <!-- The wrapper carries the id a deep link looks for (ProjectCard opens
               with a comment, so an id passed to it would not reach its root). -->
          <div v-for="(project, index) in visibleProjects" :key="index" :id="projectSlug(project.title)" class="rounded-lg">
            <ProjectCard :project="project" />
          </div>
          <SeeMoreButton :remaining="ongoingProjects.length - visibleProjects.length" @more="visibleCount += PAGE_SIZE" />
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
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AnimatedIcon from '@/components/ui/AnimatedIcon.vue'
import SeeMoreButton from '@/components/ui/SeeMoreButton.vue'
import ProjectCard from './components/ProjectCard.vue'

import config from '@/content/profile_info'
import descriptions from '@/content/profile_info/description.yml'
import { isPageDescriptionEnabled } from '@/config/featureFlags'
import { PROJECT_ANCHOR_PARAM, projectSlug } from '@/config/projectAnchors'
import { focusLinkedCard } from '@/utils/focusLinkedCard'
const { ongoing_projects } = config
// Entries switched off with `enabled: false` are already gone from the config,
// so a file whose every project is off leaves an empty list here -- which is
// truthy, and would render an empty section rather than the empty state.
const ongoingProjects = Array.isArray(ongoing_projects) ? ongoing_projects : []

// Five projects at first; "See more" adds five at a time.
const PAGE_SIZE = 5
const visibleCount = ref(PAGE_SIZE)
const visibleProjects = computed(() => ongoingProjects.slice(0, visibleCount.value))

// A link from elsewhere (a collaborator's card naming a project) opens the list
// far enough to include that project, then brings its card into view. The card
// is found by the slug of its title, so neither side stores an id.
const route = useRoute()
watch(() => route.query[PROJECT_ANCHOR_PARAM], slug => {
  if (!slug || typeof slug !== 'string') return
  const index = ongoingProjects.findIndex(project => projectSlug(project?.title) === slug)
  if (index >= visibleCount.value) visibleCount.value = Math.ceil((index + 1) / PAGE_SIZE) * PAGE_SIZE
  focusLinkedCard(slug)
}, { immediate: true })
const pageDescription = descriptions.ongoingProjects
const showPageDescription = isPageDescriptionEnabled('ongoingProjects')
</script>

<style scoped>
/* Optional styles */
</style>
