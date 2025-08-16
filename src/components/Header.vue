<template>
  <header class="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7edf3] px-10 py-2">
    <!-- Logo/Brand -->
    <div class="flex items-center gap-4 text-[#0e141b]">
      <div class="size-4">
        <img src="/profile-icon.png" alt="Profile Icon" class="w-full h-full object-cover rounded-full" />
      </div>
      <router-link to="/" class="text-[#0e141b] text-lg font-bold leading-tight tracking-[-0.015em] no-underline">
        Samyabrata Roy
      </router-link>
    </div>

    <!-- Navigation Links -->
    <div class="flex flex-1 justify-end gap-8">
      <div class="hidden md:flex items-center gap-9">
        <router-link 
          v-if="$route.name !== 'Home'"
          to="/" 
          class="text-[#0e141b] text-sm font-medium leading-normal hover:text-[#1980e6] transition-colors duration-200"
        >
          Home
        </router-link>
        <router-link 
          v-if="$route.name !== 'ProjectsPublications'"
          to="/projects-publications" 
          class="text-[#0e141b] text-sm font-medium leading-normal hover:text-[#1980e6] transition-colors duration-200"
        >
          Projects & Publications
        </router-link>
        <router-link 
          v-if="$route.name !== 'Cocurricular'"
          to="/cocurricular" 
          class="text-[#0e141b] text-sm font-medium leading-normal hover:text-[#1980e6] transition-colors duration-200"
        >
          Co-curricular
        </router-link>
        <router-link 
          v-if="$route.name !== 'Contact'"
          to="/contact" 
          class="text-[#0e141b] text-sm font-medium leading-normal hover:text-[#1980e6] transition-colors duration-200"
        >
          Contact
        </router-link>
      </div>
      
      <!-- Hire Me Button -->
      <button
        class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#1980e6] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#1565c0] transition-colors duration-200"
        @click="$router.push('/contact')"
      >
        <span class="truncate">Hire Me</span>
      </button>

      <!-- Mobile Menu Button -->
      <button
        class="md:hidden flex items-center justify-center w-10 h-10 text-[#0e141b] hover:text-[#1980e6] transition-colors duration-200"
        @click="drawer = !drawer"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>
    </div>
  </header>

  <!-- Mobile Navigation Drawer -->
  <div 
    v-if="drawer" 
    class="fixed inset-0 z-50 md:hidden"
    @click="drawer = false"
  >
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black bg-opacity-50"></div>
    
    <!-- Drawer Content -->
    <div class="absolute right-0 top-0 h-full w-64 bg-white shadow-lg">
      <div class="flex flex-col p-4">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-bold text-[#0e141b]">Menu</h3>
          <button 
            @click="drawer = false"
            class="text-[#0e141b] hover:text-[#1980e6] transition-colors duration-200"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <nav class="flex flex-col space-y-4">
          <router-link 
            v-if="$route.name !== 'Home'"
            to="/" 
            @click="drawer = false"
            class="text-[#0e141b] text-sm font-medium leading-normal hover:text-[#1980e6] transition-colors duration-200 py-2"
          >
            Home
          </router-link>
          <router-link 
            v-if="$route.name !== 'ProjectsPublications'"
            to="/projects-publications" 
            @click="drawer = false"
            class="text-[#0e141b] text-sm font-medium leading-normal hover:text-[#1980e6] transition-colors duration-200 py-2"
          >
            Projects & Publications
          </router-link>
          <router-link 
            v-if="$route.name !== 'Cocurricular'"
            to="/cocurricular" 
            @click="drawer = false"
            class="text-[#0e141b] text-sm font-medium leading-normal hover:text-[#1980e6] transition-colors duration-200 py-2"
          >
            Co-curricular
          </router-link>
          <router-link 
            v-if="$route.name !== 'Contact'"
            to="/contact" 
            @click="drawer = false"
            class="text-[#0e141b] text-sm font-medium leading-normal hover:text-[#1980e6] transition-colors duration-200 py-2"
          >
            Contact
          </router-link>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const drawer = ref(false)
</script>

<style scoped>
.no-underline {
  text-decoration: none;
}
</style>
