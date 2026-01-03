<template>
  <div class="min-h-screen bg-slate-50 py-8">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-black text-[#0e141b] mb-4 tracking-[-0.033em]">
          Workshops & Bootcamps
        </h1>
        <p class="text-lg text-gray-600 max-w-4xl mx-auto">
          Workshops and bootcamps completed in Statistics, Data Science, AI, and emerging technologies </p>
      </div>
      
      <!-- Bootcamps Section -->
      <div class="mb-16 max-w-4xl mx-auto">
        <h2 class="text-3xl font-bold text-[#0e141b] mb-6">Conferences Attended</h2>
        <!-- <p class="text-gray-600"></p> -->
        <div class="space-y-6">
          <ConferenceCard v-for="(conference, index) in attendedConferences" :key="index" :conference="conference" />
        </div>
      </div>

      <!-- Workshops Section -->
      <div class="mb-16 max-w-4xl mx-auto">
        <h2 class="text-3xl font-bold text-[#0e141b] mb-6">Workshops Attended</h2>
        <!-- <p class="text-gray-600">Academic and professional workshops I've participated in</p> -->
        <div class="space-y-6">
          <WorkshopCard v-for="(workshop, index) in attendedWorkshops" :key="index" :workshop="workshop" />
        </div>
      </div>

      <!-- Bootcamps Section -->
      <div class="mb-16 max-w-4xl mx-auto">
        <h2 class="text-3xl font-bold text-[#0e141b] mb-6">Bootcamps Completed</h2>
        <!-- <p class="text-gray-600">Intensive training programs and certifications I've earned</p> -->
        <div class="space-y-6">
          <BootcampCard v-for="(bootcamp, index) in attendedBootcamps" :key="index" :bootcamp="bootcamp" />
        </div>
      </div>


    </div>
  </div>
</template>

<script setup>
import WorkshopCard from './components/WorkshopCard.vue'
import BootcampCard from './components/BootcampCard.vue'
import ConferenceCard from './components/ConferenceCard.vue'

import config from '@/profile_info.yml'
const { attended_workshops, attended_bootcamps, attended_conferences } = config
const attendedWorkshops = attended_workshops || []
const attendedBootcamps = attended_bootcamps || []
const attendedConferences = attended_conferences || []

</script>

<style scoped>
/* Optional styles */
</style>