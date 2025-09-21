<template>
  <div class="px-4 md:px-8 lg:px-20 py-4 bg-slate-50">
    <div class="max-w-[1200px] mx-auto">
      <div class="flex flex-wrap justify-between gap-3 p-4">
        <h2 class="text-[#0e141b] tracking-light text-[32px] font-bold leading-tight min-w-72">
          Awards and Prizes
        </h2>
      </div>

      <!-- Award Cards -->
      <div class="space-y-6">
        <AwardCard
          v-for="award in awards"
          :key="award.id"
          :title="award.title"
          :year="award.year"
          :organization="award.organization"
          :description="award.description"
          :category="award.category"
          :prize="award.prize"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import AwardCard from "./components/AwardCard.vue";
import config from "@/profile_info.yml";
const { awards } = config;

// const awards = [
//   {
//     id: 1,
//     title: "National Coding Challenge",
//     year: "2023",
//     organization: "CodeForces India",
//     description: "Secured 1st place among 5,000+ participants.",
//     category: "Competitive Programming",
//     prize: "Gold Medal",
//   },
//   {
//     id: 2,
//     title: "AI Hackathon",
//     year: "2022",
//     organization: "Google Developer Group",
//     description: "Built an AI model for healthcare prediction.",
//     category: "Machine Learning",
//     prize: "Runner-Up",
//   },
// ];
</script>