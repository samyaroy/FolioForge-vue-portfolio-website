<template>
  <div class="min-h-screen bg-slate-50">
    <div class="container mx-auto px-4 py-8">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-black text-[#0e141b] mb-4 tracking-[-0.033em]">
          Affiliations, Collaborators & Memberships
        </h1>
        <p class="text-lg text-gray-600 max-w-4xl mx-auto">
          A quick overview of the networks, teams, and communities I am part of.
        </p>
      </div>

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

      <div class="max-w-6xl mx-auto">
        <AffiliationsTab
          v-if="showAffiliationsTab && activeTab === 'affiliations'"
          :affiliations="affiliations"
        />
        <CollaboratorsTab
          v-if="showCollaboratorsTab && activeTab === 'collaborators'"
          :collaborators="allCollaborators"
        />
        <MembershipsTab
          v-if="showMembershipsTab && activeTab === 'memberships'"
          :memberships="memberships"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AffiliationsTab from './components/tabs/AffiliationsTab.vue'
import CollaboratorsTab from './components/tabs/CollaboratorsTab.vue'
import MembershipsTab from './components/tabs/MembershipsTab.vue'
import config from '@/profile_info.yml'
import { isFeatureEnabled } from '@/config/featureFlags'

const { affiliations = [], collaborators = [], past_collaborators = [], memberships = [] } = config
// Combine all collaborators into one array - filtering will be done in CollaboratorsTab based on period
const allCollaborators = [...(collaborators || []), ...(past_collaborators || [])]

const showAffiliationsTab = isFeatureEnabled('showAffiliations.showAffiliations')
const showCollaboratorsTab = isFeatureEnabled('showAffiliations.showCollaborators')
const showMembershipsTab = isFeatureEnabled('showAffiliations.showMemberships')

const tabDefinitions = [
  { id: 'affiliations', name: 'Affiliations', enabled: showAffiliationsTab },
  { id: 'collaborators', name: 'Collaborators', enabled: showCollaboratorsTab },
  { id: 'memberships', name: 'Memberships', enabled: showMembershipsTab },
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

onMounted(() => {
  if (route.query.tab && enabledTabIds.value.includes(route.query.tab)) {
    activeTab.value = route.query.tab
  }
})
</script>
