<template>
  <div class="px-4 md:px-8 lg:px-20 py-4 bg-slate-50">
    <div class="max-w-[1200px] mx-auto">
      <div class="flex flex-wrap justify-between gap-3 p-4">
        <h2 class="text-[#0e141b] tracking-light text-[32px] font-bold leading-tight min-w-72">Experience</h2>
      </div>

      <!-- Student Intern -->
      <TimelineComponent v-for="(exp, index) in experience" :key="index" :isfirst="index === 0"
        :islast="index === experience.length - 1" :title="exp.job_role" :time="exp.time_period"
        :organization="exp.company" :supervisor="exp.supervisor" :location="exp.location" :description="exp.description"
        :icon="exp.type === 'Internship' ? 'mdi-laptop' : exp.type === 'Employment' && exp.job_role.includes('Developer') ? 'mdi-briefcase' : exp.type === 'Employment' && exp.job_role.includes('Research') ? 'mdi-chart-scatter-plot-hexbin' : exp.type === 'Employment' ? 'mdi-chair-rolling' : 'mdi-laptop-account'"
        :cred-link="exp.cred_link" :department="exp.department" :projects="exp.projects" :cred_link="exp.cred_link" />

      <!-- See other Internships link -->
      <div v-if="internships && internships.length" class="flex justify-end mt-6 mb-4">
        <router-link to="/internships-certifications?tab=internships"
          class="text-[#1980e6] hover:text-[#0e141b] text-sm font-medium transition-colors duration-200 flex items-center gap-1">
          See other Internships
          <v-icon size="16" class="text-[#1980e6]">mdi-arrow-right</v-icon>
        </router-link>
      </div>

    </div>
  </div>
</template>

<script setup>
import TimelineComponent from './components/TimelineComponent.vue'
import config from "@/profile_info.yml"

const { experience, internships } = config

</script>
