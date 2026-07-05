<script setup>
// Import global components
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer/index.vue'
import QuoteDiv from '@/components/QuoteDiv.vue'
import { isFeatureEnabled } from '@/config/featureFlags'

const showLayout = true //set to true
const showPageQuotePane = isFeatureEnabled('showPageQuotePane')
</script>

<template>
  <v-app>
    <div class="flex flex-col min-h-screen">
      <!-- Header is conditionally rendered based on the route -->
      <!-- It will not show on the HomePage -->
      <Header v-if="showLayout" />

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
