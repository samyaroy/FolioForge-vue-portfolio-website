<template>
  <!-- A rendered tooltip rather than a native `title`: that one only appears
       after the cursor rests on the logo, and never in some embedded browsers. -->
  <v-tooltip :text="label" location="top" :disabled="!label" content-class="!text-[0.8125rem]">
    <template #activator="{ props: activator }">
      <img v-bind="mergeProps($attrs, activator)" :src="src || logoUrl(logo)" :alt="label">
    </template>
  </v-tooltip>
</template>

<script setup>
// An institute logo that shows the institute's full name on hover. Names come
// from src/metadata/logoMetadata.yml through logoName().
import { computed, mergeProps } from 'vue'
import { logoName, logoUrl } from '@/config/mediaAssets'

// Classes and listeners (@error, @load) belong on the <img>, not the tooltip.
defineOptions({ inheritAttrs: false })

const props = defineProps({
  // Bare logo name from content, e.g. 'IITM'.
  logo: { type: String, default: '' },
  // For images not served from the logo host (favicons, society logos).
  src: { type: String, default: '' },
  // Tooltip text when the logo is not listed in logoMetadata.yml.
  name: { type: String, default: '' }
})

const label = computed(() => props.name || logoName(props.logo))
</script>
