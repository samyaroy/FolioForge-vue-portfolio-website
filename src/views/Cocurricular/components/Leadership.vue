<template>
  <div class="border-l-4 border-[#1980e6] pl-6 py-4 pr-4 rounded-md bg-slate-50">
    <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-2">
      <h3 class="text-lg font-semibold text-[#0e141b]">
        {{ leadership.role }}
        <span v-if="leadership.cred_link" class="inline-block ml-2 align-middle">
          <DocumentViewer :src="leadership.cred_link" />
        </span>
      </h3>
      <span v-if="leadership.time_period" class="text-sm text-gray-500">{{ leadership.time_period }}</span>
    </div>

    <div class="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
      <div v-if="primaryName" class="flex items-center space-x-1">
        <v-icon small class="text-[#1980e6]">{{ primaryIcon }}</v-icon>
        <span class="text-gray-600">{{ primaryName }}</span>
        <a
          v-if="primaryLink"
          :href="primaryLink"
          target="_blank"
          rel="noopener noreferrer"
          class="text-[#1980e6] hover:underline text-sm"
          :aria-label="`Open ${primaryName} website`"
        >
          <v-icon size="16" class="text-gray-500">mdi-open-in-new</v-icon>
        </a>
      </div>

      <div v-if="leadership.host" class="flex items-center space-x-1">
        <v-icon small class="text-[#1980e6]">mdi-domain </v-icon>
        <span v-if="leadership.host.web_link" class="text-gray-700">
          <a :href="leadership.host.web_link" target="_blank" rel="noopener" class="text-[#1980e6] hover:underline text-sm">
            {{ leadership.host.name }}
          </a>
        </span>
        <span v-else class="text-gray-700">
            {{ leadership.host.name }}
        </span>
      </div>

      <div v-if="instituteName" class="flex items-center space-x-1">
        <v-icon small class="text-[#1980e6]">mdi-town-hall</v-icon>
        <span class="text-gray-700">
          <SmartLink type="Institution" :text="instituteName" />
        </span>
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

defineOptions({
  name: 'LeadershipRole'
})

const props = defineProps({
  leadership: {
    type: Object,
    required: true
  }
})

const organization = computed(() => props.leadership.organization)
const event = computed(() => props.leadership.event)

const primaryName = computed(() => {
  if (organization.value) {
    return typeof organization.value === 'string' ? organization.value : organization.value.name
  }

  if (event.value) {
    return typeof event.value === 'string' ? event.value : event.value.name
  }

  return ''
})

const primaryLink = computed(() => {
  if (organization.value && typeof organization.value === 'object') {
    return organization.value.web_link || ''
  }

  if (event.value && typeof event.value === 'object') {
    return event.value.web_link || ''
  }

  return props.leadership.web_link || ''
})

const primaryIcon = computed(() => event.value && !organization.value ? 'mdi-seat' : 'mdi-office-building')

const instituteName = computed(() => props.leadership.institute|| '')

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
