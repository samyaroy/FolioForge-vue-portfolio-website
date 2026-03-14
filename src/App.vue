<script setup>
import { useRoute } from 'vue-router' 
// Import global components
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer/index.vue'

// get current route
const route = useRoute()


const showLayout = true //set to true
</script>

<template>
  <v-app>
    <div class="flex flex-col min-h-screen">
      <!-- Header is conditionally rendered based on the route -->
      <!-- It will not show on the HomePage -->
      <Header v-if="showLayout" />

      <main class="flex-1">
        <router-view />
      </main>

      <!-- Footer is conditionally rendered based on the route -->
      <!-- It will not show on the HomePage -->
      <Footer v-if="showLayout" />
    </div>
  </v-app>
</template>

<style scoped>
</style>
