<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <div class="container mx-auto px-4 py-20">
        <div class="text-center">
          <h1 class="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            Welcome to My Portfolio
          </h1>
          <p class="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A passionate developer creating beautiful and functional web applications with Vue.js, Vuetify, and Tailwind CSS.
          </p>
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <v-btn 
              color="primary" 
              size="x-large"
              class="text-white font-semibold"
              prepend-icon="mdi-rocket"
              @click="$router.push('/about')"
            >
              Learn More
            </v-btn>
            <v-btn 
              variant="outlined" 
              size="x-large"
              class="font-semibold"
              prepend-icon="mdi-github"
              @click="$router.push('/contact')"
            >
              Get In Touch
            </v-btn>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16 bg-white">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center text-gray-800 mb-12">
          What I Do
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <v-card class="text-center p-6 hover:shadow-xl transition-shadow duration-300">
            <v-icon size="64" color="primary" class="mb-4">mdi-web</v-icon>
            <h3 class="text-xl font-semibold mb-3">Web Development</h3>
            <p class="text-gray-600">
              Building modern, responsive web applications with cutting-edge technologies.
            </p>
          </v-card>

          <v-card class="text-center p-6 hover:shadow-xl transition-shadow duration-300">
            <v-icon size="64" color="primary" class="mb-4">mdi-cellphone</v-icon>
            <h3 class="text-xl font-semibold mb-3">Mobile Apps</h3>
            <p class="text-gray-600">
              Creating cross-platform mobile applications with Vue.js and native frameworks.
            </p>
          </v-card>

          <v-card class="text-center p-6 hover:shadow-xl transition-shadow duration-300">
            <v-icon size="64" color="primary" class="mb-4">mdi-palette</v-icon>
            <h3 class="text-xl font-semibold mb-3">UI/UX Design</h3>
            <p class="text-gray-600">
              Designing beautiful and intuitive user interfaces with Material Design principles.
            </p>
          </v-card>
        </div>
      </div>
    </section>

    <!-- Tech Stack Section -->
    <section class="py-16 bg-gray-50">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center text-gray-800 mb-12">
          Technologies I Use
        </h2>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div class="text-center">
            <v-icon size="48" color="primary" class="mb-2">mdi-vuejs</v-icon>
            <p class="font-semibold">Vue.js</p>
          </div>
          <div class="text-center">
            <v-icon size="48" color="primary" class="mb-2">mdi-material-design</v-icon>
            <p class="font-semibold">Vuetify</p>
          </div>
          <div class="text-center">
            <v-icon size="48" color="primary" class="mb-2">mdi-tailwind</v-icon>
            <p class="font-semibold">Tailwind CSS</p>
          </div>
          <div class="text-center">
            <v-icon size="48" color="primary" class="mb-2">mdi-nodejs</v-icon>
            <p class="font-semibold">Node.js</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// Home page component
</script>

<style scoped>
/* Custom styles for the home page */
</style>
