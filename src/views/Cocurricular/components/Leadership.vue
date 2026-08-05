<template>
  <div class="border-l-4 border-[#1980e6] pl-6 py-4 pr-4 rounded-md bg-slate-50">
    <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-2">
      <h3 class="text-lg font-semibold text-[#0e141b]">
        {{ leadership.role }}
        <span v-if="leadership.cred_link" class="inline-block ml-2 align-middle">
          <DocumentViewer :src="leadership.cred_link" />
        </span>
      </h3>
    </div>

    <div class="flex flex-col gap-2 mb-2">
      <div
        v-for="(affiliation, index) in affiliations"
        :key="index"
        class="flex flex-col md:flex-row md:items-center gap-2 md:gap-4"
      >
        <div v-if="affiliation.name" class="flex items-center space-x-1">
          <v-icon small class="text-[#1980e6]">mdi-office-building</v-icon>
          <span class="text-gray-600">{{ affiliation.name }}</span>
          <a
            v-if="affiliation.link"
            :href="affiliation.link"
            target="_blank"
            rel="noopener noreferrer"
            class="text-[#1980e6] hover:underline text-sm"
            :aria-label="`Open ${affiliation.name} website`"
          >
            <AnimatedIcon name="external-link" :size="16" class="text-gray-500" />
          </a>
        </div>

        <div v-if="affiliation.host" class="flex items-center space-x-1">
          <v-icon small class="text-[#1980e6]">mdi-domain </v-icon>
          <span v-if="affiliation.host.web_link" class="text-gray-700">
            <a :href="affiliation.host.web_link" target="_blank" rel="noopener" class="text-[#1980e6] hover:underline text-sm">
              {{ affiliation.host.name }}
            </a>
          </span>
          <span v-else class="text-gray-700">
              {{ affiliation.host.name }}
          </span>
        </div>

        <div v-if="affiliation.institute" class="flex items-center space-x-1">
          <v-icon small class="text-[#1980e6]">mdi-town-hall</v-icon>
          <span class="text-gray-700">
            <SmartLink type="Institution" :text="affiliation.institute" />
          </span>
        </div>

        <span v-if="affiliation.time_period" class="text-sm text-gray-500 md:ml-auto">{{ affiliation.time_period }}</span>
      </div>
    </div>

    <p v-if="leadership.description" class="content-justify text-gray-700 mb-3">
      <SmartLink type="Person" :text="leadership.description" />
    </p>
    <div v-if="skills.length" class="flex flex-wrap gap-2">
      <span
        v-for="skill in skills"
        :key="skill"
        class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
      >
        {{ skill }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import DocumentViewer from '@/components/DocumentViewer.vue'
import SmartLink from '@/components/SmartLink.vue'
import AnimatedIcon from '@/components/ui/AnimatedIcon.vue'

defineOptions({
  name: 'LeadershipRole'
})

const props = defineProps({
  leadership: {
    type: Object,
    required: true
  }
})

// One role can list multiple organizations via the `affiliation` array,
// each with its own optional host, institute, and time period.
const affiliations = computed(() =>
  props.leadership.affiliation.map(affiliation => ({
    name: affiliation.organization?.name || '',
    link: affiliation.organization?.web_link || '',
    host: affiliation.host || null,
    institute: affiliation.institute || '',
    time_period: affiliation.time_period || ''
  }))
)

const skills = computed(() => {
  if (Array.isArray(props.leadership.skills)) {
    return props.leadership.skills
  }

  return (props.leadership.skills || '')
    .split(',')
    .map(skill => skill.trim())
    .filter(Boolean)
})
</script>
