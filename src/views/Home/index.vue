<template>
  <div class="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden">
    <div class="layout-container flex h-full grow flex-col">
      <!-- Hero Section -->
      <HeroSection v-if="homeFlags.showHeroSection" />
      
      <!-- Research Interests Section -->
      <ResearchInterests v-if="homeFlags.showResearchInterests" />
      
      <!-- Experience Section -->
      <Experience v-if="homeFlags.showExperience" />
      
      <!-- Education Section -->
      <Education v-if="homeFlags.showEducation" />

      <!--Awards Section-->
      <Awards v-if="homeFlags.showAwards" />
    
    </div>
  </div>
</template>

<script setup>
import config from "@/profile_info.yml"
import HeroSection from './components/HeroSection.vue'
import ResearchInterests from './components/researchInterests/index.vue'
import Experience from './components/experience/index.vue'
import Education from './components/education/index.vue'
import Awards from './components/awards/index.vue'

const homeFlags = config.feature_flags?.home ?? {
  showHeroSection: true,
  showResearchInterests: true,
  showExperience: true,
  showEducation: true,
  showAwards: false,
}
</script>

<style scoped>
/* Custom styles if needed */
</style>
