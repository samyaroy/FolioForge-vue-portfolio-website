<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="other-hosted-events-title"
        @click.self="closeModal"
      >
        <div class="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-slate-50 shadow-2xl">
          <header class="flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-widest text-[#1980e6]">
                Professional Activities
              </p>
              <h2 id="other-hosted-events-title" class="mt-1 text-2xl font-black text-[#0e141b]">
                Other Hosted Events
              </h2>
            </div>

            <button
              type="button"
              class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1980e6] focus:ring-offset-2"
              aria-label="Close modal"
              @click="closeModal"
            >
              <v-icon size="22">mdi-close</v-icon>
            </button>
          </header>

          <div class="min-h-0 flex-1 overflow-y-auto px-5 py-5">
            <div v-if="eventsByYear.length > 0" class="mx-auto max-w-4xl">
              <section v-for="yearGroup in eventsByYear" :key="yearGroup.year" class="mb-10 last:mb-0">
                <div class="mb-5 flex items-center gap-4">
                  <span class="text-lg font-semibold text-gray-400">{{ yearGroup.year }}</span>
                  <div class="h-px flex-1 bg-gray-200"></div>
                </div>

                <div class="space-y-5">
                  <HostedEventCard
                    v-for="(event, index) in yearGroup.items"
                    :key="`${yearGroup.year}-${index}`"
                    :event="event"
                    compact-meta-text
                  />
                </div>
              </section>
            </div>

            <div v-else class="py-12 text-center">
              <p class="text-lg text-gray-500">No other hosted events found</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, watch } from 'vue'
import HostedEventCard from '../cards/HostedEventCard.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  events: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

function closeModal() {
  emit('update:modelValue', false)
}

function handleKeydown(event) {
  if (event.key === 'Escape') closeModal()
}

watch(() => props.modelValue, (isOpen) => {
  if (typeof document === 'undefined') return

  if (isOpen) {
    document.addEventListener('keydown', handleKeydown)
    document.body.style.overflow = 'hidden'
    return
  }

  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})

onBeforeUnmount(() => {
  if (typeof document === 'undefined') return

  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})

function extractYear(dateString) {
  const match = dateString?.match(/\d{4}/)
  return match ? match[0] : 'Unknown'
}

function parseDateValue(dateString) {
  if (!dateString) return Number.NEGATIVE_INFINITY

  const normalized = String(dateString)
    .replace(/\b(\d{1,2})(st|nd|rd|th)\b/gi, '$1')
    .trim()

  const candidates = normalized
    .split(/\s+-\s+/)
    .map(value => value.trim())
    .filter(Boolean)
    .reverse()

  for (const candidate of candidates.length ? candidates : [normalized]) {
    const parsed = Date.parse(candidate)
    if (!Number.isNaN(parsed)) return parsed
  }

  const yearMatches = normalized.match(/\d{4}/g)
  return yearMatches?.length ? Number(yearMatches[yearMatches.length - 1]) : Number.NEGATIVE_INFINITY
}

function groupByYear(items) {
  const sortedItems = [...items].sort((a, b) => parseDateValue(b.date) - parseDateValue(a.date))
  const grouped = new Map()

  sortedItems.forEach(item => {
    const year = extractYear(item.date)
    if (!grouped.has(year)) grouped.set(year, [])
    grouped.get(year).push(item)
  })

  return [...grouped.entries()].map(([year, groupedItems]) => ({ year, items: groupedItems }))
}

const eventsByYear = computed(() => groupByYear(props.events))
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 160ms ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
