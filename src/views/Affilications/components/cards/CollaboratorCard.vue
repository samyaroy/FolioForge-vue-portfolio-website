<template>
  <!-- Three short lines: name and dates; role, organisations and place; the
       projects. No photo, so each card stays about as tall as its text. The
       frame is the workshop card's: a coloured bar down the left edge. -->
  <article :class="barClass" class="border-l-4 bg-white rounded-lg pl-5 pr-4 py-3 hover:shadow-md transition-shadow duration-200 space-y-1">
    <div class="flex flex-wrap items-center justify-between gap-x-4">
      <!-- The name stays plain text. When hyperlinkMetadata.yml has a page for
           the person, the icon after it is the link: the LinkedIn logo for a
           LinkedIn profile, the external-link arrow for anything else. -->
      <h3 class="text-base font-semibold text-slate-900">
        {{ name }}<a
          v-if="profile"
          :href="profile.href"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="profile.label"
          :title="profile.label"
          class="ml-1.5 inline-flex items-center align-[-0.125em] text-[#4e7397] transition-colors duration-200 hover:text-[#1980e6]"
        ><v-icon v-if="profile.linkedin" size="16">mdi-linkedin</v-icon><AnimatedIcon v-else name="external-link" :size="13" /></a>
      </h3>
      <span v-if="collaborator.period" class="text-sm text-gray-500 whitespace-nowrap">
        {{ collaborator.period }}
      </span>
    </div>

    <div v-if="role || affiliations.length || collaborator.location" class="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-sm">
      <span v-if="role" class="font-medium text-slate-700">{{ role }}</span>
      <!-- One icon for all of them; several organisations read as a list. -->
      <span v-if="affiliations.length" class="inline-flex items-start gap-1 text-gray-600">
        <v-icon size="16" class="mt-0.5 text-[#4e7397]">mdi-domain</v-icon>
        <span>{{ affiliations.join(' · ') }}</span>
      </span>
      <span v-if="collaborator.location" class="inline-flex items-center gap-1 text-gray-500">
        <v-icon size="16" class="text-[#4e7397]">mdi-map-marker</v-icon>
        {{ collaborator.location }}
      </span>
    </div>

    <!-- A dot between titles, since some titles carry their own commas. A title
         that has a card elsewhere on the site links to it; the rest stay text. -->
    <p v-if="projects.length" class="text-sm text-gray-600">
      <span class="text-[#0e141b]">Projects/Papers:</span><template v-for="(project, index) in projects" :key="`${index}-${project.title}`">{{ index ? ' · ' : ' ' }}<RouterLink v-if="project.to" :to="project.to" class="text-[#1980e6] hover:underline">{{ project.title }}</RouterLink><span v-else>{{ project.title }}</span></template>
    </p>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import AnimatedIcon from '@/components/ui/AnimatedIcon.vue'
import { isFeatureEnabled } from '@/config/featureFlags'
import { projectCardRoute } from '@/config/projectAnchors'
import { collaboratorKind } from '@/utils/collaboratorGroups'
import { isLinkedInUrl } from '@/utils/collaborators'
import { resolveHyperlink } from '@/utils/resolveHyperlink'

const props = defineProps({
  collaborator: {
    type: Object,
    required: true,
  },
})

const text = value => (typeof value === 'string' ? value.trim() : '')

// Light blue for mentors and guides, light green for peers. With the flag off
// every card gets a plain grey bar: not the steel of the page-quote box below
// the tab, which a card should not be mistaken for.
const showGroupColors = isFeatureEnabled('showAffiliations.showCollaborators.showGroupColors')
const barClass = computed(() => {
  if (!showGroupColors) return 'border-slate-300'
  return collaboratorKind(props.collaborator) === 'mentor' ? 'border-blue-400' : 'border-emerald-300'
})

// One value or a list of them, as the content writes either.
const list = value => (Array.isArray(value) ? value : [value]).map(text).filter(Boolean)

const name = computed(() => text(props.collaborator?.name) || 'Collaborator')

// The person's page from hyperlinkMetadata.yml, if they have one.
const profile = computed(() => {
  const href = resolveHyperlink(name.value, 'Person')
  if (!href) return null
  const linkedin = isLinkedInUrl(href)
  return { href, linkedin, label: linkedin ? `${name.value} on LinkedIn` : `${name.value}'s page` }
})

// What the person was to you, in your words: "Thesis supervisor", "Co-author".
const role = computed(() => text(props.collaborator?.role))

// Someone can belong to more than one place: a lab and the institute it sits
// in, or a university and a company they consult for.
const affiliations = computed(() => list(props.collaborator?.affiliation))

const projects = computed(() =>
  list(props.collaborator?.projects).map(title => ({ title, to: projectCardRoute(title) })),
)
</script>
