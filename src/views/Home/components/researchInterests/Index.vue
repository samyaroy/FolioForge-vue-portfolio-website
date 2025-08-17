<template>
  <div class="px-4 md:px-8 lg:px-20 py-4 bg-white">
    <div class="max-w-[1200px] mx-auto">
      <div class="flex flex-wrap justify-between gap-3 p-4">
        <h2 class="text-[#0e141b] tracking-light text-[32px] font-bold leading-tight min-w-72">Research Interests</h2>
      </div>
      <v-row class="px-4">
        <v-col cols="6" md="4" lg="3" v-for="interest in researchInterests" :key="interest.name">
          <Card :name="interest.name" :icon="interest.icon" />
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup>
import Card from './components/Card.vue'

const researchInterests = [
  {
    name: 'Machine Learning',
    icon: 'mdi-brain'
  },
  {
    name: 'Statistical Modeling',
    icon: 'mdi-chart-line'
  },
  {
    name: 'Web Development',
    icon: 'mdi-web'
  },
  {
    name: 'Data Engineering',
    icon: 'mdi-database'
  },
  {
    name: 'Data Visualization',
    icon: 'mdi-chart-bubble'
  },
  {
    name: 'Cybersecurity',
    icon: 'mdi-shield-check'
  }
]
</script>

<style scoped>
/* Custom styles if needed */
</style>
