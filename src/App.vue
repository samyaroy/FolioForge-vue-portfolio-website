<script setup>
// Import global components
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer/index.vue'
import QuoteDiv from '@/components/QuoteDiv.vue'
import BetaRibbon from '@/components/BetaRibbon.vue'
import { isFeatureEnabled } from '@/config/featureFlags'

const showLayout = true //set to true
const showPageQuotePane = isFeatureEnabled('showPageQuotePane')

// The beta ribbon sits directly under the header. These views render their own
// InfoRibbon inside <router-view>, which is below this point in the DOM, so
// they place the beta ribbon themselves to keep it under the announcement
// rather than above it. Everywhere else it belongs here.
const ROUTES_WITH_OWN_RIBBON = ['Home', 'Resources']

const route = useRoute()
const betaRibbonBelongsHere = computed(
  () => !ROUTES_WITH_OWN_RIBBON.includes(String(route.name ?? '')),
)
</script>

<template>
  <v-app>
    <div class="flex flex-col min-h-screen">
      <!-- Header is conditionally rendered based on the route -->
      <!-- It will not show on the HomePage -->
      <Header v-if="showLayout" />

      <BetaRibbon v-if="showLayout && betaRibbonBelongsHere" />

      <main class="flex-1">
        <router-view />
      </main>

      <QuoteDiv v-if="showLayout && showPageQuotePane" />

      <!-- Footer is conditionally rendered based on the route -->
      <!-- It will not show on the HomePage -->
      <Footer v-if="showLayout" />
    </div>
  </v-app>
</template>

<style scoped>
</style>
