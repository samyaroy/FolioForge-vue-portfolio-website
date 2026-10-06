<template>
  <div :class="{ 'tab-panels-sliding': sliding }">
    <!-- Keyed on the active tab, so whatever the slot shows for it slides out
         and the next tab's content slides in from the side it was picked on. -->
    <Transition
      :name="`tab-slide-${direction}`"
      :css="animated"
      mode="out-in"
      @before-leave="sliding = true"
      @before-enter="sliding = true"
      @after-enter="sliding = false"
      @enter-cancelled="sliding = false"
    >
      <div :key="active ?? ''">
        <slot />
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'

const props = defineProps({
  // The same [{ id }] list the TabBar shows; its order sets the direction.
  tabs: {
    type: Array,
    required: true,
  },
  active: {
    type: String,
    default: null,
  },
})

// 'forward' (to a tab further right) or 'back'.
const direction = ref('forward')
// Off for the first frame, as in TabBar: a tab picked from the URL shows at
// once instead of sliding in as the page opens.
const animated = ref(false)
// Clips the sideways overflow only while a panel is moving, so it never adds
// a horizontal scrollbar and never trims card shadows at rest.
const sliding = ref(false)

watch(() => props.active, (next, prev) => {
  const ids = props.tabs.map(tab => tab.id)
  direction.value = ids.indexOf(next) < ids.indexOf(prev) ? 'back' : 'forward'
})

onMounted(() => {
  requestAnimationFrame(() => {
    animated.value = true
  })
})
</script>

<style scoped>
.tab-panels-sliding {
  overflow-x: clip;
}

.tab-slide-forward-enter-active,
.tab-slide-back-enter-active {
  transition:
    opacity 260ms ease-out,
    transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
}

.tab-slide-forward-leave-active,
.tab-slide-back-leave-active {
  transition:
    opacity 140ms ease-in,
    transform 140ms ease-in;
}

.tab-slide-forward-enter-from,
.tab-slide-back-leave-to {
  opacity: 0;
  transform: translateX(32px);
}

.tab-slide-forward-leave-to,
.tab-slide-back-enter-from {
  opacity: 0;
  transform: translateX(-32px);
}

@media (prefers-reduced-motion: reduce) {
  .tab-slide-forward-enter-active,
  .tab-slide-back-enter-active,
  .tab-slide-forward-leave-active,
  .tab-slide-back-leave-active {
    transition: none;
  }
}
</style>
