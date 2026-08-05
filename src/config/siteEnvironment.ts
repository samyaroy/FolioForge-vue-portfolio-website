// Which deployment is the visitor actually on?
//
// The check is on the hostname rather than a feature flag or any tracked config
// file, and that is deliberate: V1 is merged into main by replacing main's tree
// wholesale, so any branch-local marker would ride along into production on the
// next merge. The host is the one thing that differs at runtime and that no
// merge can carry over, which makes this safe to have on both branches. (It is
// also how the footer's beta link was lost from main in the first place.)
//
// Consumers:
//   - BetaBadge.vue    links to the stable site, but only on the beta host
//   - Footer/index.vue links to the beta site, but only on the stable host

import config from '@/content/profile_info'
import { SITE_URL } from '@/router/routes'

const BETA_HOST_PREFIX = 'beta.'
const LOCAL_HOSTS = ['localhost', '127.0.0.1', '[::1]']

/** Stable (production) deployment. */
export const STABLE_URL: string = SITE_URL

/**
 * Beta deployment. Authored in profile.yml so the URL lives with the rest of
 * the site content rather than being duplicated in code.
 */
export const BETA_URL: string | null = config.profile?.betaVersionUrl ?? null

// Guarded for the prerender pass, which runs in Node. scripts/seo-build.ts only
// stamps <head> on the built shell today, so no component renders there, but the
// guard keeps beta messaging out of the static HTML if that ever changes.
const host = typeof window === 'undefined' ? '' : window.location.hostname.toLowerCase()

function hostnameOf(url: string | null): string | null {
  if (!url) return null
  try {
    return new URL(url).hostname.toLowerCase()
  } catch {
    // A malformed URL in profile.yml should not take the site down; it just
    // means we cannot identify that host.
    return null
  }
}

/**
 * True on the beta host. Local dev counts as beta too -- if you are on
 * localhost you are by definition not looking at the published site.
 */
export function isBetaSite(): boolean {
  return host.startsWith(BETA_HOST_PREFIX) || LOCAL_HOSTS.includes(host)
}

/**
 * True only on the stable host. Deliberately not the inverse of isBetaSite():
 * localhost is neither, so the "looking for beta?" pointer stays out of the way
 * during local development.
 */
export function isStableSite(): boolean {
  const stable = hostnameOf(STABLE_URL)
  return Boolean(host && stable && host === stable)
}
