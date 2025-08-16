<template>
  <div class="min-h-screen bg-slate-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Page Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-black text-[#0e141b] mb-4 tracking-[-0.033em]">
          Projects & Publications
        </h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Explore my research publications, technical projects, and written articles showcasing my expertise in data science, statistics, and web development.
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
        <!-- Publications Tab -->
        <div v-if="activeTab === 'publications'" class="space-y-8">
          <div class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold text-[#0e141b] mb-6">Research Publications</h2>
            <div class="space-y-6">
              <div v-for="publication in publications" :key="publication.id" class="border-l-4 border-[#1980e6] pl-6 py-4">
                <h3 class="text-lg font-semibold text-[#0e141b] mb-2">{{ publication.title }}</h3>
                <p class="text-gray-600 mb-2">{{ publication.authors }}</p>
                <p class="text-sm text-gray-500 mb-3">{{ publication.journal }}, {{ publication.year }}</p>
                <p class="text-gray-700 mb-3">{{ publication.abstract }}</p>
                <div class="flex flex-wrap gap-2">
                  <span v-for="tag in publication.tags" :key="tag" class="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Projects Tab -->
        <div v-if="activeTab === 'projects'" class="space-y-8">
          <div class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold text-[#0e141b] mb-6">Technical Projects</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div v-for="project in projects" :key="project.id" class="border rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold text-[#0e141b]">{{ project.title }}</h3>
                  <span class="text-sm text-gray-500">{{ project.year }}</span>
                </div>
                <p class="text-gray-600 mb-4">{{ project.description }}</p>
                <div class="flex flex-wrap gap-2 mb-4">
                  <span v-for="tech in project.technologies" :key="tech" class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {{ tech }}
                  </span>
                </div>
                <div class="flex space-x-3">
                  <a v-if="project.github" :href="project.github" target="_blank" class="text-[#1980e6] hover:underline text-sm">
                    GitHub
                  </a>
                  <a v-if="project.demo" :href="project.demo" target="_blank" class="text-[#1980e6] hover:underline text-sm">
                    Live Demo
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Articles Tab -->
        <div v-if="activeTab === 'articles'" class="space-y-8">
          <div class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold text-[#0e141b] mb-6">Articles & Blog Posts</h2>
            <div class="space-y-6">
              <div v-for="article in articles" :key="article.id" class="border-b border-gray-200 pb-6 last:border-b-0">
                <div class="flex items-start justify-between mb-3">
                  <h3 class="text-lg font-semibold text-[#0e141b] hover:text-[#1980e6] cursor-pointer">
                    {{ article.title }}
                  </h3>
                  <span class="text-sm text-gray-500">{{ article.date }}</span>
                </div>
                <p class="text-gray-600 mb-3">{{ article.excerpt }}</p>
                <div class="flex items-center justify-between">
                  <div class="flex flex-wrap gap-2">
                    <span v-for="category in article.categories" :key="category" class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      {{ category }}
                    </span>
                  </div>
                  <a :href="article.link" target="_blank" class="text-[#1980e6] hover:underline text-sm">
                    Read More →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeTab = ref('publications')

const tabs = [
  { id: 'publications', name: 'Publications' },
  { id: 'projects', name: 'Projects' },
  { id: 'articles', name: 'Articles' }
]

// Sample data - replace with your actual data
const publications = [
  {
    id: 1,
    title: "Machine Learning Applications in Healthcare Data Analysis",
    authors: "Samyabrata Roy, Dr. Jane Smith, Dr. John Doe",
    journal: "Journal of Medical Informatics",
    year: "2024",
    abstract: "This research explores the application of machine learning algorithms in analyzing healthcare datasets to improve patient outcomes and diagnostic accuracy.",
    tags: ["Machine Learning", "Healthcare", "Data Analysis", "Python"]
  },
  {
    id: 2,
    title: "Statistical Modeling for Climate Change Prediction",
    authors: "Samyabrata Roy, Prof. Robert Johnson",
    journal: "Environmental Science & Technology",
    year: "2023",
    abstract: "A comprehensive statistical analysis of climate data using advanced regression models to predict future climate patterns and their impact on ecosystems.",
    tags: ["Statistics", "Climate Science", "R", "Regression Analysis"]
  }
]

const projects = [
  {
    id: 1,
    title: "E-Commerce Analytics Dashboard",
    description: "A comprehensive web application for analyzing e-commerce data with interactive visualizations and real-time insights.",
    year: "2024",
    technologies: ["Vue.js", "Python", "D3.js", "PostgreSQL"],
    github: "https://github.com/example/ecommerce-dashboard",
    demo: "https://demo.example.com"
  },
  {
    id: 2,
    title: "Predictive Maintenance System",
    description: "Machine learning system for predicting equipment failures in manufacturing plants using sensor data.",
    year: "2023",
    technologies: ["Python", "TensorFlow", "Flask", "MongoDB"],
    github: "https://github.com/example/predictive-maintenance"
  },
  {
    id: 3,
    title: "Portfolio Website",
    description: "Personal portfolio website built with modern web technologies showcasing projects and skills.",
    year: "2024",
    technologies: ["Vue.js", "Tailwind CSS", "Vite"],
    github: "https://github.com/example/portfolio",
    demo: "https://samyabrata.github.io"
  }
]

const articles = [
  {
    id: 1,
    title: "Getting Started with Data Science: A Beginner's Guide",
    excerpt: "An introductory guide to data science covering essential concepts, tools, and learning resources for beginners.",
    date: "March 15, 2024",
    categories: ["Data Science", "Tutorial"],
    link: "https://medium.com/@samyabrata/data-science-guide"
  },
  {
    id: 2,
    title: "The Future of Web Development: Trends to Watch in 2024",
    excerpt: "Exploring emerging trends in web development including AI integration, performance optimization, and new frameworks.",
    date: "February 28, 2024",
    categories: ["Web Development", "Technology"],
    link: "https://dev.to/samyabrata/web-dev-trends-2024"
  },
  {
    id: 3,
    title: "Statistical Analysis in Python: A Practical Approach",
    excerpt: "A hands-on tutorial on performing statistical analysis using Python libraries like pandas, scipy, and matplotlib.",
    date: "January 20, 2024",
    categories: ["Statistics", "Python", "Tutorial"],
    link: "https://towardsdatascience.com/statistical-analysis-python"
  }
]
</script>

<style scoped>
/* Custom styles if needed */
</style>
