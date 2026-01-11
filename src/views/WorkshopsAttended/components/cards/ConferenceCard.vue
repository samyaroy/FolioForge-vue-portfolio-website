<template>
  <div
    class="border-l-4 border-indigo-600 pl-5 py-3 rounded-lg bg-white
           hover:shadow-md transition-all duration-200"
  >
    <!-- Header -->
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

      <span v-if="conference.date" class="text-sm text-gray-500">
        {{ conference.date }}
      </span>
    </div>

    <!-- Meta -->
    <div class="space-y-1">

      <!-- Organizer -->
      <div
        v-if="normalizedOrganizers.length"
        class="text-slate-600 flex items-start"
      >
        <v-icon size="small" class="mr-2 mt-0.5">mdi-account-group</v-icon>

        <div class="flex-1 flex">
          <div class="font-medium mr-2">Organizer:</div>

          <div>
            <div
              v-for="(org, index) in normalizedOrganizers"
              :key="index"
            >
              <SmartLink :text="org.name" />
              <span v-if="org.department"> - {{ org.department }}</span>
              <span v-if="org.location">, {{ org.location }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Institution -->
      <div
        v-if="conference.institution?.length"
        class="text-slate-600 flex items-start"
      >
        <v-icon size="small" class="mr-2 mt-0.5">mdi-school</v-icon>

        <div class="flex-1 flex">
          <div class="font-medium mr-2">Institution:</div>

          <div>
            <div
              v-for="(inst, index) in conference.institution"
              :key="index"
            >
              <SmartLink :text="inst.name" />
              <span v-if="inst.department"> - {{ inst.department }}</span>
              <span v-if="inst.location">, {{ inst.location }}</span>
            </div>
          </div>
        </div>
      </div>

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