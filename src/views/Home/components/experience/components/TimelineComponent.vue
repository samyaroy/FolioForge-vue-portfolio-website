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
        <p class="text-[#0e141b] text-base font-medium leading-normal">
          {{ title }}
          <span v-if="cred_link" class="inline-block ml-1 align-middle">
            <DocumentViewer :src="cred_link" />
          </span>
        </p>
        <p class="text-[#4e7397] text-base font-normal">{{ time }}</p>
      </div>

      <div class="flex items-center gap-2 mt-1">
        <v-icon class="text-[#4e7397]" size="16">mdi-domain</v-icon>
        <p class="text-[#4e7397] text-sm"><SmartLink :text="organization" /></p>
      </div>

      <div v-if="supervisor" class="flex items-center gap-2 mt-1">
        <v-icon class="text-[#4e7397]" size="16">mdi-account-tie</v-icon>
        <p class="text-[#4e7397] text-sm">Supervisor: <SmartLink v-if="supervisor.name" :type="'Person'" :text="supervisor.name" /><span v-if="supervisor.title">, {{ supervisor.title }}</span><span v-if="supervisor.department">, {{ supervisor.department }}</span><span v-if="supervisor.institution">, {{ supervisor.institution }}</span></p>
      </div>

      <div v-if="projects" class="grid grid-cols-[auto,auto,1fr] gap-x-2 mt-1 items-start">
  <!-- Icon -->
  <v-icon class="text-[#4e7397] mt-[2px]" size="16">
    mdi-puzzle-outline
  </v-icon>

  <!-- Label -->
  <span class="text-[#4e7397] text-sm font-medium whitespace-nowrap">
    Projects:
  </span>

  <!-- Project list -->
  <ul class="grid gap-1 text-[#4e7397] text-sm">
    <li
      v-for="(project, index) in projects"
      :key="index"
      class="leading-tight"
    >
      {{ project }}
    </li>
  </ul>
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
      <p class="text-[#0e141b] text-sm">{{ description }}</p>
    </div>
  </div>
</template>

<script setup>
import SmartLink from '@/components/SmartLink.vue'
import DocumentViewer from '@/components/DocumentViewer.vue'

defineProps({
  isfirst: { type: Boolean, default: false },
  islast: { type: Boolean, default: false },
  title: { type: String, required: true },
  time: { type: String, required: true },
  organization: { type: String, required: true },
  supervisor: { type: Object, default: null },
  department: { type: String, default: null },
  projects: { type: Array, default: null },
  location: { type: String, required: true },
  description: { type: String, default: null },
  icon: { type: String, default: 'mdi-school' },
  iconColor: { type: String, default: 'text-[#1980e6]' },
  cred_link: { type: String, default: '#' }
})
</script>