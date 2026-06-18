<template>
  <div class="relative bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 overflow-hidden">
    <div v-if="certification.tag" class="certification-tag">
      <span>{{ certification.tag }}</span>
    </div>
    <div class="flex items-stretch gap-4 sm:gap-6">
      <div class="w-[85%] min-w-0 ml-6">
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
                class="h-5 md:h-7 w-auto object-contain" @error="handleLogoError">
              <span v-if="index < certification.logo.length - 1"> &bull; </span>
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

<style scoped>
.certification-tag {
  position: absolute;
  top: 18px;
  left: -42px;
  width: 140px;
  transform: rotate(-45deg);
  transform-origin: center;
  background: #b81f2d;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  text-align: center;
  padding: 3px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.55);
  border-bottom: 1px solid rgba(255, 255, 255, 0.55);
  z-index: 10;
  pointer-events: none;
}
</style>
