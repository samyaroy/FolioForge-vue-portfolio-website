<template>
  <div :class="cardClass">
    <!-- HEADER -->
    <div class="flex pr-4">
      <!-- LEFT (80%) -->
      <div class="w-[85%]">
        <div>
          <h3 class="text-md font-semibold text-[#0e141b]">
            {{ event.title }}
            <span v-if="event.cred_link" class="inline-block ml-1 align-middle">
              <DocumentViewer :src="event.cred_link" />
            </span>
          </h3>
        </div>
        <div>
          <!-- ORGANIZATION / INSTITUTIONS -->
          <div v-if="event.institution && event.institution.length" class="text-gray-600 mb-1 mt-2 flex items-start">
            <v-icon size="16" class="mr-2 mt-0.5">
              mdi-office-building
            </v-icon>

            <div class="flex-1 flex items-start">
              <div class="shrink-0 whitespace-nowrap font-medium mb-0.5">
                <span>{{ hasAffiliatedInstitution ? 'Organization:' : 'Institution:' }}</span>
              </div>

              <div class="ml-2 min-w-0">
                <div v-for="(inst, index) in event.institution" :key="index">
                  <div v-if="inst.affiliation">
                    <SmartLink :text="inst.affiliation" type="Organization" />
                  </div>

                  <div>
                    <span v-if="inst.department">
                      {{ inst.department }},
                    </span>

                    <SmartLink :text="inst.name" />

                    <span v-if="inst.role">
                      ({{ inst.role }})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- GUEST SPEAKERS -->
          <div v-if="event.guest_speakers && event.guest_speakers.length" class="text-gray-600 mb-1 flex items-start">
            <v-icon size="16" class="mr-2 mt-0.5">
              mdi-account-voice
            </v-icon>

            <div class="flex-1 flex items-start">
              <div class="shrink-0 whitespace-nowrap font-medium mb-0.5">
                <span>Guest Speaker<span v-if="event.guest_speakers.length > 1">s</span>:</span>
              </div>

              <div class="ml-2 min-w-0">
                <div v-for="(speaker, index) in event.guest_speakers" :key="index">
                  <SmartLink :text="speaker.name" type="Person" />

                  <span v-if="speaker.designation">
                    , {{ speaker.designation }}
                  </span>
                  <span v-if="speaker.department">
                    , {{ speaker.department }}
                  </span>
                  <span v-if="speaker.institution">
                    , <SmartLink :text="speaker.institution" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT (20%) -->
      <div :class="metaColumnClass">
        <!-- Date -->
        <span>{{ event.date }}</span>

        <!-- Mode + Location -->
        <div class="flex flex-col items-start mt-1">
          <span class="flex items-center gap-1">
            <v-icon v-if="event.mode === 'Online'" size="14">mdi-web</v-icon>

            <v-img v-else-if="event.mode === 'Offline'" :src="inPersonIcon" alt="In-Person Icon"
              width="14" height="14" class="d-inline-block" contain />

            <v-icon v-else-if="event.mode === 'Hybrid'" size="14">mdi-source-branch</v-icon>

            {{ event.mode }}
          </span>

          <span v-if="event.institution?.length">
            <v-icon size="14">mdi-map-marker</v-icon> {{ event.institution[0].location }}
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
  event: {
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

const hasAffiliatedInstitution = computed(() => (
  Array.isArray(props.event.institution)
  && props.event.institution.some(inst => inst?.affiliation)
))

const eventTypeStyles = {
  'guest session': {
    border: 'border-sky-500',
  },
  'academic session': {
    border: 'border-sky-500',
  },
  workshop: {
    border: 'border-emerald-500',
  },
  bootcamp: {
    border: 'border-amber-500',
  }
}

const defaultEventTypeStyle = {
  border: 'border-purple-500',
}

const eventTypeStyle = computed(() => {
  const eventType = String(props.event.event_type || '').trim().toLowerCase()
  return eventTypeStyles[eventType] || defaultEventTypeStyle
})

const cardClass = computed(() => [
  'border-l-4 pl-5 py-3 hover:shadow-md transition-shadow duration-200 rounded-lg bg-white text-sm',
  eventTypeStyle.value.border
])
</script>

<style scoped>
/* intentionally empty */
</style>
