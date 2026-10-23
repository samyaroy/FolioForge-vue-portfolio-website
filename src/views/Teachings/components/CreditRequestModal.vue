<template>
  <v-dialog v-model="isOpen" max-width="680" scrollable>
    <v-card>
      <!-- Header -->
      <div class="px-6 pt-5 pb-4">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-[#0e141b] text-lg font-bold leading-tight">Get credited</p>
            <p class="text-[#4e7397] text-sm mt-0.5">Worked on one of these projects? Tell me where your name should link.</p>
          </div>
          <v-btn icon variant="text" density="compact" aria-label="Close" @click="isOpen = false">
            <v-icon size="20">mdi-close</v-icon>
          </v-btn>
        </div>
      </div>

      <v-divider :style="{ borderColor: '#3b82f6' }" />

      <v-card-text class="px-6 pt-5 pb-2">
        <v-form ref="form" class="flex flex-col gap-3" @submit.prevent="send('gmail')">
          <!-- Vuetify names a select's input after its toggle ("Open"), which
               would hide the label from screen readers; open-text and
               close-text are that name, so both say what the field is. -->
          <v-select
            v-model="projectKey"
            :items="projectOptions"
            open-text="Project"
            close-text="Project"
            :menu-props="menuProps"
            item-title="title"
            item-value="key"
            :item-props="projectItemProps"
            variant="outlined"
            density="comfortable"
            aria-required="true"
            :rules="[required]"
          >
            <template #label>Project <span class="required-star" aria-hidden="true">*</span></template>
          </v-select>
          <!-- The project's listed students are offered, so a name already on
               the page is matched exactly; anyone else types theirs.
               Each field also carries its name as aria-label: an outlined
               Vuetify field draws its label twice, so screen readers would
               otherwise hear the name doubled, and the star with it. -->
          <v-combobox
            v-model="name"
            :items="studentNames"
            :menu-props="menuProps"
            variant="outlined"
            density="comfortable"
            aria-label="Your name"
            aria-required="true"
            :rules="[required]"
          >
            <template #label>Your name <span class="required-star" aria-hidden="true">*</span></template>
          </v-combobox>
          <v-text-field
            v-model="profile"
            placeholder="https://www.linkedin.com/in/your-name"
            variant="outlined"
            density="comfortable"
            inputmode="url"
            autocomplete="url"
            aria-label="LinkedIn or personal website"
            aria-required="true"
            :rules="[required, validProfile]"
          >
            <template #label>LinkedIn or personal website <span class="required-star" aria-hidden="true">*</span></template>
          </v-text-field>
          <v-textarea
            v-model="message"
            label="Message for me"
            aria-label="Message for me"
            placeholder="Anything I should know, such as your role in the project"
            variant="outlined"
            density="comfortable"
            rows="3"
            auto-grow
            :counter="CREDIT_MESSAGE_LIMIT"
            :rules="[withinLimit]"
          />
        </v-form>
        <p class="text-xs text-slate-500 mt-1">
          This opens an email from your own account, addressed to me. Nothing is stored on this site.
        </p>
      </v-card-text>

      <v-card-actions class="px-6 pb-5 pt-2 flex flex-wrap justify-end gap-2">
        <v-btn variant="text" class="text-none" @click="send('mailto')">
          <v-icon start size="18">mdi-email-outline</v-icon>Use email app
        </v-btn>
        <v-btn variant="flat" color="#1980e6" class="text-none" @click="send('gmail')">
          <v-icon start size="18">mdi-gmail</v-icon>Send via Gmail
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import config from '@/content/profile_info'
import {
  CREDIT_MESSAGE_LIMIT, creditRequestEmail, gmailComposeUrl, mailtoUrl, normaliseProfileUrl
} from '@/utils/creditRequest'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  /** Every semester block, not only the page shown: a student may have worked on any of them. */
  projects: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const recipient = config.contacts?.gmail ?? ''
const mentorName = config.profile?.name ?? ''

const form = ref(null)
const projectKey = ref(null)
// Null, not '': a combobox counts an empty string as a value and floats its label.
const name = ref(null)
const profile = ref('')
const message = ref('')

const projectOptions = computed(() => props.projects.flatMap((block) => (
  (block.projects || []).map((project) => ({
    key: `${block.semester}::${project.title}`,
    title: project.title,
    semester: block.semester,
    students: (project.students || []).map((student) => student.name).filter(Boolean)
  }))
)))

const projectItemProps = (item) => ({ title: item.title, subtitle: item.semester })
// The menus open outside the dialog, so they carry a class of their own for the
// smaller text below.
const menuProps = { contentClass: 'credit-request-menu' }
const selectedProject = computed(() => projectOptions.value.find((option) => option.key === projectKey.value))
const studentNames = computed(() => selectedProject.value?.students ?? [])

// A name picked for one project means nothing on another.
watch(projectKey, () => { name.value = null })

const required = (value) => (typeof value === 'string' ? value.trim() !== '' : value != null) || 'Required'
const validProfile = (value) => Boolean(normaliseProfileUrl(value ?? '')) || 'Enter a web address, such as your LinkedIn profile'
const withinLimit = (value) => (value ?? '').length <= CREDIT_MESSAGE_LIMIT || `Keep it under ${CREDIT_MESSAGE_LIMIT} characters`

/** Validates, then opens the email in Gmail or the device's mail app. */
const send = async (via) => {
  const { valid } = await form.value.validate()
  if (!valid || !selectedProject.value) return

  const { subject, body } = creditRequestEmail({
    project: selectedProject.value.title,
    semester: selectedProject.value.semester,
    name: String(name.value).trim(),
    profileUrl: normaliseProfileUrl(profile.value),
    message: message.value
  }, mentorName)

  if (via === 'gmail') window.open(gmailComposeUrl(recipient, subject, body), '_blank', 'noopener,noreferrer')
  else window.location.href = mailtoUrl(recipient, subject, body)
  isOpen.value = false
}
</script>

<style scoped>
/* Marks a field the form cannot be sent without. Hidden from screen readers,
   which hear aria-required instead. */
.required-star {
  color: #dc2626;
}
</style>

<!-- Not scoped: the menus are teleported out of this component. -->
<style>
.credit-request-menu .v-list-item-title {
  font-size: 0.8125rem;
  line-height: 1.25rem;
  white-space: normal;
}
.credit-request-menu .v-list-item-subtitle {
  font-size: 0.75rem;
}
</style>
