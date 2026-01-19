<template>
  <div class="space-y-4">
    <div
      v-if="!affiliations.length"
      class="border border-dashed border-slate-300 rounded-lg p-4 text-center text-slate-500 bg-white"
    >
      No current affiliation available.
    </div>

    <AffiliationCard
      v-for="(affiliation, index) in affiliations"
      :key="index"
      :affiliation="affiliation"
    />
  </div>
</template>

<script setup>
import AffiliationCard from '../cards/AffiliationCard.vue'

defineProps({
  affiliations: {
    type: Array,
    default: () => [],
  },
})
</script>

