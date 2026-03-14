<template>
  <div class="min-h-screen bg-slate-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Page Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-black text-[#0e141b] mb-4 tracking-[-0.033em]">
          Co-curricular Activities
        </h1>
        <p class="text-lg text-gray-600 max-w-6xl mx-auto">
          Beyond academics, I actively participate in various co-curricular activities to enhance my leadership, teamwork, and professional development.
        </p>
      </div>

      <div class="max-w-6xl mx-auto space-y-8">
        <!-- Leadership Component -->
        <Leadership v-for="(leadership, index) in leadershipRoles" :key="index" :leadership="leadership" />

        <!-- Volunteering Component -->
        <Volunteering v-for="(volunteer, index) in volunteeringRoles" :key="index" :volunteering="volunteer" />
      </div>
    </div>
  </div>
</template>

<script setup>
import Leadership from './components/Leadership.vue'
import Volunteering from './components/Volunteering.vue'

import config from '@/profile_info.yml'
const { co_curriculars } = config

const leadershipRoles = co_curriculars.find(c => c.title === "leadership_roles")?.entries || []
const volunteeringRoles = co_curriculars.find(c => c.title === "volunteering_roles")?.entries || []
</script>