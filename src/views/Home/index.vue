<template>
  <div class="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden">
    <div class="layout-container flex h-full grow flex-col">
      <!-- Info Ribbon -->
      <InfoRibbon
        v-if="homeFlags.showRibbon && hasRibbon && !isRibbonDismissed"
        :entries="ribbonEntries"
        @dismissed="isRibbonDismissed = true"
      />

      <!-- Below the announcement, not above it. App.vue places this for every
           route that does not render its own ribbon. -->
      <BetaRibbon />

      <!-- Hero Section. The ribbon toggle sits outside the skeleton so it stays
           available while the hero image is still loading. -->
      <div v-if="homeFlags.showHeroSection" class="relative">
        <RibbonToggle
          v-if="homeFlags.showRibbon && hasRibbon && isRibbonDismissed"
          :icon="ribbonIcon"
          @open="isRibbonDismissed = false"
        />
        <Skeleton name="home-hero" :loading="isHomeLoading">
          <HeroSection @hero-media-loaded="handleHeroMediaLoaded" />
        </Skeleton>
      </div>

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
      <Skeleton v-if="homeFlags.showAwards || homeFlags.showAchivement" name="home-awards" :loading="isHomeLoading">
        <Awards />
      </Skeleton>

    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import Skeleton from 'boneyard-js/vue'
import { isFeatureEnabled } from '@/config/featureFlags'
import config from '@/content/profile_info'
import HeroSection from './components/HeroSection.vue'
import InfoRibbon from '@/components/InfoRibbon.vue'
import RibbonToggle from '@/components/RibbonToggle.vue'
import BetaRibbon from '@/components/BetaRibbon.vue'
import ResearchInterests from './components/researchInterests/index.vue'
import Experience from './components/experience/index.vue'
import Education from './components/education/index.vue'
import Awards from './components/awards/index.vue'

defineOptions({
  name: 'HomePage',
})

const homeFlags = {
  showRibbon: isFeatureEnabled('showHome.showRibbon'),
  showHeroSection: isFeatureEnabled('showHome.showHeroSection'),
  showResearchInterests: isFeatureEnabled('showHome.showResearchInterests'),
  showExperience: isFeatureEnabled('showHome.showExperience'),
  showEducation: isFeatureEnabled('showHome.showEducation.main'),
  showAwards: isFeatureEnabled('showHome.showAwards'),
  showAchivement: isFeatureEnabled('showHome.showAchivement'),
}

// ribbon.yml holds a list of announcements; InfoRibbon cycles through them and
// the toggle (shown once dismissed) keeps the first one's icon.
const ribbonEntries = Array.isArray(config.ribbon) ? config.ribbon : [config.ribbon]
const hasRibbon = ribbonEntries.some(entry => entry?.message)
const ribbonIcon = ribbonEntries[0]?.icon || 'mdi-information'
const isRibbonDismissed = ref(false)

// The whole page holds its skeleton until the hero image resolves, so the
// sections do not pop in one at a time. With the hero disabled there is no
// media to wait on, so nothing is ever in a loading state.
const heroMediaReady = ref(false)
const isHomeLoading = computed(() => homeFlags.showHeroSection && !heroMediaReady.value)

function handleHeroMediaLoaded() {
  if (heroMediaReady.value) return

  heroMediaReady.value = true
}
</script>

<style scoped>
</style>
