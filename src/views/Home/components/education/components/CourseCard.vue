<template>
  <div class="flex h-full flex-col">
    <div
      class="relative grid flex-1 gap-3 px-3 py-2.5 rounded-md"
      :class="[
        course.credit ? 'grid-cols-[85fr_15fr]' : 'grid-cols-1',
        section === 'transfered_credits' ? 'bg-white' : 'bg-[#f8fafc]',
        showRibbon ? 'pl-9' : ''
      ]"
      :style="{ border: `1px solid ${isCC(course.type) ? '#bbf7d0' : '#bfdbfe'}` }"
    >
      <span
        v-if="showRibbon"
        class="absolute left-0 top-1/2 z-10 -translate-x-[calc(50%-0.625rem)] -translate-y-1/2 -rotate-90 whitespace-nowrap bg-[#2563eb] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm [clip-path:polygon(0_0,100%_0,100%_100%,calc(100%-7px)_76%,calc(100%-14px)_100%,0_100%)]"
      >
        {{ ribbonLabel }}
      </span>

      <div class="min-w-0">
        <div class="flex items-start gap-1.5">
          <p class="text-[#0e141b] text-sm font-medium leading-snug min-w-0">{{ course.course_name }}</p>
          <DocumentViewer v-if="course.cred_link" :src="course.cred_link" :size="14" class="shrink-0" />
        </div>
        <p v-if="hasCourseMeta(course)" class="text-[#4e7397] text-xs mt-0.5 font-mono">
          <span v-if="course.type">{{ course.type }}</span>
          <v-icon v-if="course.type && course.course_code" size="6" class="mx-1">mdi-circle</v-icon>
          <span v-if="course.course_code">{{ formatCourseCode(course.course_code) }}</span>
        </p>
        <p v-if="facultyList.length" class="text-[#4e7397] text-xs mt-0.5 flex items-start gap-1">
          <v-icon size="12" class="mt-0.5 shrink-0">mdi-account-tie</v-icon>
          <span class="min-w-0">
            <template v-for="(member, fi) in facultyList" :key="fi">
              <span class="whitespace-nowrap">
                <SmartLink
                  type="Person"
                  :text="member.name"
                  :href="member.link || null"
                  prefer-href
                />
              </span>
              <span v-if="fi < facultyList.length - 1">, </span>
            </template>
          </span>
        </p>
        <div
          v-if="course.logo"
          class="flex items-center justify-end gap-0.5"
          :class="hasCourseMeta(course) ? 'mt-2' : 'mt-1'"
        >
          <template v-for="(logo, li) in normalizedLogos(course.logo)" :key="logo">
            <img
              :src="getLogoPath(logo)"
              :alt="logo"
              :title="logo"
              class="h-6 w-auto object-contain opacity-95"
              @error="handleLogoError"
            >
            <span v-if="li < normalizedLogos(course.logo).length - 1" class="text-xs font-semibold">&bull;</span>
          </template>
        </div>
      </div>
      <div v-if="course.credit" class="flex flex-col items-center justify-center border-l border-[#d0dbe7] pl-2">
        <p class="text-[#0e141b] text-xl font-bold leading-none">{{ course.credit }}</p>
        <p class="text-[#4e7397] text-[10px] font-semibold uppercase leading-tight mt-1">Credit</p>
      </div>
    </div>

    <div v-if="childCourses.length" class="mt-2 grid gap-2 pl-3 border-l border-[#d0dbe7]">
      <CourseCard
        v-for="(childCourse, idx) in childCourses"
        :key="idx"
        :course="childCourse"
        :section="section"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import DocumentViewer from '@/components/DocumentViewer.vue'
import SmartLink from '@/components/SmartLink.vue'

defineOptions({ name: 'CourseCard' })

const props = defineProps({
  course: { type: Object, required: true },
  section: { type: String, default: '' }
})

const childCourses = computed(() => {
  const possibleChildren = [
    props.course?.children,
    props.course?.courses,
    props.course?.items,
    props.course?.sub_courses
  ].find(Array.isArray)

  return possibleChildren || []
})

const courseTags = computed(() => {
  const tags = props.course?.tags ?? props.course?.tag
  if (!tags) return []
  return Array.isArray(tags) ? tags : [tags]
})

const showRibbon = computed(() => sectionIsTransferCredits() && courseTags.value.length > 0)

const ribbonLabel = computed(() => courseTags.value.join(' / '))

const facultyList = computed(() => {
  const faculty = props.course?.faculty
  if (!faculty) return []
  const entries = Array.isArray(faculty) ? faculty : [faculty]
  return entries
    .map(entry =>
      entry && typeof entry === 'object'
        ? { name: entry.name, link: entry.link }
        : { name: String(entry) }
    )
    .filter(entry => entry.name)
})

function formatCourseCode(code) {
  if (Array.isArray(code)) return code.join(' / ')
  return String(code)
}

function isCC(type) {
  if (!type) return false
  return String(type).split('/').every(t => ['CC', 'PCC'].includes(t.trim()))
}

function hasCourseMeta(course) {
  return Boolean(course?.type || course?.course_code)
}

function sectionIsTransferCredits() {
  return props.section === 'transfered_credits'
}

function normalizedLogos(logo) {
  if (!logo) return []
  return Array.isArray(logo) ? logo : [logo]
}

function getLogoPath(logo) {
  return `/logo/${logo}.png`
}

function handleLogoError(event) {
  event.target.remove()
}
</script>
