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
      <div class="flex justify-center mb-8">
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

      <!-- Tab Content -->
      <div class="max-w-6xl mx-auto">
        <PublicationsTab v-if="activeTab === 'publications'" :publications="publications" />
        <ProjectsTab v-if="activeTab === 'projects'" :projects="projects" />
        <ArticlesTab v-if="activeTab === 'articles'" :articles="articles" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import PublicationsTab from './components/PublicationsTab.vue'
import ProjectsTab from './components/ProjectTab/Index.vue'
import ArticlesTab from './components/ArticlesTab.vue'
import config from '@/profile_info.yml'

const {projects, publications, articles} = config

const route = useRoute()
const activeTab = ref('projects')

// Set active tab based on query parameter
onMounted(() => {
  if (route.query.tab && ['projects', 'articles', 'publications'].includes(route.query.tab)) {
    activeTab.value = route.query.tab
  }
})

const tabs = [
  { id: 'projects', name: 'Projects' },
  { id: 'articles', name: 'Articles' },
  { id: 'publications', name: 'Publications' },
]
</script>