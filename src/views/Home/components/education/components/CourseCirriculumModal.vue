<template>
  <v-dialog v-model="isOpen" max-width="90vw" scrollable>
    <v-card>
      <!-- Header -->
      <div class="px-6 pt-5 pb-4">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-[#0e141b] text-lg font-bold leading-tight">Course Curriculum</p>
            <p v-if="degreeName" class="text-[#4e7397] text-sm mt-0.5">{{ degreeName }}</p>
          </div>
          <v-btn icon variant="text" density="compact" @click="isOpen = false">
            <v-icon size="20">mdi-close</v-icon>
          </v-btn>
        </div>
      </div>

      <v-divider :style="{ borderColor: '#3b82f6' }" />

      <!-- Course sections -->
      <v-card-text class="px-6 py-4 overflow-y-auto" style="max-height: 62vh;">
        <div v-for="(courses, section) in sections" :key="section" class="mb-6 last:mb-0">
          <p class="text-[#4e7397] text-[11px] font-semibold uppercase tracking-widest mb-2">
            {{ formatSection(section) }}
          </p>
          <div class="grid grid-cols-2 lg:grid-cols-3 gap-2">
            <component
              :is="course.cred_link ? 'a' : 'div'"
              v-for="(course, idx) in courses"
              :key="idx"
              :href="course.cred_link || undefined"
              :target="course.cred_link ? '_blank' : undefined"
              :rel="course.cred_link ? 'noopener noreferrer' : undefined"
              class="grid grid-cols-[85fr_15fr] gap-3 px-3 py-2.5 rounded-md bg-[#f8fafc] no-underline text-inherit"
              :class="{ 'hover:bg-[#f0f5fb] transition-colors': course.cred_link }"
              :style="{ border: `1px solid ${isCC(course.type) ? '#bbf7d0' : '#bfdbfe'}` }"
            >
              <div class="min-w-0">
                <p class="text-[#0e141b] text-sm font-medium leading-snug">{{ course.course_name }}</p>
                <p class="text-[#4e7397] text-xs mt-0.5 font-mono">{{ course.type }}<v-icon size="6" class="ml-1">mdi-circle</v-icon> {{ formatCourseCode(course.course_code) }}</p>
                <div v-if="course.logo" class="mt-2 flex items-center gap-1.5">
                  <template v-for="(logo, li) in normalizedLogos(course.logo)" :key="logo">
                    <img
                      :src="getLogoPath(logo)"
                      :alt="logo"
                      :title="logo"
                      class="h-3.5 w-auto object-contain opacity-60"
                      @error="handleLogoError"
                    >
                    <span v-if="li < normalizedLogos(course.logo).length - 1" class="text-slate-300 text-[9px]">·</span>
                  </template>
                </div>
              </div>
              <div v-if="course.credit" class="flex flex-col items-center justify-center border-l border-[#d0dbe7] pl-2">
                <p class="text-[#0e141b] text-xl font-bold leading-none">{{ course.credit }}</p>
                <p class="text-[#4e7397] text-[10px] font-semibold uppercase leading-tight mt-1">Credit</p>
                <v-icon v-if="course.cred_link" size="10" class="mt-1 text-[#93c5fd]">mdi-open-in-new</v-icon>
              </div>
              <div v-else-if="course.cred_link" class="flex items-end justify-center pb-0.5">
                <v-icon size="11" class="text-[#93c5fd]">mdi-open-in-new</v-icon>
              </div>
            </component>
          </div>
        </div>
      </v-card-text>

      <v-divider :style="{ borderColor: '#3b82f6' }" />

      <!-- Footer -->
      <div class="px-6 py-4 flex justify-end gap-2 text-sm">
        <v-btn v-if="curriculumLink"
          variant="flat"
          :href="curriculumLink"
          target="_blank"
          rel="noopener noreferrer"
          style="text-transform: none;"
        >
          See in Details <v-icon size="14" class="ml-1">mdi-open-in-new</v-icon>
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  cirriculum: { type: Object, default: () => ({}) },
  degreeName: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const sections = computed(() => {
  if (Array.isArray(props.cirriculum)) {
    return { curriculum: props.cirriculum }
  }

  return Object.fromEntries(
    Object.entries(props.cirriculum || {}).filter(([key]) => key !== 'link')
  )
})

const curriculumLink = computed(() => Array.isArray(props.cirriculum) ? '' : props.cirriculum?.link || '')

function formatSection(key) {
  return key.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())
}

function formatCourseCode(code) {
  if (Array.isArray(code)) return code.join(' / ')
  return String(code)
}

function isCC(type) {
  if (!type) return false
  return String(type).split('/').every(t => ['CC', 'PCC'].includes(t.trim()))
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
