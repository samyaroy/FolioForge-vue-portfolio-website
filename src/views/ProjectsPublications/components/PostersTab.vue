<template>
  <div class="bg-white rounded-lg shadow-sm p-8">
    <h2 class="text-2xl font-bold text-[#0e141b] mb-6">Posters</h2>

    <div v-if="posters && posters.length > 0" class="space-y-6">
      <div v-for="poster in posters" :key="poster.id" class="border-l-4 border-[#1980e6] pl-6 py-4">
        <div class="flex items-start justify-between mb-3">
          <h3 class="text-lg font-semibold text-[#0e141b] hover:text-[#1980e6] cursor-pointer">
            {{ poster.title }}
          </h3>
          <span class="text-sm text-gray-500">{{ poster.date }}</span>
        </div>
        <p v-if="poster.event" class="text-gray-700 mb-3"><v-icon size="20">mdi-calendar-text</v-icon><span class="px-3">{{ poster.event }}</span></p>
        <p v-if="poster.authors" class="text-gray-600 mb-2"><v-icon size="20">mdi-account-group</v-icon><span class="px-3">{{ poster.authors }}</span></p>
        <p v-if="poster.description" class="text-gray-700 mb-3">{{ poster.description }}</p>
        <div v-if="poster.link" class="mb-3">
          <a :href="poster.link" target="_blank" class="text-[#1980e6] hover:underline text-sm flex items-center">
            <v-icon size="20" class="mr-1">mdi-link</v-icon> View Poster
          </a>
        </div>
        <div v-if="poster.cred_link" class="mb-3">
          <a :href="poster.cred_link" target="_blank" class="text-[#1980e6] hover:underline text-sm flex items-center">
            <v-icon size="20" class="mr-1">mdi-file-document-outline</v-icon> Credential Link
          </a>
        </div>
        <div v-if="poster.image" class="mb-3">
          <img :src="poster.image" alt="Poster Image" class="max-w-xs h-auto rounded-lg shadow-md" />
        </div>
        <div v-if="poster.tags && poster.tags.length" class="flex flex-wrap gap-2">
          <span v-for="tag in poster.tags" :key="tag"
            class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {{ tag }}
          </span>
        </div>
      </div>
    </div>

    <div v-else class="text-center text-gray-500 italic">
      No posters yet
    </div>
  </div>
</template>

<script setup>
defineProps({
  posters: {
    type: Array,
    default: () => []
  }
})
</script>