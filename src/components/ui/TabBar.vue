<template>
  <div ref="bar" class="relative flex flex-wrap justify-center gap-1 bg-white rounded-lg p-1 shadow-sm">
    <!-- The active tab's blue fill is one pill under the buttons rather than
         each button's own background, so switching tabs slides it across. -->
    <span
      v-if="indicator"
      class="tab-indicator"
      :class="{ 'tab-indicator-animated': animated }"
      :style="{
        width: `${indicator.width}px`,
        height: `${indicator.height}px`,
        transform: `translate(${indicator.x}px, ${indicator.y}px)`,
      }"
      aria-hidden="true"
    />
    <button
      v-for="tab in tabs"
      :key="tab.id"
      :ref="el => setButton(tab.id, el)"
      @click="emit('update:modelValue', tab.id)"
      :class="[
        'relative z-[1] inline-flex items-center px-3 py-2 sm:px-6 sm:py-3 rounded-md text-sm font-medium transition-colors duration-200',
        modelValue === tab.id
          ? ['text-white', indicator ? '' : 'bg-[#1980e6] shadow-sm']
          : 'text-gray-600 hover:text-[#1980e6] hover:bg-gray-50',
        tab.highlight && modelValue !== tab.id ? 'tab-highlight-idle' : ''
      ]"
    >
      <!-- `highlight: true` on a tab gives it a warm sparkle badge, the
           counterpart of the footer's Resources sparkle and the header's Blog
           dot. The badge carries its own fill and white ring, so it reads on
           both the white bar and the blue pill; it pulses only until the tab
           is opened. -->
      <span v-if="tab.highlight" class="tab-highlight-badge">
        <v-icon size="12" class="text-white">mdi-creation</v-icon>
      </span>
      {{ tab.name }}
    </button>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  // [{ id, name, highlight? }]
  tabs: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue'])

const bar = ref(null)
const buttons = new Map()
const indicator = ref(null)
// Off for the first frame, so the pill lands on a tab picked from the URL
// (?tab=) instead of sliding there from the first one as the page opens.
const animated = ref(false)

let resizeObserver = null

function setButton(id, el) {
  if (el) {
    buttons.set(id, el)
    resizeObserver?.observe(el)
  } else {
    buttons.delete(id)
  }
}

function measure() {
  const button = buttons.get(props.modelValue)
  indicator.value = button
    ? { x: button.offsetLeft, y: button.offsetTop, width: button.offsetWidth, height: button.offsetHeight }
    : null
}

watch([() => props.modelValue, () => props.tabs], measure, { flush: 'post' })

onMounted(() => {
  measure()
  // Tabs wrap onto a second row on narrow screens and change width once the
  // web font loads, so the pill follows the buttons, not just the selection.
  resizeObserver = new ResizeObserver(measure)
  resizeObserver.observe(bar.value)
  buttons.forEach(el => resizeObserver.observe(el))
  document.fonts?.ready.then(measure)
  requestAnimationFrame(() => {
    animated.value = true
  })
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})
</script>

<style scoped>
.tab-indicator {
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 0.375rem;
  background: #1980e6;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  pointer-events: none;
}

.tab-indicator-animated {
  transition:
    transform 320ms cubic-bezier(0.22, 1, 0.36, 1),
    width 320ms cubic-bezier(0.22, 1, 0.36, 1),
    height 320ms cubic-bezier(0.22, 1, 0.36, 1);
}

/* Warm amber-to-pink, the complement of the site's blue, so it stands apart
   from both the white tab bar and the blue pill. */
.tab-highlight-badge {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 1.15rem;
  height: 1.15rem;
  margin-right: 0.45rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, #f59e0b 0%, #ec4899 100%);
  box-shadow: 0 0 0 1.5px #fff, 0 2px 6px rgba(236, 72, 153, 0.35);
}

.tab-highlight-idle {
  background-image: linear-gradient(135deg, #fff7ed 0%, #fdf2f8 100%);
}

.tab-highlight-idle .tab-highlight-badge {
  animation: tab-highlight-pulse 2s ease-out infinite;
}

@keyframes tab-highlight-pulse {
  0% {
    box-shadow: 0 0 0 1.5px #fff, 0 0 0 1.5px rgba(236, 72, 153, 0.55);
  }

  70%,
  100% {
    box-shadow: 0 0 0 1.5px #fff, 0 0 0 9px rgba(236, 72, 153, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .tab-indicator-animated {
    transition: none;
  }

  .tab-highlight-idle .tab-highlight-badge {
    animation: none;
  }
}
</style>
