<template>
  <a v-if="isBeta" :href="stableUrl" class="beta-badge" :title="title">
    <span class="beta-badge__tag">Beta</span>
    <span class="beta-badge__cta">
      Stable site
      <span aria-hidden="true">&rarr;</span>
    </span>
    <!-- The CTA text is hidden below `sm`, so carry the meaning for everyone
         who is not reading the pixels. -->
    <span class="beta-badge__sr">{{ title }}</span>
  </a>
</template>

<script setup>
// Marks the beta deployment (beta.samyabrata.codeium.xyz) so it is obvious at a
// glance which build you are looking at, and offers the way back to the stable
// site.
//
// The host check lives in @/config/siteEnvironment because the footer needs the
// mirror image of it -- it points at the beta site, but only when served from
// stable. See that file for why the check is on the hostname rather than a
// feature flag or any tracked config.
import { isBetaSite, STABLE_URL } from '@/config/siteEnvironment'

const isBeta = isBetaSite()
const stableUrl = STABLE_URL

const title = 'You are viewing the beta build of this site. Go to the stable site.'
</script>

<style scoped>
.beta-badge {
  @apply inline-flex items-center gap-1.5 rounded-full py-0.5 pl-0.5 pr-1 no-underline
         transition-colors duration-200 sm:pr-2;
  /* Yellow with near-black text: ~11:1 contrast, readable against the white header. */
  background-color: #fde047;
  color: #0e141b;
  border: 1px solid #eab308;
  /* Never let the badge stretch or wrap when the nav gets tight. */
  flex: none;
  white-space: nowrap;
}

.beta-badge:hover {
  background-color: #facc15;
  border-color: #ca8a04;
}

.beta-badge__tag {
  @apply inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase
         leading-none tracking-wider;
  background-color: #0e141b;
  color: #fde047;
}

.beta-badge__cta {
  /* Hidden on phones, where the header only has room for the pill itself. */
  @apply hidden text-[11px] font-semibold leading-none sm:inline;
}

.beta-badge__sr {
  @apply absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0;
  clip: rect(0, 0, 0, 0);
  clip-path: inset(50%);
  margin: -1px;
}
</style>
