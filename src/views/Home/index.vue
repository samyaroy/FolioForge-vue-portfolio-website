<template>
  <div class="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden">
    <div class="layout-container flex h-full grow flex-col">
      <!-- Hero Section -->
      <Skeleton v-if="homeFlags.showHeroSection" name="home-hero" :loading="isHomeLoading">
        <HeroSection @hero-media-loaded="handleHeroMediaLoaded" />
      </Skeleton>
      
      <!-- Research Interests Section -->
      <Skeleton v-if="homeFlags.showResearchInterests" name="home-research-interests" :loading="isHomeLoading">
        <ResearchInterests />
      </Skeleton>
      
      <!-- Experience Section -->
      <Skeleton v-if="homeFlags.showExperience" name="home-experience" :loading="isHomeLoading">
        <Experience />
      </Skeleton>
      
      <!-- Education Section -->
      <Skeleton v-if="homeFlags.showEducation" name="home-education" :loading="isHomeLoading">
        <Education />
      </Skeleton>

      <!--Awards Section-->
      <Skeleton v-if="homeFlags.showAwards" name="home-awards" :loading="isHomeLoading">
        <Awards />
      </Skeleton>
    
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import Skeleton from 'boneyard-js/vue'
import { isFeatureEnabled } from '@/config/featureFlags'
import HeroSection from './components/HeroSection.vue'
import ResearchInterests from './components/researchInterests/index.vue'
import Experience from './components/experience/index.vue'
import Education from './components/education/index.vue'
import Awards from './components/awards/index.vue'

defineOptions({
  name: 'HomePage',
})

const homeFlags = {
  showHeroSection: isFeatureEnabled('showHome.showHeroSection'),
  showResearchInterests: isFeatureEnabled('showHome.showResearchInterests'),
  showExperience: isFeatureEnabled('showHome.showExperience'),
  showEducation: isFeatureEnabled('showHome.showEducation'),
  showAwards: isFeatureEnabled('showHome.showAwards'),
}

const heroMediaReady = ref(false)
const isHomeLoading = computed(() => homeFlags.showHeroSection && !heroMediaReady.value)

function handleHeroMediaLoaded() {
  if (heroMediaReady.value) return

  heroMediaReady.value = true
}
</script>

<style scoped>
/* Custom styles if needed */
</style>
