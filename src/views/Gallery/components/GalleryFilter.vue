<template>
  <section class="relative z-30">
    <div ref="menuRoot" class="relative flex flex-col items-end">
      <button type="button"
        class="relative inline-flex h-10 w-8 items-center justify-center rounded-full border border-white/60 bg-white/50 text-slate-600 shadow-lg backdrop-blur-md transition-all duration-200 hover:border-primary/60 hover:bg-white/70 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        :aria-expanded="isOpen" aria-haspopup="dialog" aria-label="Open gallery filters" @click="toggleMenu">
        <v-icon size="16">{{ hasSelectedFilters ? 'mdi-filter-check-outline' : 'mdi-filter-variant' }}</v-icon>

        <span v-if="selectedFilters.length"
          class="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
          {{ selectedFilters.length }}
        </span>
      </button>

      <div v-if="isOpen"
        class="absolute right-0 top-full z-40 mt-2 w-[min(19rem,calc(100vw-2rem))] rounded-[12px] border border-white/70 bg-white/85 p-4 shadow-xl backdrop-blur-md"
        role="dialog" aria-label="Gallery filters">
        <div class="flex items-start justify-between gap-2">
          <p class="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
            Filter gallery
          </p>

          <button type="button"
            class="min-w-[3.5rem] text-right text-xs font-semibold uppercase tracking-[0.18em] text-primary transition-colors duration-200 hover:text-primary-700 -mt-1"
            :class="selectedFilters.length ? 'visible' : 'invisible pointer-events-none'" @click="clearFilters">
            Clear
          </button>
        </div>

        <div class="mt-4 flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
          <label v-for="option in options" :key="option.id"
            class="flex cursor-pointer items-center gap-3 rounded-[12px] border px-4 py-3 transition-all duration-200"
            :class="isSelected(option.id) ? 'border-primary bg-sky-50 text-primary' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'">
            <input type="checkbox" class="h-4 w-4 accent-primary" :checked="isSelected(option.id)"
              @change="toggleFilter(option.id)">
            <span class="text-sm font-medium leading-5">{{ option.label }}</span>
          </label>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  options: {
    type: Array,
    default: () => [],
  },
  selectedFilters: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:selectedFilters'])

const isOpen = ref(false)
const menuRoot = ref(null)
const hasSelectedFilters = computed(() => props.selectedFilters.length > 0)

function toggleMenu() {
  isOpen.value = !isOpen.value
}

function toggleFilter(filterId) {
  const nextFilters = new Set(props.selectedFilters)

  if (nextFilters.has(filterId)) {
    nextFilters.delete(filterId)
  } else {
    nextFilters.add(filterId)
  }

  emit('update:selectedFilters', Array.from(nextFilters))
}

function clearFilters() {
  emit('update:selectedFilters', [])
}

function isSelected(filterId) {
  return props.selectedFilters.includes(filterId)
}

function handlePointerDown(event) {
  if (!isOpen.value) return
  if (menuRoot.value?.contains(event.target)) return

  isOpen.value = false
}

function handleKeydown(event) {
  if (event.key !== 'Escape') return

  isOpen.value = false
}

onMounted(() => {
  document.addEventListener('mousedown', handlePointerDown)
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handlePointerDown)
  document.removeEventListener('keydown', handleKeydown)
})
</script>
