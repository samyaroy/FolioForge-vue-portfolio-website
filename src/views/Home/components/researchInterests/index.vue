<template>
  <div class="px-4 md:px-8 lg:px-20 py-4 bg-white">
    <div class="max-w-[1200px] mx-auto">
      <div class="flex flex-wrap justify-between gap-3 p-4">
        <h2 class="text-[#0e141b] tracking-light text-[32px] font-bold leading-tight min-w-72">Research Interests</h2>
      </div>
      <v-row class="px-4">
        <v-col cols="6" md="4" lg="3" v-for="interest in research_interests" :key="interest.key">
          <Card :name="name_maker(interest.key)" :icon="iconMap[interest.key]||'mdi-help-circle-outline'" />
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup>
import Card from './components/Card.vue'
import config from "@/profile_info.yml"

const { research_interests } = config

const name_maker = (key) => key.replace(/_/g, ' ')

const iconMap = {
  // 🤖 AI & ML
  Artificial_Intelligence: "mdi-robot-industrial",
  Machine_Learning: "mdi-brain",
  Deep_Learning: "mdi-brain",
  Neural_Networks: "mdi-brain",
  Reinforcement_Learning: "mdi-robot",

  // 🧠 Data Science
  Natural_Language_Processing: "mdi-text-box-multiple",
  Computer_Vision: "mdi-image-search",
  Time_Series_Analysis: "mdi-chart-line",
  Statistical_Modeling: "mdi-chart-bar",
  Bayesian_Statistics: "mdi-chart-bar",
  Hypothesis_Testing: "mdi-check-circle",
  Nonparametric_Inference: "mdi-function-variant",

  Data_Science: "mdi-database",
  Data_Visualization: "mdi-chart-pie",
  Data_Analysis: "mdi-chart-areaspline",
  Predictive_Analytics: "mdi-chart-line",
  Big_Data_Analytics: "mdi-database",
  Data_Mining: "mdi-database-search",
  Data_Cleaning: "mdi-broom",
  Data_Wrangling: "mdi-database-edit",
  Data_Engineering: "mdi-database-cog",

  // 🌐 Web & Systems
  Web_Development: "mdi-web",
  API_Development: "mdi-api",
  Cloud_Computing: "mdi-cloud",

  // ⚙️ DevOps & Pipelines
  DevOps: "mdi-cog-sync",
  MLOps: "mdi-robot-outline",
  DataOps: "mdi-database-sync",
  CI_CD_Pipeline: "mdi-source-merge",
  Containerization: "mdi-docker",
  Microservices: "mdi-cube-outline",
  Cloud_Native: "mdi-cloud-tags",

  // 🔐 Security & Emerging Tech
  Cybersecurity: "mdi-shield-lock",
  Blockchain: "mdi-blockchain",
  Internet_of_Things: "mdi-access-point-network",
  Quantum_Computing: "mdi-atom",
  Augmented_Reality_Virtual_Reality: "mdi-eye-off-outline",
  Edge_Computing: "mdi-access-point",

  // 🧬 Science & Interdisciplinary
  Bioinformatics: "mdi-dna",

  // 💰 Finance & Economics
  Financial_Modeling: "mdi-finance",
  Portfolio_Optimization: "mdi-briefcase-chart",
  Risk_Management: "mdi-shield-percent",
  Econometrics: "mdi-chart-bell-curve",
  Quantitative_Finance: "mdi-chart-multiple",
  Algorithmic_Trading: "mdi-swap-horizontal",
  Behavioral_Finance: "mdi-brain",
  Public_Finance: "mdi-bank",
  Corporate_Finance: "mdi-domain",
  Personal_Finance: "mdi-cash-multiple",
  Investment_Analysis: "mdi-chart-line-variant",
  Derivatives: "mdi-swap-vertical",
  Financial_Econometrics: "mdi-function-variant"
} 
</script>

<style scoped>
/* Custom styles if needed */
</style>
