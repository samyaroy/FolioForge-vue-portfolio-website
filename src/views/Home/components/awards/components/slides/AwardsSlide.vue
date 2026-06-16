<template>
  <div class="w-full flex-shrink-0">
    <div class="space-y-6">
      <AwardsCard
        v-for="award in awards"
        :key="award.id"
        :title="award.title"
        :year="award.year"
        :organization="award.organization"
        :category="iconMap[award.category]"
        :prize="award.prize"
        :description="award.description"
        :cred_link="award.cred_link"
      />
    </div>

    <div v-if="hasAchievements" class="flex justify-end mt-6 mb-4">
      <button
        type="button"
        class="awards-text-button"
        @click="$emit('show-achievements')"
      >
        See all achievements
        <v-icon size="16">mdi-arrow-right</v-icon>
      </button>
    </div>
  </div>
</template>

<script setup>
import AwardsCard from "../cards/AwardsCard.vue";

defineProps({
  awards: {
    type: Array,
    default: () => [],
  },
  iconMap: {
    type: Object,
    required: true,
  },
  hasAchievements: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['show-achievements']);
</script>
