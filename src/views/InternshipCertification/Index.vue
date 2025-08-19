<template>
  <div class="min-h-screen bg-slate-50 py-8">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-black text-[#0e141b] mb-4 tracking-[-0.033em]">
          Internships & Certifications
        </h1>
        <p class="text-lg text-gray-600 max-w-4xl mx-auto">
          Professional internships and certifications in Data Science, AI, and emerging technologies
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
        <!-- Internships Section -->
        <div v-if="activeTab === 'internships'" class="mb-16">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-[#0e141b] mb-2">Internships</h2>
          </div>

          <div class="space-y-6 max-w-4xl mx-auto">
            <InternshipCard v-for="internship in internships" :key="internship.id" :internship="internship" />
          </div>
        </div>

        <!-- Certifications Section -->
        <div v-if="activeTab === 'certifications'" class="mb-16">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-[#0e141b] mb-2">Certifications</h2>
          </div>

          <div v-if="certifications && certifications.length > 0" class="space-y-6 max-w-4xl mx-auto">
            <CertificationCard v-for="certification in certifications" :key="certification.id" :certification="certification" />
          </div>
          
          <div v-else class="text-center text-gray-500 italic py-8">
            No certificate available
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import InternshipCard from './components/InternshipCard.vue'
import CertificationCard from './components/CertificationCard.vue'

const route = useRoute()
const activeTab = ref('internships')

const tabs = [
  { id: 'internships', name: 'Internships' },
  { id: 'certifications', name: 'Certifications' }
]

// Set active tab based on query parameter
onMounted(() => {
  if (route.query.tab && ['internships', 'certifications'].includes(route.query.tab)) {
    activeTab.value = route.query.tab
  }
})

const internships = [
  // {
  //   id: 1,
  //   title: "Student Intern",
  //   organization: "Institute of Data Engineering, Analytics and Science Foundation - Technology Innovation Hub, Indian Statistical Institute",
  //   location: "Kolkata, WB",
  //   duration: "Feb'25 to present",
  //   description: "Dedicated 640+ hours to the FASAL 2.0 project (funded by the Ministry of Agriculture & Farmers' Welfare, GoI), with responsibilities spanning agricultural data acquisition, processing, and web application development (frontend).",
  //   skills: ["Data Processing", "Web Development", "Agricultural Data", "Frontend Development"],
  //   type: "Research Internship"
  // },
  {
    id: 2,
    title: "Data Science Intern",
    organization: "Institute of Data Engineering, Analytics and Science Foundation - Technology Innovation Hub, Indian Statistical Institute",
    location: "Remote",
    duration: "Jun'24 - Oct'24",
    description: "Completed 120+ hours of UGC-guideline training on Python, Research Methodology and Aptitude Testing.",
    //skills: ["Data Preprocessing", "Statistical Modeling", "Python", "Machine Learning"],
    type: "Training Internship",
    cred_link:"https://drive.google.com/file/d/1w4os8_vJNmVU4RnYM7iHU7EBYRLbD3yN/view?usp=drive_link"
  }
]

const certifications = [
  // {
  //   id: 1,
  //   title: "AI VicharanasShala Bootcamp",
  //   instructor: "Dr. Sudarshan Iyengar",
  //   institution: "Department of Computer Science and Engineering, Indian Institute of Technology Ropar",
  //   date: "June 2024",
  //   duration: "1 Month",
  //   skills: ["Python", "Statistics", "Machine Learning", "Data Visualization"],
  //   certificate: true,
  //   level: "Advanced"
  // },
  // {
  //   id: 2,
  //   title: "Social Computing - NPTEL",
  //   instructor: "Prof. Ponnurangam Kumaraguru",
  //   institution: "International Institute of Technology (IIIT) Hyderabad, TS",
  //   date: "February 2023",
  //   duration: "12 Weeks",
  //   skills: ["Social Computing", "Data Analysis", "Research Methods"],
  //   certificate: true,
  //   level: "Intermediate"
  // }
]
</script>

<style scoped>
/* Optional styles */
</style>
