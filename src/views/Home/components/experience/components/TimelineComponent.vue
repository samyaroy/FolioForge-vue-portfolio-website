<template>
  <div class="relative grid grid-cols-[40px_1fr] gap-x-2 px-4 py-2">
    <!-- Timeline line -->
    <div class="absolute left-[35px] w-px bg-gray-300" :class="{
      'top-1/4 bottom-1': isfirst,          // cut top half if first
      'top-0 bottom-0': islast,           // cut bottom half if last
      'top-0 bottom-0': !isfirst && !islast // full line otherwise
    }"></div>

    <!-- Timeline icon -->
    <div class="flex flex-col items-center pt-0 pb-0 relative z-5">
      <div class="bg-white p-1 rounded-full">
        <v-icon :class="iconColor" size="24">{{ icon }}</v-icon>
      </div>
    </div>

    <!-- Right column: content -->
    <div class="flex flex-1 flex-col py-0 relative z-10">
      <div class="flex items-center justify-between">
        <p class="text-[#0e141b] text-base font-medium leading-normal flex items-center gap-1">
          {{ title }}
          <a v-if="cred_link && cred_link !== '#'" :href="cred_link" target="_blank">
            <v-icon size="20">mdi-file-document-outline</v-icon>
          </a>
        </p>
        <p class="text-[#4e7397] text-base font-normal">{{ time }}</p>
      </div>

      <div class="flex items-center gap-2 mt-1">
        <v-icon class="text-[#4e7397]" size="16">mdi-domain</v-icon>
        <p class="text-[#4e7397] text-sm">{{ organization }}</p>
      </div>

      <div v-if="supervisor" class="flex items-center gap-2 mt-1">
        <v-icon class="text-[#4e7397]" size="16">mdi-account-tie</v-icon>
        <p class="text-[#4e7397] text-sm">Supervisor: {{ supervisor }}</p>
      </div>

      <div v-if="project" class="flex items-center gap-2 mt-1">
        <v-icon class="text-[#4e7397]" size="16">mdi-puzzle-outline</v-icon>
        <p class="text-[#4e7397] text-sm">Project: {{ project }}</p>
      </div>

      <div v-if="department" class="flex items-center gap-2 mt-1">
        <v-icon class="text-[#4e7397]" size="16">mdi-office-building-marker
        </v-icon>
        <p class="text-[#4e7397] text-sm">Department: {{ department }}</p>
      </div>

      <div class="flex items-center gap-2 mt-1">
        <v-icon class="text-[#4e7397]" size="16">mdi-map-marker</v-icon>
        <p class="text-[#4e7397] text-sm">{{ location }}</p>
      </div>
    </div>

    <!-- Description -->
    <div class="col-span-2 px-[56px] pb-6 relative" v-if="description">
      <p class="text-[#0e141b] text-base">{{ description }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isfirst: { type: Boolean, default: false },
  islast: { type: Boolean, default: false },
  title: { type: String, required: true },
  time: { type: String, required: true },
  organization: { type: String, required: true },
  supervisor: { type: String, default: null },
  department: { type: String, default: null },
  project: { type: String, default: null },
  location: { type: String, required: true },
  description: { type: String, default: null },
  icon: { type: String, default: 'mdi-school' },
  iconColor: { type: String, default: 'text-[#1980e6]' },
  cred_link: { type: String, default: '#' }
})
</script>