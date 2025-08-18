<template>
  <div class="min-h-screen bg-slate-50 py-8">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-black text-[#0e141b] mb-4 tracking-[-0.033em]">
          Workshops & Bootcamps
        </h1>
        <p class="text-lg text-gray-600 max-w-4xl mx-auto">
          Workshops and bootcamps completed in Statistics, Data Science, AI, and emerging technologies </p>
      </div>
      <!-- Bootcamps Section -->
      <div class="mb-16 max-w-4xl mx-auto">
        <h2 class="text-3xl font-bold text-[#0e141b] mb-6">Bootcamps Completed</h2>
        <!-- <p class="text-gray-600">Intensive training programs and certifications I've earned</p> -->

        <div class="space-y-6">
          <BootcampCard v-for="bootcamp in attendedBootcamps" :key="bootcamp.id" :bootcamp="bootcamp" />
        </div>
      </div>

      <!-- Workshops Section -->
      <div class="mb-16 max-w-4xl mx-auto">
        <h2 class="text-3xl font-bold text-[#0e141b] mb-6">Workshops Attended</h2>
        <!-- <p class="text-gray-600">Academic and professional workshops I've participated in</p> -->

        <div class="space-y-6">
          <WorkshopCard v-for="workshop in attendedWorkshops" :key="workshop.id" :workshop="workshop" />
        </div>
      </div>


    </div>
  </div>
</template>

<script setup>
import WorkshopCard from './components/WorkshopCard.vue'
import BootcampCard from './components/BootcampCard.vue'

const attendedWorkshops = [
  {
    id: 1,
    title: "Uncertainty in Machine Learning: Challenges and Opportunities",
    institution: "Isaac Newton Institute for Mathematical Sciences, University of Cambridge, Cambridge",
    date: "August 2025",
  },
  {
    id: 2,
    title: "Mini-Symposium on Contemporary Advancements in Computational Intelligence",
    institution: "Indian Statistical Institute, kolkata, WB",
    date: "July 2025",
  },
  {
    id: 3,
    title: "National Workshop and Bootcamp on Cyber Security and Blockchain (NWBCSB 2025)",
    institution: "International Institute of Technology (IIIT) Hyderabad, TS",
    date: "March 2025",
    duration: "7 Days",
  },
  {
    id: 4,
    title: "StatTech Fusion: Online FDP on Cutting – Edge Statistical Analysis, Research and AI techniques",
    institution: "Dept. of Statistics, Sister Nivedita University, Kolkata, WB ",
    date: "September 2024",
    duration: "7 Days",
  },
  {
    id: 5,
    title: "Numerical Algorithms & Computations in Science & Technology with Matlab",
    institution: "Dept. of Mathematics, Indian Institute of Technology Ropar, Rupnagar, PB",
    date: "July 2024",
  },
  {
    id: 6,
    title: "Democratizing Data science: Exploring Open Source Statistical Software",
    institution: "Dept. of Statistics, Sister Nivedita University, Kolkata, WB ",
    date: "March 2024",
  },
  {
    id: 7,
    title: "Research Opportunities in Computer Science (ROCS) - ACM",
    institution: "Indian Institute of Technology Madras, Chennai, TN",
    date: "January 2024",
  },
  {
    id: 8,
    title: "Social Computing - NPTEL",
    instructor: "Prof. Ponnurangam Kumaraguru",
    institution: "International Institute of Technology (IIIT) Hyderabad, TS",
    date: "February 2023",
  }
]

const attendedBootcamps = [
  {
    id: 1,
    title: "AI VicharanasShala Bootcamp",
    instructor: " Dr. Sudarshan Iyengar",
    institution: " Department of Computer Science and Engineering, Indian Institute of Technology Ropar",
    date: "June 2024",
    duration: " 1 Months",
    //description: "Comprehensive bootcamp covering Python, statistics, machine learning, and data visualization. Completed capstone project on predictive analytics.",
    //skillsLearned: ["Python", "Statistics", "Machine Learning", "Data Visualization", "SQL"],
    //certificate: true,
    //level: "Advanced",
    //link: "https://coursera.org/verify/example1"
  },
  // {
  //   id: 2,
  //   title: "Full Stack Web Development",
  //   instructor: "Mike Chen",
  //   institution: "Udemy",
  //   date: "October 2024",
  //   duration: "8 Weeks",
  //   description: "Intensive bootcamp covering frontend and backend development, including React, Node.js, and database management.",
  //   skillsLearned: ["JavaScript", "React", "Node.js", "MongoDB", "Express.js"],
  //   certificate: true,
  //   level: "Intermediate",
  //   link: "https://udemy.com/certificate/example2"
  // },
  // {
  //   id: 3,
  //   title: "Machine Learning Specialization",
  //   instructor: "Prof. Andrew Ng",
  //   institution: "Stanford Online",
  //   date: "August 2024",
  //   duration: "16 Weeks",
  //   description: "Advanced machine learning course covering supervised and unsupervised learning, neural networks, and deep learning applications.",
  //   skillsLearned: ["Supervised Learning", "Unsupervised Learning", "Neural Networks", "Deep Learning", "TensorFlow"],
  //   certificate: true,
  //   level: "Advanced",
  //   link: "https://stanford.edu/certificate/example3"
  // },
  // {
  //   id: 4,
  //   title: "Cybersecurity Fundamentals",
  //   instructor: "Lisa Rodriguez",
  //   institution: "CompTIA",
  //   date: "June 2024",
  //   duration: "6 Weeks",
  //   description: "Comprehensive cybersecurity bootcamp covering network security, cryptography, and ethical hacking principles.",
  //   skillsLearned: ["Network Security", "Cryptography", "Ethical Hacking", "Security Tools", "Risk Assessment"],
  //   certificate: true,
  //   level: "Intermediate",
  //   link: "https://comptia.org/certificate/example4"
  // }
]
</script>

<style scoped>
/* Optional styles */
</style>