<template>
  <div class="justify-left items-center mt-2 pt-4">
    <div class="text-sm">Places That Shaped My Journey:</div><br>
    <div class="flex justify-left items-center">
      <img v-for="logo in logos" :key="logo" :src="getLogoPath(logo)" :alt="logo" :title="logo"
        class="h-8 px-2 cursor-pointer transition-transform hover:scale-110" />
    </div>
    <div class="text-xs text-gray-500 pt-3">* Logos are property of respective institutions</div>
  </div>
</template>

<script>
export default {
  name: "Logos",
  props: {
    logos: {
      type: Array,
      required: true,
    },
  },
  methods: {
    getLogoPath(logo) {
      return `/src/metadata/logo/${logo}.png`;
    },
  },
};
</script>
