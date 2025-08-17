<template>
  <div class="min-h-screen bg-slate-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Page Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-black text-[#0e141b] mb-4 tracking-[-0.033em]">
          Co-curricular Activities
        </h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Beyond academics, I actively participate in various co-curricular activities that enhance my leadership, teamwork, and professional development.
        </p>
      </div>

      <div class="max-w-6xl mx-auto space-y-8">
        <!-- Leadership Component -->
        <Leadership />

        <!-- Volunteering Component -->
        <Volunteering />
      </div>
    </div>
  </div>
</template>

<script setup>
import Leadership from './components/Leadership.vue'
import Volunteering from './components/Volunteering.vue'
</script>