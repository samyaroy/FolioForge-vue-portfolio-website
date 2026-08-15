<template>
  <div class="border-l-4 border-green-500 pl-6 py-4 pr-4 rounded-md bg-slate-50 text-sm">

    <!-- Role + Credential -->
    <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-2">
      <h3 class="text-lg font-semibold text-[#0e141b]">
        {{ volunteering.role }}

        <span v-if="volunteering.cred_link" class="inline-block ml-2 align-middle">
          <DocumentViewer :src="volunteering.cred_link" />
        </span>
      </h3>

      <!-- Entry-level time period sits beside the role; per-field periods
           are rendered next to their own sub_field instead. -->
      <span v-if="volunteering.time_period" class="text-sm text-gray-500 sm:ml-auto">
        {{ volunteering.time_period }}
      </span>
    </div>

    <!-- Organization -->
    <p class="text-gray-700 mb-3 flex items-start gap-2">
      <v-icon size="16" class="mt-1">mdi-domain</v-icon>
      <SmartLink :type="'Institution'" :text="volunteering.organization" />
    </p>

    <!-- Fields & Time Periods (only when the entry actually has fields) -->
    <div v-if="fields.length" class="flex mb-1">

      <!-- Icon column -->
      <div class="w-5 flex justify-center pt-1 mr-1">
        <v-icon size="16" class="text-gray-400">
          mdi-tag-outline
        </v-icon>
      </div>

      <!-- Fields column -->
      <div class="flex-1">
        <div v-for="(f, index) in fields" :key="index" class="flex items-start justify-between gap-4 mb-0.5">
          <p class="text-gray-600">
            {{ f.sub_field }}
          </p>

          <div v-if="f.periods.length" class="text-sm text-gray-500 flex flex-col items-end shrink-0">
            <span v-for="(period, i) in f.periods" :key="i">
              {{ period }}
            </span>
          </div>
        </div>
      </div>

    </div>
    <!-- Skills (plain text, because that’s what it is) -->
    <div v-if="volunteering.skills" class="mb-2">
      <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
        {{ volunteering.skills }}
      </span>
    </div>

    <!-- Details link
    <div v-if="volunteering.details_cred" class="text-right">
      <a :href="volunteering.details_cred" target="_blank" class="text-[#1980e6] hover:underline text-sm">
        See Details →
      </a>
    </div> -->

  </div>
</template>

<script setup>
import { computed } from 'vue'
import DocumentViewer from '@/components/DocumentViewer.vue'
import SmartLink from '@/components/SmartLink.vue'

const props = defineProps({
  volunteering: {
    type: Object,
    required: true
  }
})

// `field` is optional, and a sub_field may list several periods separated by ';'.
const fields = computed(() =>
  (props.volunteering.field || []).map(f => ({
    sub_field: f.sub_field || '',
    periods: (f.time_period || '')
      .split(';')
      .map(period => period.trim())
      .filter(Boolean)
  }))
)
</script>
