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
              <div class="w-[30%] flex items-center justify-center px-6 py-0">
                <img src="/icons/credly.png" alt="Credly logo" class="w-full max-w-[160px] h-auto" />
              </div>
              <!-- Right 70%: Text -->
              <div class="w-[70%] py-2 pl-0 pr-6">
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
