<template>
  <div class="bg-white rounded-lg shadow-sm p-8">
    <h2 class="text-2xl font-bold text-[#0e141b] mb-6">Research Publications</h2>
    <div v-if="publications && publications.length > 0" class="space-y-6">
      <div
        v-for="publication in publications"
        :key="publication.id"
        class="border-l-4 border-[#1980e6] pl-6 py-4"
      >
        <h3 class="text-lg font-semibold text-[#0e141b] mb-2">{{ publication.title }}</h3>
        <p class="text-gray-600 mb-2">{{ publication.authors }}</p>
        <p class="text-sm text-gray-500 mb-3">{{ publication.journal }}, {{ publication.year }}</p>
        <p class="text-gray-700 mb-3">{{ publication.abstract }}</p>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="tag in publication.tags"
            :key="tag"
            class="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
          >
            {{ tag }}
          </span>
        </div>
      </div>
    </div>
    <div v-else class="text-center text-gray-500 italic space-y-6">
      No Publications Yet
    </div>
  </div>
</template>

<script setup>
defineProps({
  publications: Array
})
</script>