<template>
  <div class="space-y-4">
    <div
      v-if="!memberships.length"
      class="border border-dashed border-slate-300 rounded-lg p-4 text-center text-slate-500 bg-white"
    >
      No memberships listed yet.
    </div>

    <MembershipCard
      v-for="(membership, index) in memberships"
      :key="index"
      :membership="membership"
    />
  </div>
</template>

<script setup>
import MembershipCard from '../cards/MembershipCard.vue'

defineProps({
  memberships: {
    type: Array,
    default: () => [],
  },
})
</script>

