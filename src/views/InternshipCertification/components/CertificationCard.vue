<template>
  <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
    <div class="flex items-stretch gap-4 sm:gap-6">
      <div class="w-[85%] min-w-0">
        <h3 class="text-xl font-bold text-[#0e141b] mb-2">{{ certification.title }}</h3>
        <div class="flex items-center gap-2 text-[#4e7397] text-sm mb-1">
          <v-icon size="16">mdi-school</v-icon>
          <span>
            <SmartLink :type="'Institute'" :text="certification.issuer.institution" />
          </span>
          <span v-if="certification.issuer.platform"> -
            <SmartLink :type="'Institute'" :text="certification.issuer.platform" />
          </span>
        </div>
        <div v-if="certification.instructor" class="flex items-center gap-2 text-[#4e7397] text-sm mb-1">
          <v-icon size="16">mdi-account</v-icon>
          <span>
            <SmartLink :type="'Person'" :text="certification.instructor" />
          </span>
        </div>
        <div class="flex items-center gap-2 text-[#4e7397] text-sm mb-3">
          <v-icon size="16">mdi-calendar</v-icon>
          <span>{{ certification.date }} <span v-if="certification.duration">({{ certification.duration
              }})</span></span>
        </div>

        <div v-if="certification.skills && certification.skills.length" class="flex flex-wrap gap-2 mt-4">
          <span v-for="skill in certification.skills" :key="skill"
            class="px-3 py-1 text-xs font-medium bg-gray-100 text-[#4e7397] rounded-full">
            {{ skill }}
          </span>
        </div>
      </div>

      <div class="w-[15%] min-w-0 flex flex-col">
        <div class="w-full flex justify-end pr-4">
          <DocumentViewer :src="certification.cred_link" />
        </div>

        <div v-if="certification.issuer.location"
          class="mt-4 flex w-full justify-end gap-1 text-[#4e7397] text-sm pr-4">
          <v-icon size="16">mdi-map-marker</v-icon>
          <span>{{ certification.issuer.location }}</span>
        </div>

        <div v-if="certification.logo && certification.logo.length" class="mt-auto flex w-full justify-end pt-4 pr-3">
          <div class="flex items-center justify-end gap-1 empty:hidden">
            <template v-for="(logo, index) in certification.logo" :key="logo">
              <img :src="getLogoPath(logo)" :alt="logo" :title="logo"
                class="max-h-4 md:max-h-6 object-contain" @error="handleLogoError">
              <span v-if="index < certification.logo.length - 1" class="text-slate-500/50"> </span>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import SmartLink from '@/components/SmartLink.vue'
import DocumentViewer from '@/components/DocumentViewer.vue'

defineProps({
  certification: {
    type: Object,
    required: true
  }
})

function getLogoPath(logo) {
  return `/logo/${logo}.png`
}

function handleLogoError(event) {
  event.target.remove()
}
</script>
