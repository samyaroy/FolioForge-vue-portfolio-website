<template>
  <ResourceSidePane
    title="External Links"
    label="External links"
    show-label="Show links"
    hide-label="Hide links"
    toggle-label="Toggle external links"
  >
    <div v-if="groups.length" class="flex flex-col gap-6">
      <section v-for="(group, groupIndex) in groups" :key="`${group.title}-${groupIndex}`">
        <h2
          v-if="group.title"
          class="mb-4 text-sm font-bold text-[#0e141b]"
        >
          {{ group.title }}
        </h2>

        <ul class="flex flex-col gap-3">
          <li v-for="(link, index) in group.links" :key="`${link.label}-${index}`">
            <v-tooltip
              :text="link.description || link.label"
              location="left"
            >
              <template #activator="{ props }">
                <a
                  v-bind="props"
                  :href="link.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="group flex items-start gap-2 no-underline transition-colors"
                >
                  <v-icon size="16" class="mt-0.5 shrink-0 text-[#1980e6]">mdi-link-variant</v-icon>
                  <span class="min-w-0 flex-1">
                    <span class="flex items-center justify-between gap-2">
                      <span class="min-w-0 truncate text-sm font-medium text-[#0e141b] group-hover:text-[#1980e6]">
                        {{ link.label }}
                      </span>
                      <span
                        v-if="link.speciality"
                        class="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500"
                      >
                        <span class="h-1.5 w-1.5 rounded-full bg-[#1980e6]/70"></span>
                        {{ link.speciality }}
                      </span>
                    </span>
                    <span v-if="link.description" class="mt-0.5 block text-xs leading-5 text-gray-500">
                      {{ link.description }}
                    </span>
                  </span>
                </a>
              </template>
            </v-tooltip>

            <p v-if="link.incharge" class="mt-1 ml-6 flex items-center gap-1.5 text-xs text-gray-600">
              <v-icon size="14" class="shrink-0 text-gray-500">mdi-account</v-icon>
              <span class="min-w-0 truncate [&_a:hover]:no-underline">
                <SmartLink :text="link.incharge" type="Person" />
              </span>
            </p>
          </li>
        </ul>
      </section>
    </div>

    <p v-else class="text-sm text-gray-500">
      <span class="inline-flex items-end gap-2 border-b-2 border-slate-300 pb-0.5">
        <AnimatedIcon name="dino" :size="28" class="-mb-0.5 shrink-0" />
        <span>No external links yet.</span>
      </span>
    </p>
  </ResourceSidePane>
</template>

<script setup>
import AnimatedIcon from '@/components/ui/AnimatedIcon.vue'
import SmartLink from '@/components/SmartLink.vue'
import ResourceSidePane from './ResourceSidePane.vue'

defineProps({
  groups: {
    type: Array,
    default: () => [],
  },
})
</script>
