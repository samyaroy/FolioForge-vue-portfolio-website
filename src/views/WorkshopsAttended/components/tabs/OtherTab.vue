<template>
  <div class="max-w-4xl mx-auto">
    <div v-if="othersByYear.length > 0">
      <div v-for="yearGroup in othersByYear" :key="yearGroup.year" class="mb-12">
        <div class="flex items-center gap-4 mb-6">
          <span class="text-lg font-semibold text-gray-400">{{ yearGroup.year }}</span>
          <div class="flex-1 h-px bg-gray-200"></div>
        </div>

        <div class="space-y-6">
          <OtherCard
            v-for="(item, index) in yearGroup.items"
            :key="index"
            :other="item"
          />
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <p class="text-gray-500 text-lg">No entry found</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import OtherCard from '../cards/OtherCard.vue'

const props = defineProps({
  others: {
    type: Array,
    default: () => []
  }
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

const othersByYear = computed(() => groupByYear(props.others))
</script>
