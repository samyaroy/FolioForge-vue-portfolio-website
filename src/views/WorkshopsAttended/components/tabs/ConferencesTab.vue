<template>
  <div class="max-w-4xl mx-auto">
    <div v-if="conferencesByYear.length > 0">
      <div v-for="yearGroup in conferencesByYear" :key="yearGroup.year" class="mb-12">
        <!-- Year Divider -->
        <div class="flex items-center gap-4 mb-6">
          <span class="text-lg font-semibold text-gray-400">{{ yearGroup.year }}</span>
          <div class="flex-1 h-px bg-gray-200"></div>
        </div>
        
        <!-- Cards for this year -->
        <div class="space-y-6">
          <ConferenceCard v-for="(conference, index) in yearGroup.items" 
                          :key="index" :conference="conference" />
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-12">
      <p class="text-gray-500 text-lg">No conferences attended yet</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ConferenceCard from '../cards/ConferenceCard.vue'

const props = defineProps({
  conferences: {
    type: Array,
    default: () => []
  }
})

// Utility function to extract year from date string
function extractYear(dateString) {
  const match = dateString?.match(/\d{4}/)
  return match ? match[0] : 'Unknown'
}

// Utility function to group items by year
function groupByYear(items) {
  const grouped = {}
  items.forEach(item => {
    const year = extractYear(item.date)
    if (!grouped[year]) grouped[year] = []
    grouped[year].push(item)
  })
  // Return sorted by year descending (newest first)
  return Object.keys(grouped)
    .sort((a, b) => {
      if (a === 'Unknown') return 1
      if (b === 'Unknown') return -1
      return b - a
    })
    .map(year => ({ year, items: grouped[year] }))
}

// Computed property for grouped data
const conferencesByYear = computed(() => groupByYear(props.conferences))
</script>
