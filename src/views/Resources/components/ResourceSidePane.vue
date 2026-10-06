<template>
  <!-- The collapsible right column both Resources tabs share, so the divider
       sits in the same place whichever tab is open. -->
  <aside
    class="transition-all duration-300 lg:ml-6 lg:border-l lg:border-slate-300 lg:pl-4"
    :class="[
      collapsed ? 'lg:w-10' : 'lg:w-[400px]',
      stacked ? 'border-t border-slate-300 pt-6 lg:border-t-0 lg:pt-0' : '',
    ]"
    :aria-label="label"
  >
    <div
      class="mb-1 flex items-center"
      :class="collapsed
        ? (stacked ? 'justify-between gap-2 lg:justify-center' : 'justify-center')
        : 'justify-between gap-2'"
    >
      <!-- Stacked under the content on a phone, a collapsed column keeps its
           title, since there is no narrow strip for it to fold into. -->
      <h2
        v-if="!collapsed || stacked"
        class="text-lg font-bold text-[#0e141b]"
        :class="{ 'lg:hidden': collapsed }"
      >
        {{ title }}
      </h2>

      <v-tooltip :text="collapsed ? showLabel : hideLabel" location="left">
        <template #activator="{ props }">
          <button
            v-bind="props"
            type="button"
            class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1980e6]/10 text-[#1980e6] outline-none [-webkit-tap-highlight-color:transparent] focus:outline-none"
            :aria-expanded="!collapsed"
            :aria-label="toggleLabel"
            @click="collapsed = !collapsed"
          >
            <template v-if="stacked">
              <v-icon size="18" class="lg:!hidden">{{ collapsed ? 'mdi-chevron-down' : 'mdi-chevron-up' }}</v-icon>
              <v-icon size="18" class="!hidden lg:!inline-flex">{{ collapsed ? 'mdi-chevron-left' : 'mdi-chevron-right' }}</v-icon>
            </template>
            <v-icon v-else size="18">{{ collapsed ? 'mdi-chevron-left' : 'mdi-chevron-right' }}</v-icon>
          </button>
        </template>
      </v-tooltip>
    </div>

    <p v-if="!collapsed" class="mb-2 flex items-center justify-end gap-1 text-right text-[10px] leading-4 text-gray-500">
      <v-icon size="8" class="shrink-0 text-gray-400" aria-hidden="true">mdi-star</v-icon>
      <span>To access the link, click on the title.</span>
    </p>

    <slot v-if="!collapsed" />
  </aside>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  title: {
    type: String,
    required: true,
  },
  // The column's accessible name.
  label: {
    type: String,
    required: true,
  },
  showLabel: {
    type: String,
    default: 'Show',
  },
  hideLabel: {
    type: String,
    default: 'Hide',
  },
  toggleLabel: {
    type: String,
    default: 'Toggle column',
  },
  // Below `lg` the column stacks under the content: a top divider in place of
  // the left one, and up/down chevrons in place of left/right.
  stacked: {
    type: Boolean,
    default: false,
  },
})

const collapsed = ref(false)
</script>
