<template>
  <div class="flex items-start space-x-4 p-6 bg-white border rounded-lg hover:shadow-md transition-shadow duration-200">
    <!-- Icon Circle -->
    <div class="flex-shrink-0">
      <div class="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
        <v-icon color="#1980e6" size="24">{{ category }}</v-icon>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1">
      <!-- Type Badge + Year -->
      <div class="flex items-center justify-between mb-2">
        <span
          class="text-xs font-semibold px-2 py-0.5 rounded-full"
          :class="type === 'award'
            ? 'bg-blue-100 text-[#1980e6]'
            : 'bg-green-100 text-green-700'"
        >
          {{ type === 'award' ? 'Award' : 'Achievement' }}
        </span>
        <span class="text-sm text-gray-400">{{ year }}</span>
      </div>

      <!-- Title -->
      <h3 class="text-[#0e141b] text-base font-semibold leading-snug mb-2">{{ title }}</h3>

      <!-- Organization -->
      <div v-if="organization" class="flex items-center gap-2 mb-1">
        <v-icon class="text-[#4e7397]" size="16">mdi-domain</v-icon>
        <p class="text-[#4e7397] text-sm font-normal leading-normal">
          <SmartLink :text="organization" />
        </p>
      </div>

      <!-- Prize -->
      <div v-if="prize" class="flex items-center gap-2 mt-1">
        <v-icon class="text-[#4e7397]" size="16">mdi-medal</v-icon>
        <p class="text-sm text-green-600 font-medium">{{ prize }}</p>
      </div>

      <!-- Description -->
      <p v-if="description" class="text-[#4e7397] text-sm mt-2 leading-relaxed">{{ description }}</p>

      <!-- Credential Link -->
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
  type: {
    type: String,
    default: 'award',
  },
})
</script>
