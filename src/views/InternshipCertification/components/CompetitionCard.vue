<template>
  <!-- Same frame as InternshipCard, so the three tabs read as one page. The
       placing gets the trophy badge beside Solo/Team and the certificate; the
       competition's own link sits in the bottom-right corner. -->
  <div class="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow duration-300">
    <div class="flex flex-wrap items-start justify-between gap-y-2 mb-2">
      <!-- Title and category on one line, each keeping its own size. On a
           phone the category sits under the title instead, without the dash,
           so the dash never dangles at the end of a wrapped line. -->
      <div class="flex w-full min-w-0 flex-col sm:w-auto sm:flex-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-2">
        <h3 class="text-xl font-bold text-[#0e141b]">{{ competition.title }}</h3>
        <template v-if="competition.category">
          <span class="hidden text-sm text-gray-400 sm:inline" aria-hidden="true">-</span>
          <span class="text-sm text-gray-500">{{ competition.category }}</span>
        </template>
      </div>
      <div class="ml-0 sm:ml-4 flex shrink-0 flex-wrap items-start gap-2">
        <span v-if="competition.result"
          class="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-amber-100 text-amber-800 rounded-full">
          <v-icon size="14">mdi-trophy</v-icon>
          {{ competition.result }}
        </span>
        <span v-if="competition.prize"
          class="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full"
          :title="`Prize: ${competition.prize}`">
          <v-icon size="14">mdi-cash</v-icon>
          {{ competition.prize }}
        </span>
        <span v-if="competition.type"
          class="inline-block px-3 py-1 text-xs font-medium bg-[#1980e6] text-white rounded-full">
          {{ competition.type }}
        </span>
      </div>
    </div>

    <!-- The details on the left; the competition's link sits in the card's
         bottom-right corner, level with whatever line comes last, so it adds
         no height of its own. -->
    <div class="flex items-end justify-between gap-4">
      <div class="min-w-0 flex-1">
        <div v-if="competition.event || competition.host" class="flex items-start gap-2 text-[#4e7397] text-sm mb-1">
          <v-icon size="16" class="mt-[2px]">mdi-flag-checkered</v-icon>
          <span>
            <span v-if="competition.event" class="font-medium">{{ competition.event }}</span>
            <template v-if="competition.event && competition.host">, </template>
            <SmartLink v-if="competition.host" type="Institute" :text="competition.host" />
          </span>
        </div>

        <!-- Location and date share a line, as on the internship cards. -->
        <div v-if="competition.location || competition.date" class="flex flex-wrap items-start gap-x-4 gap-y-1 text-[#4e7397] text-sm mb-1">
          <div v-if="competition.location" class="flex items-start gap-2">
            <v-icon size="16">mdi-map-marker</v-icon>
            <span>{{ competition.location }}</span>
          </div>
          <div v-if="competition.date" class="flex items-start gap-2">
            <v-icon size="16">mdi-calendar</v-icon>
            <span>{{ competition.date }}</span>
          </div>
        </div>

        <!-- The team's name and its members side by side, wrapping onto two lines
             only when the card is too narrow. -->
        <div v-if="competition.team_name || competition.collaborators" class="flex flex-wrap items-start gap-x-10 gap-y-1 text-sm mb-1">
          <div v-if="competition.team_name" class="flex items-start gap-2 text-gray-600">
            <v-icon size="16" class="mt-[2px]">mdi-account-group</v-icon>
            <span><span class="font-medium">Team:</span> {{ competition.team_name }}</span>
          </div>
          <CollaboratorList :collaborators="competition.collaborators" label="Team members" :icon-size="16" />
        </div>

        <div v-if="descriptionLines.length" class="mt-3">
          <p v-for="(line, index) in descriptionLines" :key="index" class="content-justify text-[#0e141b] text-sm flow-root">
            <v-icon class="text-[#4e7397]" size="16">mdi-circle-small</v-icon>
            <SmartLink :text="line" />
          </p>
        </div>
      </div>
      <!-- Certificate, gallery post and competition page, in that order. -->
      <div v-if="hasCertificate || competition.gallery || competitionLink" class="flex shrink-0 items-center gap-2">
        <span v-if="hasCertificate" title="View certificate"
          class="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-[#1980e6] shadow">
          <DocumentViewer :src="competition.cred_link" :size="16" />
        </span>
        <GalleryLink :item-id="competition.gallery" />
        <a v-if="competitionLink" :href="competitionLink" target="_blank" rel="noopener noreferrer"
          :aria-label="`${competition.title} on ${isKaggle ? 'Kaggle' : 'the web'}`"
          :title="isKaggle ? 'View on Kaggle' : 'View competition'"
          class="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-[#1980e6] text-[#1980e6] shadow transition hover:bg-[#1980e6] hover:text-white">
          <svg v-if="isKaggle" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" class="size-4" aria-hidden="true">
            <path fill="currentColor"
              d="M464.2 565.5L318.4 384.3L458.2 249C460.8 246.3 459.9 238.5 452.9 238.5L383.7 238.5C380.2 238.5 376.7 240.3 373.2 243.8L240.9 377.5L240.9 71.5C240.9 66.5 238.4 64 233.4 64L181.5 64C176.5 64 174 66.5 174 71.5L174 568.5C174 573.5 176.5 576 181.5 576L233.4 576C238.4 576 240.9 573.5 240.9 568.5L240.9 459.5L271.7 430.2L382.2 570.8C385.2 574.3 388.7 576.1 392.7 576.1L459.6 576.1C463.1 576.1 465.1 575.1 465.6 573.1L464.2 565.5z" />
          </svg>
          <v-icon v-else size="16">mdi-open-in-new</v-icon>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import SmartLink from '@/components/SmartLink.vue'
import DocumentViewer from '@/components/DocumentViewer.vue'
import CollaboratorList from '@/components/CollaboratorList.vue'
import GalleryLink from '@/components/GalleryLink.vue'

const props = defineProps({
  competition: {
    type: Object,
    required: true
  }
})

// `cred_link` is one link, a list, or labelled links, as DocumentViewer takes
// it; the frame around the viewer's icon shows only when there is one.
const hasCertificate = computed(() => {
  const value = props.competition.cred_link
  if (Array.isArray(value)) return value.some(Boolean)
  if (value && typeof value === 'object') return Object.values(value).some(Boolean)
  return Boolean(String(value ?? '').trim())
})

// Only a web address becomes a link; anything else in `link` is ignored.
const competitionLink = computed(() => {
  const value = String(props.competition.link ?? '').trim()
  return /^https?:\/\//i.test(value) ? value : ''
})

const isKaggle = computed(() => {
  try {
    const host = new URL(competitionLink.value).hostname.replace(/^www\./, '')
    return host === 'kaggle.com' || host.endsWith('.kaggle.com')
  } catch {
    return false
  }
})

// A description is one line or a list of them; each line becomes a bullet.
const descriptionLines = computed(() => {
  const description = props.competition.description
  if (!description) return []
  return (Array.isArray(description) ? description : [description]).filter(Boolean)
})
</script>
