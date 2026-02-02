<template>
  <div class="bg-white rounded-lg shadow-sm p-8">
    <h2 class="text-2xl font-bold text-[#0e141b] mb-6">Articles & Blog Posts</h2>

    <div v-if="articles && articles.length > 0" class="space-y-6">
      <div v-for="article in articles" :key="article.id" class="border-l-4 border-[#1980e6] pl-6 py-4 pr-4  rounded-md bg-slate-50">
        <div class="flex items-start justify-between mb-3">
          <h3 class="text-lg font-semibold text-[#0e141b] hover:text-[#1980e6] cursor-pointer">
            {{ article.title }}            <span class="inline-block px-3 py-1 text-xs font-medium  text-white rounded-full"></span>
            <span class="inline-block px-3 py-1 text-xs font-medium bg-[#1980e6] text-white rounded-full">
              {{ article.type }}
            </span>
           
          </h3>



          <span class="text-sm text-gray-500">{{ article.date }}</span>
        </div>
        <p class="text-gray-700 mb-3"><v-icon size="20">mdi-book-open-page-variant</v-icon><span class="px-3">{{
          article.publication }}</span></p>
        <p class="text-gray-600 mb-4"><v-icon size="20">mdi-tag-outline</v-icon><span class="px-3">{{ article.field
            }}</span></p>
        <p class="text-gray-600 mb-4"><v-icon size="20">mdi-web</v-icon><span class="px-3"><a :href="article.link" target="_blank">{{ article.link }}</a></span></p>
        <div class="flex items-center justify-between">
          <div class="flex flex-wrap gap-2">
            <span v-for="category in article.categories" :key="category"
              class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
              {{ category }}
            </span>
          </div>
          <a :href="article.cred_link" target="_blank" class="text-[#1980e6] hover:underline text-sm">
            Read More <span v-if="article.link !== article.cred_link">(Archived copy)</span> →
          </a>
        </div>
      </div>
    </div>

    <div v-else class="text-center text-gray-500 italic">
      No articles yet
    </div>
  </div>
</template>

<script setup>
import { ar } from 'vuetify/locale';
import DocumentViewer from '@/components/DocumentViewer.vue'

defineProps({
  articles: {
    type: Array,
    default: () => []
  }
})
</script>