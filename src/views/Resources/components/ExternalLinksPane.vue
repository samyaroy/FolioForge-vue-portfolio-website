<template>
  <aside
    class="transition-all duration-300 lg:ml-6 lg:border-l lg:border-slate-300 lg:pl-4"
    :class="collapsed ? 'lg:w-10' : 'lg:w-[400px]'"
    aria-label="External links"
  >
    <div
      class="mb-4 flex items-center"
      :class="collapsed ? 'justify-center' : 'justify-between gap-2'"
    >
      <h2 v-if="!collapsed" class="text-lg font-bold text-[#0e141b]">
        External Links
      </h2>

      <v-tooltip :text="collapsed ? 'Show links' : 'Hide links'" location="left">
        <template #activator="{ props }">
          <button
            v-bind="props"
            type="button"
            class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1980e6]/10 text-[#1980e6] outline-none [-webkit-tap-highlight-color:transparent] focus:outline-none"
            :aria-expanded="!collapsed"
            aria-label="Toggle external links"
            @click="collapsed = !collapsed"
          >
            <v-icon size="18">{{ collapsed ? 'mdi-chevron-left' : 'mdi-chevron-right' }}</v-icon>
          </button>
        </template>
      </v-tooltip>
    </div>

    <div v-if="!collapsed && groups.length" class="flex flex-col gap-6">
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

    <p v-else-if="!collapsed" class="text-sm text-gray-500">
      No external links yet.
    </p>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import SmartLink from '@/components/SmartLink.vue'

const collapsed = ref(false)

defineProps({
  groups: {
    type: Array,
    default: () => [],
  },
})
</script>
