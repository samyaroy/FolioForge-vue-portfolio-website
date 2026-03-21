<template>
  <section class="flex flex-row items-end gap-8 border-b border-slate-200 pb-8">
    <div class="flex min-w-0 w-4/5 flex-col gap-4">
      <h1 class="text-xl font-bold leading-tight tracking-tight text-base_black md:text-5xl">Career Unlocks</h1>

      <p class="text-base leading-8 text-slate-500 md:text-lg">
        A curated timeline of my career highlights, showcasing key milestones, achievements, and memorable moments that have shaped my professional journey.
      </p>
    </div>

    <div
      class="flex w-1/5 justify-end"
    >
      <div
        class="inline-flex overflow-hidden rounded-full border border-slate-200 bg-white p-1 shadow-sm"
      role="tablist"
      aria-label="Gallery view mode"
      >
        <button
          v-for="option in viewOptions"
          :key="option.id"
          :ref="(element) => setTabRef(element, option.id)"
          type="button"
          class="inline-flex min-w-[6.5rem] items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-500 transition-all duration-200 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          :class="{ 'bg-primary text-white shadow-sm hover:text-white': viewMode === option.id }"
          role="tab"
          :aria-selected="viewMode === option.id"
          :tabindex="viewMode === option.id ? 0 : -1"
          @click="selectView(option.id)"
          @keydown="onKeydown($event, option.id)"
        >
          <v-icon size="16">{{ option.icon }}</v-icon>
          {{ option.label }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { nextTick, ref } from 'vue'

const props = defineProps({
  viewMode: {
    type: String,
    default: 'grid',
  },
  viewOptions: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:viewMode'])
const tabRefs = ref({})

function setTabRef(element, id) {
  if (!element) {
    delete tabRefs.value[id]
    return
  }

  tabRefs.value[id] = element
}

function selectView(id) {
  emit('update:viewMode', id)
}

function onKeydown(event, currentId) {
  const currentIndex = props.viewOptions.findIndex(option => option.id === currentId)
  if (currentIndex === -1) return

  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    event.preventDefault()
    focusTabByIndex((currentIndex + 1) % props.viewOptions.length)
  }

  if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    event.preventDefault()
    focusTabByIndex((currentIndex - 1 + props.viewOptions.length) % props.viewOptions.length)
  }

  if (event.key === 'Home') {
    event.preventDefault()
    focusTabByIndex(0)
  }

  if (event.key === 'End') {
    event.preventDefault()
    focusTabByIndex(props.viewOptions.length - 1)
  }
}

function focusTabByIndex(index) {
  const nextOption = props.viewOptions[index]
  if (!nextOption) return

  emit('update:viewMode', nextOption.id)
  nextTick(() => {
    tabRefs.value[nextOption.id]?.focus()
  })
}
</script>
