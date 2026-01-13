<template>
  <div class="grid grid-cols-[40px_1fr] gap-x-2 px-4">
    <!-- Timeline Icon & Connector -->
    <div class="flex flex-col items-center gap-1" :class="{ 'pb-3': isLast, 'pt-3': isFirst }">
      <!-- Top connector -->
      <div v-if="!isFirst" class="w-[1.5px] bg-[#d0dbe7] h-2"></div>

      <!-- Icon -->
      <div class="text-[#0e141b]">
        <v-icon :class="iconColor" size="24">
          {{ icon }}
        </v-icon>
      </div>

      <!-- Bottom connector -->
      <div v-if="!isLast" class="w-[1.5px] bg-[#d0dbe7] h-2 grow"></div>
    </div>

    <!-- Education Content -->
    <div class="flex flex-1 flex-col py-3">
      <!-- Title + Document Viewer -->
      <div>
        <p class="text-[#0e141b] text-base font-medium leading-normal">
          {{ title }}
          <span v-if="subject">in {{ subject }}</span>
          <span v-if="cred_link" class="inline-block ml-1 align-middle">
            <DocumentViewer :src="cred_link" />
          </span>
        </p>
      </div>

      <!-- Time -->
      <div class="flex items-center gap-2 mt-1">
        <v-icon class="text-[#4e7397]" size="16">
          mdi-calendar
        </v-icon>
        <p class="text-[#4e7397] text-base font-normal leading-normal">
          {{ time }}
        </p>
      </div>

      <!-- Institution & Location -->
      <div class="flex items-center gap-6 mt-1">
        <div class="flex items-center gap-2">
          <v-icon class="text-[#4e7397]" size="16">
            mdi-domain
          </v-icon>
          <p class="text-[#4e7397] text-sm font-normal leading-normal">
            <SmartLink :text="institution" />
          </p>
        </div>

        <div class="flex items-center gap-2">
          <v-icon class="text-[#4e7397]" size="16">
            mdi-map-marker
          </v-icon>
          <p class="text-[#4e7397] text-sm font-normal leading-normal">
            {{ location }}
          </p>
        </div>
      </div>

      <!-- Optional Extra Info -->
      <div v-if="extra" class="flex items-center gap-2 mt-1" _toggle>
        <v-icon class="text-[#4e7397]" size="16">
          mdi-star
        </v-icon>
        <p class="text-[#4e7397] text-sm font-normal leading-normal">
          {{ extra }}
        </p>
      </div>
    </div>
  </div>
</template>



<script setup>
import SmartLink from '@/components/SmartLink.vue'
import DocumentViewer from '@/components/DocumentViewer.vue'

defineProps({
  title: { type: String, required: true },
  subject: { type: String, default: '' },
  time: { type: String, required: true },
  institution: { type: String, required: true },
  location: { type: String, required: true },
  extra: { type: String, default: '' },
  icon: { type: String, default: 'mdi-school' },
  iconColor: { type: String, default: 'text-[#1980e6]' },
  isFirst: { type: Boolean, default: false },
  isLast: { type: Boolean, default: false },
  cred_link: { type: String, default: '' }
})
</script>