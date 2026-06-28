<template>
  <div class="min-h-screen bg-slate-50">
    <div class="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-black text-[#0e141b] tracking-[-0.033em]"
          :class="{ 'mb-4': showPageDescription }">
          Co-curricular Activities
        </h1>
        <p v-if="showPageDescription" class="content-justify text-lg text-gray-600 max-w-6xl mx-auto">
          {{ pageDescription }}
        </p>
      </div>

      <div class="max-w-[1280px] mx-auto space-y-8">
        <!-- Leadership Component -->
        <div class="bg-white rounded-lg shadow-sm p-8 text-sm">
          <h2 class="text-2xl font-bold text-[#0e141b] mb-6 flex items-center">
            <svg class="w-6 h-6 mr-3 text-[#1980e6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z">
              </path>
            </svg>
            Leadership & Organizations
          </h2>
          <Leadership class="mb-4" v-if="showLeadershipSection" v-for="(leadership, index) in leadershipRoles" :key="index"
            :leadership="leadership" />

        </div>
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
            <Volunteering v-else v-for="(volunteer, index) in volunteeringRoles" :key="index"
              :volunteering="volunteer" />
          </div>
        </div>
        <div v-if="!showLeadershipSection && !showVolunteeringSection"
          class="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500 italic">
          No co-curricular sections are enabled.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Leadership from './components/Leadership.vue'
import Volunteering from './components/Volunteering.vue'

import config from '@/content/profile_info'
import descriptions from '@/content/profile_info/description.yml'
import { isFeatureEnabled, isPageDescriptionEnabled } from '@/config/featureFlags'

const pageDescription = descriptions.cocurricular
const showPageDescription = isPageDescriptionEnabled('cocurricular')
const { co_curriculars } = config

const leadershipRoles = co_curriculars.find(c => c.title === "leadership_roles")?.entries || []
const volunteeringRoles = co_curriculars.find(c => c.title === "volunteering_roles")?.entries || []
const showLeadershipSection = isFeatureEnabled('showCocurricular.showLeadershipOrganizations')
const showVolunteeringSection = isFeatureEnabled('showCocurricular.showVolunteering')
</script>
