<template>
  <div class="max-w-4xl mx-auto">
    <div v-if="showOtherLearningEngagements" class="text-sm text-end">
      <a
        href="#other-learning-engagements"
        class="inline-flex items-center  font-medium text-[#1980e6] hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-[#1980e6] focus:ring-offset-2"
        @click.prevent="isOtherLearningModalOpen = true"
      >
        <span>Other Learning Engagements</span>
        <v-icon size="14">mdi-arrow-right</v-icon>
      </a>
    </div>

    <OtherLearningEngagementsModal
      v-model="isOtherLearningModalOpen"
      :engagements="otherLearningEngagements"
    />

    <div v-if="showMain && workshopsByYear.length > 0">
      <div v-for="yearGroup in visibleWorkshopsByYear" :key="yearGroup.year" class="mb-12">
        <!-- Year Divider -->
        <div class="flex items-center gap-4 mb-6">
          <span class="text-lg font-semibold text-gray-400">{{ yearGroup.year }}</span>
          <div class="flex-1 h-px bg-gray-200"></div>
        </div>

        <!-- Cards for this year -->
        <div class="space-y-6">
          <WorkshopCard v-for="(workshop, index) in yearGroup.items"
                        :key="index" :workshop="workshop" />
        </div>
      </div>

      <div v-if="hasMoreWorkshops" class="flex justify-end">
        <a
          href="#"
          class="text-[#1980e6] hover:text-[#1980e6] text-sm font-medium transition-colors duration-200 flex items-center gap-1"
          @click.prevent="loadMoreWorkshops"
        >
          Load more
          <v-icon size="16" class="text-[#1980e6]">mdi-arrow-right</v-icon>
        </a>
      </div>
    </div>
    
    <div v-else-if="showMain" class="text-center py-12">
      <p class="text-gray-500 text-lg">No workshops attended yet</p>
    </div>

    <div v-else-if="!showOtherLearningEngagements" class="text-center py-12">
      <p class="text-gray-500 text-lg">Workshops are currently hidden</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import WorkshopCard from '../cards/WorkshopCard.vue'
import OtherLearningEngagementsModal from '../modal/OtherLearningEngagementsModal.vue'

const props = defineProps({
  workshops: {
    type: Array,
    default: () => []
  },
  otherLearningEngagements: {
    type: Array,
    default: () => []
  },
  showMain: {
    type: Boolean,
    default: true
  },
  showOtherLearningEngagements: {
    type: Boolean,
    default: true
  }
})

const isOtherLearningModalOpen = ref(false)

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
const workshopsByYear = computed(() => groupByYear(props.workshops))

// Pagination: show 10 entries at a time, in display order across year groups
const PAGE_SIZE = 10
const visibleCount = ref(PAGE_SIZE)

const visibleWorkshopsByYear = computed(() => {
  let remaining = visibleCount.value
  const limited = []
  for (const group of workshopsByYear.value) {
    if (remaining <= 0) break
    const items = group.items.slice(0, remaining)
    remaining -= items.length
    limited.push({ year: group.year, items })
  }
  return limited
})

const hasMoreWorkshops = computed(() => visibleCount.value < props.workshops.length)

function loadMoreWorkshops() {
  visibleCount.value += PAGE_SIZE
}
</script>
