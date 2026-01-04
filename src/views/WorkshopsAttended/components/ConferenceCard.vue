<template>
  <div
    class="border-l-4 border-indigo-600 pl-6 py-4 rounded-lg bg-white
           hover:shadow-md transition-all duration-200"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-2 pr-4">
      <div class="flex items-center gap-4">
        <h3 class="text-lg font-semibold text-slate-900">
          {{ conference.title }}
        </h3>

        <a
          v-if="conference.link"
          :href="conference.link"
          target="_blank"
          rel="noopener noreferrer"
          class="text-slate-500 hover:text-slate-700"
        >
          <v-icon size="20">mdi-open-in-new</v-icon>
        </a>
      </div>
    </div>

    <!-- Meta -->
    <div class="space-y-2 mb-2">
      <!-- Organizer -->
      <div
        v-if="normalizedOrganizers.length"
        class="text-slate-600 flex items-start gap-2"
      >
        <v-icon size="small" class="mt-0.5">
          mdi-account-group
        </v-icon>

        <div>
          <span class="font-medium">Organizer:</span>
          <div class="flex flex-col mt-0.5">
            <SmartLink
              v-for="org in normalizedOrganizers"
              :key="org"
              :text="org"
              class="leading-relaxed"
            />
          </div>
        </div>
      </div>

      <!-- Institution -->
      <div
        v-if="conference.institution"
        class="text-slate-600 flex items-center"
      >
        <v-icon size="small" class="mr-2">
          mdi-school
        </v-icon>
        <span class="font-medium">Institution:</span>&nbsp;
        <SmartLink :text="conference.institution.Name" />
        <span v-if="conference.institution.Department">
          , {{ conference.institution.Department }}
        </span>
        <span v-if="conference.institution.Location">
          , {{ conference.institution.Location }}
        </span>
      </div>

      <!-- Location -->
      <div
        v-if="conference.location"
        class="text-slate-600 flex items-center"
      >
        <v-icon size="small" class="mr-2">
          mdi-map-marker
        </v-icon>
        <span>{{ conference.location }}</span>
      </div>
    </div>

    <!-- Date -->
    <div
      v-if="conference.date"
      class="text-slate-600 flex items-center mb-3"
    >
      <v-icon size="small" class="mr-2">
        mdi-calendar
      </v-icon>
      <span>{{ conference.date }}</span>
    </div>

    <!-- Footer badge -->
    <div class="mt-3">
      <span
        class="text-xs font-medium text-slate-600 bg-slate-200 px-2 py-1 rounded"
      >
        Attendee
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import SmartLink from '@/components/SmartLink.vue'

const props = defineProps({
  conference: {
    type: Object,
    required: true,
  },
})

const normalizedOrganizers = computed(() => {
  const org = props.conference.organizer

  if (!org) return []

  if (Array.isArray(org)) {
    return org.map(o => o.trim()).filter(Boolean)
  }

  if (typeof org === 'string') {
    return org
      .split(',')
      .map(o => o.trim())
      .filter(Boolean)
  }

  return []
})
</script>

<style scoped>
/* Intentionally minimal — conferences should stay quiet */
</style>