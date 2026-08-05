<template>
  <div class="space-y-4">
    <div
      v-if="!affiliationItems.length"
      class="border border-dashed border-slate-300 rounded-lg p-4 text-center text-slate-500 bg-white"
    >
      <span class="inline-flex items-end gap-2 border-b-2 border-slate-300 pb-0.5">
        <AnimatedIcon name="dino" :size="28" class="-mb-0.5 shrink-0" />
        <span>No affiliations listed yet</span>
      </span>
    </div>

    <AffiliationCard
      v-for="(affiliation, index) in affiliationItems"
      :key="index"
      :affiliation="affiliation"
    />
  </div>
</template>

<script setup>
import AnimatedIcon from '@/components/ui/AnimatedIcon.vue'
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
