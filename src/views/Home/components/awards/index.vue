<template>
  <div class="px-4 md:px-8 lg:px-20 py-8 bg-slate-50">
    <div class="max-w-[1200px] mx-auto">

      <!-- Section Header -->
      <div class="flex flex-wrap justify-between items-center gap-3 px-4 pb-6">
        <h2 class="text-[#0e141b] tracking-light text-[32px] font-bold leading-tight min-w-72">
          Awards and Achievements
        </h2>
        <span class="text-[#4e7397] text-sm font-medium">
          {{ currentIndex + 1 }} / {{ allItems.length }}
        </span>
      </div>

      <!-- Carousel -->
      <div class="relative" v-if="allItems.length">
        <!-- Slide Track -->
        <div class="overflow-hidden">
          <div
            class="flex transition-transform duration-500 ease-in-out"
            :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
          >
            <div
              v-for="(item, index) in allItems"
              :key="index"
              class="w-full flex-shrink-0 px-8"
            >
              <AwardCard
                :title="item.title"
                :year="item.year"
                :organization="item.organization"
                :category="iconMap[item.category] || 'mdi-star-circle'"
                :prize="item.prize"
                :description="item.description"
                :cred_link="item.cred_link"
                :type="item.type"
              />
            </div>
          </div>
        </div>

        <!-- Prev Arrow -->
        <button
          @click="prev"
          aria-label="Previous"
          class="absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-shadow duration-200 z-10"
        >
          <v-icon color="#1980e6" size="20">mdi-chevron-left</v-icon>
        </button>

        <!-- Next Arrow -->
        <button
          @click="next"
          aria-label="Next"
          class="absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-shadow duration-200 z-10"
        >
          <v-icon color="#1980e6" size="20">mdi-chevron-right</v-icon>
        </button>
      </div>

      <!-- Dot Indicators -->
      <div class="flex justify-center items-center gap-2 mt-5">
        <button
          v-for="(item, index) in allItems"
          :key="index"
          @click="goTo(index)"
          :aria-label="`Go to item ${index + 1}`"
          class="rounded-full transition-all duration-300"
          :class="currentIndex === index
            ? 'w-5 h-2 bg-[#1980e6]'
            : 'w-2 h-2 bg-[#4e7397] opacity-40 hover:opacity-60'"
        />
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AwardCard from "./components/AwardCard.vue"
import config from "@/profile_info.yml"

const { awards, achievements } = config

const iconMap = {
  Academic: "mdi-seal-variant",
  Professional: "mdi-trophy-award",
  Competition: "mdi-trophy",
  Grant: "mdi-cash",
  Research: "mdi-flask",
  Extracurricular: "mdi-star-circle",
}

const allItems = computed(() => [
  ...(awards || []).map(a => ({ ...a, type: 'award' })),
  ...(achievements || []).map(a => ({ ...a, type: 'achievement' })),
])

const currentIndex = ref(0)
let timer = null

const startTimer = () => {
  timer = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % allItems.value.length
  }, 30000)
}

const resetTimer = () => {
  clearInterval(timer)
  startTimer()
}

const next = () => {
  currentIndex.value = (currentIndex.value + 1) % allItems.value.length
  resetTimer()
}

const prev = () => {
  currentIndex.value = (currentIndex.value - 1 + allItems.value.length) % allItems.value.length
  resetTimer()
}

const goTo = (index) => {
  currentIndex.value = index
  resetTimer()
}

onMounted(startTimer)
onUnmounted(() => clearInterval(timer))
</script>
