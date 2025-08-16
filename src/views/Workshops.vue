<template>
  <div class="min-h-screen bg-slate-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Page Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-black text-[#0e141b] mb-4 tracking-[-0.033em]">
          Workshops & Training
        </h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Explore the workshops I've conducted and attended, covering various aspects of data science, web development, and emerging technologies.
        </p>
      </div>

      <div class="max-w-6xl mx-auto space-y-8">
        <!-- Workshops Conducted -->
        <div class="bg-white rounded-lg shadow-sm p-8">
          <h2 class="text-2xl font-bold text-[#0e141b] mb-6 flex items-center">
            <svg class="w-6 h-6 mr-3 text-[#1980e6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
            Workshops Conducted
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="workshop in conductedWorkshops" :key="workshop.id" class="border rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-[#0e141b]">{{ workshop.title }}</h3>
                <span class="text-sm text-gray-500">{{ workshop.date }}</span>
              </div>
              <p class="text-gray-600 mb-2">{{ workshop.organization }}</p>
              <p class="text-gray-700 mb-4">{{ workshop.description }}</p>
              <div class="flex flex-wrap gap-2 mb-4">
                <span v-for="topic in workshop.topics" :key="topic" class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {{ topic }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-[#1980e6] font-medium">{{ workshop.duration }}</span>
                <span class="text-sm text-green-600 font-medium">{{ workshop.participants }} participants</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Workshops Attended -->
        <div class="bg-white rounded-lg shadow-sm p-8">
          <h2 class="text-2xl font-bold text-[#0e141b] mb-6 flex items-center">
            <svg class="w-6 h-6 mr-3 text-[#1980e6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
            </svg>
            Workshops Attended
          </h2>
          <div class="space-y-6">
            <div v-for="workshop in attendedWorkshops" :key="workshop.id" class="border-l-4 border-[#1980e6] pl-6 py-4">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-lg font-semibold text-[#0e141b]">{{ workshop.title }}</h3>
                <span class="text-sm text-gray-500">{{ workshop.date }}</span>
              </div>
              <p class="text-gray-600 mb-2">{{ workshop.instructor }}</p>
              <p class="text-gray-700 mb-3">{{ workshop.description }}</p>
              <div class="flex flex-wrap gap-2 mb-3">
                <span v-for="skill in workshop.skillsLearned" :key="skill" class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                  {{ skill }}
                </span>
              </div>
              <div class="flex items-center space-x-4">
                <span class="text-sm text-[#1980e6] font-medium">{{ workshop.duration }}</span>
                <span v-if="workshop.certificate" class="text-sm text-green-600 font-medium">Certificate Received</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Upcoming Workshops -->
        <div class="bg-white rounded-lg shadow-sm p-8">
          <h2 class="text-2xl font-bold text-[#0e141b] mb-6 flex items-center">
            <svg class="w-6 h-6 mr-3 text-[#1980e6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            Upcoming Workshops
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="workshop in upcomingWorkshops" :key="workshop.id" class="border-2 border-dashed border-[#1980e6] rounded-lg p-6 bg-blue-50">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-[#0e141b]">{{ workshop.title }}</h3>
                <span class="text-sm text-[#1980e6] font-medium">{{ workshop.date }}</span>
              </div>
              <p class="text-gray-600 mb-3">{{ workshop.description }}</p>
              <div class="flex flex-wrap gap-2 mb-4">
                <span v-for="topic in workshop.topics" :key="topic" class="px-2 py-1 bg-white text-[#1980e6] text-xs rounded border border-[#1980e6]">
                  {{ topic }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">{{ workshop.duration }}</span>
                <button class="px-4 py-2 bg-[#1980e6] text-white text-sm rounded-lg hover:bg-[#1565c0] transition-colors duration-200">
                  Register
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Workshop Statistics -->
        <div class="bg-white rounded-lg shadow-sm p-8">
          <h2 class="text-2xl font-bold text-[#0e141b] mb-6 flex items-center">
            <svg class="w-6 h-6 mr-3 text-[#1980e6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            Workshop Statistics
          </h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div v-for="stat in statistics" :key="stat.label" class="text-center">
              <div class="text-3xl font-bold text-[#1980e6] mb-2">{{ stat.value }}</div>
              <div class="text-gray-600">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Sample data - replace with your actual data
const conductedWorkshops = [
  {
    id: 1,
    title: "Introduction to Machine Learning",
    organization: "University Data Science Club",
    date: "March 2024",
    description: "A comprehensive workshop covering the fundamentals of machine learning algorithms and their practical applications.",
    topics: ["Supervised Learning", "Unsupervised Learning", "Python", "Scikit-learn"],
    duration: "8 hours",
    participants: 45
  },
  {
    id: 2,
    title: "Web Development with Vue.js",
    organization: "Coding Bootcamp",
    date: "February 2024",
    description: "Hands-on workshop teaching modern web development using Vue.js framework and best practices.",
    topics: ["Vue.js", "JavaScript", "CSS", "API Integration"],
    duration: "6 hours",
    participants: 32
  },
  {
    id: 3,
    title: "Data Visualization with D3.js",
    organization: "Tech Community Meetup",
    date: "January 2024",
    description: "Interactive workshop on creating dynamic data visualizations using D3.js library.",
    topics: ["D3.js", "Data Visualization", "JavaScript", "SVG"],
    duration: "4 hours",
    participants: 28
  },
  {
    id: 4,
    title: "Statistical Analysis with R",
    organization: "Research Methodology Workshop",
    date: "December 2023",
    description: "Workshop focused on statistical analysis techniques using R programming language.",
    topics: ["R Programming", "Statistics", "Data Analysis", "Hypothesis Testing"],
    duration: "10 hours",
    participants: 38
  }
]

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

const upcomingWorkshops = [
  {
    id: 1,
    title: "Blockchain Development",
    date: "May 15, 2024",
    description: "Learn blockchain fundamentals and smart contract development with Ethereum.",
    topics: ["Blockchain", "Smart Contracts", "Solidity", "Web3"],
    duration: "10 hours"
  },
  {
    id: 2,
    title: "Natural Language Processing",
    date: "May 22, 2024",
    description: "Advanced NLP techniques including transformers and language models.",
    topics: ["NLP", "Transformers", "BERT", "Text Processing"],
    duration: "8 hours"
  },
  {
    id: 3,
    title: "DevOps Best Practices",
    date: "June 5, 2024",
    description: "Modern DevOps practices including CI/CD, containerization, and automation.",
    topics: ["DevOps", "Docker", "Kubernetes", "CI/CD"],
    duration: "12 hours"
  }
]

const statistics = [
  { label: "Workshops Conducted", value: "12" },
  { label: "Workshops Attended", value: "25" },
  { label: "Total Participants", value: "450+" },
  { label: "Certificates Earned", value: "18" }
]
</script>

<style scoped>
/* Custom styles if needed */
</style>
