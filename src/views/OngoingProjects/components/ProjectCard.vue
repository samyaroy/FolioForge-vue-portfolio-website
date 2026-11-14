<template>
  <!-- Two columns from md up: the project on the left, a preview of each of
       its links on the right. Phones stack the previews under the project, and
       a project with no links keeps the whole width. -->
  <div
    class="flex flex-col gap-5 border-l-4 border-[#10b981] py-4 pl-6 pr-4 hover:shadow-lg transition-all duration-300 rounded-lg bg-white hover:bg-green-50 text-sm md:flex-row">
    <div class="min-w-0 flex-1">
      <!-- Header -->
      <div class="flex items-start justify-between gap-4 mb-3">
        <div class="min-w-0 flex-1">
          <h3 class="min-w-0 text-lg font-semibold text-[#0e141b]">
            {{ project.title }}
          </h3>
        </div>

        <span v-if="project.time_period" class="shrink-0 whitespace-nowrap flex items-center gap-1 px-2 text-sm text-gray-500">
          <v-icon size="16">mdi-calendar-outline</v-icon>
          {{ project.time_period }}
        </span>
      </div>

      <!-- Meta Info -->
      <div class="space-y-2 mb-3">
        <p v-if="project.instructor" class="text-gray-600 flex items-center">
          <v-icon size="16" class="mr-2">mdi-account-tie</v-icon>
          <span class="font-medium mr-1">Instructor:</span>
          <SmartLink :text="project.instructor" type="Person" />
        </p>

        <p v-if="project.institution" class="text-gray-600 flex items-center">
          <v-icon size="16" class="mr-2">mdi-school</v-icon>
          <span class="font-medium mr-1">Institution:</span>
          <SmartLink :text="project.institution" type="Organization" />
        </p>

        <p v-if="project.duration" class="text-gray-600 flex items-center">
          <v-icon size="16" class="mr-2">mdi-clock-outline</v-icon>
          <span class="font-medium mr-1">Duration:</span>
          {{ project.duration }}
        </p>

        <!-- Affiliation -->
        <div v-if="project.affiliation" class="flex items-center gap-2">
          <v-icon class="text-[#4e7397]" size="16">mdi-domain</v-icon>
          <p class="text-[#4e7397] text-sm">
            Affiliation: <SmartLink :text="project.affiliation" type="Organization" />
          </p>
        </div>

        <CollaboratorList :collaborators="project.collaborators" :icon-size="16" />
      </div>

      <!-- Description -->
      <p v-if="project.description" class="content-justify text-gray-700 mb-3 text-sm leading-relaxed">
        {{ project.description }}
      </p>

      <!-- Tech stack, as one segmented strip like the Research Projects cards -->
      <div v-if="techStack.length" class="flex flex-wrap gap-px">
        <span v-for="tag in techStack" :key="tag"
          class="px-3 py-1 bg-blue-100 text-blue-800 text-xs first:rounded-l-md last:rounded-r-md">
          {{ tag }}
        </span>
      </div>
    </div>

    <!-- Link previews -->
    <aside v-if="links.length" class="flex w-full max-w-xs shrink-0 flex-col gap-3 md:w-52 lg:w-56" aria-label="Project links">
      <LinkPreview v-for="link in links" :key="link.url" :url="link.url" :kind="link.kind" />
    </aside>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import SmartLink from '@/components/SmartLink.vue'
import CollaboratorList from '@/components/CollaboratorList.vue'
import LinkPreview from './LinkPreview.vue'
import { ongoingProjectLinkCategories } from '@/config/projectLinkCategories'

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
})

const techStack = computed(() => {
  const value = props.project.tech_stack
  const tags = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : []
  return tags.map(tag => String(tag).trim()).filter(Boolean)
})

// One preview per link the card renders, in the category order.
const links = computed(() =>
  Object.keys(ongoingProjectLinkCategories)
    .map(kind => ({ kind, url: String(props.project.cred_link?.[kind] ?? '').trim() }))
    .filter(link => /^https?:\/\//i.test(link.url))
)
</script>
