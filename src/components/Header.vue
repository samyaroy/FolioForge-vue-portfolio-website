<template>
  <header
    class="sticky top-0 z-50 bg-white flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7edf3] px-10 py-4">
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
        <router-link
          v-if="showProjectsPublicationsNavLink"
          to="/projects-publications"
          class="nav-link"
          active-class="active-link"
        >
          Project & Publication
        </router-link>
        <router-link v-if="showTeachingsNavLink" to="/teachings" class="nav-link" active-class="active-link">
          Teaching
        </router-link>
        <router-link
          v-if="showProfessionalActivityNavLink"
          to="/professional-activity"
          class="nav-link"
          active-class="active-link"
        >
          Professional Activity
        </router-link>
        <router-link :to="{ name: 'Contact' }" class="nav-link" active-class="active-link">
          Contact
        </router-link>
        <router-link v-if="showGalleryNavLink" to="/gallery" class="nav-link" active-class="active-link">
          Gallery
        </router-link>
        <a v-if="showBlogNavLink" :href="blogLink" target="_blank" rel="noopener" class="blog-link text-base">
          Blog
        </a>
      </div>

      <!-- Mobile Menu Button -->
      <button class="md:hidden flex items-center justify-center w-10 h-10 transition-colors duration-200"
        @click="drawer = !drawer">

        <v-icon color="black" size="24">
          mdi-menu
        </v-icon>

      </button>
    </div>
  </header>

  <!-- Mobile Navigation Drawer -->
  <div v-if="drawer" class="fixed inset-0 z-50 md:hidden" @click.self="drawer = false">
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
          <router-link
            v-if="showGalleryNavLink"
            to="/gallery"
            @click="drawer = false"
            class="nav-link"
            active-class="active-link"
          >
            Gallery
          </router-link>
          <router-link
            v-if="showProjectsPublicationsNavLink"
            to="/projects-publications"
            @click="drawer = false"
            class="nav-link"
            active-class="active-link"
          >
            Project & Publication
          </router-link>
          <router-link v-if="showTeachingsNavLink" to="/teachings" @click="drawer = false" class="nav-link" active-class="active-link">
            Teaching
          </router-link>
          <router-link
            v-if="showProfessionalActivityNavLink"
            to="/professional-activity"
            @click="drawer = false"
            class="nav-link"
            active-class="active-link"
          >
            Professional Activity
          </router-link>
          <router-link :to="{ name: 'Contact' }" @click="drawer = false" class="nav-link" active-class="active-link">
            Contact
          </router-link>
          <a v-if="showBlogNavLink" :href="blogLink" target="_blank" rel="noopener" @click="drawer = false" class="blog-link">
            Blog
          </a>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import config from "@/profile_info.yml"
import { isFeatureEnabled } from '@/config/featureFlags'

const router = useRouter()
const drawer = ref(false)
const { profile, socials } = config

const blogLink = socials.vlog

const showBlogNavLink = computed(() => (
  isFeatureEnabled('showBlog') && Boolean(blogLink)
))

const showGalleryNavLink = computed(() => (
  isFeatureEnabled('showGallery') && router.hasRoute('Gallery')
))

const showTeachingsNavLink = computed(() => (
  isFeatureEnabled('showTeachings', { mode: 'any' }) && router.hasRoute('Teachings')
))

const showProjectsPublicationsNavLink = computed(() => (
  isFeatureEnabled('showProjectsPublications', { mode: 'any' })
  && router.hasRoute('ProjectsPublications')
))

const showProfessionalActivityNavLink = computed(() => (
  isFeatureEnabled('showProfessionalActivity', { mode: 'any' })
  && (router.hasRoute('ProfessionalActivity') || router.hasRoute('ProfessionalAcitivity'))
))

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

.blog-link {
  @apply relative inline-flex items-center text-sm font-medium text-base_black no-underline transition-colors duration-200;
  padding-right: 1.15rem;
}

.blog-link:hover {
  @apply text-primary;
}

.blog-link::before {
  content: "";
  position: absolute;
  right: -0.35rem;
  top: 50%;
  width: 2.15rem;
  height: 2.15rem;
  border-radius: 9999px;
  background: #1980e6;
  filter: blur(16px);
  opacity: 0.22;
  transform: translateY(-50%);
  pointer-events: none;
}

.blog-link::after {
  content: "";
  position: absolute;
  right: 0.1rem;
  top: 0.05rem;
  width: 0.42rem;
  height: 0.42rem;
  border-radius: 9999px;
  background: #1980e6;
  box-shadow: 0 0 12px rgba(25, 128, 230, 0.75);
  opacity: 0.9;
  animation: blog-dot-blink 1.8s ease-in-out infinite;
  pointer-events: none;
}

@keyframes blog-dot-blink {
  0%,
  100% {
    opacity: 0.45;
  }

  50% {
    opacity: 1;
  }
}
</style>
