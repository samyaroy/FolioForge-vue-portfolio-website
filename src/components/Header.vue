<template>
  <v-app-bar 
    color="primary" 
    class="shadow-lg"
    elevation="4"
    app
  >
    <!-- Logo/Brand -->
    <v-app-bar-title class="text-white font-bold text-xl">
      <router-link to="/" class="text-white no-underline">
        My Portfolio
      </router-link>
    </v-app-bar-title>

    <v-spacer></v-spacer>

    <!-- Navigation Links -->
    <div class="hidden md:flex space-x-4">
      <v-btn 
        variant="text" 
        class="text-white"
        :class="{ 'font-bold': $route.name === 'HomePage' }"
        @click="$router.push('/')"
      >
        <v-icon class="mr-1">mdi-home</v-icon>
        Home
      </v-btn>
      
      <v-btn 
        variant="text" 
        class="text-white"
        :class="{ 'font-bold': $route.name === 'About' }"
        @click="$router.push('/about')"
      >
        <v-icon class="mr-1">mdi-information</v-icon>
        About
      </v-btn>
      
      <v-btn 
        variant="text" 
        class="text-white"
        :class="{ 'font-bold': $route.name === 'Contact' }"
        @click="$router.push('/contact')"
      >
        <v-icon class="mr-1">mdi-email</v-icon>
        Contact
      </v-btn>
    </div>

    <!-- Mobile Menu Button -->
    <v-app-bar-nav-icon 
      class="md:hidden text-white"
      @click="drawer = !drawer"
    ></v-app-bar-nav-icon>
  </v-app-bar>

  <!-- Mobile Navigation Drawer -->
  <v-navigation-drawer 
    v-model="drawer" 
    location="right" 
    temporary
    class="bg-white"
  >
    <v-list class="py-4">
      <v-list-item 
        @click="navigateTo('/')"
        :class="{ 'bg-blue-50': $route.name === 'HomePage' }"
      >
        <template v-slot:prepend>
          <v-icon>mdi-home</v-icon>
        </template>
        <v-list-item-title>Home</v-list-item-title>
      </v-list-item>

      <v-list-item 
        @click="navigateTo('/about')"
        :class="{ 'bg-blue-50': $route.name === 'About' }"
      >
        <template v-slot:prepend>
          <v-icon>mdi-information</v-icon>
        </template>
        <v-list-item-title>About</v-list-item-title>
      </v-list-item>

      <v-list-item 
        @click="navigateTo('/contact')"
        :class="{ 'bg-blue-50': $route.name === 'Contact' }"
      >
        <template v-slot:prepend>
          <v-icon>mdi-email</v-icon>
        </template>
        <v-list-item-title>Contact</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const drawer = ref(false)

const navigateTo = (path) => {
  router.push(path)
  drawer.value = false
}
</script>

<style scoped>
/* Custom styles for the header */
.no-underline {
  text-decoration: none;
}
</style>
