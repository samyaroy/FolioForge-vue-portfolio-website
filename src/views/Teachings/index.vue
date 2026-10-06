<template>
  <div class="min-h-screen bg-slate-50">
    <div class="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl sm:text-4xl font-black text-[#0e141b] tracking-[-0.033em]"
          :class="{ 'mb-4': showPageDescription }">
          Teaching
        </h1>
        <p v-if="showPageDescription" class="content-justify text-base sm:text-lg text-gray-600 max-w-4xl mx-auto">
          {{ pageDescription }}
        </p>
      </div>

      <!-- Navigation Tabs -->
      <div v-if="tabs.length" class="flex justify-center mb-8">
        <TabBar v-model="activeTab" :tabs="tabs" />
      </div>
      <div v-else class="text-center text-gray-500 mb-8">
        No sections are enabled right now.
      </div>

      <!-- Tab Content -->
      <TabPanels class="max-w-[1280px] mx-auto" :tabs="tabs" :active="activeTab">
        <CoursesTaughtTab
          v-if="showCoursesTaughtTab && activeTab === 'courses'"
          :courses="courses_taught"
        />

        <ProjectsMentoredTab
          v-if="showProjectsMentoredTab && activeTab === 'projects'"
          :projects="projects_mentored"
        />

        <OtherTeachingsTab
          v-if="showOtherTeachingsTab && activeTab === 'others'"
          :items="other_teachings"
        />
      </TabPanels>
    </div>
  </div>
</template>

<script setup>
import TabBar from '@/components/ui/TabBar.vue'
import TabPanels from '@/components/ui/TabPanels.vue'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { SEMESTER_ANCHOR_PARAM, TEACHING_PROJECTS_TAB } from '@/config/teachingAnchors'
import config from '@/content/profile_info'
import descriptions from '@/content/profile_info/description.yml'
import { isFeatureEnabled, isPageDescriptionEnabled } from '@/config/featureFlags'

const pageDescription = descriptions.teachings
const showPageDescription = isPageDescriptionEnabled('teachings')

import CoursesTaughtTab from './components/CoursesTaughtTab.vue'
import ProjectsMentoredTab from './components/ProjectsMentoredTab.vue'
import OtherTeachingsTab from './components/OtherTeachingsTab.vue'

const showCoursesTaughtTab = isFeatureEnabled('showTeachings.showCoursesTaught')
const showProjectsMentoredTab = isFeatureEnabled('showTeachings.showProjectsMentored')
const showOtherTeachingsTab = isFeatureEnabled('showTeachings.showOtherTeachings')

const tabDefinitions = [
  { id: 'courses', name: 'Courses Taught', enabled: showCoursesTaughtTab },
  { id: 'projects', name: 'Projects Mentored', enabled: showProjectsMentoredTab },
  { id: 'others', name: 'Others', enabled: showOtherTeachingsTab },
]

const tabs = computed(() => tabDefinitions.filter(tab => tab.enabled))
const enabledTabIds = computed(() => tabs.value.map(tab => tab.id))

// Prefer the "Projects Mentored" tab as the landing tab when it is enabled,
// otherwise fall back to the first available tab.
const defaultTabId = computed(() =>
  enabledTabIds.value.includes('projects') ? 'projects' : (tabs.value[0]?.id || null)
)

const route = useRoute()
const activeTab = ref(defaultTabId.value)

// Data from config
const {
  courses_taught,
  projects_mentored,
  other_teachings
} = config

watch(tabs, (nextTabs) => {
  if (!nextTabs.some(tab => tab.id === activeTab.value)) {
    activeTab.value = defaultTabId.value
  }
}, { immediate: true })

// Allow deep-linking via ?tab=
onMounted(() => {
  if (route.query.tab && enabledTabIds.value.includes(route.query.tab)) {
    activeTab.value = route.query.tab
  }
  focusRequestedSemester()
})

// A link from elsewhere — a role describing the cohorts it mentored — opens the
// Projects Mentored tab and brings that semester into view.
watch(() => route.query[SEMESTER_ANCHOR_PARAM], focusRequestedSemester)

function focusRequestedSemester() {
  const slug = route.query[SEMESTER_ANCHOR_PARAM]
  if (!slug || typeof slug !== 'string') return
  if (enabledTabIds.value.includes(TEACHING_PROJECTS_TAB)) activeTab.value = TEACHING_PROJECTS_TAB

  // The tab renders, the semester expands, and the router's own scrollBehavior
  // sends the page to the top — so the position is asserted until it holds
  // rather than set once and hoped for.
  let attempts = 0
  const settle = () => {
    const group = document.getElementById(slug)
    if (!group) {
      // A semester renamed on one side only stops matching; the tab is still
      // the right place to land, so a miss is not an error.
      if (++attempts < 12) window.setTimeout(settle, 60)
      return
    }
    const box = group.getBoundingClientRect()
    if (box.top > 60 && box.top < window.innerHeight * 0.5) return
    group.scrollIntoView({ behavior: attempts ? 'smooth' : 'auto', block: 'start' })
    if (++attempts < 12) window.setTimeout(settle, 80)
  }
  nextTick(settle)
}
</script>
