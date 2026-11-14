<template>
  <!-- "See more" under a list that shows its entries a page at a time. The
       parent owns the count and passes how many are still hidden. -->
  <div v-if="remaining > 0" class="flex justify-center pt-2">
    <button type="button" class="see-more-button" @click="$emit('more')">
      See more
      <v-icon size="16">mdi-chevron-down</v-icon>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  /** Entries not shown yet; the button hides itself at zero. */
  remaining: number
}>()

defineEmits<{ more: [] }>()
</script>

<style scoped>
/* Same opt-out as `.more-certificates-button`: the global `button` rule in
   style.css gives every bare button a background, padding and a border. */
.see-more-button {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0;
  border: 0;
  outline: 0;
  border-radius: 0;
  background: transparent;
  color: #1980e6;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.25rem;
  box-shadow: none;
  cursor: pointer;
  transition: color 200ms ease;
}

.see-more-button:hover,
.see-more-button:focus,
.see-more-button:focus-visible {
  border: 0;
  outline: 0;
  background: transparent;
  color: #0e141b;
  box-shadow: none;
}
</style>
