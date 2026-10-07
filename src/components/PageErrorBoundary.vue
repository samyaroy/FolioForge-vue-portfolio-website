<script setup lang="ts">
import { onErrorCaptured, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { reloadForNewBuild } from '@shared/reloadForNewBuild'

// Wraps the page area in App.vue, outside the loading skeleton: the skeleton
// unmounts its slot while it shows the fallback shell, and would take these
// listeners with it. The header and footer sit outside this boundary, so a
// page that breaks keeps the site's navigation, and a broken footer does not
// take the page down with it.
const router = useRouter()
const failed = ref(false)

// Vue names where an error came from in development but passes an
// error-reference URL in production (https://vuejs.org/error-reference/):
// runtime-0 is a setup function, runtime-1 a render function. Only those leave
// a component blank. A click handler or watcher that throws does not, so it is
// left to Vue's own console logging as before.
const BREAKS_RENDERING = /^(setup|render) function$|#runtime-[01]$/

onErrorCaptured((error, _instance, info) => {
  if (!BREAKS_RENDERING.test(info)) return
  console.error(error)
  failed.value = true
  return false
})

// A navigation only throws when a page's chunk fails to load (the guards in
// src/router/index.ts return, never throw), usually because a deploy replaced
// it after this tab opened. Load the destination fresh to pick up the new
// build; if that already happened moments ago, show the error screen.
const stopOnError = router.onError((error, to) => {
  if (reloadForNewBuild(to.fullPath)) return
  // With a handler registered, the router no longer logs the error itself.
  console.error(error)
  failed.value = true
})

const stopAfterEach = router.afterEach((_to, _from, failure) => {
  if (!failure) failed.value = false
})

onUnmounted(() => {
  stopOnError()
  stopAfterEach()
})

function reload() {
  location.reload()
}
</script>

<template>
  <div v-if="failed" class="relative flex size-full min-h-screen flex-col bg-slate-50 overflow-x-hidden">
    <div class="layout-container flex h-full grow flex-col">
      <div class="px-8 md:px-16 lg:px-20 flex flex-1 justify-center py-10">
        <div class="layout-content-container flex flex-col w-full max-w-[960px] flex-1 items-center text-center">
          <p class="text-sm font-semibold uppercase tracking-[0.3em] text-[#4e7397]">
            Something went wrong
          </p>
          <h1 class="mt-3 text-4xl font-black tracking-[-0.033em] text-[#0e141b]">
            This page couldn't load.
          </h1>
          <p class="mt-4 max-w-[560px] text-slate-600">
            It hit an error on the way in. Reloading usually fixes it, and the
            rest of the site still works.
          </p>
          <div class="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              class="inline-flex rounded-lg bg-[#1980e6] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#0842a0]"
              @click="reload"
            >
              Reload the page
            </button>
            <router-link
              to="/"
              class="inline-flex rounded-lg border border-slate-300 px-5 py-3 text-sm font-bold text-[#0e141b] transition-colors hover:bg-slate-100"
            >
              Back to home
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
  <slot v-else />
</template>
