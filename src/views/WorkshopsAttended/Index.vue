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
        <ConferencesTab v-if="activeTab === 'conferences'" :conferences="attendedConferences" />
        <WorkshopsTab v-if="activeTab === 'workshops'" :workshops="attendedWorkshops" />
        <BootcampsTab v-if="activeTab === 'bootcamps'" :bootcamps="attendedBootcamps" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ConferencesTab from './components/tabs/ConferencesTab.vue'
import WorkshopsTab from './components/tabs/WorkshopsTab.vue'
import BootcampsTab from './components/tabs/BootcampsTab.vue'

import config from '@/profile_info.yml'
const { attended_workshops, attended_bootcamps, attended_conferences } = config
const attendedWorkshops = attended_workshops || []
const attendedBootcamps = attended_bootcamps || []
const attendedConferences = attended_conferences || []

const route = useRoute()
const activeTab = ref('workshops') // Default to workshops

// Set active tab based on query parameter
onMounted(() => {
  if (route.query.tab && ['conferences', 'workshops', 'bootcamps'].includes(route.query.tab)) {
    activeTab.value = route.query.tab
  }
})

const tabs = [
  { id: 'conferences', name: 'Conferences' },
  { id: 'workshops', name: 'Workshops' },
  { id: 'bootcamps', name: 'Bootcamps' },
]
</script>

<style scoped>
/* Optional styles */
</style>
