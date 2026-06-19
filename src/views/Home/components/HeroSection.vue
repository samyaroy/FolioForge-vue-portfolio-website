<template>
  <div class="px-4 md:px-8 lg:px-20 flex flex-1 justify-center py-5">
    <div class="layout-content-container flex flex-col max-w-[1200px] flex-1">
      <div class="container mx-auto">
        <div class="flex flex-col gap-6 px-4 py-10 md:gap-8 lg:flex-row">
          <!-- Profile Image Section -->
          <div
            class="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg md:h-auto md:min-w-[400px] lg:w-full flex items-center justify-center -mt-4"
            style='background-image: url("/SamyabrataRoy2.jpg");'></div>

          <!-- Content Section -->
          <div class="flex flex-col gap-6 md:min-w-[400px] md:gap-8 lg:justify-center">
            <!-- Text Content -->
            <div class="flex flex-col gap-2 text-left">
              <h1
                class="text-[#0e141b] !text-4xl font-black leading-tight tracking-[-0.033em] md:text-5xl md:font-black md:leading-tight md:tracking-[-0.033em]" v-html="heading"></h1>
              <h2
                class="content-justify text-[#0e141b] text-sm font-normal leading-normal md:text-base md:font-normal md:leading-normal">
                {{ about }}
              </h2>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-row gap-3 w-full">
              <button
                class="flex flex-1 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-3 md:h-12 md:px-4 bg-[#1980e6] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#1565c0] transition-colors duration-200"
                @click="$router.push({ path: '/projects-publications', query: { tab: 'publications' } })">
                <v-icon size="18">mdi-briefcase-outline</v-icon>
                <span class="truncate">See my work</span>
              </button>
              <button
                class="flex flex-1 cursor-pointer items-center justify-center gap-1 overflow-hidden rounded-lg h-10 px-3 md:h-12 md:px-4 bg-black border-2 border-[#1980e6] text-[#ffffff] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#1980e6] hover:text-white transition-all duration-200"
                @click="downloadCV">
                <v-icon size="18">mdi-tray-arrow-down</v-icon>
                <span class="truncate px-1">My CV</span>
              </button>
              <button
                class="flex flex-1 cursor-pointer items-center justify-center gap-1 overflow-hidden rounded-lg h-10 px-3 md:h-12 md:px-4 border-2 border-[#1980e6] text-[#1980e6] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#1980e6] hover:text-white transition-all duration-200"
                @click="openGmailDraft">
                <v-icon size="18">mdi-email-outline</v-icon>
                <span class="truncate px-1">Get In Touch</span>
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
              <a :href=email_link class="text-[#0e141b] hover:text-[#1980e6] transition-colors duration-200">
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
import config from "@/profile_info.yml"

const { profile, contacts, socials } = config

const name = profile.name
const about = profile.about
const heading = profile.heading
const cv_link = profile.cv

const email = contacts.email
const email_link = `mailto:${email}`

const github_personal = socials.github
const linkedin = socials.linkedin

const downloadCV = () => {
  const link = document.createElement('a')
  link.href = cv_link
  link.download = `${name.replace(" ", "_")}_CV.pdf`
  link.click()
}

const openGmailDraft = () => {
  const subject = encodeURIComponent('Collaboration Opportunity')
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}`
  window.open(gmailUrl, '_blank')
}
</script>

<style scoped>
/* Custom styles if needed */
</style>
