<template>
  <div class="grid grid-cols-[40px_1fr] gap-x-2 px-4">
    <!-- Timeline Icon & Connector -->
    <div class="flex flex-col items-center gap-1" :class="{ 'pb-3': isLast, 'pt-2': isFirst }">
      <!-- Top connector -->
      <div v-if="!isFirst" class="w-[1.5px] bg-[#d0dbe7] h-2"></div>

      <!-- Icon -->
      <div class="text-[#0e141b]">
        <v-icon :class="iconColor" size="24">
          {{ icon }}
        </v-icon>
      </div>

      <!-- Bottom connector -->
      <div v-if="!isLast" class="w-[1.5px] bg-[#d0dbe7] h-2 grow"></div>
    </div>

    <!-- Education Content -->
    <div class="flex flex-1 flex-col py-3">
      <!-- Title + Document Viewer -->
      <div>
        <p class="text-[#0e141b] text-base font-medium leading-normal">
          {{ title }}
          <span v-if="subject">in {{ subject }}</span>
          <span v-if="canViewCurriculum" class="inline-block ml-2 align-middle">
            <v-tooltip text="View Curriculum" location="top">
              <template #activator="{ props: tooltipProps }">
                <v-icon
                  v-bind="tooltipProps"
                  size="16"
                  class="cursor-pointer text-[#4e7397] hover:text-[#1980e6] transition-colors"
                  @click="showCurriculumModal = true"
                >
                  mdi-information-variant-circle-outline
                </v-icon>
              </template>
            </v-tooltip>
          </span>

          <span v-if="cred_link" class="inline-block ml-4 align-middle">
            <DocumentViewer :src="cred_link" />
          </span>
        </p>
        <div v-if="subFields.length" class="mt-0.5 space-y-0.5">
          <div
            v-for="subFieldEntry in subFields"
            :key="`${subFieldEntry.label}:${subFieldEntry.names.join('|')}`"
            class="flex items-center gap-2"
          >
            <v-icon class="text-[#4e7397]" size="15">
              mdi-certificate-outline
            </v-icon>
            <p class="text-slate-700 text-[15px] font-medium leading-normal">
              <!-- The space lives inside the interpolation: Vue's whitespace condensing
                   drops a trailing literal space at the end of a <template>. -->
              <template v-if="subFieldEntry.prefix">{{ `${subFieldEntry.prefix} ` }}</template>
              <template v-for="(name, index) in subFieldEntry.names" :key="name"><span class="font-semibold">{{ name }}</span>{{ nameSeparator(index, subFieldEntry.names.length) }}</template>
            </p>
            <span v-if="subFieldEntry.credLink" class="inline-block align-middle">
              <DocumentViewer :src="subFieldEntry.credLink" :size="15" />
            </span>
          </div>
        </div>
      </div>

      <!-- Time, plus how far along the programme is when it's still running -->
      <div class="flex flex-wrap items-center gap-x-6 gap-y-1 mt-1">
        <div class="flex items-center gap-2">
          <v-icon class="text-[#4e7397]" size="16">
            mdi-calendar
          </v-icon>
          <!-- 15px: a step down from the title's text-base, still a step above
               the text-sm institution/location row below. -->
          <p class="text-[#4e7397] text-[15px] font-normal leading-normal">
            {{ time }}
          </p>
        </div>

        <div v-if="currentLevel" class="flex items-center gap-2">
          <v-icon class="text-[#4e7397]" size="16">
            mdi-progress-clock
          </v-icon>
          <!-- 15px: a step down from the title's text-base, still a step above
               the text-sm institution/location row below. -->
          <p class="text-[#4e7397] text-[15px] font-normal leading-normal">
            {{ currentLevel }}
          </p>
        </div>
      </div>

      <!-- Campus, Institution & Location -->
      <div class="flex flex-wrap items-center gap-x-6 gap-y-1 mt-1">
        <div v-if="campus" class="flex items-center gap-2">
          <v-icon class="text-[#4e7397]" size="16">
            mdi-office-building-marker
          </v-icon>
          <p class="text-[#4e7397] text-sm font-normal leading-normal">
            {{ campus }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <v-icon class="text-[#4e7397]" size="16">
            mdi-domain
          </v-icon>
          <p class="text-[#4e7397] text-sm font-normal leading-normal">
            <SmartLink :text="institution" />
          </p>
        </div>

        <div class="flex items-center gap-2">
          <v-icon class="text-[#4e7397]" size="16">
            mdi-map-marker
          </v-icon>
          <p class="text-[#4e7397] text-sm font-normal leading-normal">
            {{ location }}
          </p>
        </div>
      </div>

      <!-- Optional Extra Info -->
      <div v-if="extra" class="flex items-center gap-2 mt-1" _toggle>
        <v-icon class="text-[#4e7397]" size="16">
          mdi-star
        </v-icon>
        <p class="text-[#4e7397] text-sm font-normal leading-normal">
          {{ extra }}
        </p>
      </div>
    </div>

    <!-- Curriculum Modal -->
    <CourseCirriculumModal
      v-if="canViewCurriculum"
      v-model="showCurriculumModal"
      :cirriculum="cirriculum"
      :degree-name="subject ? `${title} in ${subject}` : title"
      :category="category"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import SmartLink from '@/components/SmartLink.vue'
import DocumentViewer from '@/components/DocumentViewer.vue'
import { isFeatureEnabled } from '@/config/featureFlags'
import CourseCirriculumModal from './CourseCirriculumModal.vue'

const props = defineProps({
  title: { type: String, required: true },
  subject: { type: String, default: '' },
  subField: { type: [String, Array, Object], default: '' },
  subFieldCredLink: { type: String, default: '' },
  time: { type: String, required: true },
  institution: { type: String, required: true },
  location: { type: String, required: true },
  campus: { type: String, default: '' },
  currentLevel: { type: String, default: '' },
  category: { type: String, default: '' },
  extra: { type: String, default: '' },
  icon: { type: String, default: 'mdi-school' },
  iconColor: { type: String, default: 'text-[#1980e6]' },
  isFirst: { type: Boolean, default: false },
  isLast: { type: Boolean, default: false },
  cred_link: { type: [String, Array, Object], default: '' },
  cirriculum: { type: Object, default: () => ({}) }
})

const showCurriculumModal = ref(false)

// "Minor in", or nothing when the entry has no label.
function subFieldPrefix(label) {
  const normalizedLabel = String(label || '').trim()
  if (!normalizedLabel) return ''
  if (normalizedLabel.toLowerCase() === 'minor') return 'Minor in'
  return `${normalizedLabel} in`
}

// A name may be one string or a list of them; a list reads "A, B and C".
function subFieldNames(value) {
  const list = Array.isArray(value) ? value : [value]
  return list.map(name => String(name ?? '').trim()).filter(Boolean)
}

function nameSeparator(index, count) {
  if (index === count - 1) return ''
  return index === count - 2 ? ' and ' : ', '
}

function normalizeSubField(value) {
  if (!value) return null

  if (typeof value === 'string' || Array.isArray(value)) {
    const names = subFieldNames(value)
    if (!names.length) return null
    return {
      names,
      label: 'Minor',
      prefix: subFieldPrefix('Minor'),
      credLink: props.subFieldCredLink || '',
    }
  }

  const names = subFieldNames(value.name || value.title || value.value)
  if (!names.length) return null
  const label = value.label || 'Minor'

  return {
    names,
    label,
    prefix: subFieldPrefix(label),
    credLink:
      value.cred_link ||
      value.credential_link ||
      value.credentialLink ||
      props.subFieldCredLink ||
      '',
  }
}

const subFields = computed(() => {
  // A bare list of strings is one sub-field with several names, not several sub-fields.
  const entries = Array.isArray(props.subField) && props.subField.some(item => item && typeof item === 'object')
    ? props.subField
    : [props.subField]
  return entries.map(normalizeSubField).filter(Boolean)
})

const hasCurriculum = computed(() =>
  props.cirriculum && Object.keys(props.cirriculum).some(k => k !== 'link')
)

const canViewCurriculum = computed(() =>
  hasCurriculum.value && isFeatureEnabled('showHome.showEducation.showCourseDetailsInfo')
)
</script>
