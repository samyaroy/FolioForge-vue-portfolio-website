<template>
  <div class="min-h-screen bg-[#eef3f8] py-8">
    <div class="container mx-auto px-4">
      <div class="mb-12">
        <h1 class="text-4xl font-black text-[#0e141b] mb-4 tracking-[-0.033em]">
          Resources
        </h1>
        <p class="text-lg text-gray-600 max-w-4xl">
          A curated collection of useful links, materials, and references related to my academic and professional work.
        </p>
      </div>

      <div
        v-if="subjects.length"
        class="grid grid-cols-1 gap-y-6 lg:grid-cols-[220px_minmax(0,1fr)_260px] lg:gap-x-0"
      >
        <SubjectTabs
          :subjects="subjects"
          :active-index="activeIndex"
          :default-icon="DEFAULT_SUBJECT_ICON"
          @select="activeIndex = $event"
        />

        <ResourceContentPane
          :subject="activeSubject"
          :materials="activeMaterials"
          :active-index="activeIndex"
        />

        <ExternalLinksPane :links="externalLinks" />
      </div>

      <div v-else class="mx-auto max-w-2xl text-center text-gray-500">
        No resources are available right now.
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import resourcesContent from '@/content/resources.yml'
import ExternalLinksPane from './components/ExternalLinksPane.vue'
import ResourceContentPane from './components/ResourceContentPane.vue'
import SubjectTabs from './components/SubjectTabs.vue'

defineOptions({
  name: 'ResourcesPage',
})

const DEFAULT_SUBJECT_ICON = 'mdi-book-open-page-variant'

const subjects = computed(() => {
  const rawSubjects = Array.isArray(resourcesContent?.subjects)
    ? resourcesContent.subjects
    : []

  return rawSubjects.map((subject, index) => ({
    id: subject.id || slugify(subject.title || `subject-${index}`),
    title: subject.title || 'Untitled',
    icon: subject.icon || DEFAULT_SUBJECT_ICON,
    description: subject.description || '',
    materials: Array.isArray(subject.materials)
      ? subject.materials.map(normalizeMaterial)
      : [],
    links: Array.isArray(subject.links)
      ? subject.links.map(normalizeExternalLink)
      : [],
  }))
})

const route = useRoute()
const activeIndex = ref(0)

const activeSubject = computed(() => subjects.value[activeIndex.value] || null)
const activeMaterials = computed(() => (
  Array.isArray(activeSubject.value?.materials) ? activeSubject.value.materials : []
))
const externalLinks = computed(() => {
  if (activeSubject.value?.links?.length) return activeSubject.value.links
  return Array.isArray(resourcesContent?.external)
    ? resourcesContent.external.map(normalizeExternalLink)
    : []
})

watch(subjects, (nextSubjects) => {
  if (activeIndex.value >= nextSubjects.length) {
    activeIndex.value = 0
  }
}, { immediate: true })

onMounted(() => {
  const requestedTab = route.query.tab
  if (!requestedTab) return

  const matchedIndex = subjects.value.findIndex(subject => subject.id === String(requestedTab))
  if (matchedIndex >= 0) {
    activeIndex.value = matchedIndex
  }
})

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
    url: material.link || material.url || '',
  }
}

function normalizeExternalLink(link) {
  return {
    label: link.label || link.title || 'Untitled link',
    url: link.url || link.link || '',
    description: link.description || '',
  }
}
</script>
