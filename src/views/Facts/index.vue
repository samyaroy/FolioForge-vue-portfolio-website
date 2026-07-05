<template>
  <div class="min-h-screen bg-[#eef3f8] py-8">
    <div class="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
      <div class="mb-12">
        <h1 class="text-4xl font-black text-[#0e141b] tracking-[-0.033em]"
          :class="{ 'mb-4': showPageDescription }">
          Did you know?
        </h1>
        <p v-if="showPageDescription" class="text-lg text-gray-600 max-w-4xl">
          {{ pageDescription }}
        </p>
      </div>

      <div
        v-if="facts.length"
        class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <div
          v-for="(fact, index) in facts"
          :key="index"
          class="flex flex-col rounded-xl bg-white p-6 shadow-sm ring-1 ring-[#e7edf3] transition-shadow duration-200 hover:shadow-md"
        >
          <div class="mb-4 flex size-12 items-center justify-center rounded-full bg-[#e7f0fb] text-[#1980e6]">
            <v-icon size="24">{{ fact.icon || DEFAULT_FACT_ICON }}</v-icon>
          </div>
          <h2 class="mb-2 text-lg font-bold text-[#0e141b]">{{ fact.title }}</h2>
          <p class="text-slate-600">{{ fact.description }}</p>
        </div>
      </div>

      <div v-else class="mx-auto max-w-2xl text-center text-gray-500">
        No facts are available right now.
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import factsContent from '@/content/profile_info/facts.yml'
import descriptions from '@/content/profile_info/description.yml'
import { isPageDescriptionEnabled } from '@/config/featureFlags'

defineOptions({
  name: 'FactsPage',
})

const DEFAULT_FACT_ICON = 'mdi-lightbulb-on-outline'

const pageDescription = descriptions.facts
const showPageDescription = isPageDescriptionEnabled('facts')

const facts = computed(() => {
  const rawFacts = Array.isArray(factsContent?.facts) ? factsContent.facts : []
  return rawFacts
    .filter(fact => Boolean(fact) && typeof fact === 'object')
    .map(fact => ({
      title: fact.title || 'Untitled',
      description: fact.description || '',
      icon: fact.icon || DEFAULT_FACT_ICON,
    }))
})
</script>
