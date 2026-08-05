<template>
  <div class="justify-left items-center mt-2 pt-4 max-w-full min-w-0">
    <div class="text-sm">Places That Shaped My Journey:</div><br>
    <div class="flex flex-wrap justify-left items-center max-w-full gap-y-3.5">
      <img v-for="(tooltip, key) in logos" :key="key" :src="getLogoPath(key)" :alt="tooltip" :title="tooltip"
        class="h-8 px-2 cursor-pointer transition-transform hover:scale-110" />
    </div>
    <div class="text-xs text-gray-500 pt-3">* All the logos used are property of respective institutions</div>
  </div>
</template>

<script>
export default {
  name: "Logos",
  props: {
    logos: {
      type: Object,
      required: true,
    },
  },
  methods: {
    getLogoPath(logo) {
      return `/logo/${logo}.png`;
    },
  },
};
</script>
