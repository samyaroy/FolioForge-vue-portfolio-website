<template>
  <div class="min-h-screen bg-slate-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Page Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-black text-[#0e141b] mb-4 tracking-[-0.033em]">
          Conferences & Workshops
        </h1>
        <p class="text-lg text-gray-600 max-w-4xl mx-auto">
          Conferences attended, workshops completed, and intensive bootcamp training in Statistics, Data Science, AI, and emerging technologies
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
        />
        <BootcampsTab
          v-if="showBootcampsTab && activeTab === 'bootcamps'"
          :bootcamps="attendedBootcamps"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ConferencesTab from './components/tabs/ConferencesTab.vue'
import FDPsTab from './components/tabs/FDPsTab.vue'
import WorkshopsTab from './components/tabs/WorkshopsTab.vue'
import BootcampsTab from './components/tabs/BootcampsTab.vue'

import config from '@/profile_info.yml'
import { isFeatureEnabled } from '@/config/featureFlags'
const { attended_workshops, attended_bootcamps, attended_conferences, attended_fdps } = config
const attendedWorkshops = attended_workshops || []
const attendedBootcamps = attended_bootcamps || []
const attendedConferences = attended_conferences || []
const attendedFDPs = attended_fdps || []

const showConferencesTab = isFeatureEnabled('showWorkshopsAttended.showConferences')
const showFDPsTab = isFeatureEnabled('showWorkshopsAttended.showFDPs')
const showWorkshopsTab = isFeatureEnabled('showWorkshopsAttended.showWorkshops')
const showBootcampsTab = isFeatureEnabled('showWorkshopsAttended.showBootcamps')

const tabDefinitions = [
  { id: 'conferences', name: 'Conferences', enabled: showConferencesTab },
  { id: 'fdps', name: 'FDPs', enabled: showFDPsTab },
  { id: 'workshops', name: 'Workshops', enabled: showWorkshopsTab },
  { id: 'bootcamps', name: 'Bootcamps', enabled: showBootcampsTab },
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
