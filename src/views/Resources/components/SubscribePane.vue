<template>
  <ResourceSidePane
    title="Worth Subscribing"
    label="Worth subscribing"
    show-label="Show subscriptions"
    hide-label="Hide subscriptions"
    toggle-label="Toggle subscriptions"
  >
    <div class="flex flex-col gap-6">
      <section v-for="(group, groupIndex) in groups" :key="`${group.title}-${groupIndex}`">
        <h2
          v-if="group.title"
          class="mb-4 text-sm font-bold text-[#0e141b]"
        >
          {{ group.title }}
        </h2>

        <ul class="flex flex-col gap-3">
          <li v-for="(link, index) in group.links" :key="`${link.label}-${index}`">
            <div class="group flex items-start gap-2">
              <LinkFavicon :url="link.url" />
              <a
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
                class="min-w-0 flex-1 no-underline transition-colors"
              >
                <span class="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span class="min-w-0 max-w-full flex-auto break-words text-sm font-medium text-[#0e141b] group-hover:text-[#1980e6]">
                    {{ link.label }}
                  </span>
                  <span
                    v-if="link.speciality"
                    class="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500"
                  >
                    <span class="h-1.5 w-1.5 rounded-full bg-[#1980e6]/70"></span>
                    {{ link.speciality }}
                  </span>
                </span>
                <span v-if="link.cadence" class="mt-0.5 block text-xs leading-5 text-gray-500">
                  {{ link.cadence }}
                </span>
              </a>
            </div>

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
  </ResourceSidePane>
</template>

<script setup>
import SmartLink from '@/components/SmartLink.vue'
import LinkFavicon from './LinkFavicon.vue'
import ResourceSidePane from './ResourceSidePane.vue'

defineProps({
  // [{ title, icon, links: [{ label, url, cadence,
  // speciality, incharge }] }], already without empty groups;
  // the page leaves the column out when there are none.
  groups: {
    type: Array,
    default: () => [],
  },
})
</script>
