<template>
  <section v-if="items.length" class="flex flex-col gap-10">
    <TransitionGroup
      tag="div"
      name="gallery-cards"
      class="gallery-card-grid relative grid items-stretch gap-6"
      :style="gridStyle"
      aria-live="polite"
      @before-leave="pinLeavingCard"
    >
      <!-- The id is what a shared card link lands on; see galleryAnchorId. -->
      <div
        v-for="item in items"
        :id="galleryAnchorId(item.id)"
        :key="item.id"
        class="flex h-full rounded-[12px] transition-shadow duration-500"
        :class="item.id === highlightedId
          ? 'ring-2 ring-primary ring-offset-4 ring-offset-slate-50'
          : ''"
      >
        <GalleryCard
          :item="item"
          :compact-layout="normalizedCardsPerRow === 4"
        />
      </div>
    </TransitionGroup>

    <div v-if="canLoadMore" class="flex justify-center">
      <button
        type="button"
        class="bg-transparent px-8 py-2 text-lg font-medium text-primary"
        @click="$emit('loadMore')"
      >
        see more
      </button>
    </div>
  </section>

  <div v-else class="rounded-[24px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
    <h2 class="text-2xl font-bold text-base_black">No gallery items match this filter.</h2>
    <p class="mt-3 text-sm leading-6 text-slate-500">
      Try another tag or add new entries
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import GalleryCard from './GalleryCard.vue'
import { galleryAnchorId } from '@/utils/shareLinks'

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  canLoadMore: {
    type: Boolean,
    default: false,
  },
  /** Card a shared link pointed at; ringed until the visitor interacts. */
  highlightedId: {
    type: String,
    default: '',
  },
  cardsPerRow: {
    type: Number,
    default: 3,
  },
})

defineEmits(['loadMore'])

const normalizedCardsPerRow = computed(() => normalizeCardCount(props.cardsPerRow))
const gridStyle = computed(() => ({
  '--gallery-cards-per-row': String(normalizedCardsPerRow.value),
  '--gallery-cards-per-row-md': String(Math.min(normalizedCardsPerRow.value, 2)),
}))

// Grid items lose their slot once `position: absolute` kicks in on leave, so
// freeze the card at its current spot before the leave transition starts.
function pinLeavingCard(el) {
  el.style.left = `${el.offsetLeft}px`
  el.style.top = `${el.offsetTop}px`
  el.style.width = `${el.offsetWidth}px`
  el.style.height = `${el.offsetHeight}px`
}

function normalizeCardCount(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 3

  return Math.abs(value - 3) <= Math.abs(value - 4) ? 3 : 4
}
</script>

<style scoped>
.gallery-card-grid {
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .gallery-card-grid {
    grid-template-columns: repeat(var(--gallery-cards-per-row-md), minmax(0, 1fr));
  }
}

@media (min-width: 1280px) {
  .gallery-card-grid {
    grid-template-columns: repeat(var(--gallery-cards-per-row), minmax(0, 1fr));
  }
}

.gallery-cards-enter-active,
.gallery-cards-leave-active {
  transition: opacity 300ms ease, transform 300ms ease;
}

.gallery-cards-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.96);
}

.gallery-cards-leave-to {
  opacity: 0;
  transform: scale(0.94);
}

.gallery-cards-leave-active {
  position: absolute;
  z-index: 0;
}

.gallery-cards-move {
  transition: transform 400ms ease;
}
</style>
