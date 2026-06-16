<template>
  <div class="flex min-h-[148px] items-start space-x-4 rounded-lg border bg-white p-4 hover:shadow-md transition-shadow duration-200">
    <div class="flex-shrink-0">
      <div class="w-12 h-12 bg-[#ffffff] rounded-full flex items-center justify-center">
        <v-icon color="#1980e6" size="24">{{ category }}</v-icon>
      </div>
    </div>

    <div class="flex-1 mt-2">
      <div class="flex items-center justify-between mb-1">
        <h3 class="text-[#0e141b] text-base font-medium leading-normal">{{ title }}</h3>
        <span class="text-sm text-gray-500">{{ year }}</span>
      </div>

      <div class="flex items-center gap-2">
        <v-icon class="text-[#4e7397]" size="16">mdi-domain</v-icon>
        <p class="text-[#4e7397] text-sm font-normal leading-normal">
          <SmartLink :text="organization" />
        </p>
      </div>

      <div v-if="prize" class="flex items-center gap-2 mt-1">
        <v-icon class="text-[#4e7397]" size="16">mdi-medal</v-icon>
        <p class="flex items-center space-x-4 text-sm text-green-600 font-medium">
          {{ prize }}
        </p>
      </div>

      <p v-if="description" class="text-[#4e7397] text-sm mt-2 leading-relaxed">{{ description }}</p>

      <div v-if="cred_link" class="mt-3">
        <a
          :href="cred_link"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1 text-[#1980e6] text-sm hover:underline"
        >
          <v-icon size="14">mdi-open-in-new</v-icon>
          View Credential
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import SmartLink from '@/components/SmartLink.vue'

defineProps({
  title: String,
  year: [String, Number],
  organization: String,
  category: String,
  prize: String,
  description: String,
  cred_link: String,
});
</script>
