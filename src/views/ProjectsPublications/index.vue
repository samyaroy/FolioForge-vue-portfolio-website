<template>
  <div class="min-h-screen bg-slate-50">
    <div class="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl sm:text-4xl font-black text-[#0e141b] tracking-[-0.033em]"
          :class="{ 'mb-4': showPageDescription }">
          Project & Publication
        </h1>
        <p v-if="showPageDescription" class="content-justify text-base sm:text-lg text-gray-600 max-w-4xl mx-auto">
          {{ pageDescription }}
        </p>
      </div>

      <!-- Navigation Tabs -->
      <div v-if="tabs.length" class="flex justify-center mb-8">
        <div class="flex flex-wrap justify-center gap-1 bg-white rounded-lg p-1 shadow-sm">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'px-3 py-2 sm:px-6 sm:py-3 rounded-md text-sm font-medium transition-all duration-200',
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
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { PROJECT_ANCHOR_PARAM, PROJECT_TAB } from '@/config/projectAnchors'
import PublicationsTab from './components/PublicationsTab.vue'
import ProjectsTab from './components/ProjectTab/index.vue'
import ArticlesTab from './components/ArticlesTab/index.vue'
import PostersTab from './components/PostersTab.vue'
import config from '@/content/profile_info'
import descriptions from '@/content/profile_info/description.yml'
import { isFeatureEnabled, isPageDescriptionEnabled } from '@/config/featureFlags'

// A YAML section that exists but holds only comments parses to `null`, and a
// prop `default: () => []` does not cover `null` — only `undefined`. Coerce here
// so an emptied-out section renders the empty state instead of throwing.
const toArray = (value) => (Array.isArray(value) ? value : [])

const projects = config.projects || []
const publications = toArray(config.publications)
const articles = toArray(config.articles)
const posters = toArray(config.posters)
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
  focusRequestedProject()
})

// A link from elsewhere — an internship naming the project it produced — opens
// the Projects tab and brings that project into view. The card is found by the
// slug of its title, so neither side has to store an id.
watch(() => route.query[PROJECT_ANCHOR_PARAM], focusRequestedProject)

function focusRequestedProject() {
  const slug = route.query[PROJECT_ANCHOR_PARAM]
  if (!slug || typeof slug !== 'string') return
  if (enabledTabIds.value.includes(PROJECT_TAB)) activeTab.value = PROJECT_TAB

  // Two things happen after this runs: a group may expand to reveal the card,
  // and the router's own scrollBehavior sends the page to the top. So the
  // position is asserted until it holds rather than set once and hoped for.
  let attempts = 0
  const settle = () => {
    const card = document.getElementById(slug)
    if (!card) {
      // A title edited on one side and not the other stops matching; the tab is
      // still the right place to land, so a miss is not an error.
      if (++attempts < 12) window.setTimeout(settle, 60)
      return
    }
    if (!card.classList.contains('project-linked')) {
      card.classList.add('project-linked')
      window.setTimeout(() => card.classList.remove('project-linked'), 2400)
    }
    const box = card.getBoundingClientRect()
    const centred = Math.abs(box.top + box.height / 2 - window.innerHeight / 2) < 140
    if (centred) return
    card.scrollIntoView({ behavior: attempts ? 'smooth' : 'auto', block: 'center' })
    if (++attempts < 12) window.setTimeout(settle, 80)
  }
  nextTick(settle)
}
</script>

<style scoped>
/* A brief ring on the card a link asked for, so it is obvious which one the
   page scrolled to. */
:deep(.project-linked) {
  outline: 2px solid #1980e6;
  outline-offset: 3px;
  transition: outline-color 400ms ease;
}
</style>
