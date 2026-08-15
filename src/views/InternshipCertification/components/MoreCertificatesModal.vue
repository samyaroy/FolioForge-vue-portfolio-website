<template>
  <v-dialog v-model="dialog" max-width="820" scrollable>
    <v-card class="rounded-lg">
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-lg font-bold text-[#0e141b]">More Certificates</span>
        <v-btn icon variant="text" aria-label="Close" @click="dialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text style="max-height: 70vh;">
        <ul class="divide-y divide-gray-100">
          <li v-for="(row, index) in rows" :key="index" class="flex items-center gap-4 py-3">

            <div class="flex-1 min-w-0">
              <!-- Title, with the credential icon right beside it -->
              <div class="flex items-center gap-2 min-w-0">
                <span class="font-semibold text-[#0e141b] truncate" :title="row.title">
                  {{ row.title }}
                </span>
                <DocumentViewer v-if="row.credLink" :src="row.credLink" :size="18" />
              </div>

              <!-- Issuer: institution and platform are each optional, so the
                   line (and the separator between them) only appears when
                   there is something to show. -->
              <p v-if="row.institution || row.platform"
                class="flex items-center gap-2 text-sm text-[#4e7397] mt-0.5">
                <v-icon size="14">mdi-school</v-icon>
                <span class="truncate">
                  <SmartLink v-if="row.institution" :type="'Institute'" :text="row.institution" />
                  <template v-if="row.institution && row.platform"> &middot; </template>
                  <SmartLink v-if="row.platform" :type="'Institute'" :text="row.platform" />
                </span>
              </p>

              <!-- Issue date and tenure -->
              <p v-if="row.date || row.duration" class="flex items-center gap-2 text-sm text-[#4e7397] mt-0.5">
                <v-icon size="14">mdi-calendar</v-icon>
                <span>
                  {{ row.date }}
                  <template v-if="row.duration">({{ row.duration }})</template>
                </span>
              </p>
            </div>

            <!-- Issuer logo(s) -->
            <div class="shrink-0 flex items-center justify-end gap-2 w-40">
              <img v-for="logo in row.logos" :key="logo" :src="logoUrl(logo)" :alt="logo" :title="logo"
                class="h-16 w-auto max-w-[76px] object-contain" @error="handleLogoError">
              <v-icon v-if="!row.logos.length" size="40" class="text-gray-300">
                mdi-certificate-outline
              </v-icon>
            </div>
          </li>
        </ul>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from 'vue'
import DocumentViewer from '@/components/DocumentViewer.vue'
import SmartLink from '@/components/SmartLink.vue'
import { logoUrl } from '@/config/mediaAssets'

const props = defineProps({
  certifications: {
    type: Array,
    required: true
  }
})

const dialog = defineModel({ type: Boolean, default: false })

// Only `title` is required: an entry may carry a platform but no institution
// (or neither), no logo, no date, or no credential link. Normalising here keeps
// the template to plain `v-if`s on flat fields.
const rows = computed(() =>
  props.certifications.map(certification => ({
    title: certification.title || '',
    credLink: certification.cred_link || '',
    institution: certification.issuer?.institution || '',
    platform: certification.issuer?.platform || '',
    date: certification.date || '',
    duration: certification.duration || '',
    logos: logosFor(certification)
  }))
)

// `logo` is authored as a list, but a bare string is the obvious thing to write
// for a single-issuer certificate, so accept both.
function logosFor(certification) {
  const logo = certification.logo
  if (Array.isArray(logo)) return logo.filter(Boolean)
  return logo ? [logo] : []
}

function handleLogoError(event) {
  event.target.remove()
}
</script>
