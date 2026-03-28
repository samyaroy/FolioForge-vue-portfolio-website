<template>
  <div class="space-y-4">
    <div
      v-if="!affiliationItems.length"
      class="border border-dashed border-slate-300 rounded-lg p-4 text-center text-slate-500 bg-white"
    >
      No affiliations listed yet
    </div>

    <AffiliationCard
      v-for="(affiliation, index) in affiliationItems"
      :key="index"
      :affiliation="affiliation"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AffiliationCard from '../cards/AffiliationCard.vue'

const props = defineProps({
  affiliations: {
    type: Array,
    default: () => [],
  },
})

const affiliationItems = computed(() => (
  Array.isArray(props.affiliations) ? props.affiliations : []
))
</script>
