<template>
  <div
    class="border-l-4 border-teal-500 pl-5 py-3 rounded-lg bg-white
           hover:shadow-md transition-all duration-200"
  >
    <!-- PARENT: stacks on a phone, where the 20% meta column is too narrow to
         hold a date on one line. -->
    <div class="flex flex-col sm:flex-row gap-2 sm:gap-4">

      <!-- CHILD 1: 80% -->
      <div class="w-full sm:w-[75%] min-w-0 space-y-3">

        <!-- Header -->
        <div>
          <h3 class="text-lg font-semibold text-slate-900">
            {{ talk.title }}
            <a
              v-if="talk.link"
              :href="talk.link"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-block ml-1 align-middle text-slate-500 hover:text-slate-700"
            >
              <AnimatedIcon name="external-link" :size="16" />
            </a>
          </h3>
        </div>

        <!-- Meta -->
        <div class="space-y-1">
          <!-- Event -->
          <div v-if="talk.event" class="text-slate-600 flex items-start">
            <v-icon size="small" class="mr-2 mt-0.5">mdi-calendar-star</v-icon>
             <div class="min-w-0 flex-1 flex flex-col sm:flex-row">
                <div class="font-medium mr-2 shrink-0">Event:</div>
                <div>{{ talk.event }}</div>
             </div>
          </div>

          <!-- Organizer -->
          <div
            v-if="normalizedOrganizers.length"
            class="text-slate-600 flex items-start"
          >
            <v-icon size="small" class="mr-2 mt-0.5">mdi-account-group</v-icon>

            <div class="min-w-0 flex-1 flex flex-col sm:flex-row">
              <div class="font-medium mr-2 shrink-0">Organizer:</div>

              <div>
                <div
                  v-for="(org, index) in normalizedOrganizers"
                  :key="index"
                >
                  <span v-if="org.department">{{ org.department }}, </span>
                  <SmartLink :text="org.name" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- CHILD 2: 20% -->
      <div class="w-full sm:w-[20%] shrink-0 text-left sm:text-right text-sm text-gray-500 space-y-1">

        <div
          v-if="talk.date"
          class="flex items-center justify-start sm:justify-end gap-1"
        >
          <v-icon size=14>mdi-calendar</v-icon>
          <span>{{ talk.date }}</span>
        </div>

        <div
          v-if="talk.location"
          class="flex items-center justify-start sm:justify-end gap-1"
        >
          <v-icon size=14>mdi-map-marker</v-icon>
          <span>{{ talk.location }}</span>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import SmartLink from '@/components/SmartLink.vue'
import AnimatedIcon from '@/components/ui/AnimatedIcon.vue'

const props = defineProps({
  talk: {
    type: Object,
    required: true,
  },
})

const normalizedOrganizers = computed(() => {
  const org = props.talk.organizer
  if (!Array.isArray(org)) return []
  return org.filter(o => o?.name)
})
</script>

<style scoped>
</style>
