<template>
  <div :class="[
    'border-l-4 pl-3 pr-4 py-3 hover:shadow-md transition-shadow duration-200 rounded-lg bg-white',
    borderClass
  ]">
    <div class="flex items-stretch gap-4">
      <div v-if="other.type" :class="[
        'shrink-0 flex items-center justify-center rounded-sm px-0.75 py-1 text-[11px] font-semibold uppercase tracking-widest',
        typeToneClass
      ]">
        <span class="vertical-type-label">{{ other.type }}</span>
      </div>

      <div class="flex flex-1 min-w-0">
        <div class="w-[80%] min-w-0">
          <div>
            <h3 class="text-md font-semibold text-[#0e141b]">
              {{ other.title }}
            </h3>
          </div>

          <div>
            <p v-if="other.speaker" :class="['text-gray-600 mb-1 flex items-center', 'text-sm']">
              <v-icon size="14" class="mr-2">mdi-account</v-icon>
              <span>Speaker:&nbsp;</span>
              <template v-for="(s, index) in other.speaker" :key="s">
                <SmartLink :text="s" type="Person" />
                <span v-if="index < other.speaker.length - 1">,&nbsp;</span>
              </template>
            </p>

            <div v-if="normalizedHosts.length" class="text-gray-600 mb-1 flex items-start">
              <v-icon size="16" class="mr-2 mt-0.5">
                mdi-office-building
              </v-icon>

              <div class="flex-1 text-sm">
                <span class="font-medium">Host:&nbsp;</span>
                <template v-for="(host, index) in normalizedHosts" :key="`${host.name}-${index}`">
                  <span v-if="host.department">{{ host.department }}, </span>
                  <SmartLink :text="host.name" :href="host.link || host.href || null" />
                  <span v-if="index < normalizedHosts.length - 1">;&nbsp;</span>
                </template>
              </div>
            </div>
          </div>
        </div>

        <div class="w-[20%] text-[12px] text-gray-500 flex flex-col items-end text-right">
          <span><v-icon size="14">mdi-calendar</v-icon> {{ other.date }}</span>

          <div class="flex flex-col items-end mt-1">
            <div v-if="other.mode || displayLocation" class="mt-1 flex items-center justify-end gap-1 min-w-0">
              <v-icon v-if="other.mode === 'Online'" size="14">mdi-web</v-icon>

              <v-img v-else-if="other.mode === 'Offline'" :src="inPersonIcon" alt="In-Person Icon" width="14"
                height="14" class="d-inline-block" contain />

              <v-icon v-else-if="other.mode === 'Hybrid'" size="14">mdi-source-branch</v-icon>

              <span v-if="other.mode">{{ other.mode }}</span>

              <template v-if="displayLocation">
                <span v-if="other.mode" class="text-gray-400">|</span>
                <v-icon size="14">mdi-map-marker</v-icon>
                <span class="truncate" :title="displayLocation">{{ displayLocation }}</span>
              </template>
            </div>

            <a v-if="externalLink" :href="externalLink" target="_blank" rel="noopener noreferrer"
              class="mt-1 inline-flex items-center justify-end gap-1 text-blue-600 hover:text-blue-700">
              <span>See Details</span>
              <v-icon size="14">mdi-open-in-new</v-icon>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import SmartLink from '@/components/SmartLink.vue'


import inPersonIcon from '@/assets/icons/persons-in-a-class-by-flaticon.png'

const props = defineProps({
  other: {
    type: Object,
    required: true
  }
})

const normalizedType = computed(() => props.other?.type?.trim().toLowerCase() || '')

const isWebinarType = computed(() => {
  return normalizedType.value === 'webiner' || normalizedType.value === 'webinar'
})

const borderClass = computed(() => {
  return isWebinarType.value
    ? 'border-green-500'
    : 'border-yellow-400'
})

const typeToneClass = computed(() => {
  return isWebinarType.value
    ? 'bg-green-50/40 text-green-700'
    : 'bg-yellow-50/40 text-yellow-700'
})

const normalizedHosts = computed(() => {
  const host = props.other?.host

  if (Array.isArray(host)) {
    return host
      .map(entry => {
        if (typeof entry === 'string') {
          return { name: entry, department: '', location: '', link: null, href: null }
        }
        return {
          name: entry?.name || '',
          department: entry?.department || '',
          location: entry?.location || '',
          link: entry?.link || null,
          href: entry?.href || null,
        }
      })
      .filter(entry => entry.name)
  }

  if (typeof host === 'string') {
    return [{ name: host, department: '', location: '', link: null, href: null }]
  }

  if (host?.name) {
    return [{
      name: host.name,
      department: host.department || '',
      location: host.location || '',
      link: host.link || null,
      href: host.href || null,
    }]
  }

  return []
})

const externalLink = computed(() => props.other?.link || props.other?.cred_link || null)

const displayLocation = computed(() => {
  return props.other?.location || normalizedHosts.value[0]?.location || ''
})
</script>

<style scoped>
.vertical-type-label {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  line-height: 1;
}
</style>
