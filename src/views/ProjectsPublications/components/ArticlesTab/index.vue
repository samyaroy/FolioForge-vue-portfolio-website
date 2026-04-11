<template>
  <div class="space-y-8">
    <GeneralArticle
      v-if="showGeneralArticlesSection"
      :articles="generalArticles"
    />
    <JournalArticle
      v-if="showJournalArticlesSection"
      :articles="journalArticles"
    />
    <div
      v-if="!showGeneralArticlesSection && !showJournalArticlesSection"
      class="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500 italic"
    >
      No article sections are enabled.
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { isFeatureEnabled } from '@/config/featureFlags'
import GeneralArticle from './components/GeneralArticle.vue'
import JournalArticle from './components/JournalArticle.vue'

const props = defineProps({
  articles: {
    type: Array,
    default: () => []
  }
})

function isJournalArticle(article) {
  const normalizedType = String(article?.type || 'general')
    .trim()
    .toLowerCase()

  return normalizedType === 'journal'
}

const generalArticles = computed(() =>
  props.articles.filter(article => !isJournalArticle(article))
)

const journalArticles = computed(() =>
  props.articles.filter(isJournalArticle)
)

const showGeneralArticlesSection = isFeatureEnabled('showProjectsPublications.showArticles.showGeneralArticles')
const showJournalArticlesSection = isFeatureEnabled('showProjectsPublications.showArticles.showJournalArticles')
</script>
