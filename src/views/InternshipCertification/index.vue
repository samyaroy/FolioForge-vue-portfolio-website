<template>
  <div class="min-h-screen bg-slate-50 py-8">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-black text-[#0e141b] mb-4 tracking-[-0.033em]">
          Internships & Certifications
        </h1>
        <p class="text-lg text-gray-600 max-w-4xl mx-auto">
          Professional internships and certifications I have obtained during my journey.
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
        <!-- Internships Section -->
        <div v-if="showInternshipsTab && activeTab === 'internships'" class="mb-16">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-[#0e141b] mb-2">Training Internships</h2>
          </div>

          <div class="space-y-6 max-w-4xl mx-auto">
            <InternshipCard v-for="(internship, index) in internships" :key="internship.index" :internship="internship" />
          </div>
        </div>

        <!-- Certifications Section -->
        <div v-if="showCertificationsTab && activeTab === 'certifications'" class="mb-16">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-[#0e141b] mb-2">Certifications</h2>
          </div>
          <div v-if="credly" class="max-w-4xl mx-auto mb-6">
            <div class="bg-white rounded-lg shadow-md flex items-center overflow-hidden">
              <!-- Left 30%: Credly Logo -->
              <div class="w-[30%] flex items-center justify-center p-6">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 312.3 80.3" class="w-full max-w-[160px] h-auto">
                  <path fill="#FF6B00" d="M60.4 12.2c-1.1-.6-2.4-.6-3.5 0l-7.8 4.5c-1.1.6-1.7 1.8-1.7 3v9c0 1.2.7 2.4 1.7 3l7.8 4.5c1.1.6 2.4.6 3.5 0l7.8-4.5c1.1-.6 1.7-1.8 1.7-3v-9c0-1.2-.7-2.4-1.7-3l-7.8-4.5z"/>
                  <path fill="#FF6B00" d="M40.2 0C18 0 0 18 0 40.2s18 40.2 40.2 40.2 40.2-18 40.2-40.2S62.3 0 40.2 0zm0 65.3c-13.9 0-25.2-11.3-25.2-25.2S26.3 15 40.2 15s25.2 11.3 25.2 25.2-11.3 25.1-25.2 25.1z"/>
                  <path fill="#111B21" d="M113.2 55.3c-3.4 2.4-7.5 3.7-12 3.7-11.4 0-19.5-8.1-19.5-19.1s8.1-19.1 19.5-19.1c4.2 0 8.1 1.2 11.4 3.4l-4.7 7.1c-1.9-1.2-4.2-2-6.7-2-6 0-10.4 4.5-10.4 10.6s4.4 10.6 10.4 10.6c2.7 0 5.1-.8 7-2.2l5 7z"/>
                  <path fill="#111B21" d="M132.3 34.5c-2.4 0-4.8 1.5-5.9 3.7v20.3h-8.8V27h8.4v3.4c2-2.5 4.8-4.1 8-4.1.8 0 1.5.1 2.2.2l-1.2 8.3c-.8-.2-1.7-.3-2.7-.3z"/>
                  <path fill="#111B21" d="M159.3 45.4h-21.1c1.2 4.1 4.5 6.4 9 6.4 3 0 5.6-1 7.8-3l5 5.3c-3.2 3.4-7.8 5.2-13.1 5.2-10.3 0-17.4-7.1-17.4-16.4 0-9.4 7.1-16.5 16.7-16.5 9.2 0 16 6.7 16 16.1-.1 1-.2 1.9-.3 2.9h-.6zm-7.5-5.9c-.5-4.1-3.7-6.8-8-6.8-4.1 0-7.4 2.6-8.3 6.8h16.3z"/>
                  <path fill="#111B21" d="M192 16.2v42.3h-8.4v-3c-2.6 2.5-6 3.8-9.7 3.8-9.5 0-16.1-7.2-16.1-16.5s6.6-16.4 16.1-16.4c3.4 0 6.5 1.1 9 3.2V16.2h9.1zm-8.9 30.6v-13c-2-2.5-5-4-8.2-4-5.4 0-9.4 4.2-9.4 9.9s4 10 9.4 10c3.3-.1 6.3-1.4 8.2-3.9z"/>
                  <rect fill="#111B21" x="199.4" y="16.2" width="9.1" height="42.3" rx="1"/>
                  <path fill="#111B21" d="M237.7 27l-12.9 35.6c-3.2 8.5-8.3 13.2-16 14.4l-2-7.4c4.7-.9 7.7-3.4 9.4-7.5l-14.1-35.1h9.5l9.1 24.2 7.8-24.2h9.2z"/>
                </svg>
              </div>
              <!-- Right 70%: Text -->
              <div class="w-[70%] p-6 pl-0">
                <p class="text-sm text-[#4e7397]">
                  Visit
                  <a
                    :href="credly"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-[#1980e6] font-medium underline hover:text-[#126ab5]"
                  >here</a>
                  to check for my earned badges on Credly.
                </p>
              </div>
            </div>
          </div>
          <div v-if="certifications && certifications.length > 0" class="space-y-6 max-w-4xl mx-auto">
            <CertificationCard v-for="certification in certifications" :key="certification.id" :certification="certification" />
          </div>
          
          <div v-else class="text-center text-gray-500 italic py-8">
            No certificate available
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import InternshipCard from './components/InternshipCard.vue'
import CertificationCard from './components/CertificationCard.vue'
import config from "@/profile_info.yml"
import { isFeatureEnabled } from '@/config/featureFlags'

const { certifications, internships } = config
const credly = config.socials?.credly

const showInternshipsTab = isFeatureEnabled('showInternshipCertifications.showInternships')
const showCertificationsTab = isFeatureEnabled('showInternshipCertifications.showCertifications')

const tabDefinitions = [
  { id: 'internships', name: 'Training Internships', enabled: showInternshipsTab },
  { id: 'certifications', name: 'Certifications', enabled: showCertificationsTab },
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
