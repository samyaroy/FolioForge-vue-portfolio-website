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
                class="text-[#0e141b] !text-4xl font-black leading-tight tracking-[-0.033em] md:text-5xl md:font-black md:leading-tight md:tracking-[-0.033em]">
                Web Developer <br />Data Science, Statistics Enthusiast
              </h1>
              <h2
                class="text-[#0e141b] text-sm font-normal leading-normal md:text-base md:font-normal md:leading-normal">
                Curious student with a strong foundation in statistical theory and inference, data science and full-stack web
development. Comfortable moving between data analysis and modern web technologies to turn data into insights
and ideas into applications. Experienced with statistical modeling, data cleaning, and API development, eager to
apply an evidence-based approach to solving complex challenges in research and development fields.
              </h2>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col gap-4 md:flex-row md:gap-4 w-full">
              <button
                class="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 md:h-12 md:px-5 bg-[#1980e6] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em] md:text-base md:font-bold md:leading-normal md:tracking-[0.015em] hover:bg-[#1565c0] transition-colors duration-200"
                @click="$router.push('/projects-publications')">
                <span class="truncate">See my work</span>
              </button>
              <button
                class="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 md:h-12 md:px-5 bg-black border-2 border-[#1980e6] text-[#ffffff] text-sm font-bold leading-normal tracking-[0.015em] md:text-base md:font-bold md:leading-normal md:tracking-[0.015em] hover:bg-[#1980e6] hover:text-white transition-all duration-200"
                @click="downloadCV">
                <v-icon>mdi-tray-arrow-down</v-icon>
                <span class="truncate"> My CV</span>
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
const email = import.meta.env.VITE_EMAIL
const email_link = import.meta.env.VITE_EMAIL_LINK
const phone = import.meta.env.VITE_PHONE
const location = import.meta.env.VITE_LOCATION

const github_personal = import.meta.env.VITE_GITHUB1
const github_student = import.meta.env.VITE_GITHUB2
const linkedin = import.meta.env.VITE_LINKEDIN
const twitter = import.meta.env.VITE_TWITTER

const downloadCV = () => {
  // You can replace this with your actual CV download logic
  const link = document.createElement('a')
  link.href = '/path-to-your-cv.pdf' // Replace with your actual CV file path
  link.download = 'Samyabrata_Roy_CV.pdf'
  link.click()
}
</script>

<style scoped>
/* Custom styles if needed */
</style>

