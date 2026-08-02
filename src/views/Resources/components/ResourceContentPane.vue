<template>
  <div class="min-w-0 overflow-hidden bg-white lg:rounded-r-lg">
    <Transition name="resource-slide" mode="out-in">
      <section
        v-if="subject"
        :key="activeIndex"
        class="min-h-[260px] p-6"
        aria-label="Contents"
      >
        <p v-if="subject.description" class="content-justify mb-6 text-gray-600">
          {{ subject.description }}
        </p>

        <ul v-if="materials.length" class="flex flex-col gap-4">
          <li v-for="(material, index) in materials" :key="`${material.title}-${index}`">
            <ResourceMaterialCard :material="material" />
          </li>
        </ul>

        <div
          v-else
          class="border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-gray-500"
        >
          <span class="inline-flex items-end gap-2 border-b-2 border-slate-300 pb-0.5">
            <AnimatedIcon name="dino" :size="28" class="-mb-0.5 shrink-0" />
            <span>Nothing here yet — content for this section is coming soon.</span>
          </span>
        </div>
      </section>
    </Transition>
  </div>
</template>

<script setup>
import AnimatedIcon from '@/components/ui/AnimatedIcon.vue'
import ResourceMaterialCard from './ResourceMaterialCard.vue'

defineProps({
  subject: {
    type: Object,
    default: null,
  },
  materials: {
    type: Array,
    default: () => [],
  },
  activeIndex: {
    type: Number,
    default: 0,
  },
})
</script>

<style scoped>
.resource-slide-enter-active,
.resource-slide-leave-active {
  transition:
    opacity 180ms ease,
    transform 220ms ease;
}

.resource-slide-enter-from {
  opacity: 0;
  transform: translateX(1.25rem);
}

.resource-slide-leave-to {
  opacity: 0;
  transform: translateX(-1.25rem);
}
</style>
