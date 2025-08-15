<template>
  <v-footer 
    class="bg-gray-800 text-white py-8"
    app
  >
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Brand Section -->
        <div class="col-span-1 md:col-span-2">
          <h3 class="text-xl font-bold mb-4">My Portfolio</h3>
          <p class="text-gray-300 mb-4 max-w-md">
            A passionate developer creating beautiful and functional web applications with modern technologies.
          </p>
          <div class="flex space-x-4">
            <v-btn 
              icon 
              variant="text" 
              color="white"
              href="https://github.com" 
              target="_blank"
            >
              <v-icon>mdi-github</v-icon>
            </v-btn>
            <v-btn 
              icon 
              variant="text" 
              color="white"
              href="https://linkedin.com" 
              target="_blank"
            >
              <v-icon>mdi-linkedin</v-icon>
            </v-btn>
            <v-btn 
              icon 
              variant="text" 
              color="white"
              href="https://twitter.com" 
              target="_blank"
            >
              <v-icon>mdi-twitter</v-icon>
            </v-btn>
            <v-btn 
              icon 
              variant="text" 
              color="white"
              href="mailto:contact@example.com"
            >
              <v-icon>mdi-email</v-icon>
            </v-btn>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="text-lg font-semibold mb-4">Quick Links</h4>
          <ul class="space-y-2">
            <li>
              <router-link 
                to="/" 
                class="text-gray-300 hover:text-white transition-colors duration-200"
              >
                Home
              </router-link>
            </li>
            <li>
              <router-link 
                to="/about" 
                class="text-gray-300 hover:text-white transition-colors duration-200"
              >
                About
              </router-link>
            </li>
            <li>
              <router-link 
                to="/contact" 
                class="text-gray-300 hover:text-white transition-colors duration-200"
              >
                Contact
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Contact Info -->
        <div>
          <h4 class="text-lg font-semibold mb-4">Contact Info</h4>
          <div class="space-y-2 text-gray-300">
            <div class="flex items-center">
              <v-icon size="small" class="mr-2">mdi-email</v-icon>
              <span>contact@example.com</span>
            </div>
            <div class="flex items-center">
              <v-icon size="small" class="mr-2">mdi-phone</v-icon>
              <span>+1 (555) 123-4567</span>
            </div>
            <div class="flex items-center">
              <v-icon size="small" class="mr-2">mdi-map-marker</v-icon>
              <span>San Francisco, CA</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Section -->
      <v-divider class="my-6 bg-gray-600"></v-divider>
      
      <div class="flex flex-col md:flex-row justify-between items-center">
        <p class="text-gray-300 text-sm">
          © {{ new Date().getFullYear() }} My Portfolio. All rights reserved.
        </p>
        
        <div class="flex space-x-4 mt-4 md:mt-0">
          <a href="#" class="text-gray-300 hover:text-white text-sm transition-colors duration-200">
            Privacy Policy
          </a>
          <a href="#" class="text-gray-300 hover:text-white text-sm transition-colors duration-200">
            Terms of Service
          </a>
        </div>
      </div>
    </div>
  </v-footer>
</template>

<script setup>
// Footer component
</script>

<style scoped>
/* Custom styles for the footer */
</style>
