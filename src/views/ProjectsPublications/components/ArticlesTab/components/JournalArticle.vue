<template>
  <div class="bg-white rounded-lg shadow-sm p-8">
    <h2 class="text-2xl font-bold text-[#0e141b] mb-6">Journal Articles</h2>

    <div v-if="articles.length" class="space-y-6">
      <div
        v-for="(article, index) in articles"
        :key="article.title || index"
        class="border-l-4 border-[#1980e6] pl-6 py-4 pr-4 rounded-md bg-slate-50"
      >
        <div class="flex items-start justify-between gap-4 mb-3">
          <h3 class="text-lg font-semibold text-[#0e141b]">
            {{ article.title }}
            <span
              v-if="getArticleLabel(article)"
              class="inline-block ml-3 px-3 py-1 text-xs font-medium bg-[#1980e6] text-white rounded-full"
            >
              {{ getArticleLabel(article) }}
            </span>
          </h3>

          <span v-if="article.date" class="text-sm text-gray-500 shrink-0">
            {{ article.date }}
          </span>
        </div>

        <p
          v-if="article.publication?.name || article.publication?.host"
          class="text-gray-700 mb-3"
        >
          <v-icon size="20">mdi-book-open-page-variant</v-icon>
          <span v-if="article.publication?.name" class="pl-3">
            {{ article.publication.name }}
          </span>
          <template v-if="article.publication?.host">
            <span v-if="article.publication?.name" class="px-2">-</span>
            <span class="font-medium">
              <SmartLink :type="'Institute'" :text="article.publication.host" />
            </span>
          </template>
        </p>

        <p v-if="article.field" class="text-gray-600 mb-4">
          <v-icon size="20">mdi-tag-outline</v-icon>
          <span class="px-3">{{ article.field }}</span>
        </p>

        <p v-if="article.link" class="text-gray-600 mb-4">
          <v-icon size="20">mdi-web</v-icon>
          <span class="px-3">
            <a
              :href="article.link"
              target="_blank"
              rel="noopener noreferrer"
              class="break-all"
            >
              {{ article.link }}
            </a>
          </span>
        </p>

        <div class="flex items-center justify-between gap-4">
          <!-- <div v-if="getCategories(article.categories).length" class="flex flex-wrap gap-2">
            <span
              v-for="category in getCategories(article.categories)"
              :key="category"
              class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
            >
              {{ category }}
            </span>
          </div>
          <div v-else />
        -->

          <a
            v-if="article.cred_link"
            :href="article.cred_link"
            target="_blank"
            rel="noopener noreferrer"
            class="text-[#1980e6] hover:underline text-sm shrink-0"
          >
            Read More <span v-if="article.link && article.link !== article.cred_link">(Archived copy)</span> ->
          </a>
        </div>
      </div>
    </div>

    <div v-else class="text-center text-gray-500 italic">
      No journal articles yet
    </div>
  </div>
</template>

<script setup>
import SmartLink from '@/components/SmartLink.vue'

defineProps({
  articles: {
    type: Array,
    default: () => []
  }
})

function getArticleLabel(article) {
  if (typeof article?.article_type === 'string' && article.article_type.trim()) {
    return article.article_type.trim()
  }

  if (typeof article?.type === 'string' && article.type.trim()) {
    return article.type.trim()
  }

  return ''
}

// function getCategories(categories) {
//   if (Array.isArray(categories)) {
//     return categories
//   }

//   if (typeof categories === 'string' && categories.trim()) {
//     return categories
//       .split(',')
//       .map(category => category.trim())
//       .filter(Boolean)
//   }

//   return []
// }
</script>
