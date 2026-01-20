<template>
  <header
    class="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7edf3] px-10 py-2">
    <!-- Logo/Brand -->
    <div class="flex items-center gap-4 text-base_black">
      <div class="size-4">
        <img src="/profile-icon.png" alt="Profile Icon" class="w-full h-full object-cover rounded-full" />
      </div>
      <router-link to="/" class="text-base_black text-lg font-bold leading-tight tracking-[-0.015em] no-underline">
        {{ profile.name }}
      </router-link>
    </div>

    <!-- Navigation Links -->
    <div class="flex flex-1 justify-end gap-8">
      <div class="hidden md:flex items-center gap-9">
        <router-link to="/" class="nav-link" active-class="active-link">
          Home
        </router-link>
        <router-link to="/projects-publications" class="nav-link" active-class="active-link">
          Projects & Publications
        </router-link>
        <router-link to="/teachings" @click="drawer = false" class="nav-link" active-class="active-link">
            Teachings
          </router-link>
        <router-link to="/cocurricular" class="nav-link" active-class="active-link">
          Co-curricular
        </router-link>
        <router-link to="/professional-activity" class="nav-link" active-class="active-link">
          Professional Activity
        </router-link>
        <router-link to="/contact" class="nav-link" active-class="active-link">
          Contact
        </router-link>
      </div>

      <!-- Hire Me Button -->
      <button
        class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-slate-50 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary-700 transition-colors duration-200"
        @click="SEND_MAIL">
        <span class="truncate">Hire Me</span>
      </button>

      <!-- Mobile Menu Button -->
      <button
        class="md:hidden flex items-center justify-center w-10 h-10 text-base_black hover:text-primary transition-colors duration-200"
        @click="drawer = !drawer">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"  bg="black">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>
    </div>
  </header>

  <!-- Mobile Navigation Drawer -->
  <div v-if="drawer" class="fixed inset-0 z-50 md:hidden" @click="drawer = false">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black bg-opacity-50"></div>

    <!-- Drawer Content -->
    <div class="absolute right-0 top-0 h-full w-64 bg-white shadow-lg">
      <div class="flex flex-col p-4">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-bold text-base_black">Menu</h3>
          <button @click="drawer = false" class="text-base_black hover:text-primary transition-colors duration-200">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <nav class="flex flex-col space-y-4">
          <router-link to="/" @click="drawer = false" class="nav-link" active-class="active-link">
            Home
          </router-link>
          <router-link to="/projects-publications" @click="drawer = false" class="nav-link" active-class="active-link">
            Projects & Publications
          </router-link>
          <router-link to="/teachings" @click="drawer = false" class="nav-link" active-class="active-link">
            Teachings
          </router-link>
          <router-link to="/cocurricular" @click="drawer = false" class="nav-link" active-class="active-link">
            Co-curricular
          </router-link>
          <router-link to="/contact" @click="drawer = false" class="nav-link" active-class="active-link">
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
import config from "@/profile_info.yml"

const router = useRouter()
const drawer = ref(false)
const { profile, contacts } = config

const SEND_MAIL = () => {
  const subject = encodeURIComponent('Freelance Project:')
  const body = encodeURIComponent('I would like to discuss a potential collaboration.')
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${contacts.email}&su=${subject}&body=${body}`
  window.open(gmailUrl, '_blank')
}
</script>

<style scoped>
.no-underline {
  text-decoration: none;
}

.nav-link {
  @apply text-base_black text-sm font-medium transition-colors duration-200 no-underline;
}
.nav-link:hover {
  @apply text-primary;
}
.active-link {
  @apply font-bold text-primary;
}
</style>