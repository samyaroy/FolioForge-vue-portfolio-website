<template>
  <div class="min-h-screen bg-slate-50 py-8">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-black text-[#0e141b] mb-4 tracking-[-0.033em]">
          Internships & Certifications
        </h1>
        <p class="text-lg text-gray-600 max-w-4xl mx-auto">
          Professional internships and certifications in Data Science, AI, and emerging technologies
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
        <!-- Internships Section -->
        <div v-if="activeTab === 'internships'" class="mb-16">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-[#0e141b] mb-2">Training Internships</h2>
          </div>

          <div class="space-y-6 max-w-4xl mx-auto">
            <InternshipCard v-for="(internship, index) in internships" :key="internship.index" :internship="internship" />
          </div>
        </div>

        <!-- Certifications Section -->
        <div v-if="activeTab === 'certifications'" class="mb-16">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-[#0e141b] mb-2">Certifications</h2>
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
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import InternshipCard from './components/InternshipCard.vue'
import CertificationCard from './components/CertificationCard.vue'
import config from "@/profile_info.yml"

const { certifications, internships } = config

const route = useRoute()
const activeTab = ref('internships')

const tabs = [
  { id: 'internships', name: 'Training Internships' },
  { id: 'certifications', name: 'Certifications' }
]

// Set active tab based on query parameter
onMounted(() => {
  if (route.query.tab && ['internships', 'certifications'].includes(route.query.tab)) {
    activeTab.value = route.query.tab
  }
})

</script>

<style scoped>
/* Optional styles */
</style>
