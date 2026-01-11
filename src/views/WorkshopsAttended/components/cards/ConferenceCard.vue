<template>
  <div
    class="border-l-4 border-indigo-600 pl-5 py-3 rounded-lg bg-white
           hover:shadow-md transition-all duration-200"
  >
    <!-- Header with Title and Date -->
    <div class="flex items-center justify-between mb-1.5 pr-4">
      <h3 class="text-lg font-semibold text-slate-900">
        {{ conference.title }}
        <a
          v-if="conference.link"
          :href="conference.link"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-block ml-1 align-middle text-slate-500 hover:text-slate-700"
        >
          <v-icon size="16">mdi-open-in-new</v-icon>
        </a>
      </h3>

      <!-- Date on the right -->
      <span v-if="conference.date" class="text-sm text-gray-500">{{ conference.date }}</span>
    </div>

    <!-- Meta -->
    <div class="space-y-1 mb-1">
      <!-- Organizer -->
      <div
        v-if="normalizedOrganizers.length"
        class="text-slate-600 flex items-start"
      >
        <v-icon size="small" class="mr-2 mt-0.5">mdi-account-group</v-icon>
        <div class="flex-1 flex items-start">
          <div class="font-medium mb-0.5"><span>Organizer: </span></div>
          <div class="ml-2">
            <div v-for="(org, index) in normalizedOrganizers" :key="index">
              <SmartLink :text="org" />
            </div>
          </div>
        </div>
      </div>

      <!-- Institution - Handle array format (new format) -->
      <template v-if="Array.isArray(conference.institution)">
        <div v-for="(inst, index) in conference.institution" :key="index" class="text-slate-600 flex items-start mb-1">
          <v-icon size="small" class="mr-2 mt-0.5">mdi-school</v-icon>
          <span>
            <span v-if="index === 0" class="font-medium">Institution: </span>
            <span v-if="inst.department">{{ inst.department }}, </span>
            <SmartLink v-if="inst.name" :text="inst.name" />
            <span v-if="inst.location">, {{ inst.location }}</span>
          </span>
        </div>
      </template>
      <!-- Handle object format (old format) -->
      <template v-else-if="conference.institution">
        <p class="text-slate-600 flex items-start">
          <v-icon size="small" class="mr-2 mt-0.5">mdi-school</v-icon>
          <span>
            <span class="font-medium">Institution: </span>
            <span v-if="conference.institution.Department">
              {{ conference.institution.Department }}, 
            </span>
            <span v-if="Array.isArray(conference.institution.Name)">
              <span v-for="(name, index) in conference.institution.Name" :key="index" :class="index > 0 ? 'block ml-5' : ''">
                <SmartLink v-if="name" :text="name" />
              </span>
            </span>
            <span v-else-if="conference.institution.Name">
              <SmartLink :text="conference.institution.Name" />
            </span>
            <span v-if="conference.institution.Location">
              , {{ conference.institution.Location }}
            </span>
          </span>
        </p>
      </template>

      <!-- Location -->
      <p
        v-if="conference.location"
        class="text-slate-600 flex items-center"
      >
        <v-icon size="small" class="mr-2">mdi-map-marker</v-icon>
        <span>{{ conference.location }}</span>
      </p>
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
