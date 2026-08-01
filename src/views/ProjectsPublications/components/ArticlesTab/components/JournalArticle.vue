<template>
  <div class="bg-white rounded-lg shadow-sm p-8">
    <button
      type="button"
      class="mb-6 flex w-full items-center justify-between text-left focus:outline-none"
      :aria-expanded="!isSectionCollapsed"
      :aria-label="isSectionCollapsed ? 'Expand journal articles section' : 'Collapse journal articles section'"
      @click="isSectionCollapsed = !isSectionCollapsed"
    >
      <h2 class="text-2xl font-bold text-[#0e141b]">Journal Articles</h2>
      <v-icon class="text-[#0e141b]">
        {{ isSectionCollapsed ? 'mdi-unfold-more-horizontal' : 'mdi-unfold-less-horizontal' }}
      </v-icon>
    </button>

    <div v-if="articles.length" class="space-y-6 text-sm">
      <div v-for="(article, index) in articles" :key="article.title || index"
        class="border-l-4 border-[#1980e6] pl-6 pr-4 pt-3 rounded-md bg-slate-50"
        :class="isSectionCollapsed ? 'pb-2' : 'pb-4'">
        <div class="flex flex-col gap-4 md:flex-row md:items-stretch md:gap-8">
          <div
            v-if="getLogos(article.logo).length"
            class="flex shrink-0 items-center justify-start gap-3 md:w-36 md:justify-center"
          >
            <img
              v-for="logo in getLogos(article.logo)"
              :key="logo"
              :src="getLogoPath(logo)"
              :alt="logo"
              :title="logo"
              class="max-h-12 w-auto object-contain opacity-90 md:max-h-20"
            >
          </div>
          <div class="min-w-0 flex-1">
            <div class="mb-2 flex items-start justify-between gap-4">
              <h3 class="min-w-0 text-lg font-semibold text-[#0e141b]">
                {{ article.title }}
                <span v-if="getArticleLabel(article)"
                  class="inline-block ml-3 px-3 py-1 text-xs font-medium bg-[#1980e6] text-white rounded-full">
                  {{ getArticleLabel(article) }}
                </span>
              </h3>

              <span v-if="article.date" class="shrink-0 text-sm text-gray-500">
                {{ article.date }}
              </span>
            </div>

            <div
              v-if="article.publication?.name || article.publication?.host || (isSectionCollapsed && getArticleDocumentLink(article))"
              class="flex min-h-7 items-center justify-between gap-4"
              :class="isSectionCollapsed ? '' : 'mb-3'"
            >
              <p v-if="article.publication?.name || article.publication?.host" class="min-w-0 text-gray-700">
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

              <v-tooltip v-if="isSectionCollapsed && getArticleDocumentLink(article)" location="top">
                <template #activator="{ props }">
                  <a
                    v-bind="props"
                    :href="getArticleDocumentLink(article)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#1980e6] text-[#1980e6] transition hover:bg-[#1980e6] hover:text-white"
                    aria-label="Open article link"
                  >
                    <v-icon size="15">mdi-web</v-icon>
                  </a>
                </template>
                <span>Open article link</span>
              </v-tooltip>
            </div>

            <p v-if="!isSectionCollapsed && article.field" class="text-gray-600 mb-4">
              <v-icon size="20">mdi-tag-outline</v-icon>
              <span class="px-3">{{ article.field }}</span>
            </p>

            <div v-if="!isSectionCollapsed && (article.link || article.cred_link)" class="flex items-start gap-4 mb-4">
              <p v-if="article.link" class="text-gray-600 flex-1 min-w-0 text-left">
                <v-icon size="20">mdi-web</v-icon>
                <span class="px-3">
                  <a :href="article.link" target="_blank" rel="noopener noreferrer" class="break-all">
                    {{ article.link }}
                  </a>
                </span>
              </p>

              <div class="ml-auto shrink-0 text-right">
                <a v-if="article.cred_link" :href="article.cred_link" target="_blank" rel="noopener noreferrer"
                  class="text-[#1980e6] hover:underline text-sm shrink-0">
                  Read More <span v-if="article.link && article.link !== article.cred_link">(Archived copy)</span> ->
                </a>
              </div>
            </div>

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
            </div>

          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center text-gray-500 italic">
      No journal articles yet
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SmartLink from '@/components/SmartLink.vue'
import { isFeatureEnabled } from '@/config/featureFlags'

defineProps({
  articles: {
    type: Array,
    default: () => []
  }
})

const isSectionCollapsed = ref(
  !isFeatureEnabled('showProjectsPublications.expandArticleSectionsByDefault.journalArticles')
)

const getArticleDocumentLink = (article) => article?.link || article?.cred_link || ''

function getLogoPath(logo) {
  return `/logo/${logo}.png` // coming from public folder, so no need for import
}

function getLogos(logo) {
  if (Array.isArray(logo)) {
    return logo.filter(item => typeof item === 'string' && item.trim())
  }

  if (typeof logo === 'string' && logo.trim()) {
    return [logo.trim()]
  }

  return []
}

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
