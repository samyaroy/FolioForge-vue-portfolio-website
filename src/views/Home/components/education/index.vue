<template>
  <div class="px-4 md:px-8 lg:px-20 py-4 bg-white">
    <div class="max-w-[1200px] mx-auto">
      <div class="flex flex-wrap justify-between gap-3 p-4">
        <h2 class="text-[#0e141b] tracking-light text-[32px] font-bold leading-tight min-w-72">
          Education
        </h2>
      </div>

      <!-- Education timeline -->

      <EducationMilestone v-for="(edu, index) in education" :key="index"
        :icon="iconMap[edu.type]"
        :title="edu.degree"
        :subject="edu.field"
        :time="String(edu.time_period)"
        :institution="edu.institution"
        :location="edu.location"
        :extra="edu.extra"
        :isFirst="index === 0"
        :isLast="index === education.length - 1"
        :cred_link="edu.cred_link || '#'"
      />

      <!-- See certification link -->
      <div v-if="certifications && certifications.length" class="flex justify-end mt-6 mb-4">
        <router-link 
          to="/internships-certifications?tab=certifications" 
          class="text-[#1980e6] hover:text-[#0e141b] text-sm font-medium transition-colors duration-200 flex items-center gap-1"
        >
          See other certifications
          <v-icon size="16" class="text-[#1980e6]">mdi-arrow-right</v-icon>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import EducationMilestone from "./components/EducationMilestone.vue";
import config from "@/profile_info.yml"

const { education, certifications } = config

const iconMap = {
  School: "mdi-town-hall",
  Diploma: "mdi-certificate",
  College: "mdi-school",
  University: "mdi-school"
}
</script>

