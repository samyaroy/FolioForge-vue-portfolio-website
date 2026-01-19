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

      <div class="max-w-6xl mx-auto">
        <AffiliationsTab v-if="activeTab === 'affiliations'" :affiliations="affiliations" />
        <CollaboratorsTab
          v-if="activeTab === 'collaborators'"
          :collaborators="allCollaborators"
        />
        <MembershipsTab v-if="activeTab === 'memberships'" :memberships="memberships" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AffiliationsTab from './components/tabs/AffiliationsTab.vue'
import CollaboratorsTab from './components/tabs/CollaboratorsTab.vue'
import MembershipsTab from './components/tabs/MembershipsTab.vue'
import config from '@/profile_info.yml'

const { affiliations = [], collaborators = [], past_collaborators = [], memberships = [] } = config
// Combine all collaborators into one array - filtering will be done in CollaboratorsTab based on period
const allCollaborators = [...(collaborators || []), ...(past_collaborators || [])]

const route = useRoute()
const activeTab = ref('affiliations')

onMounted(() => {
  if (route.query.tab && ['affiliations', 'collaborators', 'memberships'].includes(route.query.tab)) {
    activeTab.value = route.query.tab
  }
})

const tabs = [
  { id: 'affiliations', name: 'Affiliations' },
  { id: 'collaborators', name: 'Collaborators' },
  { id: 'memberships', name: 'Memberships' },
]
</script>
