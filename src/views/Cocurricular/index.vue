<template>
  <div class="min-h-screen bg-slate-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Page Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-black text-[#0e141b] mb-4 tracking-[-0.033em]">
          Co-curricular Activities
        </h1>
        <p class="text-lg text-gray-600 max-w-6xl mx-auto">
          Beyond academics, I actively participate in various co-curricular activities to enhance my leadership,
          teamwork, and professional development.
        </p>
      </div>

      <div class="max-w-6xl mx-auto space-y-8">
        <!-- Leadership Component -->
        <Leadership
          v-if="showLeadershipSection"
          v-for="(leadership, index) in leadershipRoles"
          :key="index"
          :leadership="leadership"
        />
        <div v-if="showVolunteeringSection" class="bg-white rounded-lg shadow-sm p-8">
          <h2 class="text-2xl font-bold text-[#0e141b] mb-6 flex items-center">
            <svg class="w-6 h-6 mr-3 text-[#1980e6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z">
              </path>
            </svg>
            Volunteering
          </h2>
          <div class="space-y-6">
            <div v-if="volunteeringRoles.length === 0" class="text-gray-500 italic text-center">
              No volunteering roles to display.
          </div>
            <!-- Volunteering Component -->
            <Volunteering v-else v-for="(volunteer, index) in volunteeringRoles" :key="index" :volunteering="volunteer" />
          </div>
        </div>
        <div
          v-if="!showLeadershipSection && !showVolunteeringSection"
          class="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500 italic"
        >
          No co-curricular sections are enabled.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Leadership from './components/Leadership.vue'
import Volunteering from './components/Volunteering.vue'

import config from '@/profile_info.yml'
import { isFeatureEnabled } from '@/config/featureFlags'
const { co_curriculars } = config

const leadershipRoles = co_curriculars.find(c => c.title === "leadership_roles")?.entries || []
const volunteeringRoles = co_curriculars.find(c => c.title === "volunteering_roles")?.entries || []
const showLeadershipSection = isFeatureEnabled('showCocurricular.showLeadershipOrganizations')
const showVolunteeringSection = isFeatureEnabled('showCocurricular.showVolunteering')
</script>
