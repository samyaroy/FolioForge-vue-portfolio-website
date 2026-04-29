<template>
  <div class="relative flex size-full min-h-[70vh] flex-col bg-slate-50 overflow-x-hidden">
    <div class="flex flex-1 items-center justify-center px-8 py-12">
      <div class="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm md:p-12">
        <p class="text-sm font-semibold uppercase tracking-[0.35em] text-[#4e7397]">404 Error</p>
        <h1 class="mt-4 text-4xl font-black tracking-[-0.033em] text-[#0e141b] md:text-5xl">
          That page could not be found.
        </h1>
        <p class="mt-4 text-base text-slate-600 md:text-lg">
          The route you requested does not exist or may have moved.
        </p>
        <p v-if="missingPath" class="mt-3 break-all text-sm text-slate-500">
          Requested path: {{ missingPath }}
        </p>

        <div class="mt-8 flex justify-center">
          <router-link
            to="/"
            class="inline-flex items-center rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white no-underline transition-colors duration-200 hover:bg-primary-700"
          >
            Back to Home
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const missingPath = computed(() => {
  const from = route.query.from
  if (typeof from === 'string' && from.trim()) {
    return from
  }

  return route.path === '/404' ? '' : route.fullPath
})
</script>
