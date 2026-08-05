<template>
  <span v-if="isBeta" class="beta-badge" :title="title">Beta</span>
</template>

<script setup>
// Marks the beta deployment (beta.samyabrata.codeium.xyz) so it is obvious at a
// glance which build you are looking at.
//
// The check is on the hostname rather than a feature flag or any tracked config
// file, and that is deliberate: V1 is merged into main by replacing main's tree
// wholesale, so any branch-local marker would ride along into production on the
// next merge. The host is the one thing that differs at runtime and that no
// merge can carry over, which makes this safe to have on both branches.
//
// Local dev counts as beta too -- if you are on localhost you are by definition
// not looking at the published site.
const BETA_HOST_PREFIX = 'beta.'
const LOCAL_HOSTS = ['localhost', '127.0.0.1', '[::1]']

// Guarded for the prerender pass, which runs in Node. scripts/seo-build.ts only
// stamps <head> on the built shell today, so no component renders there, but the
// guard keeps "Beta" out of the static HTML if that ever changes.
const host = typeof window === 'undefined' ? '' : window.location.hostname

const isBeta = host.startsWith(BETA_HOST_PREFIX) || LOCAL_HOSTS.includes(host)

const title = 'You are viewing the beta build of this site'
</script>

<style scoped>
.beta-badge {
  @apply inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wider;
  /* Yellow with near-black text: ~11:1 contrast, readable against the white header. */
  background-color: #fde047;
  color: #0e141b;
  border: 1px solid #eab308;
  /* Never let the badge stretch or wrap when the nav gets tight. */
  flex: none;
  white-space: nowrap;
}
</style>
