<template>
  <hr class="footer-divider bg-slate-50" />

  <v-footer class="bg-blue-800 text-black py-8">
    <!-- Colored horizontal bar -->

    <div class="container mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Brand Section -->
        <div class="col-span-1 md:col-span-2">
          <h3 class="text-xl font-bold mb-6">{{ profile.name }}</h3>
          <p class="text-black-300 mb-6 max-w-lg">
            {{ profile.footer }}
          </p>
          <div class="flex space-x-4">
            <v-btn icon variant="text" color="black" :href=github target="_blank">
              <v-icon>mdi-github</v-icon>
            </v-btn>
            <!-- Student IITM GitHub -->
            <div class="flex flex-col items-center">
              <v-btn icon variant="text" color="black" :href=github2 target="_blank">
                <v-icon>mdi-github</v-icon>
              </v-btn>
              <span class="text-xs text-gray-500 mt-1">Student A/c (IITM)</span>
            </div>
            <v-btn icon variant="text" color="black" :href=kaggle target="_blank">
              <v-icon>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                  <path fill="#1f1f1e"
                    d="M464.2 565.5L318.4 384.3L458.2 249C460.8 246.3 459.9 238.5 452.9 238.5L383.7 238.5C380.2 238.5 376.7 240.3 373.2 243.8L240.9 377.5L240.9 71.5C240.9 66.5 238.4 64 233.4 64L181.5 64C176.5 64 174 66.5 174 71.5L174 568.5C174 573.5 176.5 576 181.5 576L233.4 576C238.4 576 240.9 573.5 240.9 568.5L240.9 459.5L271.7 430.2L382.2 570.8C385.2 574.3 388.7 576.1 392.7 576.1L459.6 576.1C463.1 576.1 465.1 575.1 465.6 573.1L464.2 565.5z" />
                </svg>
              </v-icon>
            </v-btn>
            <v-btn icon variant="text" color="black" :href=linkedin target="_blank">
              <v-icon>mdi-linkedin</v-icon>
            </v-btn>
            <!-- <v-btn icon variant="text" color="black" :href=twitter target="_blank">
              <v-icon>mdi-twitter</v-icon>
            </v-btn> -->
            <v-btn icon variant="text" color="white" href="mailto:contact@example.com">
              <v-icon>mdi-email</v-icon>
            </v-btn>
          </div>
          <logos :logos="logos" />
        </div>

        <!-- Other Links -->
        <div>
          <h4 class="text-lg font-semibold mb-2">Other Links</h4>
          <ul class="space-y-2">
            <!-- <li>
              <router-link 
                to="/" 
                class="text-gray-300 hover:text-white transition-colors duration-200"
              >
                Home
              </router-link>
            </li>
            <li>
              <router-link 
                to="/projects-publications" 
                class="text-gray-300 hover:text-white transition-colors duration-200"
              >
                Projects & Publications
              </router-link>
            </li>
            <li>
              <router-link 
                to="/cocurricular" 
                class="text-gray-300 hover:text-white transition-colors duration-200"
              >
                Co-curricular
              </router-link>
            </li> -->

            <li>
              <router-link to="/ongoing-projects"
                class="text-black-300 hover:text-black transition-colors duration-200">
                Ongoing Projects
              </router-link>
            </li>
            <li>
              <router-link to="/internships-certifications"
                class="text-black-300 hover:text-black transition-colors duration-200">
                Internships & Certifications
              </router-link>
            </li>
            <li>
              <router-link to="/workshops-bootcamps-attended"
                class="text-black-300 hover:text-black transition-colors duration-200">
                Bootcamps & Workshops attended
              </router-link>
            </li>
            <!-- <li>
              <router-link 
                to="/contact" 
                class="text-gray-300 hover:text-white transition-colors duration-200"
              >
                Contact
              </router-link>
            </li>-->
          </ul>
          <br />
          <h4 class="text-lg font-semibold mb-2">Social Links</h4>

          <ul class="space-y-2">
            <li>
              <a :href="google_scholar" target="_blank">Google Scholar</a>
            </li>
            <li>
              <a :href="researchgate" target="_blank">ResearchGate</a>
            </li>
          </ul>
        </div>

        <!-- Contact Info -->
        <div>
          <h4 class="text-lg font-semibold mb-4">Contact Info</h4>
          <div class="space-y-2 text-black-300">
            <div class="flex items-center">
              <v-icon size="small" class="mr-2">mdi-email</v-icon>
              <span>{{ email }}</span>
            </div>
            <div class="flex items-center">
              <v-icon size="small" class="mr-2">mdi-phone</v-icon>
              <span>{{ phone }}</span>
            </div>
            <div class="flex items-center">
              <v-icon size="small" class="mr-2">mdi-map-marker</v-icon>
              <span>{{ location }}</span>
            </div>
          </div>
          <div class="pt-4 pb-0">
            <a href="https://info.flagcounter.com/Wh9G"><img
                src="https://s01.flagcounter.com/count2/Wh9G/bg_FFFFFF/txt_000000/border_CCCCCC/columns_2/maxflags_10/viewers_0/labels_0/pageviews_0/flags_0/percent_0/"
                alt="Flag Counter" border="0"></a>
          </div>
        </div>
      </div>

      <!-- Bottom Section -->
      <v-divider class="my-2 bg-gray-600"></v-divider>

      <div class="flex flex-col md:flex-row justify-between items-center">
        <p class="text-gray-500 text-sm">
          © {{ new Date().getFullYear() }} Samyabrata Roy. Rights Reserved.
        </p>
        <div class="flex space-x-4 mt-2 md:mt-0">
          <a href="#" class="text-gray-500 hover:text-white text-sm transition-colors duration-200">
            Privacy Policy
          </a>
          <a href="#" class="text-gray-500 hover:text-white text-sm transition-colors duration-200">
            Terms of Service
          </a>
        </div>
      </div>
      <p class="text-gray-500 text-sm">
        &ensp; Source code available at <a
          href="https://github.com/samyaroy/FolioForge-vue-portfolio-website/tree/V1_template">GitHub Repo</a>.
        <br />
        &ensp; Please fork/clone from there — not directly from the site’s source.
      </p>

    </div>
  </v-footer>
</template>

<script>
import config from "@/profile_info.yml"
import Logos from "./Logos.vue";

export default {
  components: {
    Logos,
  },
  data() {
    const { profile, contacts, socials } = config;
    return {
      profile,
      email: contacts.email,
      phone: contacts.phone,
      location: contacts.location,
      github: socials.github,
      github2: socials.github2,
      linkedin: socials.linkedin,
      kaggle: socials.kaggle,
      google_scholar: socials.google_scholar,
      researchgate: socials.researchgate,
      logos: ['MSRKAV', 'NN', 'SNU', 'IITM', 'IDEAS', 'IIMM'],
    };
  }
}
</script>

<style scoped>
/* Custom styles for the footer */
.footer-divider {
  border: none;
  height: 3px;
  /* thickness */
  /* background-color: #4CAF50; */
  /* choose your accent color */
  width: 100%;
  margin: 0 auto 1rem;
  border-radius: 5px;
}
</style>
