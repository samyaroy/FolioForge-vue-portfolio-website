<template>
  <div class="px-4 md:px-8 lg:px-20 py-4 bg-slate-50">
    <div class="max-w-[1200px] mx-auto">
      <div class="flex flex-wrap justify-between gap-3 p-4">
        <h2 class="text-[#0e141b] tracking-light text-[32px] font-bold leading-tight min-w-72">Experience</h2>
      </div>

      <!-- Student Intern -->
      <TimelineComponent
        title="Student Intern"
        time="Feb'25 to present"
        organization="Institute of Data Engineering, Analytics and Science Foundation - Technology Innovation Hub, Indian Statistical Institute"
        location="Kolkata, WB"
        description="Dedicated 640+ hours to the FASAL 2.0 project (funded by the Ministry of Agriculture & Farmers' Welfare, GoI), with responsibilities spanning agricultural data acquisition, processing, and web application development (frontend)."
        icon="mdi-school"
        iconColor="text-[#1980e6]"
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
      <div class="flex justify-end mt-6 mb-4">
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
</script>

