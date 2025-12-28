<template>
  <div class="flex items-start space-x-4 p-4 border rounded-lg hover:shadow-md transition-shadow duration-200">
    <!-- Icon Circle -->
    <div class="flex-shrink-0">
      <div class="w-12 h-12 bg-[#ffffff] rounded-full flex items-center justify-center">
        <v-icon :class="iconColor" color="#1980e6" size="24">{{category}}</v-icon>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 mt-2">
      <div class="flex items-center justify-between mb-1">
        <h3 class="text-[#0e141b] text-base font-medium leading-normal">{{ title }}
          <!-- <span v-if="category"
            class="inline-block mx-5 px-2 py-1 text-xs font-medium bg-[#1980e6] text-white rounded-full">
            {{ category }}
          </span> -->
        </h3>
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
    </div>
  </div>
</template>

<script setup>
import SmartLink from '@/components/SmartLink.vue'

defineProps({
  title: String,
  year: String,
  organization: String,
  category: String,
  prize: String,
});
</script>