<template>
  <!-- Three short lines: name and dates; role, organisation and place; the
       projects. No photo, so each card stays about as tall as its text. -->
  <article class="bg-white border border-slate-200 rounded-lg px-4 py-3 shadow-sm hover:shadow-md transition-shadow space-y-1">
    <div class="flex flex-wrap items-center justify-between gap-x-4">
      <!-- The name links to the person's page when hyperlinkMetadata.yml has
           one, and only then gets the external-link icon. The icon opens the
           same page; it is hidden from screen readers and skipped by Tab, so
           the link is announced and focused once, on the name. -->
      <h3 class="text-base font-semibold text-slate-900">
        <SmartLink :text="name" :type="'Person'" /><a
          v-if="profileUrl"
          :href="profileUrl"
          target="_blank"
          rel="noopener noreferrer"
          tabindex="-1"
          aria-hidden="true"
          class="ml-1.5 inline-block align-middle text-[#4e7397] transition-colors duration-200 hover:text-[#1980e6]"
        ><AnimatedIcon name="external-link" :size="13" /></a>
      </h3>
      <span v-if="collaborator.period" class="text-sm text-gray-500 whitespace-nowrap">
        {{ collaborator.period }}
      </span>
    </div>

    <div v-if="role || collaborator.affiliation || collaborator.location" class="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-sm">
      <span v-if="role" class="font-medium text-slate-700">{{ role }}</span>
      <span v-if="collaborator.affiliation" class="inline-flex items-center gap-1 text-gray-600">
        <v-icon size="16" class="text-[#4e7397]">mdi-domain</v-icon>
        {{ collaborator.affiliation }}
      </span>
      <span v-if="collaborator.location" class="inline-flex items-center gap-1 text-gray-500">
        <v-icon size="16" class="text-[#4e7397]">mdi-map-marker</v-icon>
        {{ collaborator.location }}
      </span>
    </div>

    <!-- Plain text, a dot between titles: some titles carry their own commas. -->
    <p v-if="projects.length" class="text-sm text-gray-600">
      <span class="text-[#0e141b]">Projects:</span>
      {{ projects.join(' · ') }}
    </p>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import SmartLink from '@/components/SmartLink.vue'
import AnimatedIcon from '@/components/ui/AnimatedIcon.vue'
import { resolveHyperlink } from '@/utils/resolveHyperlink'
import { stripEmphasis } from '@/utils/inlineMarkup'

const props = defineProps({
  collaborator: {
    type: Object,
    required: true,
  },
})

const text = value => (typeof value === 'string' ? value.trim() : '')

const name = computed(() => text(props.collaborator?.name) || 'Collaborator')

// The same lookup SmartLink makes for the name, so the icon appears exactly
// when the name is a link.
const profileUrl = computed(() => resolveHyperlink(stripEmphasis(name.value), 'Person'))

// What the person was to you, in your words: "Thesis supervisor", "Co-author".
const role = computed(() => text(props.collaborator?.role))

// A list of titles; a single title written as plain text is one project.
const projects = computed(() => {
  const value = props.collaborator?.projects
  return (Array.isArray(value) ? value : [value]).map(text).filter(Boolean)
})
</script>
