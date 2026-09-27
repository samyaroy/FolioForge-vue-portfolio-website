<template>
  <div class="px-4 md:px-8 lg:px-20 py-4 bg-white">
    <div class="max-w-[1200px] mx-auto">
      <div class="flex flex-wrap justify-between gap-3 p-4">
        <h2 class="text-[#0e141b] tracking-light text-2xl sm:text-[32px] font-bold leading-tight min-w-0 sm:min-w-72">Research Interest</h2>
      </div>
      <v-row class="px-4">
        <v-col cols="6" md="4" lg="3" v-for="interest in research_interests" :key="interest.key">
          <Card :name="name_maker(interest.key)" :icon="researchInterestIcons[interest.key] || RESEARCH_INTEREST_FALLBACK_ICON" />
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup>
import Card from './components/Card.vue'
import config from "@/content/profile_info"
import { researchInterestIcons, RESEARCH_INTEREST_FALLBACK_ICON } from "@/config/researchInterestIcons"

const { research_interests } = config

const name_maker = (key) => key.replace(/_/g, ' ')

</script>

<style scoped>
/* Custom styles if needed */
</style>
