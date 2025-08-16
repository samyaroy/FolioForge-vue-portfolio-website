<template>
  <div class="min-h-screen bg-slate-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Page Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-black text-[#0e141b] mb-4 tracking-[-0.033em]">
          Co-curricular Activities
        </h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Beyond academics, I actively participate in various co-curricular activities that enhance my leadership, teamwork, and professional development.
        </p>
      </div>

      <div class="max-w-6xl mx-auto space-y-8">
        <!-- Leadership & Organizations -->
        <div class="bg-white rounded-lg shadow-sm p-8">
          <h2 class="text-2xl font-bold text-[#0e141b] mb-6 flex items-center">
            <svg class="w-6 h-6 mr-3 text-[#1980e6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            Leadership & Organizations
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="role in leadershipRoles" :key="role.id" class="border-l-4 border-[#1980e6] pl-6 py-4">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-lg font-semibold text-[#0e141b]">{{ role.title }}</h3>
                <span class="text-sm text-gray-500">{{ role.period }}</span>
              </div>
              <p class="text-gray-600 mb-2">{{ role.organization }}</p>
              <p class="text-gray-700 mb-3">{{ role.description }}</p>
              <div class="flex flex-wrap gap-2">
                <span v-for="skill in role.skills" :key="skill" class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {{ skill }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Competitions & Awards -->
        <div class="bg-white rounded-lg shadow-sm p-8">
          <h2 class="text-2xl font-bold text-[#0e141b] mb-6 flex items-center">
            <svg class="w-6 h-6 mr-3 text-[#1980e6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
            </svg>
            Competitions & Awards
          </h2>
          <div class="space-y-6">
            <div v-for="award in awards" :key="award.id" class="flex items-start space-x-4 p-4 border rounded-lg hover:shadow-md transition-shadow duration-200">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-[#1980e6] rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                  </svg>
                </div>
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="text-lg font-semibold text-[#0e141b]">{{ award.title }}</h3>
                  <span class="text-sm text-gray-500">{{ award.year }}</span>
                </div>
                <p class="text-gray-600 mb-2">{{ award.organization }}</p>
                <p class="text-gray-700 mb-3">{{ award.description }}</p>
                <div class="flex items-center space-x-4">
                  <span class="text-sm font-medium text-[#1980e6]">{{ award.category }}</span>
                  <span v-if="award.prize" class="text-sm text-green-600 font-medium">{{ award.prize }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Workshops & Certifications -->
        <div class="bg-white rounded-lg shadow-sm p-8">
          <h2 class="text-2xl font-bold text-[#0e141b] mb-6 flex items-center">
            <svg class="w-6 h-6 mr-3 text-[#1980e6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
            Workshops & Certifications
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="cert in certifications" :key="cert.id" class="border rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-[#0e141b]">{{ cert.title }}</h3>
                <span class="text-xs text-gray-500">{{ cert.duration }}</span>
              </div>
              <p class="text-gray-600 mb-3">{{ cert.issuer }}</p>
              <p class="text-gray-700 mb-4 text-sm">{{ cert.description }}</p>
              <div class="flex items-center justify-between">
                <span class="text-sm text-[#1980e6] font-medium">{{ cert.status }}</span>
                <a v-if="cert.link" :href="cert.link" target="_blank" class="text-[#1980e6] hover:underline text-sm">
                  View Certificate
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Volunteering & Community Service -->
        <div class="bg-white rounded-lg shadow-sm p-8">
          <h2 class="text-2xl font-bold text-[#0e141b] mb-6 flex items-center">
            <svg class="w-6 h-6 mr-3 text-[#1980e6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
            Volunteering & Community Service
          </h2>
          <div class="space-y-6">
            <div v-for="volunteer in volunteering" :key="volunteer.id" class="border-l-4 border-green-500 pl-6 py-4">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-lg font-semibold text-[#0e141b]">{{ volunteer.role }}</h3>
                <span class="text-sm text-gray-500">{{ volunteer.period }}</span>
              </div>
              <p class="text-gray-600 mb-2">{{ volunteer.organization }}</p>
              <p class="text-gray-700 mb-3">{{ volunteer.description }}</p>
              <div class="flex flex-wrap gap-2">
                <span v-for="impact in volunteer.impact" :key="impact" class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                  {{ impact }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Sample data - replace with your actual data
const leadershipRoles = [
  {
    id: 1,
    title: "President",
    organization: "Data Science Club",
    period: "2023 - 2024",
    description: "Led a team of 50+ members, organized workshops, hackathons, and industry talks. Increased membership by 40% and secured partnerships with tech companies.",
    skills: ["Leadership", "Event Management", "Public Speaking", "Team Building"]
  },
  {
    id: 2,
    title: "Vice President",
    organization: "Student Council",
    period: "2022 - 2023",
    description: "Represented student body, organized cultural events, and worked with administration to improve campus facilities and student welfare.",
    skills: ["Student Advocacy", "Event Planning", "Communication", "Problem Solving"]
  },
  {
    id: 3,
    title: "Team Lead",
    organization: "Coding Competition Team",
    period: "2023 - 2024",
    description: "Led a team of 5 developers in national coding competitions, achieved 2nd place in ACM-ICPC regional contest.",
    skills: ["Competitive Programming", "Team Leadership", "Algorithm Design", "Problem Solving"]
  }
]

const awards = [
  {
    id: 1,
    title: "Best Technical Project Award",
    organization: "University Tech Fest",
    year: "2024",
    category: "Data Science",
    prize: "₹50,000",
    description: "Won first place for developing an innovative machine learning solution for healthcare data analysis."
  },
  {
    id: 2,
    title: "Dean's List",
    organization: "University",
    year: "2023",
    category: "Academic Excellence",
    description: "Recognized for maintaining a GPA of 3.8+ for three consecutive semesters."
  },
  {
    id: 3,
    title: "Hackathon Winner",
    organization: "Microsoft Student Partners",
    year: "2023",
    category: "Innovation",
    prize: "₹25,000",
    description: "Developed a sustainable energy monitoring system using IoT and AI technologies."
  }
]

const certifications = [
  {
    id: 1,
    title: "AWS Certified Solutions Architect",
    issuer: "Amazon Web Services",
    duration: "2024",
    description: "Comprehensive cloud architecture and AWS services certification.",
    status: "Active",
    link: "#"
  },
  {
    id: 2,
    title: "Google Data Analytics Professional Certificate",
    issuer: "Google",
    duration: "2023",
    description: "Data analysis, visualization, and business intelligence skills.",
    status: "Completed",
    link: "#"
  },
  {
    id: 3,
    title: "Machine Learning Specialization",
    issuer: "Coursera - Stanford University",
    duration: "2023",
    description: "Advanced machine learning algorithms and applications.",
    status: "Completed",
    link: "#"
  },
  {
    id: 4,
    title: "Web Development Bootcamp",
    issuer: "Udemy",
    duration: "2023",
    description: "Full-stack web development with modern technologies.",
    status: "Completed",
    link: "#"
  }
]

const volunteering = [
  {
    id: 1,
    role: "Teaching Assistant",
    organization: "Code for Good Initiative",
    period: "2023 - Present",
    description: "Teaching programming fundamentals to underprivileged students, helping them develop technical skills for better career opportunities.",
    impact: ["50+ Students Taught", "100+ Hours Volunteered", "Community Impact"]
  },
  {
    id: 2,
    role: "Event Coordinator",
    organization: "Blood Donation Drive",
    period: "2022 - 2023",
    description: "Organized quarterly blood donation camps in collaboration with local hospitals, ensuring safe and efficient donation processes.",
    impact: ["200+ Donors", "Life Saving", "Healthcare Support"]
  },
  {
    id: 3,
    role: "Mentor",
    organization: "Women in Tech Program",
    period: "2023 - Present",
    description: "Mentoring female students in technology, providing guidance on career paths and technical skills development.",
    impact: ["15+ Mentees", "Career Guidance", "Diversity Support"]
  }
]
</script>

<style scoped>
/* Custom styles if needed */
</style>
