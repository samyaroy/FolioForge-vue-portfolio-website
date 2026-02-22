<template>
  <div class="min-h-screen bg-slate-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Page Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-black text-[#0e141b] mb-4 tracking-[-0.033em]">
          Projects & Publications
        </h1>
        <p class="text-lg text-gray-600 max-w-4xl mx-auto">
          Explore my research publications, technical projects, and written articles showcasing my expertise.
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
      <div class="max-w-6xl mx-auto">
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
import ProjectsTab from './components/ProjectTab/Index.vue'
import ArticlesTab from './components/ArticlesTab.vue'
import PostersTab from './components/PostersTab.vue'
import config from '@/profile_info.yml'
import { isFeatureEnabled } from '@/config/featureFlags'

const { projects, publications, articles, posters } = config

const showProjectsTab = isFeatureEnabled('showProjectsPublications.showProjects', { mode: 'any' })
const showArticlesTab = isFeatureEnabled('showProjectsPublications.showArticles')
const showPublicationsTab = isFeatureEnabled('showProjectsPublications.showPublications')
const showPostersTab = isFeatureEnabled('showProjectsPublications.showPosters')

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
