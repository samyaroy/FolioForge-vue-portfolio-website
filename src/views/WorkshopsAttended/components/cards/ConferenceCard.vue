<template>
  <div class="border-l-4 border-indigo-600 pl-5 py-3 rounded-lg bg-white
           hover:shadow-md transition-all duration-200 text-sm">
    <!-- PARENT: stacks on a phone, where the 20% meta column is too narrow to
         hold a date on one line. -->
    <div class="flex flex-col sm:flex-row gap-2 sm:gap-4">

      <!-- CHILD 1: 80% -->
      <div class="w-full sm:w-[75%] min-w-0 space-y-3">

        <!-- Header -->
        <div class="flex items-start">
         <h3 class="text-md font-semibold text-slate-900">
  {{ conference.title }}
  
  <a
    v-if="conference.link && !conference.cred_link"
    :href="conference.link"
    target="_blank"
    rel="noopener noreferrer"
    class="inline align-baseline ml-1 text-slate-500 hover:text-slate-700"
  >
    <AnimatedIcon name="external-link" :size="16" class="inline-block align-text-bottom" />
  </a>

  <DocumentViewer
    v-else-if="conference.cred_link"
    :src="conference.cred_link"
    class="inline ml-1"
  />
</h3>
        </div>

        <!-- Meta -->
        <div class="space-y-1">

          <!-- Organizer -->
          <div v-if="normalizedOrganizers.length" class="text-slate-600 flex items-start">
            <v-icon size="small" class="mr-2 mt-0.5">mdi-account-group</v-icon>

            <div class="min-w-0 flex-1 flex flex-col sm:flex-row">
              <div class="font-medium mr-2 shrink-0">Organizer(s):</div>

              <div>
                <div v-for="(org, index) in normalizedOrganizers" :key="index">
                  <span v-if="org.department">{{ org.department }}, </span>
                  <SmartLink :text="org.name" />
                </div>
              </div>
            </div>
          </div>

          <!-- Institution -->
          <div v-if="conference.institution?.length" class="text-slate-600 flex items-start">
            <v-icon size="small" class="mr-2 mt-0.5">mdi-school</v-icon>

            <div class="min-w-0 flex-1 flex flex-col sm:flex-row">
              <div class="font-medium mr-2 shrink-0">Institution:</div>

              <div>
                <div v-for="(inst, index) in conference.institution" :key="index">
                  <SmartLink :text="inst.name" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- CHILD 2: 20% -->
      <div class="w-full sm:w-[20%] shrink-0 text-left sm:text-right text-sm text-gray-500 space-y-1">

        <div v-if="conference.date" class="flex items-center justify-start sm:justify-end gap-1">
          <v-icon size=14>mdi-calendar</v-icon>
          <span>{{ conference.date }}</span>
        </div>

        <div v-if="conference.location" class="flex items-center justify-start sm:justify-end gap-1">
          <v-icon size=14>mdi-map-marker</v-icon>
          <span>{{ conference.location }}</span>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import SmartLink from '@/components/SmartLink.vue'
import DocumentViewer from '@/components/DocumentViewer.vue'
import AnimatedIcon from '@/components/ui/AnimatedIcon.vue'


const props = defineProps({
  conference: {
    type: Object,
    required: true,
  },
})

/**
 * Organizer is now STRICTLY:
 * Array<{ name, department?, location? }>
 */
const normalizedOrganizers = computed(() => {
  const org = props.conference.organizer
  if (!Array.isArray(org)) return []
  return org.filter(o => o?.name)
})
</script>

<style scoped>
/* conferences should stay quiet */
</style>
