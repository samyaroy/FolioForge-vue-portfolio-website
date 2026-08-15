<template>
  <div class="px-4 md:px-8 lg:px-20 flex flex-1 justify-center py-5">
    <div class="layout-content-container flex flex-col max-w-[1200px] flex-1">
      <div class="container mx-auto">
        <div class="flex flex-col gap-6 px-0 sm:px-4 py-10 md:gap-8 lg:flex-row">
          <!-- Profile Image Section -->
          <div
            class="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg md:h-auto md:min-w-[400px] lg:w-full flex items-center justify-center -mt-4"
            :style="heroImageStyle"
            role="img"
            :aria-label="heroImageAlt"></div>

          <!-- Content Section -->
          <div class="flex flex-col gap-6 md:min-w-[400px] md:gap-8 lg:justify-center">
            <!-- Text Content -->
            <div class="flex flex-col gap-2 text-left">
              <h1
                class="text-[#0e141b] !text-4xl font-black leading-tight tracking-[-0.033em] md:text-5xl md:font-black md:leading-tight md:tracking-[-0.033em]" v-html="heading"></h1>
              <h2
                class="hero-about content-justify text-[#0e141b] text-sm font-normal leading-normal md:text-base md:font-normal md:leading-normal">
                <SmartLink :text="about" :type="'Institute'" />
              </h2>
            </div>

            <!-- Action Buttons. Three equal-width buttons in one row leaves each
                 label under ~80px on a phone, which truncates them to nothing;
                 they wrap instead and only share a row from `sm` up. -->
            <div class="flex flex-row flex-wrap gap-3 w-full">
              <button
                class="flex flex-1 basis-[calc(50%-0.375rem)] sm:basis-0 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-3 md:h-12 md:px-4 bg-[#1980e6] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#1565c0] transition-colors duration-200"
                @click="$router.push({ path: '/projects-publications', query: { tab: 'publications' } })">
                <v-icon size="18">mdi-folder-network</v-icon>
                <span class="truncate">See my work</span>
              </button>
              <button
                class="get-in-touch-button flex flex-1 basis-[calc(50%-0.375rem)] sm:basis-0 cursor-pointer items-center justify-center gap-1 overflow-hidden rounded-lg h-10 px-3 md:h-12 md:px-4 bg-white text-[#000000] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#1980e6] hover:text-white transition-all duration-200"
                @click="openGmailDraft">
                <v-icon size="18">mdi-door</v-icon>
                <span class="truncate px-1">Get In Touch</span>
              </button>
              <button
                class="flex flex-1 basis-[calc(50%-0.375rem)] sm:basis-0 cursor-pointer items-center justify-center gap-1 overflow-hidden rounded-lg h-10 px-3 md:h-12 md:px-4 bg-black border-2 border-[#1980e6] text-[#ffffff] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#1980e6] hover:text-white transition-all duration-200"
                @click="downloadCV">
                <v-icon size="18">mdi-tray-arrow-down</v-icon>
                <span class="truncate px-1">My CV</span>
              </button>
            </div>

            <!-- Social Media Icons -->
            <div class="flex items-center gap-6 pt-2">
              <a :href=linkedin target="_blank"
                class="text-[#0e141b] hover:text-[#1980e6] transition-colors duration-200">
                <v-icon>mdi-linkedin</v-icon>
              </a>
              <a :href=github_personal target="_blank"
                class="text-[#0e141b] hover:text-[#1980e6] transition-colors duration-200">
                <v-icon>mdi-github</v-icon>
              </a>
              <!-- Still links to the gmail address; the icon is the plain
                   mdi glyph, not the animated one. -->
              <a
                :href="gmail_link"
                class="text-[#0e141b] hover:text-[#1980e6] transition-colors duration-200"
                aria-label="Email"
              >
                <v-icon>mdi-email</v-icon>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>
import { onMounted } from 'vue'
import config from "@/content/profile_info"
import SmartLink from "@/components/SmartLink.vue"

// Home holds its skeleton until the hero portrait resolves. The portrait is a
// CSS background rather than an <img>, so there is no load event to bind to --
// preloading the same URL gives us one, and the browser serves the background
// from cache rather than fetching twice.
const emit = defineEmits(['hero-media-loaded'])

const { profile, contacts, socials } = config

const about = profile.about
const heading = profile.heading
const cv_link = profile.cv

// Hero portrait, authored in profile.yml. Takes either a remote URL or a path
// served from public/ -- CSS url() does not care which, so switching between a
// bundled file and a hosted one is a content edit with no code change.
const heroImageAlt = profile.heroImageAlt ?? profile.name
const heroImageStyle = profile.heroImage
  ? { backgroundImage: `url("${profile.heroImage}")` }
  : {}

const gmail = contacts.gmail
const gmail_link = `mailto:${gmail}`

const github_personal = socials.github
const linkedin = socials.linkedin

const downloadCV = () => {
  window.open(cv_link, '_blank', 'noopener,noreferrer')
}

const openGmailDraft = () => {
  const subject = encodeURIComponent('Collaboration Opportunity')
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${gmail}&su=${subject}`
  window.open(gmailUrl, '_blank')
}

// Fires once, on success or failure -- a hero that 404s must still release the
// skeleton or the whole page would sit in its loading state forever. With no
// portrait configured there is nothing to wait for.
let hasEmittedHeroMediaLoaded = false

function notifyHeroMediaLoaded() {
  if (hasEmittedHeroMediaLoaded) return

  hasEmittedHeroMediaLoaded = true
  emit('hero-media-loaded')
}

onMounted(() => {
  if (!profile.heroImage) {
    notifyHeroMediaLoaded()
    return
  }

  const heroImage = new Image()
  heroImage.onload = notifyHeroMediaLoaded
  heroImage.onerror = notifyHeroMediaLoaded
  heroImage.src = profile.heroImage

  if (heroImage.complete) {
    notifyHeroMediaLoaded()
  }
})
</script>

<style scoped>
.get-in-touch-button {
  border: 2px solid #000000 !important;
}

.hero-about :deep(a) {
  color: #1980e6;
  font-weight: 500;
  text-decoration: none;
  transition: color 160ms ease;
}

.hero-about :deep(a:hover) {
  color: #1565c0;
  /* overrides SmartLink's own hover:underline utility class */
  text-decoration: none;
}

.hero-about :deep(a:focus-visible) {
  outline: 2px solid rgba(25, 128, 230, 0.9);
  outline-offset: 2px;
  border-radius: 2px;
}
</style>
