<template>
  <div class="px-4 md:px-8 lg:px-20 py-4 bg-white">
    <div class="max-w-[1200px] mx-auto">
      <div class="flex flex-wrap justify-between gap-3 p-4">
        <h2 class="text-[#0e141b] tracking-light text-[32px] font-bold leading-tight min-w-72">
          Education
        </h2>
      </div>

      <!-- Education timeline -->
      <EducationMilestone
        icon="mdi-school"
        title="Diploma Level - Bachelor of Science (BS) in Data Science and Application"
        time="2022 - Ongoing"
        institution="Indian Institute Of Technology Madras"
        location="Chennai, TN"
        extra="Current CGPA: 5.97/10"
        :isFirst="true"
      />

      <EducationMilestone
        icon="mdi-school"
        title="Bachelor of Science (BSc) in Statistics"
        time="2022 - 2025"
        institution="Sister Nivedita University"
        location="Kolkata, WB"
        extra="CGPA: 6.95/10"
      />

      <EducationMilestone
        icon="mdi-certificate"
        title="Diploma in Web Designing (DWD)"
        time="2020"
        institution="CITC - The Hub of IT"
        location="Mohali, PB"
        extra="Marks: 84.5%"
      />

      <EducationMilestone
        icon="mdi-town-hall"
        title="XII (Science) - West Bengal Council of Higher Secondary Education (WBCHSE)"
        time="2020 - 2022"
        institution="Nava Nalanda High School"
        location="Kolkata, WB"
        extra="Marks: 83.8%"
      />

      <EducationMilestone
        icon="mdi-town-hall"
        title="X - West Bengal Board of Secondary Education (WBBSE)"
        time="2010 - 2020"
        institution="Mahesh sri Ramkrishna Ashram Vidyalaya (HS)"
        location="Rishra, WB"
        extra="Marks: 85.71%"
        :isLast="true"
      />
    </div>
  </div>
</template>

<script setup>
import EducationMilestone from "./components/EducationMilestone.vue";
</script>
