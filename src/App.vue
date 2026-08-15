<script setup>
// Import global components
import { computed, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Skeleton from 'boneyard-js/vue'
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

// Every view is its own lazy chunk (see src/router/index.ts), so navigating to
// a page that is not cached yet waits on a network request. One skeleton here
// covers all of them: the bone is captured per route by `npm run boneyard:build`
// but the *name* is shared, so pages do not each need their own.
const router = useRouter()
const isRouteLoading = ref(false)
let pendingTimer = null

// A cached chunk resolves in a few milliseconds. Showing a skeleton for that
// long reads as a flicker, so the shell only appears once a navigation has been
// pending long enough to actually be noticed.
const SHELL_DELAY_MS = 150

const stopBeforeEach = router.beforeEach(() => {
  clearTimeout(pendingTimer)
  pendingTimer = setTimeout(() => {
    isRouteLoading.value = true
  }, SHELL_DELAY_MS)

  return true
})

// Runs for aborted and failed navigations too, so the shell cannot get stuck on
// if a guard redirects or the chunk request fails.
const stopAfterEach = router.afterEach(() => {
  clearTimeout(pendingTimer)
  isRouteLoading.value = false
})

onUnmounted(() => {
  clearTimeout(pendingTimer)
  stopBeforeEach()
  stopAfterEach()
})
</script>

<template>
  <v-app>
    <div class="flex flex-col min-h-screen">
      <!-- Header is conditionally rendered based on the route -->
      <!-- It will not show on the HomePage -->
      <Header v-if="showLayout" />

      <BetaRibbon v-if="showLayout && betaRibbonBelongsHere" />

      <main class="flex-1">
        <Skeleton name="page-shell" :loading="isRouteLoading" class="block h-full">
          <!-- Shown when `page-shell` has not been captured yet. Without a
               fallback the library renders an empty slot in that state, which
               would blank the page instead of degrading to the old behaviour.
               Once the bone exists this is never used. -->
          <template #fallback>
            <div class="min-h-screen bg-slate-50">
              <div class="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8">
                <div class="mx-auto mb-8 h-9 w-2/3 max-w-md rounded-full bg-slate-200 sm:h-10" />
                <div class="mx-auto mb-8 h-4 w-5/6 max-w-2xl rounded-full bg-slate-100" />
                <div class="mx-auto mb-8 h-11 w-64 rounded-lg bg-slate-200" />
                <div class="space-y-6">
                  <div v-for="row in 3" :key="row" class="rounded-lg bg-white p-4 shadow-sm sm:p-8">
                    <div class="mb-4 h-5 w-1/2 rounded-full bg-slate-200" />
                    <div class="mb-2 h-3 w-full rounded-full bg-slate-100" />
                    <div class="mb-2 h-3 w-11/12 rounded-full bg-slate-100" />
                    <div class="h-3 w-3/4 rounded-full bg-slate-100" />
                  </div>
                </div>
              </div>
            </div>
          </template>

          <router-view />
        </Skeleton>
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
