<template>
  <aside v-if="isBeta" class="beta-ribbon" role="note" aria-label="Beta build notice">
    <div class="beta-ribbon__content">
      <span class="beta-ribbon__tag">Beta</span>
      <p class="beta-ribbon__message">
        You are viewing the beta version of this site.
        <a :href="stableUrl" class="beta-ribbon__link">
          Go to the stable site<span aria-hidden="true">&nbsp;&rarr;</span>
        </a>
      </p>
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
</script>

<style scoped>
/* Structure mirrors InfoRibbon so the two stack as one band when both show. */
.beta-ribbon {
  position: relative;
  z-index: 1;
  width: 100%;
  padding: 5px 16px;
  /* Yellow with near-black text: ~11:1 contrast. */
  color: #0e141b;
  background: linear-gradient(90deg, #fde047 0%, #facc15 55%, #fbbf24 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45);
  border-bottom: 1px solid #ca8a04;
}

.beta-ribbon__content {
  display: flex;
  align-items: center;
  justify-content: center;
  width: min(1200px, 100%);
  min-height: 26px;
  margin: 0 auto;
  gap: 10px;
}

.beta-ribbon__tag {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  border-radius: 999px;
  padding: 3px 8px;
  background: #0e141b;
  color: #fde047;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.beta-ribbon__message {
  margin: 0;
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.3;
  text-wrap: balance;
}

.beta-ribbon__link {
  color: #0e141b;
  text-decoration: underline;
  text-decoration-color: rgba(14, 20, 27, 0.45);
  text-underline-offset: 3px;
  white-space: nowrap;
  transition: text-decoration-color 160ms ease;
}

.beta-ribbon__link:hover {
  text-decoration-color: #0e141b;
}

.beta-ribbon__link:focus-visible {
  outline: 2px solid #0e141b;
  outline-offset: 2px;
}

@media (max-width: 640px) {
  .beta-ribbon {
    padding: 5px 12px;
  }

  .beta-ribbon__content {
    justify-content: flex-start;
    gap: 8px;
    text-align: left;
  }

  .beta-ribbon__message {
    font-size: 0.78rem;
  }
}
</style>
