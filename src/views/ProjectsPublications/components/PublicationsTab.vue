<template>
  <div class="bg-white rounded-lg shadow-sm p-8">
    <h2 class="text-2xl font-bold text-[#0e141b] mb-6">Research Publications</h2>
    <div v-if="publicationsByYear.length">
      <div v-for="yearGroup in publicationsByYear" :key="yearGroup.year" class="mb-12 last:mb-0">
        <div class="mb-6 flex items-center gap-4">
          <span class="text-lg font-semibold text-gray-400">{{ yearGroup.year }}</span>
          <div class="h-px flex-1 bg-gray-200"></div>
        </div>

        <div class="space-y-6">
          <div
            v-for="(publication, index) in yearGroup.items"
            :key="publication.id || publication.title || index"
            class="border-l-4 border-[#1980e6] pl-6 py-4 pr-4 rounded-md bg-slate-50"
          >
            <div class="flex flex-col gap-4 md:flex-row md:items-stretch md:gap-8">
              <div
                v-if="getLogos(publication.logo).length"
                class="flex shrink-0 items-center justify-start gap-3 md:w-36 md:justify-center"
              >
                <img
                  v-for="logo in getLogos(publication.logo)"
                  :key="logo"
                  :src="getLogoPath(logo)"
                  :alt="logo"
                  :title="logo"
                  class="max-h-12 w-auto object-contain opacity-90 md:max-h-20"
                >
              </div>

              <div class="min-w-0 flex-1">
                <h3 class="text-lg font-semibold text-[#0e141b] mb-2">{{ publication.title }}</h3>
                <div class="mb-3 flex flex-wrap gap-x-6 gap-y-2">
                  <p v-if="publication.authors"
                    class="flex w-full min-w-0 items-center gap-2 text-gray-600 md:w-max md:max-w-full md:min-w-[calc(50%_-_0.75rem)] md:flex-[1_1_auto]">
                    <v-icon size="16" class="shrink-0">mdi-account-multiple-outline</v-icon>
                    <span class="min-w-0 break-words">{{ publication.authors }}</span>
                  </p>

                  <p v-if="publication.journal || publication.year"
                    class="flex w-full min-w-0 items-center gap-2 text-sm text-gray-500 md:w-max md:max-w-full md:min-w-[calc(50%_-_0.75rem)] md:flex-[1_1_auto]">
                    <v-icon size="16" class="shrink-0">mdi-book-open-page-variant-outline</v-icon>
                    <span class="min-w-0 break-words">
                      {{ getPublicationInfo(publication) }}
                    </span>
                  </p>

                  <p v-if="publication.doi"
                    class="flex w-full min-w-0 items-center gap-1 text-xs text-gray-600 md:w-max md:max-w-full md:min-w-[calc(50%_-_0.75rem)] md:flex-[1_1_auto]">
                    <v-icon size="14" class="shrink-0">mdi-identifier</v-icon>
                    <span class="shrink-0">DOI:</span>
                    <a
                      :href="getDoiUrl(publication.doi)"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="min-w-0 break-all text-[#1980e6] hover:underline"
                      :title="getDoiLabel(publication.doi)"
                    >
                      {{ getDoiLabel(publication.doi) }}
                    </a>
                  </p>

                  <p v-if="publication.link"
                    class="flex w-full min-w-0 items-center gap-1 text-xs text-gray-600 md:w-max md:max-w-full md:min-w-[calc(50%_-_0.75rem)] md:flex-[1_1_auto]">
                    <v-icon size="14" class="shrink-0">mdi-link-variant</v-icon>
                    <span class="shrink-0">Link:</span>
                    <a
                      :href="publication.link"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="min-w-0 break-all text-[#1980e6] hover:underline"
                      :title="publication.link"
                    >
                      {{ getPublicationLinkLabel(publication.link) }}
                    </a>
                  </p>
                </div>
              </div>
            </div>
            <p v-if="getPublicationTags(publication.tags)" class="mt-3 text-xs text-gray-600">
              <v-icon size="14">mdi-tag-outline</v-icon>
              <span class="px-2">{{ getPublicationTags(publication.tags) }}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-center text-gray-500 italic space-y-6">
      No Publications Yet
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  publications: {
    type: Array,
    default: () => []
  }
})

const getPublicationYear = (publication) => {
  const match = String(publication?.year ?? publication?.date ?? '').match(/\d{4}/)
  return match ? match[0] : 'Unknown'
}

const publicationsByYear = computed(() => {
  const grouped = {}

  const items = Array.isArray(props.publications) ? props.publications : []

  items.forEach((publication) => {
    const year = getPublicationYear(publication)
    if (!grouped[year]) grouped[year] = []
    grouped[year].push(publication)
  })

  return Object.keys(grouped)
    .sort((a, b) => {
      if (a === 'Unknown') return 1
      if (b === 'Unknown') return -1
      return Number(b) - Number(a)
    })
    .map(year => ({ year, items: grouped[year] }))
})

const getLogos = (logo) => {
  if (Array.isArray(logo)) {
    return logo.filter(item => typeof item === 'string' && item.trim())
  }

  if (typeof logo === 'string' && logo.trim()) {
    return [logo.trim()]
  }

  return []
}

const getLogoPath = (logo) => `/logo/${logo}.png`

const getPublicationInfo = (publication) => (
  [publication?.journal, publication?.year]
    .filter(value => value !== undefined && value !== null && String(value).trim())
    .join(', ')
)

const getPublicationLinkLabel = (link) => (
  typeof link === 'string'
    ? link.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '')
    : ''
)

const getPublicationTags = (tags) => {
  if (Array.isArray(tags)) {
    return tags
      .map(tag => String(tag).trim())
      .filter(Boolean)
      .join(', ')
  }

  if (typeof tags === 'string') {
    return tags.trim()
  }

  return ''
}

const getDoiLabel = (doi) => (
  typeof doi === 'string'
    ? doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').trim()
    : ''
)

const getDoiUrl = (doi) => {
  if (typeof doi !== 'string') return ''

  const trimmedDoi = doi.trim()

  if (/^https?:\/\//i.test(trimmedDoi)) {
    return trimmedDoi
  }

  return `https://doi.org/${trimmedDoi}`
}
</script>
