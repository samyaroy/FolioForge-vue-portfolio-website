<template>
  <Transition name="info-ribbon" @after-leave="emitDismissed">
    <section v-if="isVisible" class="info-ribbon-shell" aria-label="Announcement">
      <div class="info-ribbon-panel">
        <div class="info-ribbon-content">
          <span class="info-ribbon-icon">
            <v-icon color="#ffffff" size="14">{{ icon }}</v-icon>
          </span>
          <span class="info-ribbon-message">
            <CaptionContent :text="message" />
          </span>
          <button class="info-ribbon-close" type="button" aria-label="Close announcement" @click="closeRibbon">
            <v-icon color="#ffffff" size="14">mdi-close</v-icon>
          </button>
        </div>
      </div>
    </section>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'
import CaptionContent from '@/components/CaptionContent.vue'

defineProps({
  message: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: 'mdi-information',
  },
})

const isVisible = ref(true)
const emit = defineEmits(['dismissed'])

function closeRibbon() {
  isVisible.value = false
}

function emitDismissed() {
  emit('dismissed')
}
</script>

<style scoped>
.info-ribbon-shell {
  position: relative;
  z-index: 1;
  width: 100%;
  max-height: 48px;
  padding: 0;
  overflow: hidden;
  background: transparent;
  perspective: 900px;
}

.info-ribbon-shell::before {
  content: none;
}

.info-ribbon-shell::after {
  content: none;
}

.info-ribbon-panel {
  position: relative;
  z-index: 1;
  width: 100%;
  padding: 5px 16px;
  color: #ffffff;
  background:
    linear-gradient(90deg, #0f172a 0%, #1666b9 38%, #1980e6 63%, #0f766e 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.26),
    inset 0 -10px 20px rgba(15, 23, 42, 0.18);
  transform: rotateX(-5deg) translateY(-2px);
  transform-origin: top center;
}

.info-ribbon-panel::after {
  content: none;
}

.info-ribbon-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: min(1200px, 100%);
  min-height: 26px;
  margin: 0 auto;
  gap: 10px;
  text-align: center;
}

.info-ribbon-icon {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: 1px solid rgba(255, 255, 255, 0.32);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22);
}

.info-ribbon-message {
  max-width: 980px;
  flex: 1 1 auto;
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: 0;
  text-wrap: balance;
}

.info-ribbon-message :deep(a) {
  color: #ffffff;
  text-decoration: underline;
  text-decoration-color: rgba(255, 255, 255, 0.55);
  text-underline-offset: 3px;
  transition: text-decoration-color 160ms ease;
}

.info-ribbon-message :deep(a:hover) {
  text-decoration-color: #ffffff;
}

.info-ribbon-message :deep(a:focus-visible) {
  outline: 2px solid rgba(255, 255, 255, 0.9);
  outline-offset: 2px;
}

.info-ribbon-message :deep(strong),
.info-ribbon-message :deep(em) {
  color: inherit;
}

.info-ribbon-close {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 999px;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.12);
  box-shadow: none;
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    transform 160ms ease;
}

.info-ribbon-close:hover {
  border-color: rgba(255, 255, 255, 0.44);
  background: rgba(255, 255, 255, 0.22);
  transform: translateY(-1px);
}

.info-ribbon-close:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.9);
  outline-offset: 2px;
}

.info-ribbon-enter-active,
.info-ribbon-leave-active {
  transition:
    max-height 260ms ease,
    opacity 220ms ease,
    transform 260ms ease;
}

.info-ribbon-enter-from,
.info-ribbon-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-12px);
}

.info-ribbon-enter-to,
.info-ribbon-leave-from {
  max-height: 48px;
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 640px) {
  .info-ribbon-shell {
    max-height: 60px;
    padding: 0;
  }

  .info-ribbon-panel {
    padding: 5px 12px;
  }

  .info-ribbon-content {
    min-height: 30px;
    gap: 8px;
    text-align: left;
  }

  .info-ribbon-icon {
    width: 22px;
    height: 22px;
  }

  .info-ribbon-message {
    font-size: 0.78rem;
  }

  .info-ribbon-close {
    width: 24px;
    height: 24px;
  }

  .info-ribbon-enter-to,
  .info-ribbon-leave-from {
    max-height: 60px;
  }
}
</style>
