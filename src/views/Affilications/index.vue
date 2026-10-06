<template>
  <div class="min-h-screen bg-slate-50">
    <div class="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl sm:text-4xl font-black text-[#0e141b] tracking-[-0.033em]"
          :class="{ 'mb-4': showPageDescription }">
          Affiliations, Collaborators & Memberships
        </h1>
        <p v-if="showPageDescription" class="content-justify text-base sm:text-lg text-gray-600 max-w-4xl mx-auto">
          {{ pageDescription }}
        </p>
      </div>

      <div v-if="tabs.length" class="flex justify-center mb-8">
        <TabBar v-model="activeTab" :tabs="tabs" />
      </div>
      <div v-else class="text-center text-gray-500 mb-8">
        No sections are enabled right now.
      </div>

      <TabPanels class="max-w-[1280px] mx-auto" :tabs="tabs" :active="activeTab">
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
      </TabPanels>
    </div>
  </div>
</template>

<script setup>
import TabBar from '@/components/ui/TabBar.vue'
import TabPanels from '@/components/ui/TabPanels.vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AffiliationsTab from './components/tabs/AffiliationsTab.vue'
import CollaboratorsTab from './components/tabs/CollaboratorsTab.vue'
import MembershipsTab from './components/tabs/MembershipsTab.vue'
import config from '@/content/profile_info'
import descriptions from '@/content/profile_info/description.yml'
import { isFeatureEnabled, isPageDescriptionEnabled } from '@/config/featureFlags'

const pageDescription = descriptions.affiliations
const showPageDescription = isPageDescriptionEnabled('affiliations')

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
