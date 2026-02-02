<template>
  <div class="border-l-4 border-green-500 pl-6 py-4 pr-4 rounded-md bg-slate-50">

    <!-- Role + Credential -->
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-lg font-semibold text-[#0e141b]">
        {{ volunteering.role }}

        <span v-if="volunteering.cred_link" class="inline-block ml-2 align-middle">
          <DocumentViewer :src="volunteering.cred_link" />
        </span>
      </h3>
    </div>

    <!-- Organization -->
    <p class="text-gray-700 mb-3 flex items-center gap-2">
      <v-icon size="16">mdi-domain</v-icon>
      {{ volunteering.organization }}
    </p>

    <!-- Fields & Time Periods -->
<div class="flex mb-2">

  <!-- Icon column -->
  <div class="w-5 flex justify-center pt-1 mr-1">
    <v-icon size="16" class="text-gray-400">
      mdi-tag-outline
    </v-icon>
  </div>

  <!-- Fields column -->
  <div class="flex-1">
    <div
      v-for="(f, index) in volunteering.field"
      :key="index"
      class="flex items-start justify-between mb-2"
    >
      <p class="text-gray-600">
        {{ f['sub-field'] }}
      </p>

      <div class="text-sm text-gray-500 flex flex-col items-end">
        <span
          v-for="(period, i) in f.time_period.split(';')"
          :key="i"
        >
          {{ period.trim() }}
        </span>
      </div>
    </div>
  </div>

</div>
    <!-- Skills (plain text, because that’s what it is) -->
    <div class="mb-2">
      <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
        {{ volunteering.skills }}
      </span>
    </div>

    <!-- Details link -->
    <div v-if="volunteering.details_cred" class="text-right">
      <a :href="volunteering.details_cred" target="_blank" class="text-[#1980e6] hover:underline text-sm">
        See Details →
      </a>
    </div>

  </div>
</template>

<script setup>
import DocumentViewer from '@/components/DocumentViewer.vue'

defineProps({
  volunteering: {
    type: Object,
    required: true
  }
})
</script>