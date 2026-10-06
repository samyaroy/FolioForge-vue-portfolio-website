<template>
  <ResourceSidePane
    title="Worth Subscribing"
    label="Worth subscribing"
    show-label="Show subscriptions"
    hide-label="Hide subscriptions"
    toggle-label="Toggle subscriptions"
    stacked
  >
    <div class="flex flex-col gap-6">
      <section v-for="(group, groupIndex) in groups" :key="`${group.title}-${groupIndex}`">
        <h3
          v-if="group.title"
          class="mb-3.5 flex items-center gap-2 text-sm font-bold text-[#0e141b]"
        >
          <v-icon v-if="group.icon" size="16" class="shrink-0 text-[#1980e6]">{{ group.icon }}</v-icon>
          <span>{{ group.title }}</span>
          <span class="rounded-full bg-slate-200 px-1.5 text-[11px] font-semibold text-gray-500">
            {{ group.links.length }}
          </span>
        </h3>

        <ul class="flex flex-col gap-3.5">
          <li
            v-for="(link, index) in group.links"
            :key="`${link.label}-${index}`"
            class="flex items-start gap-2"
          >
            <LinkFavicon :url="link.url" class="max-lg:mt-3" />

            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-2">
                <a
                  :href="link.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="min-w-0 truncate text-sm font-medium text-[#0e141b] no-underline transition-colors hover:text-[#1980e6]"
                >
                  {{ link.label }}
                </a>

                <!-- The group's call to action (Subscribe, Follow, ...), to the
                     sign-up page when the entry names one. Taller on touch
                     screens so it is easy to hit. -->
                <a
                  :href="link.subscribeUrl || link.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  :aria-label="`${group.cta}: ${link.label}`"
                  class="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#1980e6]/10 px-2.5 py-1 text-xs font-semibold text-[#1980e6] no-underline transition-colors hover:bg-[#1980e6]/15 hover:text-[#1980e6] max-lg:min-h-10 max-lg:px-3.5"
                >
                  {{ group.cta }}
                  <v-icon size="12">mdi-arrow-top-right</v-icon>
                </a>
              </div>

              <div
                v-if="link.cadence || link.speciality"
                class="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-gray-500"
              >
                <span v-if="link.cadence">{{ link.cadence }}</span>
                <span
                  v-if="link.speciality"
                  class="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-[#1980e6]/70"></span>
                  {{ link.speciality }}
                </span>
              </div>

              <p v-if="link.description" class="mt-0.5 text-xs leading-5 text-gray-500">
                <SmartLink :text="link.description" type="Person" />
              </p>

              <p v-if="link.incharge" class="mt-1 flex items-center gap-1.5 text-xs text-gray-600">
                <v-icon size="14" class="shrink-0 text-gray-500">mdi-account</v-icon>
                <span class="min-w-0 truncate [&_a:hover]:no-underline">
                  <SmartLink :text="link.incharge" type="Person" />
                </span>
              </p>
            </div>
          </li>
        </ul>
      </section>
    </div>
  </ResourceSidePane>
</template>

<script setup>
import SmartLink from '@/components/SmartLink.vue'
import LinkFavicon from './LinkFavicon.vue'
import ResourceSidePane from './ResourceSidePane.vue'

defineProps({
  // [{ title, icon, cta, links: [{ label, url, subscribeUrl, cadence,
  // description, speciality, incharge }] }], already without empty groups;
  // the page leaves the column out when there are none.
  groups: {
    type: Array,
    default: () => [],
  },
})
</script>
