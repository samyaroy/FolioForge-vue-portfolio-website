<template>
  <aside v-if="isBeta" class="beta-ribbon" aria-label="Beta build notice">
    <div class="beta-ribbon__panel">
      <div class="beta-ribbon__content">
        <a :href="stableUrl" class="beta-ribbon__link" :title="title">
          <span class="beta-ribbon__tag">Beta</span>
          <span class="beta-ribbon__cta">
            Stable site<span aria-hidden="true">&nbsp;&rarr;</span>
          </span>
          <span class="beta-ribbon__sr">{{ title }}</span>
        </a>
      </div>
    </div>
  </aside>
</template>

<script setup>
// Marks the beta deployment (beta.samyabrata.codeium.xyz) so it is obvious at a
// glance which build you are looking at, and offers the way back to stable.
//
// Sits directly under the header. On views that render their own InfoRibbon
// (Home, Resources) those views place this beneath the announcement themselves;
// App.vue covers every other route. See App.vue for that split.
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
/* Shell/panel/content mirrors InfoRibbon, so when both show on Home and
   Resources they stack as one continuous band rather than two mismatched
   strips. The band runs full width; the marker inside stays badge-sized and
   sits at the right, under the header nav it used to live in. */
.beta-ribbon {
  position: relative;
  z-index: 1;
  width: 100%;
  overflow: hidden;
  background: transparent;
}

.beta-ribbon__panel {
  position: relative;
  z-index: 1;
  width: 100%;
  padding: 2px 10px 2px 16px;
  /* White, continuing the header's surface; the border is the header's own
     divider colour, so the band reads as part of it rather than a stripe. */
  background: #ffffff;
  border-bottom: 1px solid #e7edf3;
}

.beta-ribbon__content {
  display: flex;
  align-items: center;
  /* Right-aligned and full-bleed rather than capped at a centred max-width, so
     the marker sits hard against the right edge instead of floating inward on
     wide screens. */
  justify-content: flex-end;
  width: 100%;
}

/* Identical to the badge this replaced: yellow pill, black tag, near-black
   text at ~11:1 contrast. */
.beta-ribbon__link {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 6px;
  padding: 2px 8px 2px 2px;
  border: 1px solid #eab308;
  border-radius: 999px;
  background-color: #fef9c3;
  color: #0e141b;
  text-decoration: none;
  white-space: nowrap;
  transition:
    background-color 160ms ease,
    border-color 160ms ease;
}

.beta-ribbon__link:hover {
  background-color: #ffffff;
  border-color: #a16207;
}

.beta-ribbon__link:focus-visible {
  outline: 2px solid #0e141b;
  outline-offset: 2px;
}

.beta-ribbon__tag {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 3px 7px;
  background: #0e141b;
  color: #fde047;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.beta-ribbon__cta {
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
}

.beta-ribbon__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  border: 0;
  overflow: hidden;
  white-space: nowrap;
  clip: rect(0, 0, 0, 0);
  clip-path: inset(50%);
}

@media (max-width: 640px) {
  .beta-ribbon__panel {
    padding: 2px 8px 2px 12px;
  }
}
</style>
