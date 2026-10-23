<template>
  <div class="min-h-screen bg-slate-50">
    <div class="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl sm:text-4xl font-black text-[#0e141b] tracking-[-0.033em]"
          :class="{ 'mb-4': showPageDescription }">
          Professional Activities
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
        <InvitedTalksTab
          v-if="showInvitedTalksTab && activeTab === 'invited-talks'"
          :talks="invitedTalks"
        />
        <HostedEventsTab
          v-if="showHostedEventsTab && activeTab === 'hosted-events'"
          :events="hostedEvents"
          :other-hosted-events="otherHostedEvents"
          :show-main="showHostedEventsMain"
          :show-other-hosted-events="showHostedEventsOthers"
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
import InvitedTalksTab from './components/tabs/InvitedTalksTab.vue'
import HostedEventsTab from './components/tabs/HostedEventsTab.vue'

import config from '@/content/profile_info'
import descriptions from '@/content/profile_info/description.yml'
import { isFeatureEnabled, isPageDescriptionEnabled } from '@/config/featureFlags'

const pageDescription = descriptions.professionalActivity
const showPageDescription = isPageDescriptionEnabled('professionalActivity')

// NOTE: The user should add invited_talks, hosted_events and other_hosted_events to profile_info.yml
const { invited_talks, hosted_events, other_hosted_events } = config
const invitedTalks = invited_talks || []
const hostedEvents = hosted_events || []
const otherHostedEvents = other_hosted_events || []

const showInvitedTalksTab = isFeatureEnabled('showProfessionalActivity.showInvitedTalks')
const showHostedEventsTab = isFeatureEnabled('showProfessionalActivity.showHostedEvents', { mode: 'any' })
const showHostedEventsMain = isFeatureEnabled('showProfessionalActivity.showHostedEvents.main')
const showHostedEventsOthers = isFeatureEnabled('showProfessionalActivity.showHostedEvents.others')

const tabDefinitions = [
  { id: 'invited-talks', name: 'Invited Talks', enabled: showInvitedTalksTab },
  { id: 'hosted-events', name: 'Hosted (Convented) events', enabled: showHostedEventsTab },
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
