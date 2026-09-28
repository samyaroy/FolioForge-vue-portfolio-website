<template>
  <div class="max-w-4xl mx-auto mb-6">
    <div class="bg-white rounded-lg shadow-md flex items-stretch overflow-hidden">
      <!-- Left 20%: Credly Logo. At 20% of a phone-width card the box is
           narrower than its own `px-6`, which crushed the logo; the
           padding and share both scale down below `sm`. -->
      <div class="w-[30%] sm:w-[20%] shrink-0 flex items-center justify-center px-2 sm:px-6 py-3 border-r border-[#166fd1]">
        <img :src="credlyIcon" alt="Credly logo" class="w-full max-w-[160px] h-8 sm:h-12 object-contain" />
      </div>
      <!-- Right 80%: the link, the issuers, and the live count on the far right
           (stacked under the link below `sm`). -->
      <div class="w-[70%] sm:w-[80%] py-2 px-3 sm:pl-6 sm:pr-6 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
        <div class="min-w-0 flex-1">
          <p class="text-sm text-[#4e7397]">
            View my verified badges on
            <a :href="profileUrl" target="_blank" rel="noopener noreferrer"
              class="text-[#1980e6] font-medium underline hover:text-[#126ab5]">Credly</a>
          </p>
          <ul v-if="summary?.issuers.length" class="credly-readout mt-1.5 flex flex-wrap gap-1" aria-label="Badge issuers">
            <li v-for="issuer in summary.issuers" :key="issuer.name" class="credly-issuer">
              <span>{{ issuer.name }}</span>
              <span class="credly-issuer-count">{{ issuer.count }}</span>
            </li>
          </ul>
        </div>

        <!-- Hidden when the count cannot be had; the link above still works. -->
        <a v-if="status !== 'unavailable'" :href="profileUrl" target="_blank" rel="noopener noreferrer"
          class="credly-readout credly-stats" :aria-busy="status === 'loading'">
          <span class="credly-count" :class="{ 'credly-count--loading': status === 'loading' }" aria-hidden="true">
            {{ displayCount }}
          </span>
          <span class="flex min-w-0 flex-col">
            <span class="credly-label">
              <span v-if="summary" class="sr-only">{{ summary.count }}</span>
              Verified {{ summary?.count === 1 ? 'Badge' : 'Badges' }}
            </span>
            <span class="credly-updated">
              <template v-if="summary">
                Last updated <time :datetime="summary.updatedAt.toISOString()">{{ updatedLabel }}</time>
              </template>
              <template v-else>Syncing&hellip;</template>
            </span>
          </span>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// The live readout is set in Orbitron, loaded here rather than in index.html
// so the font ships only with this route's chunk.
import '@fontsource-variable/orbitron'
import { computed, onMounted, ref } from 'vue'
import { iconUrl } from '@/config/mediaAssets'
import { loadCredlyBadgeSummary, type CredlyBadgeSummary } from '@/utils/credlyBadges'

const props = defineProps<{
  /** Public Credly profile; the link text and the count both point here. */
  profileUrl: string
  /** `credlyBadgesApi` from profile.yml. Blank shows the link alone. */
  summaryEndpoint?: string
}>()

const credlyIcon = iconUrl('Credly')

const summary = ref<CredlyBadgeSummary | null>(null)
const status = ref<'loading' | 'ready' | 'unavailable'>(props.summaryEndpoint?.trim() ? 'loading' : 'unavailable')

// Two digits reads as an instrument readout (03, 12); larger counts keep all
// their digits.
const displayCount = computed(() => (summary.value ? String(summary.value.count).padStart(2, '0') : '--'))

// Spelled out rather than left to Intl: en-GB abbreviates September as "Sept"
// in some engines and "Sep" in others. UTC, because `updatedAt` is.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const updatedLabel = computed(() => {
  const date = summary.value?.updatedAt
  if (!date) return ''
  return `${String(date.getUTCDate()).padStart(2, '0')} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`
})

onMounted(async () => {
  if (status.value === 'unavailable') return
  summary.value = await loadCredlyBadgeSummary(props.summaryEndpoint)
  status.value = summary.value ? 'ready' : 'unavailable'
})
</script>

<style scoped>
.credly-readout {
  font-family: 'Orbitron Variable', ui-monospace, SFMono-Regular, Menlo, monospace;
}

/* The global `a` rule in style.css colours every link purple. */
.credly-stats {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 0.75rem;
  color: #0e141b;
  font-weight: 500;
  border-radius: 0.25rem;
}

.credly-stats:hover {
  color: #0e141b;
}

.credly-stats:focus-visible {
  outline: 2px solid #1980e6;
  outline-offset: 4px;
}

@media (min-width: 640px) {
  .credly-stats {
    align-self: stretch;
    padding-left: 1.5rem;
    border-left: 1px solid #dbe4ee;
  }
}

.credly-count {
  min-width: 2ch;
  color: #1980e6;
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.04em;
  font-variant-numeric: tabular-nums;
  transition: color 200ms ease;
}

.credly-stats:hover .credly-count {
  color: #126ab5;
}

.credly-count--loading {
  color: #b6c8dc;
  animation: credly-blink 1.2s steps(2, jump-none) infinite;
}

@keyframes credly-blink {
  50% {
    opacity: 0.35;
  }
}

@media (prefers-reduced-motion: reduce) {
  .credly-count--loading {
    animation: none;
  }
}

.credly-label {
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.credly-updated {
  margin-top: 0.25rem;
  color: #4e7397;
  font-size: 0.5625rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

/* Below `sm` the readout shares a narrow column, so the line may break, but only
   between the label and the date. */
.credly-updated time {
  white-space: nowrap;
}

.credly-issuer {
  display: inline-flex;
  align-items: center;
  gap: 0.3125rem;
  padding: 0 0.3125rem 0 0.375rem;
  border: 1px solid #cfe0f5;
  border-radius: 0.25rem;
  background: #f3f8fe;
  color: #166fd1;
  font-size: 0.5625rem;
  font-weight: 600;
  line-height: 1.125rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.credly-issuer-count {
  padding-left: 0.3125rem;
  border-left: 1px solid #cfe0f5;
  color: #0e141b;
  font-variant-numeric: tabular-nums;
}
</style>
