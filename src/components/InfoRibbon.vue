<template>
  <Transition name="info-ribbon" @after-leave="emitDismissed">
    <section
      v-if="isVisible && currentEntry"
      class="info-ribbon-shell"
      aria-label="Announcement"
      @mouseenter="pauseRotation"
      @mouseleave="resumeRotation"
      @focusin="pauseRotation"
      @focusout="resumeRotation"
    >
      <div class="info-ribbon-panel">
        <div class="info-ribbon-content">
          <span class="info-ribbon-icon">
            <v-icon color="#ffffff" size="14">{{ currentEntry.icon }}</v-icon>
          </span>
          <span class="info-ribbon-message">
            <Transition name="info-ribbon-swap" mode="out-in">
              <span :key="activeIndex" class="info-ribbon-message-text">
                <CaptionContent :text="currentEntry.message" />
              </span>
            </Transition>
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
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import CaptionContent from '@/components/CaptionContent.vue'

const DEFAULT_ICON = 'mdi-information'

const props = defineProps({
  // One entry per announcement — `{ message, icon }`, straight from
  // content/profile_info/ribbon.yml. A lone object is accepted too, so the
  // YAML can go back to a single mapping without touching this component.
  entries: {
    type: [Array, Object],
    default: () => [],
  },
  // How long each message holds before the next one takes its place.
  rotationMs: {
    type: Number,
    default: 5000,
  },
})

const isVisible = ref(true)
const activeIndex = ref(0)
const emit = defineEmits(['dismissed'])

// Entries without a message would render an empty ribbon, so drop them here
// rather than making every call site filter first.
const ribbonEntries = computed(() => {
  const list = Array.isArray(props.entries) ? props.entries : [props.entries]
  return list
    .filter(entry => typeof entry?.message === 'string' && entry.message.trim())
    .map(entry => ({ message: entry.message, icon: entry.icon || DEFAULT_ICON }))
})

const currentEntry = computed(() => ribbonEntries.value[activeIndex.value] ?? null)

let rotationTimer = null

function stopRotation() {
  if (rotationTimer === null) return
  window.clearInterval(rotationTimer)
  rotationTimer = null
}

function startRotation() {
  stopRotation()
  // A single announcement has nothing to rotate to.
  if (ribbonEntries.value.length < 2) return

  rotationTimer = window.setInterval(() => {
    activeIndex.value = (activeIndex.value + 1) % ribbonEntries.value.length
  }, props.rotationMs)
}

// Hovering or tabbing in holds the current message: these announcements carry
// links, and rotating one away mid-read would pull the link out from under the
// pointer.
function pauseRotation() {
  stopRotation()
}

function resumeRotation() {
  startRotation()
}

watch(
  ribbonEntries,
  () => {
    activeIndex.value = 0
    startRotation()
  },
  { immediate: true },
)

onBeforeUnmount(stopRotation)

function closeRibbon() {
  stopRotation()
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

.info-ribbon-message-text {
  display: block;
}

/* Only the text swaps; the panel around it stays put between messages. */
.info-ribbon-swap-enter-active,
.info-ribbon-swap-leave-active {
  transition:
    opacity 200ms ease,
    transform 200ms ease;
}

.info-ribbon-swap-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.info-ribbon-swap-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (prefers-reduced-motion: reduce) {
  .info-ribbon-swap-enter-active,
  .info-ribbon-swap-leave-active {
    transition: none;
  }

  .info-ribbon-swap-enter-from,
  .info-ribbon-swap-leave-to {
    transform: none;
  }
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
