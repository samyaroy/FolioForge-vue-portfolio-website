<template>
  <nav class="lg:sticky lg:top-8 lg:self-start" aria-label="Resource subjects">
    <ul class="flex flex-col gap-2">
      <li v-for="(subject, index) in subjects" :key="subject.id">
        <v-tooltip
          :text="subject.description || subject.title"
          location="right"
        >
          <template #activator="{ props }">
            <button
              v-bind="props"
              type="button"
              class="resource-tab flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors"
              :class="index === activeIndex
                ? 'bg-white text-base font-bold text-[#1980e6] lg:rounded-l-lg'
                : 'font-medium text-gray-600 hover:text-[#1980e6]'"
              :aria-current="index === activeIndex ? 'page' : undefined"
              @click="$emit('select', index)"
            >
              <v-icon
                size="20"
                :class="index === activeIndex ? 'text-[#1980e6]' : 'text-gray-400'"
              >
                {{ subject.icon || defaultIcon }}
              </v-icon>
              <span class="truncate">{{ subject.title }}</span>
            </button>
          </template>
        </v-tooltip>
      </li>
    </ul>
  </nav>
</template>

<script setup>
defineProps({
  subjects: {
    type: Array,
    default: () => [],
  },
  activeIndex: {
    type: Number,
    default: 0,
  },
  defaultIcon: {
    type: String,
    required: true,
  },
})

defineEmits(['select'])
</script>

<style scoped>
.resource-tab,
.resource-tab:hover,
.resource-tab:focus,
.resource-tab:focus-visible {
  border-color: transparent !important;
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
  outline: none;
}
</style>
