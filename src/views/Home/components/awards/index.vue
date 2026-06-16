<template>
  <div class="px-4 md:px-8 lg:px-20 py-4 bg-slate-50">
    <div class="max-w-[1200px] mx-auto">
      <div class="flex flex-wrap justify-between gap-3 p-4">
        <h2 class="text-[#0e141b] tracking-light text-[32px] font-bold leading-tight min-w-72">
          {{ currentSlide === 1 ? 'Achievements' : 'Award and Prize' }}
        </h2>
      </div>

      <div class="overflow-hidden">
        <div
          class="flex transition-transform duration-500 ease-in-out"
          :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
        >
          <AwardsSlide
            :awards="awards"
            :icon-map="iconMap"
            :has-achievements="hasAchievements"
            @show-achievements="setSlide(1)"
          />

          <AchievementsSlide
            :achievements="achievements"
            :icon-map="iconMap"
            @show-awards="setSlide(0)"
          />
        </div>
      </div>

      <div v-if="hasAchievements" class="flex justify-center items-center gap-2 mt-2 mb-4">
        <button
          v-for="slide in slides"
          :key="slide.index"
          type="button"
          class="awards-dot-button"
          :class="{ 'is-active': currentSlide === slide.index }"
          :aria-label="`Show ${slide.label}`"
          @click="setSlide(slide.index)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import AchievementsSlide from "./components/slides/AchievementsSlide.vue";
import AwardsSlide from "./components/slides/AwardsSlide.vue";
import config from "@/profile_info.yml";
const { awards, achievements } = config;

const AUTO_SLIDE_INTERVAL = 30000
const currentSlide = ref(0)
let autoSlideTimer = null

const hasAchievements = computed(() => Boolean(achievements && achievements.length))
const slides = [
  { index: 0, label: 'awards and prizes' },
  { index: 1, label: 'achievements' },
]

const stopAutoSlide = () => {
  if (autoSlideTimer) {
    clearInterval(autoSlideTimer)
    autoSlideTimer = null
  }
}

const startAutoSlide = () => {
  stopAutoSlide()

  if (!hasAchievements.value) {
    return
  }

  autoSlideTimer = setInterval(() => {
    currentSlide.value = currentSlide.value === 0 ? 1 : 0
  }, AUTO_SLIDE_INTERVAL)
}

const setSlide = (index) => {
  currentSlide.value = index
  startAutoSlide()
}

const iconMap = {
  Academic: "mdi-seal-variant",
  Professional: "mdi-trophy-award",
  Competition: "mdi-trophy",
  Grant: "mdi-cash",
  Research: "mdi-flask",
  Extracurricular: "mdi-star-circle",
}

onMounted(startAutoSlide)
onUnmounted(stopAutoSlide)
</script>

<style scoped>
:deep(.awards-text-button) {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0;
  border: 0;
  outline: 0;
  border-radius: 0;
  background: transparent;
  color: #1980e6;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.25rem;
  box-shadow: none;
  cursor: pointer;
  transition: color 200ms ease;
}

:deep(.awards-text-button:hover),
:deep(.awards-text-button:focus),
:deep(.awards-text-button:focus-visible) {
  border: 0;
  outline: 0;
  background: transparent;
  color: #0e141b;
  box-shadow: none;
}

.awards-dot-button {
  width: 0.5rem;
  height: 0.5rem;
  padding: 0;
  border: 0;
  outline: 0;
  border-radius: 9999px;
  background: rgba(78, 115, 151, 0.4);
  box-shadow: none;
  cursor: pointer;
  transition: width 300ms ease, background-color 300ms ease, opacity 300ms ease;
}

.awards-dot-button.is-active {
  width: 1.25rem;
  background: #1980e6;
}

.awards-dot-button:hover,
.awards-dot-button:focus,
.awards-dot-button:focus-visible {
  border: 0;
  outline: 0;
  background: rgba(25, 128, 230, 0.7);
  box-shadow: none;
}

.awards-dot-button.is-active:hover,
.awards-dot-button.is-active:focus,
.awards-dot-button.is-active:focus-visible {
  background: #1980e6;
}
</style>
