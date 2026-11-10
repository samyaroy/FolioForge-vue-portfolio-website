<template>
  <!-- Names are plain text; the icons after each one are the links. The comma
       follows the last icon (or the name) directly, with no space before it.
       The label keeps its own column, so wrapped names line up under the first
       name rather than under the label. -->
  <div v-if="people.length" class="flex items-start gap-2 text-gray-600">
    <v-icon :size="iconSize" class="shrink-0">mdi-account-supervisor</v-icon>
    <span class="shrink-0 whitespace-nowrap">{{ label }}:</span>
    <p class="min-w-0">
      <template v-for="(person, index) in people" :key="person.key">
        {{ index > 0 ? ' ' : '' }}<span class="whitespace-nowrap">{{ person.name }}<template
            v-for="contact in person.contacts" :key="contact.href"><a
              :href="contact.href"
              :target="contact.kind === 'email' ? undefined : '_blank'"
              :rel="contact.kind === 'email' ? undefined : 'noopener noreferrer'"
              :aria-label="contact.label"
              :title="contact.label"
              class="ml-1 inline-flex items-center align-[-0.15em] text-[#4e7397] transition-colors duration-200 hover:text-[#1980e6]"
            ><img
                v-if="contact.kind === 'orcid'"
                :src="orcidIcon"
                alt=""
                class="size-[15px] object-contain"
              /><v-icon v-else size="16">{{ contactIcons[contact.kind] }}</v-icon></a></template><span
            v-if="index < people.length - 1">,</span></span>
      </template>
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { collaboratorList, type ContactKind } from '@/utils/collaborators'
import { iconUrl } from '@/config/mediaAssets'

const props = withDefaults(
  defineProps<{
    /** The entry's `collaborators` value, in any shape the content uses. */
    collaborators?: unknown
    label?: string
    iconSize?: number | string
  }>(),
  { collaborators: undefined, label: 'Collaborators', iconSize: 20 },
)

const people = computed(() => collaboratorList(props.collaborators))

const orcidIcon = iconUrl('Orchid')

const contactIcons: Record<Exclude<ContactKind, 'orcid'>, string> = {
  email: 'mdi-email-outline',
  linkedin: 'mdi-linkedin',
  website: 'mdi-web',
}
</script>
