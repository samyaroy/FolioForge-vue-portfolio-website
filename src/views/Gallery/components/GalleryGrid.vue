<template>
  <section v-if="items.length" class="flex flex-col gap-10">
    <TransitionGroup
      tag="div"
      name="gallery-cards"
      class="relative grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3"
      aria-live="polite"
      @before-leave="pinLeavingCard"
    >
      <div
        v-for="item in items"
        :key="item.id"
        class="h-full"
      >
        <GalleryCard :item="item" />
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
import GalleryCard from './GalleryCard.vue'

defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  canLoadMore: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['loadMore'])

// Grid items lose their slot once `position: absolute` kicks in on leave, so
// freeze the card at its current spot before the leave transition starts.
function pinLeavingCard(el) {
  el.style.left = `${el.offsetLeft}px`
  el.style.top = `${el.offsetTop}px`
  el.style.width = `${el.offsetWidth}px`
  el.style.height = `${el.offsetHeight}px`
}
</script>

<style scoped>
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
