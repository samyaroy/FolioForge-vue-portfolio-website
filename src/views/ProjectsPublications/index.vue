<template>
  <div class="min-h-screen bg-slate-50">
    <div class="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-black text-[#0e141b] tracking-[-0.033em]"
          :class="{ 'mb-4': showPageDescription }">
          Project & Publication
        </h1>
        <p v-if="showPageDescription" class="content-justify text-lg text-gray-600 max-w-4xl mx-auto">
          {{ pageDescription }}
        </p>
      </div>

      <!-- Navigation Tabs -->
      <div v-if="tabs.length" class="flex justify-center mb-8">
        <div class="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'px-6 py-3 rounded-md text-sm font-medium transition-all duration-200',
              activeTab === tab.id
                ? 'bg-[#1980e6] text-white shadow-sm'
                : 'text-gray-600 hover:text-[#1980e6] hover:bg-gray-50'
            ]"
          >
            {{ tab.name }}
          </button>
        </div>
      </div>
      <div v-else class="text-center text-gray-500 mb-8">
        No sections are enabled right now.
      </div>

      <!-- Tab Content -->
      <div class="max-w-[1280px] mx-auto">
        <PublicationsTab
          v-if="showPublicationsTab && activeTab === 'publications'"
          :publications="publications"
        />
        <ProjectsTab
          v-if="showProjectsTab && activeTab === 'projects'"
          :projects="projects"
        />
        <ArticlesTab
          v-if="showArticlesTab && activeTab === 'articles'"
          :articles="articles"
        />
        <PostersTab
          v-if="showPostersTab && activeTab === 'posters'"
          :posters="posters"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import PublicationsTab from './components/PublicationsTab.vue'
import ProjectsTab from './components/ProjectTab/index.vue'
import ArticlesTab from './components/ArticlesTab/index.vue'
import PostersTab from './components/PostersTab.vue'
import config from '@/content/profile_info'
import descriptions from '@/content/profile_info/description.yml'
import { isFeatureEnabled, isPageDescriptionEnabled } from '@/config/featureFlags'

const { projects, publications, articles, posters } = config
const pageDescription = descriptions.projectsPublications

const showProjectsTab = isFeatureEnabled('showProjectsPublications.showProjects', { mode: 'any' })
const showArticlesTab = isFeatureEnabled('showProjectsPublications.showArticles', { mode: 'any' })
const showPublicationsTab = isFeatureEnabled('showProjectsPublications.showPublications')
const showPostersTab = isFeatureEnabled('showProjectsPublications.showPosters')
const showPageDescription = isPageDescriptionEnabled('projectsPublications')

const tabDefinitions = [
  { id: 'projects', name: 'Projects', enabled: showProjectsTab },
  { id: 'articles', name: 'Articles', enabled: showArticlesTab },
  { id: 'publications', name: 'Publications', enabled: showPublicationsTab },
  { id: 'posters', name: 'Posters', enabled: showPostersTab },
]

const tabs = computed(() => tabDefinitions.filter(tab => tab.enabled))
const enabledTabIds = computed(() => tabs.value.map(tab => tab.id))

const route = useRoute()
const activeTab = ref(tabs.value[0]?.id || null)

watch(tabs, (nextTabs) => {
  if (!nextTabs.some(tab => tab.id === activeTab.value)) {
    activeTab.value = nextTabs[0]?.id || null
  }
}, { immediate: true })

// Set active tab based on query parameter
onMounted(() => {
  if (route.query.tab && enabledTabIds.value.includes(route.query.tab)) {
    activeTab.value = route.query.tab
  }
})
</script>
