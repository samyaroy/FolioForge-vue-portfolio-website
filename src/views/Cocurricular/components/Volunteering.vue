<template>
  <div class="bg-white rounded-lg shadow-sm p-8">
    <h2 class="text-2xl font-bold text-[#0e141b] mb-6 flex items-center">
      <svg class="w-6 h-6 mr-3 text-[#1980e6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
      </svg>
      Volunteering
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
</template>

<script setup>
const volunteering = [
  {
    id: 1,
    role: "Teaching Assistant",
    organization: "Statistics I course, Nilgiri House, IITM BS Degree",
    period: "Jan 2025",
    //description: "Teaching programming fundamentals to underprivileged students, helping them develop technical skills for better career opportunities.",
    impact: ["25+ Students Taught"]
  },
//   {
//     id: 2,
//     role: "Event Coordinator",
//     organization: "Blood Donation Drive",
//     period: "2022 - 2023",
//     description: "Organized quarterly blood donation camps in collaboration with local hospitals, ensuring safe and efficient donation processes.",
//     impact: ["200+ Donors", "Life Saving", "Healthcare Support"]
//   },
//   {
//     id: 3,
//     role: "Mentor",
//     organization: "Women in Tech Program",
//     period: "2023 - Present",
//     description: "Mentoring female students in technology, providing guidance on career paths and technical skills development.",
//     impact: ["15+ Mentees", "Career Guidance", "Diversity Support"]
//   }
]
</script>