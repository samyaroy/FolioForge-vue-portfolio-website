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
            <CourseCard
              v-for="(course, idx) in courses"
              :key="idx"
              :course="course"
              :section="section"
            />
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
import CourseCard from './CourseCard.vue'

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

</script>
