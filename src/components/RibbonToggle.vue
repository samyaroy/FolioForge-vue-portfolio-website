<template>
  <button
    class="ribbon-toggle"
    type="button"
    aria-label="Show announcement"
    @click="$emit('open')"
  >
    <v-icon color="#ffffff" size="18">{{ icon }}</v-icon>
  </button>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    default: 'mdi-information',
  },
})

defineEmits(['open'])
</script>

<style scoped>
.ribbon-toggle {
  position: absolute;
  top: 14px;
  right: clamp(16px, 5vw, 80px);
  z-index: 5;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 999px;
  background: linear-gradient(135deg, #1666b9, #0f766e);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.22);
  transition:
    transform 160ms ease,
    box-shadow 160ms ease;
}

.ribbon-toggle:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.28);
}

.ribbon-toggle:focus-visible {
  outline: 2px solid #1980e6;
  outline-offset: 3px;
}
</style>
