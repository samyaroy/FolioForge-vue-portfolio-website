<template>
  <div class="min-h-screen bg-slate-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Page Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-black text-[#0e141b] mb-4 tracking-[-0.033em]">
          Teachings
        </h1>
        <p class="text-lg text-gray-600 max-w-4xl mx-auto">
          Courses taught, projects mentored, and other academic teaching contributions.
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
        <CoursesTaughtTab
          v-if="activeTab === 'courses'"
          :courses="coursesTaught"
        />

        <ProjectsMentoredTab
          v-if="activeTab === 'projects'"
          :projects="projectsMentored"
        />

        <OtherTeachingsTab
          v-if="activeTab === 'others'"
          :items="otherTeachings"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import config from '@/profile_info.yml'

import CoursesTaughtTab from './components/CoursesTaughtTab.vue'
import ProjectsMentoredTab from './components/ProjectsMentoredTab.vue'
import OtherTeachingsTab from './components/OtherTeachingsTab.vue'

const route = useRoute()
const activeTab = ref('courses')

// Data from config
const {
  coursesTaught,
  projectsMentored,
  otherTeachings
} = config

// Allow deep-linking via ?tab=
onMounted(() => {
  const validTabs = ['courses', 'projects', 'others']
  if (route.query.tab && validTabs.includes(route.query.tab)) {
    activeTab.value = route.query.tab
  }
})

const tabs = [
  { id: 'courses', name: 'Courses Taught' },
  { id: 'projects', name: 'Projects Mentored' },
  { id: 'others', name: 'Others' }
]
</script>