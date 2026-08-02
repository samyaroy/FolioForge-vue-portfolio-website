<template>
  <div class="space-y-4">
    <div
      v-if="!memberships.length"
      class="border border-dashed border-slate-300 rounded-lg p-4 text-center text-slate-500 bg-white"
    >
      <span class="inline-flex items-end gap-2 border-b-2 border-slate-300 pb-0.5">
        <AnimatedIcon name="dino" :size="28" class="-mb-0.5 shrink-0" />
        <span>No memberships listed yet.</span>
      </span>
    </div>

    <MembershipCard
      v-for="(membership, index) in memberships"
      :key="index"
      :membership="membership"
    />
  </div>
</template>

<script setup>
import AnimatedIcon from '@/components/ui/AnimatedIcon.vue'
import MembershipCard from '../cards/MembershipCard.vue'

defineProps({
  memberships: {
    type: Array,
    default: () => [],
  },
})
</script>

