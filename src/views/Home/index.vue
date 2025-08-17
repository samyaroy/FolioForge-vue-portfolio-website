<template>
  <div class="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden">
    <div class="layout-container flex h-full grow flex-col">
      <!-- Hero Section -->
      <HeroSection />
      
      <!-- Research Interests Section -->
      <ResearchInterests />
      
      <!-- Experience Section -->
      <Experience />
      
      <!-- Education Section -->
      <Education />

      <!--Awards Section-->
      <!-- <Awards /> -->
    
    </div>
  </div>
</template>

<script setup>
import HeroSection from './components/HeroSection.vue'
import ResearchInterests from './components/researchInterests/index.vue'
import Experience from './components/experience/index.vue'
import Education from './components/education/index.vue'
import Awards from './components/awards/index.vue'
</script>

<style scoped>
/* Custom styles if needed */
</style>
