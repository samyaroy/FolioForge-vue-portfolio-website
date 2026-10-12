<template>
  <div class="justify-left items-center mt-2 pt-4 max-w-full min-w-0">
    <div class="text-sm">Places That Shaped My Journey:</div><br>
    <div class="flex flex-wrap justify-left items-center max-w-full gap-y-3.5">
      <LogoImage v-for="logo in logos" :key="logo" :logo="logo"
        class="h-8 px-2 cursor-pointer transition-transform hover:scale-110" />
    </div>
    <div class="text-xs text-red-400 pt-3">* Logos belong to their institutions; no active affiliation implied</div>
  </div>
</template>

<script>
import LogoImage from '@/components/ui/LogoImage.vue'
export default {
  name: "Logos",
  components: { LogoImage },
  props: {
    // Bare logo names; their full names come from src/metadata/logoMetadata.yml.
    logos: {
      type: Array,
      required: true,
    },
  },
};
</script>
