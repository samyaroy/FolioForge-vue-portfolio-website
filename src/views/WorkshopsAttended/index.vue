<template>
  <div class="min-h-screen bg-slate-50">
    <div class="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl sm:text-4xl font-black text-[#0e141b] tracking-[-0.033em]"
          :class="{ 'mb-4': showPageDescription }">
          Conferences & Workshops
        </h1>
        <p v-if="showPageDescription" class="content-justify text-base sm:text-lg text-gray-600 max-w-5xl mx-auto">
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
        <ConferencesTab
          v-if="showConferencesTab && activeTab === 'conferences'"
          :conferences="attendedConferences"
        />
        <FDPsTab
          v-if="showFDPsTab && activeTab === 'fdps'"
          :fdps="attendedFDPs"
        />
        <WorkshopsTab
          v-if="showWorkshopsTab && activeTab === 'workshops'"
          :workshops="attendedWorkshops"
          :other-learning-engagements="attendedOtherWorkshops"
          :show-main="showWorkshopsMain"
          :show-other-learning-engagements="showWorkshopsOthers"
        />
        <BootcampsTab
          v-if="showBootcampsTab && activeTab === 'bootcamps'"
          :bootcamps="attendedBootcamps"
        />
        <OtherTab
          v-if="showOtherTab && activeTab === 'other'"
          :others="attendedOther"
        />
      </TabPanels>
    </div>
  </div>
</template>

<script setup>
import TabBar from '@/components/ui/TabBar.vue'
import TabPanels from '@/components/ui/TabPanels.vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ConferencesTab from './components/tabs/ConferencesTab.vue'
import FDPsTab from './components/tabs/FDPsTab.vue'
import WorkshopsTab from './components/tabs/WorkshopsTab.vue'
import OtherTab from './components/tabs/OtherTab.vue'
import BootcampsTab from './components/tabs/BootcampsTab.vue'

import config from '@/content/profile_info'
import descriptions from '@/content/profile_info/description.yml'
import { isFeatureEnabled, isPageDescriptionEnabled } from '@/config/featureFlags'

const pageDescription = descriptions.workshopsAttended
const showPageDescription = isPageDescriptionEnabled('workshopsAttended')
const {
  attended_workshops,
  attended_webinars_n_others,
  attended_other_workshops,
  attended_bootcamps,
  attended_conferences,
  attended_fdps,
} = config
const attendedWorkshops = attended_workshops || []
const attendedOther = attended_webinars_n_others || []
const attendedOtherWorkshops = attended_other_workshops || []
const attendedBootcamps = attended_bootcamps || []
const attendedConferences = attended_conferences || []
const attendedFDPs = attended_fdps || []

const showConferencesTab = isFeatureEnabled('showWorkshopsAttended.showConferences')
const showFDPsTab = isFeatureEnabled('showWorkshopsAttended.showFDPs')
const showWorkshopsTab = isFeatureEnabled('showWorkshopsAttended.showWorkshops', { mode: 'any' })
const showWorkshopsMain = isFeatureEnabled('showWorkshopsAttended.showWorkshops.main')
const showWorkshopsOthers = isFeatureEnabled('showWorkshopsAttended.showWorkshops.others')
const showOtherTab = isFeatureEnabled('showWorkshopsAttended.showOther')
const showBootcampsTab = isFeatureEnabled('showWorkshopsAttended.showBootcamps')

const tabDefinitions = [
  { id: 'conferences', name: 'Conferences', enabled: showConferencesTab },
  { id: 'fdps', name: 'FDPs', enabled: showFDPsTab },
  { id: 'workshops', name: 'Workshops', enabled: showWorkshopsTab },
  { id: 'bootcamps', name: 'Bootcamps', enabled: showBootcampsTab },
  { id: 'other', name: 'Others', enabled: showOtherTab },
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

<style scoped>
/* Optional styles */
</style>
