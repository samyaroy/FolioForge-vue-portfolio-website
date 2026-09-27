<template>
  <div class="relative grid grid-cols-[40px_1fr] gap-x-2 px-4 py-0">
    <!-- Timeline line -->
    <div class="absolute left-[35px] w-px bg-gray-300" :class="{
      'top-1/4 bottom-1': isfirst,          // cut top half if first
      'top-0 bottom-0': islast,           // cut bottom half if last
      'top-0 bottom-0': !isfirst && !islast // full line otherwise
    }"></div>

    <!-- Timeline icon -->
    <div class="flex flex-col items-center pt-0 pb-0 relative z-5">
      <div class="bg-white p-1 rounded-full">
        <v-icon :class="iconColor" size="24">{{ icon }}</v-icon>
      </div>
    </div>

    <!-- Right column: content -->
    <div class="flex flex-1 flex-col py-0 relative z-10">
      <!-- Role and dates sit on one line from `sm` up; on a phone the date drops
           below the title rather than squeezing it into a couple of words. -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <p class="text-[#0e141b] text-base font-medium leading-normal">
          {{ title }}
          <span v-if="cred_link" class="inline-block ml-1 align-middle">
            <DocumentViewer :src="cred_link" />
          </span>
        </p>
        <p class="text-[#4e7397] text-sm font-normal sm:shrink-0">{{ time }}</p>
      </div>

      <div class="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 mt-1">
        <div class="flex min-w-0 flex-1 basis-full sm:basis-0 items-center gap-2">
          <v-icon class="text-[#4e7397] shrink-0" size="16">mdi-domain</v-icon>
          <p class="text-[#4e7397] text-sm">
            <SmartLink :text="organization" />
          </p>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <v-icon class="text-[#4e7397] shrink-0" size="16">mdi-map-marker</v-icon>
            <p class="text-[#4e7397] text-sm">{{ location }}</p>
          </div>
        </div>
      </div>
      <div v-if="supervisor" class="flex items-center gap-2 mt-1">
        <v-icon class="text-[#4e7397]" size="16">mdi-account-tie</v-icon>
        <p class="text-[#4e7397] text-sm">Supervisor:
          <SmartLink v-if="supervisor.name" :type="'Person'" :text="supervisor.name" /><span v-if="supervisor.title">,
            {{ supervisor.title }}</span><span v-if="supervisor.department">, {{ supervisor.department }}</span><span
            v-if="supervisor.institution">, {{ supervisor.institution }}</span>
        </p>
      </div>

      <!-- On a phone the nowrap label plus a 1fr list leaves the project titles
           a couple of words wide, so the list drops under the label there and
           only shares its row from `sm` up. -->
      <div v-if="projects" class="grid grid-cols-[auto_1fr] sm:grid-cols-[auto_auto_1fr] gap-x-2 mt-1 items-start">
        <!-- Icon -->
        <v-icon class="text-[#4e7397] mt-[2px]" size="16">
          mdi-puzzle-outline
        </v-icon>

        <!-- Label -->
        <span class="text-[#4e7397] text-sm font-medium whitespace-nowrap">
          Projects:
        </span>

        <!-- Project list -->
        <ul class="col-start-2 sm:col-start-3 grid gap-1 text-[#4e7397] text-sm">
          <li v-for="(project, index) in projects" :key="index" class="leading-tight">
            <div>
              <span> &bull; </span><SmartLink :text="projectTitle(project)" />
            </div>
            <div v-if="projectPrincipalInvestigator(project)" class="ml-4 mt-0.5 flex items-start gap-1 text-xs text-[#5f7f9d]">
              <v-icon class="text-[#5f7f9d] mt-[1px] shrink-0" size="14">mdi-account-school</v-icon>
              <span>
                PI: 
                <SmartLink :type="'Person'" :text="projectPrincipalInvestigator(project)[0]"/>, 
                <SmartLink :type="'Person'" :text="projectPrincipalInvestigator(project)[1]"/>
              </span>
            </div>
          </li>
        </ul>
      </div>
      <div v-if="department" class="flex items-center gap-2 mt-1">
        <v-icon class="text-[#4e7397]" size="16">mdi-office-building-marker
        </v-icon>
        <p class="text-[#4e7397] text-sm">Department: {{ department }}</p>
      </div>




      <!-- Description -->
      <div class="col-span-2 px-0 sm:px-6 pb-4 sm:pb-6 mt-1 relative" v-if="description">
        <template v-for="(block, index) in descriptionBlocks" :key="index">
          <!-- flow-root so the cross-reference's float is contained by the
               line it belongs to instead of escaping the card. -->
          <p v-if="block.kind === 'point'" class="content-justify text-[#0e141b] text-sm flow-root"><v-icon
              class="text-[#4e7397]" size="16">mdi-circle-small</v-icon>
            <SmartLink :text="block.text" />
            <CrossReferenceLink v-if="block.reference" :reference="block.reference" />
          </p>
          <!-- SUB-BULLET FEATURE (unused) - start. No content authors a "- "
               line today, so this branch never renders. A run of sub-bullets is
               one numbered list laid out in a row, wrapping when the row runs
               out. Delete this <ol> and the block model with it. -->
          <ol v-else class="pl-5 sm:pl-6 flex flex-wrap gap-x-7 gap-y-0.5">
            <li v-for="(item, position) in block.items" :key="position" class="text-[#0e141b] text-sm">
              <span class="text-[#4e7397] mr-1">{{ position + 1 }}.</span>
              <SmartLink :text="item.text" />
              <CrossReferenceLink v-if="item.reference" :reference="item.reference" />
            </li>
          </ol>
          <!-- SUB-BULLET FEATURE (unused) - end -->
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import SmartLink from '@/components/SmartLink.vue'
import CrossReferenceLink from '@/components/CrossReferenceLink.vue'
import DocumentViewer from '@/components/DocumentViewer.vue'
// SUB-BULLET FEATURE (unused): drop this import and render `description`
// directly again if the feature goes.
import { descriptionBlocks as toBlocks } from '@/utils/bulletLines'
import { splitCrossReference } from '@/utils/crossReference'

const projectTitle = (project) => {
  return typeof project === 'string' ? project : project?.title
}

const projectPrincipalInvestigator = (project) => {
  const pi = typeof project === 'string' ? null : project?.principal_investigator

  if (!pi) {
    return null
  }

  if (typeof pi === 'string') {
    return pi
  }

  return [pi.name, [ pi.title, pi.department, pi.institution].filter(Boolean).join(', ')]
}

const props = defineProps({
  isfirst: { type: Boolean, default: false },
  islast: { type: Boolean, default: false },
  title: { type: String, required: true },
  time: { type: String, required: true },
  organization: { type: String, required: true },
  supervisor: { type: Object, default: null },
  department: { type: String, default: null },
  projects: { type: Array, default: null },
  location: { type: String, required: true },
  description: { type: Array, default: null },
  icon: { type: String, default: 'mdi-school' },
  iconColor: { type: String, default: 'text-[#1980e6]' },
  // One URL, or a list of { label, url } documents shown as tabs in DocumentViewer.
  cred_link: { type: [String, Array, Object], default: '#' }
})

// SUB-BULLET FEATURE (unused): a description line opening with "- " belongs
// under the point above it. With no such line authored, every block is a point.
//
// Each line is then split from the trailing @see it may carry, so the sentence
// and its cross-reference are drawn as two things on one line.
const descriptionBlocks = computed(() => toBlocks(props.description ?? []).map(block =>
  block.kind === 'point'
    ? { ...block, ...splitCrossReference(block.text) }
    : { ...block, items: block.items.map(splitCrossReference) },
))
</script>
