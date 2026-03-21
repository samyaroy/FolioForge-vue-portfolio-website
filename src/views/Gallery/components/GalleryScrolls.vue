<template>
  <section v-if="items.length" class="flex flex-col gap-10">
    <div class="mx-auto flex w-full max-w-4xl flex-col gap-6" aria-live="polite">
      <div
        v-for="item in items"
        :key="item.id"
        class="h-full"
      >
        <GalleryCard :item="item" />
      </div>
    </div>

    <div v-if="canLoadMore" class="flex justify-center">
      <button
        type="button"
        class="border-b-2 border-primary bg-transparent px-8 py-4 text-xl font-bold text-primary transition-colors duration-200 hover:bg-sky-50"
        @click="$emit('loadMore')"
      >
        see more
      </button>
    </div>
  </section>

  <div v-else class="rounded-[24px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
    <h2 class="text-2xl font-bold text-base_black">No gallery items match this filter.</h2>
    <p class="mt-3 text-sm leading-6 text-slate-500">
      Try another tag or add a new entry in <code>src/content/gallery.yml</code>.
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
</script>
