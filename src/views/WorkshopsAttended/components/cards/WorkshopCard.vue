<template>
  <div class="border-l-4 border-[#1d67fd] pl-5 py-3 hover:shadow-md transition-shadow duration-200 rounded-lg bg-white text-sm">
    <!-- HEADER -->
    <div class="flex pr-4">
      <!-- LEFT (80%) -->
      <div class="w-[85%]">
        <div>
          <h3 class="text-md font-semibold text-[#0e141b]">
            {{ workshop.title }}
            <span v-if="credentialLink" class="inline-block ml-1 align-middle">
              <DocumentViewer :src="credentialLink" />
            </span>
          </h3>
        </div>
        <div>
          <!-- INSTRUCTOR -->
          <div v-if="instructors.length" class="text-gray-600 mb-1 mt-2 flex items-start">
            <v-icon size="16" class="mr-2 mt-0.5">mdi-account</v-icon>

            <div class="flex-1 flex items-start">
              <div class="font-medium mb-0.5 shrink-0">
                <span>Instructor<span v-if="instructors.length > 1">s</span>:&nbsp;</span>
              </div>

              <div>
                <div v-for="(instructor, index) in instructors" :key="`${instructor.name}-${index}`">
                  <SmartLink :text="instructor.name" type="Person" />
                  <span v-if="instructor.title">, {{ instructor.title }}</span>
                  <span v-if="instructor.department">, {{ instructor.department }}</span>
                  <span v-if="instructor.institution">, <SmartLink :text="instructor.institution" type="Institute" /></span>
                </div>
              </div>
            </div>
          </div>

          <!-- INSTITUTIONS -->
          <div v-if="institutions.length" class="text-gray-600 mb-1 flex items-start">
            <v-icon size="16" class="mr-2 mt-0.5">
              mdi-office-building
            </v-icon>

            <div class="flex-1 flex items-start">
              <div class="font-medium mb-0.5">
                <span>Institution(s):</span>
              </div>

              <div class="ml-2">
                <div v-for="(inst, index) in institutions" :key="`${inst.name}-${index}`">
                  <span v-if="inst.department">
                    {{ inst.department }},
                  </span>

                  <SmartLink v-if="inst.name" :text="inst.name" />

                  <span v-if="inst.role">
                    ({{ inst.role }})
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- DURATION -->
          <p v-if="workshop.duration" class="text-gray-600 mb-1 flex items-center">
            <v-icon size="16" class="mr-2">mdi-timer-outline</v-icon>
            <span class="font-medium">Duration:&nbsp;</span>
            <span>{{ workshop.duration }}</span>
          </p>
        </div>
      </div>

      <!-- RIGHT (20%) -->
      <div :class="metaColumnClass">
        <!-- Date -->
        <span>{{ workshop.date }}</span>

        <!-- Mode + Location -->
        <div class="flex flex-col items-start mt-1">
          <span class="flex items-center gap-1">
            <v-icon v-if="workshop.mode === 'Online'" size="14">mdi-web</v-icon>

            <v-img v-else-if="workshop.mode === 'Offline'" :src="inPersonIcon" alt="In-Person Icon"
              width="14" height="14" class="d-inline-block" contain />

            <v-icon v-else-if="workshop.mode === 'Hybrid'" size="14">mdi-source-branch</v-icon>

            {{ workshop.mode }}
          </span>

          <span v-if="displayLocation" class="flex items-center gap-1 mt-1">
            <v-icon size="14">mdi-map-marker</v-icon> {{ displayLocation }}
          </span>
        </div>
      </div>
    </div>


  </div>
</template>

<script setup>
import { computed } from 'vue'
import SmartLink from '@/components/SmartLink.vue'
import DocumentViewer from '@/components/DocumentViewer.vue'

import inPersonIcon from '@/assets/icons/persons-in-a-class-by-flaticon.png'

const props = defineProps({
  workshop: {
    type: Object,
    required: true
  },
  compactMetaText: {
    type: Boolean,
    default: false
  }
})

const metaColumnClass = [
  'w-[15%] text-gray-500 flex flex-col items-start',
  props.compactMetaText ? 'text-xs' : 'text-sm'
]

const credentialLink = computed(() => {
  return props.workshop?.cred_link || props.workshop?.details_cred || props.workshop?.link || ''
})

function normalizeInstructor(entry) {
  if (!entry) return null
  if (typeof entry === 'string') return { name: entry, title: '', department: '', institution: '' }
  if (!entry.name) return null

  return {
    name: entry.name,
    title: entry.title || entry.position || entry.designation || '',
    department: entry.department || '',
    institution: entry.institution || '',
  }
}

const instructors = computed(() => {
  const instructor = props.workshop?.instructor
  const entries = Array.isArray(instructor) ? instructor : [instructor]
  return entries.map(normalizeInstructor).filter(Boolean)
})

function normalizeInstitution(entry) {
  if (!entry) return null
  if (typeof entry === 'string') return { name: entry, department: '', role: '', location: '' }
  if (!entry.name) return null
  return {
    name: entry.name,
    department: entry.department || '',
    role: entry.role || '',
    location: entry.location || '',
  }
}

const institutions = computed(() => {
  const institution = props.workshop?.institution
  const entries = Array.isArray(institution) ? institution : [institution]
  return entries.map(normalizeInstitution).filter(Boolean)
})

const displayLocation = computed(() => {
  return props.workshop?.location || institutions.value.find(institution => institution.location)?.location || ''
})
</script>

<style scoped>
/* intentionally empty */
</style>
