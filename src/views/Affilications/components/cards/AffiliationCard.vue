<template>
  <div class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h3 class="text-lg font-semibold text-slate-900">
          {{ affiliation.organization }}
        </h3>

        <p v-if="affiliation.department" class="text-sm text-gray-600">
          <v-icon size="16" class="text-[#4e7397] mr-1">mdi-domain</v-icon>
          Department of {{ affiliation.department }}
        </p>

        <p v-if="affiliation.location" class="text-sm text-gray-500">
          <v-icon size="16" class="text-[#4e7397] mr-2">mdi-map-marker</v-icon>
          <span>{{ affiliation.location }}</span>
        </p>
      </div>

      <span v-if="affiliation.period" class="text-sm text-gray-500">
        {{ affiliation.period }}
      </span>
    </div>

    <p v-if="affiliation.role || affiliation.position" class="mt-2 text-gray-700">
      {{ affiliation.role || affiliation.position }}
    </p>

    <p v-if="affiliation.description" class="mt-3 text-gray-600 leading-relaxed">
      {{ affiliation.description }}
    </p>

    <div v-if="affiliation.link" class="mt-3">
      <a
        :href="affiliation.link"
        target="_blank"
        rel="noopener noreferrer"
        class="text-[#1980e6] font-medium hover:underline"
      >
        View details
      </a>
    </div>
  </div>
</template>

<script setup>
defineProps({
  affiliation: {
    type: Object,
    required: true,
  },
})
</script>

