<template>
  <div class="min-h-screen bg-slate-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Page Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-black text-[#0e141b] mb-4 tracking-[-0.033em]">
          Projects & Publications
        </h1>
        <p class="text-lg text-gray-600 max-w-4xl mx-auto">
          Explore my research publications, technical projects, and written articles showcasing my expertise.
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
        <PublicationsTab v-if="activeTab === 'publications'" :publications="publications" />
        <ProjectsTab v-if="activeTab === 'projects'" :projects="projects" />
        <ArticlesTab v-if="activeTab === 'articles'" :articles="articles" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PublicationsTab from './components/PublicationsTab.vue'
import ProjectsTab from './components/ProjectTab/Index.vue'
import ArticlesTab from './components/ArticlesTab.vue'

const activeTab = ref('projects')

const tabs = [
  { id: 'projects', name: 'Projects' },
  { id: 'articles', name: 'Articles' },
  { id: 'publications', name: 'Publications' },
]
const publications = [
  // {
  //   id: 1,
  //   title: "Predicting Wine Quality: A Comparison of Linear Regression Techniques on a Multicollinear and Outlier-Affected Dataset",
  //   authors: "Samyabrata Roy",
  //   journal: "BSc. (Hons.) Statistics Degree Project, Sister Nivedita University",
  //   year: "2025",
  //   abstract: "Conducted linear regression analysis on a Wine Quality dataset (n = 32) to evaluate performance under multicollinearity and outlier influence. Compared OLS, ridge, and robust regression using R.",
  //   tags: ["R", "Regression", "Robust Methods", "Statistics"],
  //   link: "https://doi.org/10.13140/RG.2.2.16657.13926"
  // },
  // {
  //   id: 2,
  //   title: "Multivariate Analysis of Career Preferences: Insights from Kolkata’s College Students",
  //   authors: "Samyabrata Roy",
  //   journal: "Internship Project, IDEAS TIH, ISI",
  //   year: "2024",
  //   abstract: "Statistical study on career preferences among Kolkata’s college students using survey-based data (n=172). Applied nonparametric inference and data visualization to explore socio-economic and academic factors.",
  //   tags: ["Python", "Nonparametric Inference", "Survey Design", "Data Visualization"],
  //   link: "https://doi.org/10.13140/RG.2.2.16657.13926"
  // }
]

const projects = [
  {
    id: 1,
    category: "Technical",
    title: "Quiz Pilot (V1 & V2)",
    guide:"",
    type:"Diploma Level. Project, BS in Data Science and Applications, IIT Madras",
    description: "Full-stack quiz platform with role-based dashboards, score analytics, and Redis + Celery powered reminders. Built with Flask, Vue.js, SQLite, and Bootstrap.",
    time_period: "Jan 2025 - Aug 2025",
    technologies: ["Flask", "Vue.js", "SQLite", "Redis", "Celery", "Bootstrap"],
    github: "https://github.com/samyaroy/quiz_pilot_master_repo",
    doi:""
  },
  {
    id: 1001,
    category: "Research",
    title: "Predicting Wine Quality: A Comparison of Linear Regression Techniques on a Multicollinear and Outlier-Affected Dataset",
    guide:"Prof. Aniruddha Choudhuri, Assistant Professor, Department of Statistics, Sister Nivedita University, kolkata",
    type:"BSc. (Hons.) Statistics Degree Project, Sister Nivedita University",
    description: "Conducted robust linear regression analysis on a Wine Quality dataset (n = 32) to evaluate model performance under multicollinearity and outlier influence.",
    time_period: "Jan 2025 - May 2025",
    keywords: ["Wine quality rating", "Exploratory Data Analysis", "Ordinary Least Squares", "Stepwise Regression", "Robust Regression", "R"],
    github: "",
    doi:"10.13140/RG.2.2.16657.13926"
  },
  {
    id: 1002,
    category: "Research",
    title: "Multivariate Analysis of Career Preferences: Insights from Kolkata’s College Students",
    guide:"Mr. Debashis Ghosh, Head, Technology Business Development & Incubation, Institute of Data Engineering, Analytics and Science Foundation - Technology Innovation Hub, Indian Statistical Institute, Kolkata ",
    type:"Internship Project, Data Science Intern at IDEAS TIH, ISI",
    description: "Conducted robust linear regression analysis on a Wine Quality dataset (n = 32) to evaluate model performance under multicollinearity and outlier influence.",
    time_period: "Jul 2024 - Dec 2024",
    keywords: ["Nonparametric Inference", "Data Visualization", "Survey Design", "Python"],
    github: "",
    doi:"",
    colaborator:['Rishav Kumar banerjee','Saunak Datta']
  },
  {
    id: 2,
    category: "Technical",
    title: "Doctor Vaahaan",
    guide:"",
    type:"Freelance Project",
    description: "Responsive website for vehicle doctor services, deployed with Laravel, MySQL, and Bootstrap.",
    time_period: "Nov 2024 - Dec 2024",
    technologies: ["Laravel", "MySQL", "Bootstrap"],
    demo: "https://www.doctorvahaan.com/"
  },
  {
    id: 3,
    category: "Technical",
    title: "Hand Raise Detector",
    guide:"",
    type:"AI VicharanaShala Bootcamp, IIT Ropar",
    description: "AI project using YOLOv8 and OpenCV to detect raised hands in real-time video streams. Developed during AI VicharanaShala Bootcamp, IIT Ropar.",
    year: "2024",
    technologies: ["Python", "OpenCV", "YOLOv8"]
  }
]

const articles = [
  // {
  //   id: 1,
  //   title: "Robust Regression in Practice: Handling Outliers in Real Datasets",
  //   excerpt: "An applied overview of robust regression techniques, comparing them with OLS under outlier-heavy conditions.",
  //   date: "Feb 2025",
  //   categories: ["Statistics", "Regression"],
  //   link: "https://medium.com/@samyabrata"
  // },
  // {
  //   id: 2,
  //   title: "Building Scalable Quiz Applications with Flask & Vue",
  //   excerpt: "A walkthrough of architecture, database design, and async background tasks in Quiz Pilot V2.",
  //   date: "Jan 2025",
  //   categories: ["Web Development", "Flask", "Vue.js"],
  //   link: "https://dev.to/samyabrata"
  // }
]
</script>