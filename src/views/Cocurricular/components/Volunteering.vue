<template>
  <div class="border-l-4 border-green-500 pl-4 sm:pl-5 py-2.5 pr-4 rounded-md bg-slate-50 text-sm">
    <!-- Roles as a timeline, the same rail the leadership card uses. One role
         renders as a single node without a dot; several read as a sequence. -->
    <div class="grid grid-cols-[18px_minmax(0,1fr)] gap-x-2">
      <template v-for="(entry, index) in roles" :key="index">
        <div class="flex flex-col items-center">
          <div class="w-[1.5px] h-2" :class="showTimeline && index > 0 ? 'bg-[#d0dbe7]' : 'bg-transparent'"></div>
          <div
            v-if="showTimeline"
            class="h-2.5 w-2.5 shrink-0 rounded-full border-[1.5px] border-green-500 bg-white"
          ></div>
          <div class="w-[1.5px] grow" :class="showTimeline && index < roles.length - 1 ? 'bg-[#d0dbe7]' : 'bg-transparent'"></div>
        </div>

        <div class="pb-2 last:pb-0">
          <!-- Role, its credential, and the period it ran for -->
          <div class="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
            <h3 class="text-lg font-semibold text-[#0e141b]">
              {{ entry.role }}
              <span v-if="entry.cred_link" class="inline-block ml-1.5 align-middle">
                <DocumentViewer :src="entry.cred_link" />
              </span>
            </h3>
            <span v-if="entry.time_period" class="text-sm text-gray-500 sm:ml-auto shrink-0">
              {{ entry.time_period }}
            </span>
          </div>

          <p v-if="entry.organization" class="text-gray-700 flex items-start gap-1.5">
            <v-icon size="16" class="text-[#1980e6] mt-0.5">mdi-domain</v-icon>
            <SmartLink :type="'Institution'" :text="entry.organization" />
          </p>

          <!-- Fields get a rail of their own when a role ran several of them:
               two internship programmes under one mentorship are a sequence in
               the same way two roles are. A single field keeps its tag icon,
               which is a label rather than a step. -->
          <div v-if="entry.fields.length" class="mt-0.5 grid grid-cols-[18px_minmax(0,1fr)] gap-x-1.5">
            <template v-for="(field, fieldIndex) in entry.fields" :key="fieldIndex">
              <div class="flex flex-col items-center">
                <div class="w-[1.5px] h-1.5" :class="entry.showFieldTimeline && fieldIndex > 0 ? 'bg-[#d0dbe7]' : 'bg-transparent'"></div>
                <div
                  v-if="entry.showFieldTimeline"
                  class="h-2 w-2 shrink-0 rounded-full border-[1.5px] border-green-500 bg-white"
                ></div>
                <v-icon v-else size="14" class="text-gray-400">mdi-tag-outline</v-icon>
                <div class="w-[1.5px] grow" :class="entry.showFieldTimeline && fieldIndex < entry.fields.length - 1 ? 'bg-[#d0dbe7]' : 'bg-transparent'"></div>
              </div>

              <div class="flex items-start justify-between gap-4 pb-0.5">
                <p class="text-gray-600">{{ field.sub_field }}</p>
                <div v-if="field.periods.length" class="text-sm text-gray-500 flex flex-col items-end shrink-0">
                  <span v-for="(period, periodIndex) in field.periods" :key="periodIndex">{{ period }}</span>
                </div>
              </div>
            </template>
          </div>

          <div v-if="entry.skills" class="mt-1.5">
            <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">{{ entry.skills }}</span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import DocumentViewer from '@/components/DocumentViewer.vue'
import SmartLink from '@/components/SmartLink.vue'

const props = defineProps({
  volunteering: {
    type: Object,
    required: true
  }
})

// A sub_field may list several periods separated by ';'.
const readFields = source => (source.field || []).map(field => ({
  sub_field: field.sub_field || '',
  periods: (field.time_period || '')
    .split(';')
    .map(period => period.trim())
    .filter(Boolean)
}))

const readRole = source => {
  const fields = readFields(source)
  return {
    role: source.role || '',
    organization: source.organization || '',
    time_period: source.time_period || '',
    cred_link: source.cred_link || null,
    skills: source.skills || '',
    fields,
    showFieldTimeline: fields.length > 1
  }
}

// An entry either holds several roles that belong together — the same place,
// different jobs — or is a single role. Both become a list, so the card renders
// one way and the timeline appears only when there is a sequence to show.
const roles = computed(() =>
  Array.isArray(props.volunteering.roles) && props.volunteering.roles.length
    ? props.volunteering.roles.map(readRole)
    : [readRole(props.volunteering)]
)

const showTimeline = computed(() => roles.value.length > 1)
</script>
