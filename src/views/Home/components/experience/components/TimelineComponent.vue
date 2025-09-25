<template>
  <div class="grid grid-cols-[40px_1fr] gap-x-2 px-4">
    <!-- Timeline Icon -->
    <div class="flex flex-col items-center gap-1 pt-3 pb-3">
      <div class="text-[#0e141b]">
        <v-icon :class="iconColor" size="24">{{ icon }}</v-icon>
      </div>
    </div>

    <!-- Experience Info -->
    <div class="flex flex-1 flex-col py-3">
      <div class="flex items-center justify-between">
  <!-- Left side: title + optional link -->
  <p class="text-[#0e141b] text-base font-medium leading-normal flex items-center gap-1">
    {{ title }}
    <a v-if="cred_link && cred_link !== '#'" :href="cred_link" target="_blank">
      <v-icon size="20">mdi-file-document-outline</v-icon>
    </a>
  </p>

  <!-- Right side: time -->
  <div class="flex items-center gap-1">
    <!-- <v-icon class="text-[#4e7397]" size="16">mdi-calendar</v-icon> -->
    <p class="text-[#4e7397] text-base font-normal leading-normal">{{ time }}</p>
  </div>
</div>

      <!-- Organization -->
      <div class="flex items-center gap-2 mt-1">
        <v-icon class="text-[#4e7397]" size="16">mdi-domain</v-icon>
        <p class="text-[#4e7397] text-sm font-normal leading-normal">{{ organization }}</p>
      </div>

      <!-- Organization -->
      <div v-if="supervisor" class="flex items-center gap-2 mt-1">
        <v-icon class="text-[#4e7397]" size="16">mdi-account-tie</v-icon>
        <p class="text-[#4e7397] text-sm font-normal leading-normal">{{ supervisor }}</p>
      </div>

      <!-- Location -->
      <div class="flex items-center gap-2 mt-1">
        <v-icon class="text-[#4e7397]" size="16">mdi-map-marker</v-icon>
        <p class="text-[#4e7397] text-sm font-normal leading-normal">{{ location }}</p>
      </div>
    </div>

    <!-- Description -->
    <div class="col-span-2 px-4 pb-6" v-if="description">
      <p class="text-[#0e141b] text-base font-normal leading-normal">
        {{ description }}
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  time: { type: String, required: true },
  organization: { type: String, required: true },
  supervisor: { type: String, default: '' },
  location: { type: String, required: true },
  description: { type: String, default: '' },
  icon: { type: String, default: 'mdi-school' }, 
  iconColor: { type: String, default: 'text-[#1980e6]' }, 
  cred_link: { type: String, default: '#' }
})
</script>