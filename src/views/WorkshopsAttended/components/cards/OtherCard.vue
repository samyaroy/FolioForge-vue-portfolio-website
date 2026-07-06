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

      <div class="relative flex flex-1 min-w-0">
        <div :class="mainColumnClass">
          <div>
            <h3 class="text-md font-semibold text-[#0e141b]">
              {{ other.title }}
              <span v-if="credentialLink" class="inline-block ml-1 align-middle">
                <DocumentViewer :src="credentialLink" />
              </span>
            </h3>
          </div>

          <div>
            <p v-if="speakers.length" :class="['text-gray-600 mb-1 flex items-start', 'text-sm']">
              <v-icon size="14" class="mr-2 mt-0.5">mdi-account</v-icon>
              <span>Speaker:&nbsp;</span>
              <span v-if="stackSpeakers" class="flex flex-col">
                <span v-for="s in speakers" :key="s">
                  <SmartLink :text="s" type="Person" />
                </span>
              </span>
              <span v-else>
                <template v-for="(s, index) in speakers" :key="s">
                  <SmartLink :text="s" type="Person" />
                  <span v-if="index < speakers.length - 1">,&nbsp;</span>
                </template>
              </span>
            </p>

            <div v-if="normalizedHosts.length" class="text-gray-600 mb-1 flex items-start">
              <v-icon size="16" class="mr-2 mt-0.5">
                mdi-office-building
              </v-icon>

              <div class="flex-1 text-sm flex items-start min-w-0">
                <span class="font-medium shrink-0">Host:&nbsp;</span>
                <span class="min-w-0 flex-1 break-words">
                  <template v-for="(host, index) in normalizedHosts" :key="`${host.name}-${index}`">
                    <span v-if="host.department">{{ formatDepartments(host.department) }}, </span>
                    <SmartLink :text="host.name" :href="host.link || host.href || null" />
                    <span v-if="index < normalizedHosts.length - 1">;&nbsp;</span>
                  </template>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="hasMetaColumn" :class="metaColumnClass">
          <span v-if="other.date"><v-icon size="14">mdi-calendar</v-icon> {{ other.date }}</span>

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
import DocumentViewer from '@/components/DocumentViewer.vue'


import inPersonIcon from '@/assets/icons/persons-in-a-class-by-flaticon.png'

const props = defineProps({
  other: {
    type: Object,
    required: true
  }
})

// Speakers written as a YAML list ([] or -) render comma-separated on one
// line; a multi-line block string (|-) renders one speaker per line.
const speakers = computed(() => {
  const speaker = props.other?.speaker
  if (Array.isArray(speaker)) {
    return speaker.filter(Boolean)
  }
  if (typeof speaker === 'string') {
    return speaker.split('\n').map(s => s.trim()).filter(Boolean)
  }
  return []
})

const stackSpeakers = computed(() => {
  return typeof props.other?.speaker === 'string' && speakers.value.length > 1
})

const normalizedType = computed(() => props.other?.type?.trim().toLowerCase() || '')

const typeThemes = {
  webinar: {
    border: 'border-green-500',
    tone: 'bg-green-50/40 text-green-700'
  },
  webiner: {
    border: 'border-green-500',
    tone: 'bg-green-50/40 text-green-700'
  },
  seminar: {
    border: 'border-pink-500',
    tone: 'bg-red-50/50 text-pink-700'
  },
  lecture: {
    border: 'border-amber-500',
    tone: 'bg-amber-50/50 text-amber-700'
  },
  workshop: {
    border: 'border-violet-500',
    tone: 'bg-violet-50/50 text-violet-700'
  },
  conference: {
    border: 'border-cyan-500',
    tone: 'bg-cyan-50/50 text-cyan-700'
  },
  talk: {
    border: 'border-rose-500',
    tone: 'bg-rose-50/50 text-rose-700'
  },
}

const typeTheme = computed(() => {
  return typeThemes[normalizedType.value] || {
    border: 'border-slate-400',
    tone: 'bg-slate-50/60 text-slate-700'
  }
})

const borderClass = computed(() => {
  return typeTheme.value.border
})

const typeToneClass = computed(() => {
  return typeTheme.value.tone
})

function formatDepartments(department) {
  if (Array.isArray(department)) {
    return department.filter(Boolean).join(' / ')
  }

  return department || ''
}

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

const credentialLink = computed(() => props.other?.cred_link || '')

const externalLink = computed(() => props.other?.link || null)

const displayLocation = computed(() => {
  return props.other?.location || normalizedHosts.value[0]?.location || ''
})

const hasMetaColumn = computed(() => {
  return Boolean(props.other?.date || props.other?.mode || displayLocation.value || externalLink.value)
})

const mainColumnClass = computed(() => {
  return externalLink.value ? 'w-[80%] min-w-0' : 'w-full min-w-0'
})

const metaColumnClass = computed(() => {
  const baseClass = 'text-[12px] text-gray-500 flex flex-col items-end text-right'

  return externalLink.value
    ? `${baseClass} w-[20%]`
    : `${baseClass} absolute right-0 top-0 w-[20%] pointer-events-none`
})
</script>

<style scoped>
.vertical-type-label {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  line-height: 1;
}
</style>
