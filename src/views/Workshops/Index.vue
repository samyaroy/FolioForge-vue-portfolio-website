<template>
  <div class="min-h-screen bg-slate-50 py-8">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-black text-[#0e141b] mb-4 tracking-[-0.033em]">
          Workshops Attended
        </h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Explore the workshops I've attended, covering various aspects of data science, web development, and emerging technologies.
        </p>
      </div>

      <div class="space-y-6 max-w-4xl mx-auto">
        <WorkshopCard
          v-for="workshop in attendedWorkshops"
          :key="workshop.id"
          :workshop="workshop"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import WorkshopCard from './components/WorkshopCard.vue'

const attendedWorkshops = [
  {
    id: 1,
    title: "Advanced Deep Learning with TensorFlow",
    instructor: "Dr. Sarah Johnson, Google AI",
    date: "April 2024",
    description: "Advanced workshop covering deep learning architectures, neural networks, and TensorFlow implementation.",
    skillsLearned: ["Deep Learning", "TensorFlow", "Neural Networks", "Computer Vision"],
    duration: "12 hours",
    certificate: true
  },
  {
    id: 2,
    title: "Cloud Computing with AWS",
    instructor: "Mike Chen, AWS Solutions Architect",
    date: "March 2024",
    description: "Comprehensive workshop on AWS cloud services, deployment strategies, and best practices.",
    skillsLearned: ["AWS", "Cloud Computing", "DevOps", "Serverless"],
    duration: "16 hours",
    certificate: true
  },
  {
    id: 3,
    title: "Agile Project Management",
    instructor: "Lisa Rodriguez, Scrum Master",
    date: "February 2024",
    description: "Workshop on agile methodologies, scrum framework, and project management tools.",
    skillsLearned: ["Agile", "Scrum", "Project Management", "Team Collaboration"],
    duration: "8 hours",
    certificate: true
  },
  {
    id: 4,
    title: "UI/UX Design Principles",
    instructor: "Alex Thompson, Senior Designer",
    date: "January 2024",
    description: "Workshop covering user interface design principles, user experience, and design tools.",
    skillsLearned: ["UI Design", "UX Research", "Figma", "User Testing"],
    duration: "6 hours",
    certificate: true
  }
]
</script>

<style scoped>
/* Optional styles */
</style>