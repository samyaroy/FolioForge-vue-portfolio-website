<template>
  <div class="w-full flex-shrink-0">
    <div class="space-y-6">
      <AchievementCard
        v-for="achievement in achievements"
        :key="`${achievement.title}-${achievement.year}`"
        :title="achievement.title"
        :year="achievement.year"
        :organization="achievement.organization"
        :category="iconMap[achievement.category]"
        :description="achievement.description"
        :cred_link="achievement.cred_link"
      />
    </div>

    <div class="flex justify-start mt-6 mb-4">
      <button
        type="button"
        class="awards-text-button"
        @click="$emit('show-awards')"
      >
        <v-icon size="16">mdi-arrow-left</v-icon>
        See awards and prizes
      </button>
    </div>
  </div>
</template>

<script setup>
import AchievementCard from "../cards/AchievementCard.vue";

defineProps({
  achievements: {
    type: Array,
    default: () => [],
  },
  iconMap: {
    type: Object,
    required: true,
  },
});

defineEmits(['show-awards']);
</script>
