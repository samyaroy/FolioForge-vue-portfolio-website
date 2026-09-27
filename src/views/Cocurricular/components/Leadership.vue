<template>
  <div class="border-l-4 border-[#1980e6] pl-4 sm:pl-6 py-4 pr-4 rounded-md bg-slate-50">
    <div v-if="showEntryRole" class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-2">
      <h3 class="text-lg font-semibold text-[#0e141b]">
        {{ leadership.role }}
        <span v-if="leadership.cred_link" class="inline-block ml-2 align-middle">
          <DocumentViewer :src="leadership.cred_link" />
        </span>
      </h3>
    </div>

    <!-- Affiliations as a timeline: one node per organization, so a role held
         across two places reads as a sequence rather than two loose rows. The
         rail column is shared by every row, which is what keeps the left edge
         of the content straight. -->
    <div class="grid grid-cols-[18px_minmax(0,1fr)] gap-x-2 mb-2">
      <template v-for="(affiliation, index) in affiliations" :key="index">
        <div class="flex flex-col items-center">
          <div class="w-[1.5px] h-2" :class="showTimeline && index > 0 ? 'bg-[#d0dbe7]' : 'bg-transparent'"></div>
          <div
            v-if="showTimeline"
            class="h-2.5 w-2.5 shrink-0 rounded-full border-[1.5px] border-[#1980e6] bg-white"
          ></div>
          <div class="w-[1.5px] grow" :class="showTimeline && index < affiliations.length - 1 ? 'bg-[#d0dbe7]' : 'bg-transparent'"></div>
        </div>

        <div class="pb-2 last:pb-0">
          <!-- A named role heads its own node and takes the period with it;
               otherwise the period belongs on the organisation row, beside what
               it describes rather than floating above it. -->
          <div v-if="affiliation.role" class="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
            <!-- With the entry heading suppressed, these roles are the card's
                 headings, so they carry the heading's size. -->
            <p class="text-lg font-semibold text-[#0e141b]">
              {{ affiliation.role }}
              <span v-if="affiliation.cred_link" class="inline-block ml-1.5 align-middle">
                <DocumentViewer :src="affiliation.cred_link" />
              </span>
            </p>
            <span v-if="affiliation.time_period" class="text-sm text-gray-500 sm:ml-auto shrink-0">{{ affiliation.time_period }}</span>
          </div>

          <div class="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
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
              <v-icon small class="text-[#1980e6]">mdi-domain</v-icon>
              <span v-if="affiliation.host.web_link" class="text-gray-700">
                <a :href="affiliation.host.web_link" target="_blank" rel="noopener" class="text-[#1980e6] hover:underline text-sm">
                  {{ affiliation.host.name }}
                </a>
              </span>
              <span v-else class="text-gray-700">{{ affiliation.host.name }}</span>
            </div>

            <div v-if="affiliation.institute" class="flex items-center space-x-1">
              <v-icon small class="text-[#1980e6]">mdi-town-hall</v-icon>
              <span class="text-gray-700">
                <SmartLink type="Institution" :text="affiliation.institute" />
              </span>
            </div>

            <span v-if="!affiliation.role && affiliation.time_period" class="text-sm text-gray-500 md:ml-auto shrink-0">
              {{ affiliation.time_period }}
            </span>
          </div>
        </div>
      </template>

      <!-- Description and skills sit in the content column, so every line in
           the card starts at the same place. -->
      <p v-if="leadership.description" class="col-start-2 content-justify text-gray-700 mb-2">
        <SmartLink type="Person" :text="leadership.description" />
      </p>
      <div v-if="skills.length" class="col-start-2 flex flex-wrap gap-2">
        <span
          v-for="skill in skills"
          :key="skill"
          class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
        >
          {{ skill }}
        </span>
      </div>
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
    // A per-affiliation role, when the entry names one: a single role held at
    // two organizations reads differently from two distinct roles.
    role: affiliation.role || '',
    cred_link: affiliation.cred_link || null,
    name: affiliation.organization?.name || '',
    link: affiliation.organization?.web_link || '',
    host: affiliation.host || null,
    institute: affiliation.institute || '',
    time_period: affiliation.time_period || ''
  }))
)

// One affiliation needs no timeline; a sequence of them does.
const showTimeline = computed(() => affiliations.value.length > 1)

// When every affiliation names its own role, repeating the entry's role above
// them would say the same thing twice — and say it wrongly, since the nodes may
// hold different titles.
const showEntryRole = computed(() => !affiliations.value.length || affiliations.value.some(affiliation => !affiliation.role))

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
