<script setup>
import { useRoute } from 'vue-router' // ✅ REQUIRED import
import { computed } from 'vue'
// Import global components
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'

// get current route
const route = useRoute()

// computed flag: hide layout on home
const showLayout = computed(() => route.name !== 'HomePage')
</script>

<template>
  <div class="d-flex flex-column min-vh-100">
    <!-- Header is conditionally rendered based on the route -->
    <!-- It will not show on the HomePage -->
    <Header v-if="showLayout" />

    <main class="flex-fill px-0">
      <router-view />
    </main>

    <!-- Footer is conditionally rendered based on the route -->
    <!-- It will not show on the HomePage -->
    <Footer v-if="showLayout" />
  </div>
</template>

<style scoped>
.footer {
  margin-top: auto /* Ensure footer is at the bottom */;
}
</style>
