<template>
  <div class="px-4 md:px-8 lg:px-20 py-4 bg-slate-50">
    <div class="max-w-[1200px] mx-auto">
      <div class="flex flex-wrap justify-between gap-3 p-4">
        <h2 class="text-[#0e141b] tracking-light text-[32px] font-bold leading-tight min-w-72">
          {{ currentTitle }}
        </h2>
      </div>

      <div class="overflow-hidden">
        <div
          class="flex transition-transform duration-500 ease-in-out"
          :style="{ transform: `translateX(-${activeSlidePosition * 100}%)` }"
        >
          <AwardsSlide
            v-if="canShowAwards"
            :awards="awards"
            :icon-map="iconMap"
            :has-achievements="canShowAchievements"
            @show-achievements="setSlide(1)"
          />

          <AchievementsSlide
            v-if="canShowAchievements"
            :achievements="achievements"
            :icon-map="iconMap"
            :has-awards="canShowAwards"
            @show-awards="setSlide(0)"
          />
        </div>
      </div>

      <div v-if="slides.length > 1" class="flex justify-center items-center gap-2 mt-2 mb-4">
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
import config from "@/content/profile_info";
import { isFeatureEnabled } from '@/config/featureFlags'
const { awards, achievements } = config;

const AUTO_SLIDE_INTERVAL = 30000
const currentSlide = ref(0)
let autoSlideTimer = null

const hasAwards = computed(() => Boolean(awards && awards.length))
const hasAchievements = computed(() => Boolean(achievements && achievements.length))
const canShowAwards = computed(() => isFeatureEnabled('showHome.showAwards') && hasAwards.value)
const canShowAchievements = computed(() => isFeatureEnabled('showHome.showAchivement') && hasAchievements.value)
const slides = computed(() => [
  ...(canShowAwards.value ? [{ index: 0, label: 'awards and prizes' }] : []),
  ...(canShowAchievements.value ? [{ index: 1, label: 'achievements' }] : []),
])

const activeSlidePosition = computed(() =>
  Math.max(0, slides.value.findIndex((slide) => slide.index === currentSlide.value))
)

const currentTitle = computed(() =>
  slides.value[activeSlidePosition.value]?.index === 1 ? 'Achievements' : 'Award and Prize'
)

const stopAutoSlide = () => {
  if (autoSlideTimer) {
    clearInterval(autoSlideTimer)
    autoSlideTimer = null
  }
}

const startAutoSlide = () => {
  stopAutoSlide()

  if (slides.value.length < 2) {
    return
  }

  autoSlideTimer = setInterval(() => {
    const currentIndex = slides.value.findIndex((slide) => slide.index === currentSlide.value)
    const nextIndex = currentIndex === slides.value.length - 1 ? 0 : currentIndex + 1
    currentSlide.value = slides.value[nextIndex].index
  }, AUTO_SLIDE_INTERVAL)
}

const setSlide = (index) => {
  if (!slides.value.some((slide) => slide.index === index)) {
    return
  }

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

onMounted(() => {
  currentSlide.value = slides.value[0]?.index ?? 0
  startAutoSlide()
})
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
