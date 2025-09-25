<template>
  <div class="px-4 md:px-8 lg:px-20 py-4 bg-slate-50">
    <div class="max-w-[1200px] mx-auto">
      <div class="flex flex-wrap justify-between gap-3 p-4">
        <h2 class="text-[#0e141b] tracking-light text-[32px] font-bold leading-tight min-w-72">Experience</h2>
      </div>

      <!-- Student Intern -->
      <TimelineComponent v-for="(exp, index) in experience" :key="index"
        :title= "exp.job_role"
        :time= "exp.time_period"
        :organization= "exp.company"
        :supervisor="exp.supervisor"
        :location= "exp.location"
        :description= "exp.description"
        :icon="exp.type === 'Internship' ? 'mdi-school' : 'mdi-certificate'"
        :cred-link="exp.cred_link"
      />
   <!--  
      <TimelineComponent
        title="Research Assistant"
        time="Jun'24 - Jan'25"
        organization="Some Other Institute"
        location="Bangalore"
        description="Assisted in data preprocessing and building statistical models for large-scale datasets."
        icon="mdi-briefcase"
        iconColor="text-[#1980e6]"
      />

      // Software Developer 
      <TimelineComponent
        title="Software Developer Intern"
        time="Jan'24 - May'24"
        organization="Tech Startup Pvt Ltd"
        location="Hyderabad"
        description="Worked on backend APIs and implemented database optimizations."
        icon="mdi-laptop"
        iconColor="text-[#1980e6]"
      />
      -->
      
      <!-- See other Internships link -->
      <div v-if="internships && internships.length" class="flex justify-end mt-6 mb-4">
        <router-link 
          to="/internships-certifications?tab=internships" 
          class="text-[#1980e6] hover:text-[#0e141b] text-sm font-medium transition-colors duration-200 flex items-center gap-1"
        >
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

