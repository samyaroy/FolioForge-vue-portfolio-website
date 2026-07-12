<template>
  <InfoRibbon
    v-if="showRibbon && ribbonMessage && !isRibbonDismissed"
    :icon="ribbonIcon"
    :message="ribbonMessage"
    @dismissed="isRibbonDismissed = true"
  />

  <div class="relative min-h-screen bg-[#eef3f8] py-8">
    <RibbonToggle
      v-if="showRibbon && ribbonMessage && isRibbonDismissed"
      :icon="ribbonIcon"
      @open="isRibbonDismissed = false"
    />

    <div class="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
      <!-- Page Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-black text-[#0e141b] tracking-[-0.033em]"
          :class="{ 'mb-4': showPageDescription }">
          Resources
        </h1>
        <p v-if="showPageDescription" class="content-justify text-lg text-gray-600 max-w-4xl mx-auto">
          {{ pageDescription }}
        </p>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex justify-center mb-8">
        <div class="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
          <button
            v-for="tab in topTabs"
            :key="tab.id"
            @click="activeTopTab = tab.id"
            :class="[
              'px-6 py-3 rounded-md text-sm font-medium transition-all duration-200',
              activeTopTab === tab.id
                ? 'bg-[#1980e6] text-white shadow-sm'
                : 'text-gray-600 hover:text-[#1980e6] hover:bg-gray-50'
            ]"
          >
            {{ tab.name }}
          </button>
        </div>
      </div>

      <template v-if="activeTopTab === 'study-material'">
        <div
          v-if="subjects.length"
          class="grid grid-cols-1 gap-y-6 lg:grid-cols-[270px_minmax(0,1fr)_auto] lg:gap-x-0"
        >
          <SubjectTabs
            :subjects="subjects"
            :active-index="activeIndex"
            :default-icon="DEFAULT_SUBJECT_ICON"
            @select="activeIndex = $event"
          />

          <ResourceContentPane
            class="lg:self-start"
            :subject="activeSubject"
            :materials="activeMaterials"
            :active-index="activeIndex"
          />

          <ExternalLinksPane :groups="externalLinkGroups" />
        </div>

        <div v-else class="mx-auto max-w-2xl text-center text-gray-500">
          No resources are available right now.
        </div>
      </template>

      <WorthExploringPane
        v-else
        :groups="exploringGroups"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import resourcesContent from '@/content/profile_info/resources.yml'
import descriptions from '@/content/profile_info/description.yml'
import config from '@/content/profile_info'
import { isFeatureEnabled, isPageDescriptionEnabled } from '@/config/featureFlags'
import { resolveHyperlink } from '@/utils/resolveHyperlink'
import InfoRibbon from '@/components/InfoRibbon.vue'
import RibbonToggle from '@/components/RibbonToggle.vue'
import ExternalLinksPane from './components/ExternalLinksPane.vue'
import ResourceContentPane from './components/ResourceContentPane.vue'
import SubjectTabs from './components/SubjectTabs.vue'
import WorthExploringPane from './components/WorthExploringPane.vue'

const pageDescription = descriptions.resources
const showPageDescription = isPageDescriptionEnabled('resources')

const showRibbon = isFeatureEnabled('showResources.showRibbon')
const ribbonMessage = config.ribbon?.message
const ribbonIcon = config.ribbon?.icon || 'mdi-information'
const isRibbonDismissed = ref(false)

defineOptions({
  name: 'ResourcesPage',
})

const DEFAULT_SUBJECT_ICON = 'mdi-book-open-page-variant'

const subjects = computed(() => {
  const rawSubjects = Array.isArray(resourcesContent?.subjects)
    ? resourcesContent.subjects
    : []

  return rawSubjects.filter(isObject).map((subject, index) => ({
    id: subject.id || slugify(subject.title || `subject-${index}`),
    title: subject.title || 'Untitled',
    icon: subject.icon || DEFAULT_SUBJECT_ICON,
    description: subject.description || '',
    materials: Array.isArray(subject.materials)
      ? subject.materials.filter(isObject).map(normalizeMaterial)
      : [],
    links: Array.isArray(subject.links)
      ? subject.links.filter(isObject).map(normalizeExternalLink)
      : [],
  }))
})

const topTabs = [
  { id: 'study-material', name: 'Study Material' },
  { id: 'worth-exploring', name: 'Worth Exploring' },
]

const route = useRoute()
const activeTopTab = ref(topTabs[0].id)
const activeIndex = ref(0)

const activeSubject = computed(() => subjects.value[activeIndex.value] || null)
const activeMaterials = computed(() => (
  Array.isArray(activeSubject.value?.materials) ? activeSubject.value.materials : []
))
const externalLinkGroups = computed(() => {
  if (activeSubject.value?.links?.length) {
    return [{ title: '', links: activeSubject.value.links }]
  }

  const rawGroups = Array.isArray(resourcesContent?.external)
    ? resourcesContent.external
    : []

  return rawGroups
    .filter(isObject)
    .map(group => ({
      title: group.group || group.title || '',
      links: Array.isArray(group.links)
        ? group.links.filter(isObject).map(normalizeExternalLink)
        : [],
    }))
    .filter(group => group.links.length)
})

const exploringGroups = computed(() => {
  const rawGroups = Array.isArray(resourcesContent?.explore)
    ? resourcesContent.explore
    : []

  return rawGroups
    .filter(isObject)
    .map(group => ({
      title: group.group || group.title || '',
      links: Array.isArray(group.links)
        ? group.links.filter(isObject).map(normalizeExternalLink)
        : [],
    }))
    .filter(group => group.links.length)
})

watch(subjects, (nextSubjects) => {
  if (activeIndex.value >= nextSubjects.length) {
    activeIndex.value = 0
  }
}, { immediate: true })

onMounted(() => {
  const requestedTab = String(route.query.tab || '')
  if (!requestedTab) return

  if (topTabs.some(tab => tab.id === requestedTab)) {
    activeTopTab.value = requestedTab
    return
  }

  const matchedIndex = subjects.value.findIndex(subject => subject.id === requestedTab)
  if (matchedIndex >= 0) {
    activeTopTab.value = 'study-material'
    activeIndex.value = matchedIndex
  }
})

// Guards content maps against null/empty list entries (e.g. a dangling "-" in
// the YAML), which would otherwise crash normalization and blank the page.
function isObject(value) {
  return Boolean(value) && typeof value === 'object'
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeMaterial(material) {
  return {
    title: material.title || 'Untitled resource',
    description: material.description || '',
    meta: material.meta || '',
    instructor: material.instructor || '',
    distributor: material.distributor || '',
    logo: material.logo || '',
    url: material.link || material.url || '',
  }
}

function normalizeExternalLink(link) {
  const label = link.label || link.title || 'Untitled link'
  return {
    label,
    url: link.url || link.link || resolveHyperlink(link.ref || label) || '',
    description: link.description || '',
    incharge: link.incharge || '',
    speciality: link.speciality || link.specialty || link.specility || '',
  }
}
</script>
