<template>
  <div class="min-h-screen bg-slate-50 py-8">
    <div class="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-black text-[#0e141b] tracking-[-0.033em]"
          :class="{ 'mb-4': showPageDescription }">
          Internships & Certifications
        </h1>
        <p v-if="showPageDescription" class="content-justify text-lg text-gray-600 max-w-4xl mx-auto">
          {{ pageDescription }}
        </p>
      </div>

      <!-- Navigation Tabs -->
      <div v-if="tabs.length" class="flex justify-center mb-8">
        <div class="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
          <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id" :class="[
            'px-6 py-3 rounded-md text-sm font-medium transition-all duration-200',
            activeTab === tab.id
              ? 'bg-[#1980e6] text-white shadow-sm'
              : 'text-gray-600 hover:text-[#1980e6] hover:bg-gray-50'
          ]">
            {{ tab.name }}
          </button>
        </div>
      </div>
      <div v-else class="text-center text-gray-500 mb-8">
        No sections are enabled right now.
      </div>

      <!-- Tab Content -->
      <div class="max-w-[1280px] mx-auto">
        <!-- Internships Section -->
        <div v-if="showInternshipsTab && activeTab === 'internships'" class="mb-16">
          <div class="space-y-6 max-w-4xl mx-auto">
            <InternshipCard v-for="(internship, index) in internships" :key="index"
              :internship="internship" />
          </div>
        </div>

        <!-- Certifications Section -->
        <div v-if="showCertificationsTab && activeTab === 'certifications'" class="mb-16">
          <div v-if="credly" class="max-w-4xl mx-auto mb-6">
            <div class="bg-white rounded-lg shadow-md flex items-center overflow-hidden">
              <!-- Left 20%: Credly Logo -->
              <div class="w-[20%] flex items-start justify-center px-6 pt-3 pb-3 border-r border-[#166fd1]">
                <img :src="credlyIcon" alt="Credly logo" class="w-full max-w-[160px] h-12" />
              </div>
              <!-- Right 80%: Text -->
              <div class="w-[80%] py-2 pl-6 pr-6">
                <p class="text-sm text-[#4e7397]">
                  View my verified badges on
                  <a :href="credly" target="_blank" rel="noopener noreferrer"
                    class="text-[#1980e6] font-medium underline hover:text-[#126ab5]">Credly</a>
                </p>
              </div>
            </div>
          </div>

          <div v-if="certifications && certifications.length > 0" class="space-y-6 max-w-4xl mx-auto">
            <CertificationCard v-for="certification in certifications" :key="certification.id"
              :certification="certification" />

            <!-- Secondary certificates live in `more_certifications`; the link
                 stays hidden until that list has entries. -->
            <div v-if="moreCertifications.length" class="flex justify-end">
              <button type="button" class="more-certificates-button" @click="showMoreCertificates = true">
                View more certificates
                <v-icon size="16" class="arrow-jiggle">mdi-arrow-right</v-icon>
              </button>
            </div>
          </div>

          <div v-else class="text-center text-gray-500 italic py-8">
            <span class="inline-flex items-end gap-2 border-b-2 border-slate-300 pb-0.5">
              <AnimatedIcon name="dino" :size="28" class="-mb-0.5 shrink-0" />
              <span>No certificate available</span>
            </span>
          </div>
        </div>
      </div>

      <MoreCertificatesModal v-model="showMoreCertificates" :certifications="moreCertifications" />
    </div>
  </div>
</template>

<script setup>
import AnimatedIcon from '@/components/ui/AnimatedIcon.vue'
import { iconUrl } from '@/config/mediaAssets'

const credlyIcon = iconUrl('Credly')
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import InternshipCard from './components/InternshipCard.vue'
import CertificationCard from './components/CertificationCard.vue'
import MoreCertificatesModal from './components/MoreCertificatesModal.vue'
import config from "@/content/profile_info"
import descriptions from '@/content/profile_info/description.yml'
import { isFeatureEnabled, isPageDescriptionEnabled } from '@/config/featureFlags'

const { certifications, internships } = config
const moreCertifications = config.more_certifications || []
const credly = config.socials.credly
const pageDescription = descriptions.internshipCertifications

const showInternshipsTab = isFeatureEnabled('showInternshipCertifications.showInternships')
const showCertificationsTab = isFeatureEnabled('showInternshipCertifications.showCertifications')
const showPageDescription = isPageDescriptionEnabled('internshipCertifications')

const tabDefinitions = [
  { id: 'internships', name: 'Training Internships', enabled: showInternshipsTab },
  { id: 'certifications', name: 'Certifications', enabled: showCertificationsTab },
]

const tabs = computed(() => tabDefinitions.filter(tab => tab.enabled))
const enabledTabIds = computed(() => tabs.value.map(tab => tab.id))

const route = useRoute()
const activeTab = ref(tabs.value[0]?.id || null)
const showMoreCertificates = ref(false)

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
/* Same treatment as `.awards-text-button` on the home page: the global
   `button` rule in style.css gives every bare button a background, padding
   and a border, so a text link built from one has to opt out explicitly. */
.more-certificates-button {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0;
  border: 0;
  outline: 0;
  border-radius: 0;
  background: transparent;
  color: #1980e6;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.25rem;
  box-shadow: none;
  cursor: pointer;
  transition: color 200ms ease;
}

.more-certificates-button:hover,
.more-certificates-button:focus,
.more-certificates-button:focus-visible {
  border: 0;
  outline: 0;
  background: transparent;
  color: #0e141b;
  box-shadow: none;
}
</style>
