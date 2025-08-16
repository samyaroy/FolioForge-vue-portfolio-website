<template>
  <div class="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden">
    <div class="layout-container flex h-full grow flex-col">
      <!-- Main Content Area -->
      <div class="px-4 md:px-8 lg:px-20 flex flex-1 justify-center py-5">
        <div class="layout-content-container flex flex-col max-w-[1200px] flex-1">
          <div class="container mx-auto">
            <div class="flex flex-col gap-6 px-4 py-10 md:gap-8 lg:flex-row">
              <!-- Profile Image Section -->
              <div
                class="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg md:h-auto md:min-w-[400px] lg:w-full flex items-center justify-center -mt-4"
                style='background-image: url("/SamyabrataRoy2.jpg");'
              ></div>
              
              <!-- Content Section -->
              <div class="flex flex-col gap-6 md:min-w-[400px] md:gap-8 lg:justify-center">
                <!-- Text Content -->
                <div class="flex flex-col gap-2 text-left">
                  <h1 class="text-[#0e141b] text-4xl font-black leading-tight tracking-[-0.033em] md:text-5xl md:font-black md:leading-tight md:tracking-[-0.033em]">
                    Data Science, Statistics, and Web Development Expert
                  </h1>
                  <h2 class="text-[#0e141b] text-sm font-normal leading-normal md:text-base md:font-normal md:leading-normal">
                    Recent graduate with a strong foundation in data analysis, statistical modeling, and web development. Passionate about leveraging data to drive insights and
                    build innovative solutions.
                  </h2>
                </div>
                
                <!-- Action Buttons -->
                <div class="flex flex-col gap-4 md:flex-row md:gap-4 w-full">
                  <button
                    class="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 md:h-12 md:px-5 bg-[#1980e6] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em] md:text-base md:font-bold md:leading-normal md:tracking-[0.015em] hover:bg-[#1565c0] transition-colors duration-200"
                    @click="$router.push('/projects-publications')"
                  >
                    <span class="truncate">See my work</span>
                  </button>
                  <button
                    class="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 md:h-12 md:px-5 bg-white border-2 border-[#1980e6] text-[#0e141b] text-sm font-bold leading-normal tracking-[0.015em] md:text-base md:font-bold md:leading-normal md:tracking-[0.015em] hover:bg-[#1980e6] hover:text-white transition-all duration-200"
                    @click="downloadCV"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    <span class="truncate">My CV</span>
                  </button>
                </div>
                
                <!-- Social Media Icons -->
                <div class="flex items-center gap-6 pt-2">
                  <a 
                    href="https://linkedin.com/in/samyabrata-roy" 
                    target="_blank" 
                    class="text-[#0e141b] hover:text-[#1980e6] transition-colors duration-200"
                  >
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                  <a 
                    href="https://github.com/samyabrata" 
                    target="_blank" 
                    class="text-[#0e141b] hover:text-[#1980e6] transition-colors duration-200"
                  >
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                  <a 
                    href="mailto:contact@samyabrata.com" 
                    class="text-[#0e141b] hover:text-[#1980e6] transition-colors duration-200"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Research Interest Section -->
      <div class="px-4 md:px-8 lg:px-20 py-4 bg-white">
        <div class="max-w-[1200px] mx-auto">
          <div class="flex flex-wrap justify-between gap-3 p-4">
            <h2 class="text-[#0e141b] tracking-light text-[32px] font-bold leading-tight min-w-72">Research Interests</h2>
          </div>
          <v-row class="px-4">
            <v-col cols="6" md="4" lg="3">
              <div class="bg-slate-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 h-full">
                <div class="flex flex-col items-center justify-center text-center h-full">
                  <v-icon class="text-[#1980e6] mb-2" size="20">mdi-brain</v-icon>
                  <h3 class="text-[#0e141b] text-sm font-bold leading-tight">Machine Learning</h3>
                </div>
              </div>
            </v-col>
            <v-col cols="6" md="4" lg="3">
              <div class="bg-slate-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 h-full">
                <div class="flex flex-col items-center justify-center text-center h-full">
                  <v-icon class="text-[#1980e6] mb-2" size="20">mdi-chart-line</v-icon>
                  <h3 class="text-[#0e141b] text-sm font-bold leading-tight">Statistical Modeling</h3>
                </div>
              </div>
            </v-col>
            <v-col cols="6" md="4" lg="3">
              <div class="bg-slate-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 h-full">
                <div class="flex flex-col items-center justify-center text-center h-full">
                  <v-icon class="text-[#1980e6] mb-2" size="20">mdi-web</v-icon>
                  <h3 class="text-[#0e141b] text-sm font-bold leading-tight">Web Development</h3>
                </div>
              </div>
            </v-col>
            <v-col cols="6" md="4" lg="3">
              <div class="bg-slate-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 h-full">
                <div class="flex flex-col items-center justify-center text-center h-full">
                  <v-icon class="text-[#1980e6] mb-2" size="20">mdi-database</v-icon>
                  <h3 class="text-[#0e141b] text-sm font-bold leading-tight">Data Engineering</h3>
                </div>
              </div>
            </v-col>
            <v-col cols="6" md="4" lg="3">
              <div class="bg-slate-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 h-full">
                <div class="flex flex-col items-center justify-center text-center h-full">
                  <v-icon class="text-[#1980e6] mb-2" size="20">mdi-chart-bubble</v-icon>
                  <h3 class="text-[#0e141b] text-sm font-bold leading-tight">Data Visualization</h3>
                </div>
              </div>
            </v-col>
            <v-col cols="6" md="4" lg="3">
              <div class="bg-slate-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 h-full">
                <div class="flex flex-col items-center justify-center text-center h-full">
                  <v-icon class="text-[#1980e6] mb-2" size="20">mdi-shield-check</v-icon>
                  <h3 class="text-[#0e141b] text-sm font-bold leading-tight">Cybersecurity</h3>
                </div>
              </div>
            </v-col>
          </v-row>
        </div>
      </div>

      <!-- Experience Section -->
      <div class="px-4 md:px-8 lg:px-20 py-4 bg-slate-50">
        <div class="max-w-[1200px] mx-auto">
          <div class="flex flex-wrap justify-between gap-3 p-4">
            <h2 class="text-[#0e141b] tracking-light text-[32px] font-bold leading-tight min-w-72">Experience</h2>
          </div>
          
          <!-- Timeline -->
          <div class="grid grid-cols-[40px_1fr] gap-x-2 px-4">
            <div class="flex flex-col items-center gap-1 pt-3 pb-3">
              <div class="text-[#0e141b]">
                <v-icon class="text-[#1980e6]" size="24">mdi-school</v-icon>
              </div>
            </div>
            <div class="flex flex-1 flex-col py-3">
              <p class="text-[#0e141b] text-base font-medium leading-normal">Student Intern</p>
              <div class="flex items-center gap-2 mt-1">
                <v-icon class="text-[#4e7397]" size="16">mdi-calendar</v-icon>
                <p class="text-[#4e7397] text-base font-normal leading-normal">Feb'25 to present</p>
              </div>
              <div class="flex items-center gap-2 mt-1">
                <v-icon class="text-[#4e7397]" size="16">mdi-domain</v-icon>
                <p class="text-[#4e7397] text-sm font-normal leading-normal">Institute of Data Engineering, Analytics and Science Foundation - Technology Innovation Hub, Indian Statistical Institute</p>
              </div>
              <div class="flex items-center gap-2 mt-1">
                <v-icon class="text-[#4e7397]" size="16">mdi-map-marker</v-icon>
                <p class="text-[#4e7397] text-sm font-normal leading-normal">Kolkata</p>
              </div>
            </div>
            
            <!-- Description for Student Intern -->
            <div class="col-span-2 px-4 pb-6">
              <p class="text-[#0e141b] text-base font-normal leading-normal">
                Working on cutting-edge data engineering and analytics projects at the Technology Innovation Hub. Contributing to research initiatives 
                in machine learning, statistical modeling, and data science applications. Collaborating with experienced researchers and industry 
                professionals to develop innovative solutions for real-world problems. Gaining hands-on experience with advanced analytics tools 
                and methodologies while supporting the institute's mission to advance data science and technology innovation.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Education Section -->
      <div class="px-4 md:px-8 lg:px-20 py-4 bg-white">
        <div class="max-w-[1200px] mx-auto">
          <div class="flex flex-wrap justify-between gap-3 p-4">
            <h2 class="text-[#0e141b] tracking-light text-[32px] font-bold leading-tight min-w-72">Education</h2>
          </div>
          
          <!-- Timeline -->
          <div class="grid grid-cols-[40px_1fr] gap-x-2 px-4">
            <div class="flex flex-col items-center gap-1 pt-3">
              <div class="text-[#0e141b]">
                <v-icon class="text-[#1980e6]" size="24">mdi-school</v-icon>
              </div>
              <div class="w-[1.5px] bg-[#d0dbe7] h-2 grow"></div>
            </div>
            <div class="flex flex-1 flex-col py-3">
              <p class="text-[#0e141b] text-base font-medium leading-normal">Diploma Level - Bachelor of Science (BS) in Data Science and Application</p>
              <div class="flex items-center gap-2 mt-1">
                <v-icon class="text-[#4e7397]" size="16">mdi-calendar</v-icon>
                <p class="text-[#4e7397] text-base font-normal leading-normal">2022 - Ongoing</p>
              </div>
              <div class="flex items-center gap-2 mt-1">
                <v-icon class="text-[#4e7397]" size="16">mdi-domain</v-icon>
                <p class="text-[#4e7397] text-sm font-normal leading-normal">Indian Institute Of Technology Madras</p>
              </div>
              <div class="flex items-center gap-2 mt-1">
                <v-icon class="text-[#4e7397]" size="16">mdi-map-marker</v-icon>
                <p class="text-[#4e7397] text-sm font-normal leading-normal">Chennai, TN</p>
              </div>
              <div class="flex items-center gap-2 mt-1">
                <v-icon class="text-[#4e7397]" size="16">mdi-star</v-icon>
                <p class="text-[#4e7397] text-sm font-normal leading-normal">Current CGPA: 5.97/10</p>
              </div>
            </div>
            
            <div class="flex flex-col items-center gap-1">
              <div class="w-[1.5px] bg-[#d0dbe7] h-2"></div>
              <div class="text-[#0e141b]">
                <v-icon class="text-[#1980e6]" size="24">mdi-school</v-icon>
              </div>
              <div class="w-[1.5px] bg-[#d0dbe7] h-2 grow"></div>
            </div>
            <div class="flex flex-1 flex-col py-3">
              <p class="text-[#0e141b] text-base font-medium leading-normal">Bachelor of Science (BSc) in Statistics</p>
              <div class="flex items-center gap-2 mt-1">
                <v-icon class="text-[#4e7397]" size="16">mdi-calendar</v-icon>
                <p class="text-[#4e7397] text-base font-normal leading-normal">2022 - 2025</p>
              </div>
              <div class="flex items-center gap-2 mt-1">
                <v-icon class="text-[#4e7397]" size="16">mdi-domain</v-icon>
                <p class="text-[#4e7397] text-sm font-normal leading-normal">Sister Nivedita University</p>
              </div>
              <div class="flex items-center gap-2 mt-1">
                <v-icon class="text-[#4e7397]" size="16">mdi-map-marker</v-icon>
                <p class="text-[#4e7397] text-sm font-normal leading-normal">Kolkata, WB</p>
              </div>
              <div class="flex items-center gap-2 mt-1">
                <v-icon class="text-[#4e7397]" size="16">mdi-star</v-icon>
                <p class="text-[#4e7397] text-sm font-normal leading-normal">CGPA: 6.95/10</p>
              </div>
            </div>
            
            <div class="flex flex-col items-center gap-1">
              <div class="w-[1.5px] bg-[#d0dbe7] h-2"></div>
              <div class="text-[#0e141b]">
                <v-icon class="text-[#1980e6]" size="24">mdi-certificate</v-icon>
              </div>
              <div class="w-[1.5px] bg-[#d0dbe7] h-2 grow"></div>
            </div>
            <div class="flex flex-1 flex-col py-3">
              <p class="text-[#0e141b] text-base font-medium leading-normal">Diploma in Web Designing (DWD)</p>
              <div class="flex items-center gap-2 mt-1">
                <v-icon class="text-[#4e7397]" size="16">mdi-calendar</v-icon>
                <p class="text-[#4e7397] text-base font-normal leading-normal">2020</p>
              </div>
              <div class="flex items-center gap-2 mt-1">
                <v-icon class="text-[#4e7397]" size="16">mdi-domain</v-icon>
                <p class="text-[#4e7397] text-sm font-normal leading-normal">CITC - The Hub of IT</p>
              </div>
              <div class="flex items-center gap-2 mt-1">
                <v-icon class="text-[#4e7397]" size="16">mdi-map-marker</v-icon>
                <p class="text-[#4e7397] text-sm font-normal leading-normal">Mohali, PB</p>
              </div>
              <div class="flex items-center gap-2 mt-1">
                <v-icon class="text-[#4e7397]" size="16">mdi-star</v-icon>
                <p class="text-[#4e7397] text-sm font-normal leading-normal">Marks: 84.5%</p>
              </div>
            </div>
            
            <div class="flex flex-col items-center gap-1">
              <div class="w-[1.5px] bg-[#d0dbe7] h-2"></div>
              <div class="text-[#0e141b]">
                <v-icon class="text-[#1980e6]" size="24">mdi-school</v-icon>
              </div>
              <div class="w-[1.5px] bg-[#d0dbe7] h-2 grow"></div>
            </div>
            <div class="flex flex-1 flex-col py-3">
              <p class="text-[#0e141b] text-base font-medium leading-normal">XII (Science) - West Bengal Council of Higher Secondary Education (WBCHSE)</p>
              <div class="flex items-center gap-2 mt-1">
                <v-icon class="text-[#4e7397]" size="16">mdi-calendar</v-icon>
                <p class="text-[#4e7397] text-base font-normal leading-normal">2020 - 2022</p>
              </div>
              <div class="flex items-center gap-2 mt-1">
                <v-icon class="text-[#4e7397]" size="16">mdi-domain</v-icon>
                <p class="text-[#4e7397] text-sm font-normal leading-normal">Nava Nalanda High School</p>
              </div>
              <div class="flex items-center gap-2 mt-1">
                <v-icon class="text-[#4e7397]" size="16">mdi-map-marker</v-icon>
                <p class="text-[#4e7397] text-sm font-normal leading-normal">Kolkata, WB</p>
              </div>
              <div class="flex items-center gap-2 mt-1">
                <v-icon class="text-[#4e7397]" size="16">mdi-star</v-icon>
                <p class="text-[#4e7397] text-sm font-normal leading-normal">Marks: 83.8%</p>
              </div>
            </div>
            
            <div class="flex flex-col items-center gap-1 pb-3">
              <div class="w-[1.5px] bg-[#d0dbe7] h-2"></div>
              <div class="text-[#0e141b]">
                <v-icon class="text-[#1980e6]" size="24">mdi-school</v-icon>
              </div>
            </div>
            <div class="flex flex-1 flex-col py-3">
              <p class="text-[#0e141b] text-base font-medium leading-normal">X - West Bengal Board of Secondary Education (WBBSE)</p>
              <div class="flex items-center gap-2 mt-1">
                <v-icon class="text-[#4e7397]" size="16">mdi-calendar</v-icon>
                <p class="text-[#4e7397] text-base font-normal leading-normal">2006 - 2020</p>
              </div>
              <div class="flex items-center gap-2 mt-1">
                <v-icon class="text-[#4e7397]" size="16">mdi-domain</v-icon>
                <p class="text-[#4e7397] text-sm font-normal leading-normal">Mahesh sri Ramkrishna Ashram Vidyalaya (HS)</p>
              </div>
              <div class="flex items-center gap-2 mt-1">
                <v-icon class="text-[#4e7397]" size="16">mdi-map-marker</v-icon>
                <p class="text-[#4e7397] text-sm font-normal leading-normal">Rishra, WB</p>
              </div>
              <div class="flex items-center gap-2 mt-1">
                <v-icon class="text-[#4e7397]" size="16">mdi-star</v-icon>
                <p class="text-[#4e7397] text-sm font-normal leading-normal">Marks: 85.71%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
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
