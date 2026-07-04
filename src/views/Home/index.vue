<template>
  <div class="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden">
    <div class="layout-container flex h-full grow flex-col">
      <!-- Info Ribbon -->
      <InfoRibbon
        v-if="homeFlags.showRibbon && ribbonMessage && !isRibbonDismissed"
        :icon="ribbonIcon"
        :message="ribbonMessage"
        @dismissed="isRibbonDismissed = true"
      />

      <!-- Hero Section -->
      <div v-if="homeFlags.showHeroSection" class="relative">
        <button
          v-if="homeFlags.showRibbon && ribbonMessage && isRibbonDismissed"
          class="hero-ribbon-toggle"
          type="button"
          aria-label="Show announcement"
          @click="isRibbonDismissed = false"
        >
          <v-icon color="#ffffff" size="18">{{ ribbonIcon }}</v-icon>
        </button>
        <HeroSection />
      </div>
      
      <!-- Research Interests Section -->
      <ResearchInterests v-if="homeFlags.showResearchInterests" />
      
      <!-- Experience Section -->
      <Experience v-if="homeFlags.showExperience" />
      
      <!-- Education Section -->
      <Education v-if="homeFlags.showEducation" />

      <!--Awards Section-->
      <Awards v-if="homeFlags.showAwards || homeFlags.showAchivement" />
    
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { isFeatureEnabled } from '@/config/featureFlags'
import config from '@/content/profile_info'
import HeroSection from './components/HeroSection.vue'
import InfoRibbon from './components/InfoRibbon.vue'
import ResearchInterests from './components/researchInterests/index.vue'
import Experience from './components/experience/index.vue'
import Education from './components/education/index.vue'
import Awards from './components/awards/index.vue'

const homeFlags = {
  showRibbon: isFeatureEnabled('showHome.showRibbon'),
  showHeroSection: isFeatureEnabled('showHome.showHeroSection'),
  showResearchInterests: isFeatureEnabled('showHome.showResearchInterests'),
  showExperience: isFeatureEnabled('showHome.showExperience'),
  showEducation: isFeatureEnabled('showHome.showEducation.main'),
  showAwards: isFeatureEnabled('showHome.showAwards'),
  showAchivement: isFeatureEnabled('showHome.showAchivement'),
}

const ribbonMessage = config.ribbon?.message
const ribbonIcon = config.ribbon?.icon || 'mdi-information'
const isRibbonDismissed = ref(false)
</script>

<style scoped>
.hero-ribbon-toggle {
  position: absolute;
  top: 14px;
  right: clamp(16px, 5vw, 80px);
  z-index: 5;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 999px;
  background: linear-gradient(135deg, #1666b9, #0f766e);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.22);
  transition:
    transform 160ms ease,
    box-shadow 160ms ease;
}

.hero-ribbon-toggle:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.28);
}

.hero-ribbon-toggle:focus-visible {
  outline: 2px solid #1980e6;
  outline-offset: 3px;
}
</style>
