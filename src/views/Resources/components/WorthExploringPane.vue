<template>
  <div v-if="groups.length" class="flex flex-col gap-10">
    <section v-for="(group, groupIndex) in groups" :key="`${group.title}-${groupIndex}`">
      <h2
        v-if="group.title"
        class="mb-4 text-lg font-bold text-[#0e141b]"
      >
        {{ group.title }}
      </h2>

      <ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <li v-for="(link, index) in group.links" :key="`${link.label}-${index}`">
          <div class="flex h-full flex-col rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
            <a
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="group flex items-start gap-2 no-underline"
            >
              <LinkFavicon :url="link.url" />
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
              </span>
            </a>

            <p v-if="link.description" class="content-justify mt-0.5 ml-6 text-xs leading-5 text-gray-500">
              <SmartLink :text="link.description" type="Person" />
            </p>

            <p v-if="link.incharge" class="mt-2 ml-6 flex items-center gap-1.5 text-xs text-gray-600">
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

  <div
    v-else
    class="border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-gray-500"
  >
    Nothing here yet — links for this section are coming soon.
  </div>
</template>

<script setup>
import SmartLink from '@/components/SmartLink.vue'
import LinkFavicon from './LinkFavicon.vue'

defineProps({
  groups: {
    type: Array,
    default: () => [],
  },
})
</script>
