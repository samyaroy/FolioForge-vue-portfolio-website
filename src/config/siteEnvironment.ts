// Deployment settings and public hostnames identify published sites. Checkout
// metadata identifies local/preview builds without a mergeable branch marker.

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

/**
 * Explicit declaration from the deployment's build settings, and the first
 * thing consulted. 'beta' or 'stable'; anything else (including unset, the
 * normal case) falls through to the hostname.
 *
 * Use a deployment setting to override hostname and branch detection, for
 * example to smoke-test another environment locally:
 *
 *   VITE_SITE_ENV=stable npm run build
 *
 * Cloudflare: set VITE_SITE_ENV on each deployment's build variables (beta on
 * the V1 build, stable on the main build). The build reads the same value; see
 * vite.config.ts, which uses it to noindex non-production output.
 */
const DECLARED_ENV = (import.meta.env?.VITE_SITE_ENV ?? '').trim().toLowerCase()
const SITE_BRANCH = import.meta.env.VITE_SITE_BRANCH ?? ''

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

function siteEnvironment(): 'beta' | 'stable' | null {
  if (DECLARED_ENV === 'beta' || DECLARED_ENV === 'stable') return DECLARED_ENV
  if (host && host === hostnameOf(STABLE_URL)) return 'stable'
  if (host.startsWith(BETA_HOST_PREFIX)) return 'beta'
  if (SITE_BRANCH === 'main') return 'stable'
  if (SITE_BRANCH === 'V1' || LOCAL_HOSTS.includes(host)) return 'beta'
  return null
}

export function isBetaSite(): boolean {
  return siteEnvironment() === 'beta'
}

export function isStableSite(): boolean {
  return siteEnvironment() === 'stable'
}
