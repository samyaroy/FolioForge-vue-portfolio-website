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
        <RibbonToggle
          v-if="homeFlags.showRibbon && ribbonMessage && isRibbonDismissed"
          :icon="ribbonIcon"
          @open="isRibbonDismissed = false"
        />
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
import InfoRibbon from '@/components/InfoRibbon.vue'
import RibbonToggle from '@/components/RibbonToggle.vue'
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

