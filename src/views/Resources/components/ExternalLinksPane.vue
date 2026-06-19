<template>
  <aside
    class="lg:ml-12 lg:border-l lg:border-slate-300 lg:pl-8"
    aria-label="External links"
  >
    <div class="mb-4">
      <h2 class="text-sm font-bold uppercase tracking-wide text-[#0e141b]">External Links</h2>
    </div>

    <ul v-if="links.length" class="flex flex-col gap-3">
      <li v-for="(link, index) in links" :key="`${link.label}-${index}`">
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
              <span class="min-w-0">
                <span class="block truncate text-sm font-medium text-[#0e141b] group-hover:text-[#1980e6]">
                  {{ link.label }}
                </span>
                <span v-if="link.description" class="mt-0.5 block text-xs leading-5 text-gray-500">
                  {{ link.description }}
                </span>
              </span>
            </a>
          </template>
        </v-tooltip>
      </li>
    </ul>

    <p v-else class="text-sm text-gray-500">
      No external links yet.
    </p>
  </aside>
</template>

<script setup>
defineProps({
  links: {
    type: Array,
    default: () => [],
  },
})
</script>
