<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4">
      <div class="max-w-4xl mx-auto">
        <!-- Page Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-800 mb-4">About Me</h1>
          <p class="text-xl text-gray-600">Learn more about my journey and expertise</p>
        </div>

        <!-- About Content -->
        <div class="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 class="text-2xl font-semibold text-gray-800 mb-6">My Story</h2>
          <p class="text-gray-600 mb-4 leading-relaxed">
            I'm a passionate full-stack developer with over 5 years of experience in creating modern web applications. 
            My journey in software development began with a curiosity about how websites work, which led me to dive 
            deep into frontend and backend technologies.
          </p>
          <p class="text-gray-600 mb-4 leading-relaxed">
            I specialize in Vue.js ecosystem, including Vuetify for Material Design components and Tailwind CSS for 
            utility-first styling. My expertise extends to Node.js, Python, and various databases, allowing me to 
            build complete solutions from concept to deployment.
          </p>
          <p class="text-gray-600 leading-relaxed">
            When I'm not coding, you can find me contributing to open-source projects, writing technical blog posts, 
            or exploring new technologies to stay current with industry trends.
          </p>
        </div>

        <!-- Skills Section -->
        <div class="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 class="text-2xl font-semibold text-gray-800 mb-6">Skills & Technologies</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Frontend -->
            <div>
              <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <v-icon color="primary" class="mr-2">mdi-monitor</v-icon>
                Frontend Development
              </h3>
              <div class="space-y-2">
                <div class="flex items-center">
                  <v-icon size="small" color="primary" class="mr-2">mdi-check</v-icon>
                  <span class="text-gray-600">Vue.js 3 & Composition API</span>
                </div>
                <div class="flex items-center">
                  <v-icon size="small" color="primary" class="mr-2">mdi-check</v-icon>
                  <span class="text-gray-600">Vuetify & Material Design</span>
                </div>
                <div class="flex items-center">
                  <v-icon size="small" color="primary" class="mr-2">mdi-check</v-icon>
                  <span class="text-gray-600">Tailwind CSS</span>
                </div>
                <div class="flex items-center">
                  <v-icon size="small" color="primary" class="mr-2">mdi-check</v-icon>
                  <span class="text-gray-600">JavaScript (ES6+)</span>
                </div>
                <div class="flex items-center">
                  <v-icon size="small" color="primary" class="mr-2">mdi-check</v-icon>
                  <span class="text-gray-600">TypeScript</span>
                </div>
              </div>
            </div>

            <!-- Backend -->
            <div>
              <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <v-icon color="primary" class="mr-2">mdi-server</v-icon>
                Backend Development
              </h3>
              <div class="space-y-2">
                <div class="flex items-center">
                  <v-icon size="small" color="primary" class="mr-2">mdi-check</v-icon>
                  <span class="text-gray-600">Node.js & Express</span>
                </div>
                <div class="flex items-center">
                  <v-icon size="small" color="primary" class="mr-2">mdi-check</v-icon>
                  <span class="text-gray-600">Python & Django</span>
                </div>
                <div class="flex items-center">
                  <v-icon size="small" color="primary" class="mr-2">mdi-check</v-icon>
                  <span class="text-gray-600">RESTful APIs</span>
                </div>
                <div class="flex items-center">
                  <v-icon size="small" color="primary" class="mr-2">mdi-check</v-icon>
                  <span class="text-gray-600">GraphQL</span>
                </div>
                <div class="flex items-center">
                  <v-icon size="small" color="primary" class="mr-2">mdi-check</v-icon>
                  <span class="text-gray-600">PostgreSQL & MongoDB</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Experience Section -->
        <div class="bg-white rounded-lg shadow-md p-8">
          <h2 class="text-2xl font-semibold text-gray-800 mb-6">Experience</h2>
          
          <div class="space-y-6">
            <div class="border-l-4 border-primary pl-6">
              <h3 class="text-lg font-semibold text-gray-800">Senior Frontend Developer</h3>
              <p class="text-gray-600 mb-2">Tech Company Inc. • 2022 - Present</p>
              <p class="text-gray-600">
                Leading frontend development for enterprise applications using Vue.js, Vuetify, and modern build tools.
              </p>
            </div>
            
            <div class="border-l-4 border-primary pl-6">
              <h3 class="text-lg font-semibold text-gray-800">Full Stack Developer</h3>
              <p class="text-gray-600 mb-2">Startup XYZ • 2020 - 2022</p>
              <p class="text-gray-600">
                Built and maintained multiple web applications using Vue.js, Node.js, and various cloud services.
              </p>
            </div>
            
            <div class="border-l-4 border-primary pl-6">
              <h3 class="text-lg font-semibold text-gray-800">Junior Developer</h3>
              <p class="text-gray-600 mb-2">Digital Agency • 2019 - 2020</p>
              <p class="text-gray-600">
                Started my career building responsive websites and learning modern web development practices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// About page component
</script>

<style scoped>
/* Custom styles for the about page */
</style>
