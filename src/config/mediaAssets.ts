// Resolves institute logos and service icons to their hosted URLs.
//
// Both sets used to live in public/ and ship inside dist/ on every build. They
// are served from media.samyabrata.codeium.xyz now, with the base URLs authored
// in profile.yml so moving them again is a content edit rather than a hunt
// through the ten components that reference them.
//
// Names stay bare at the call sites and in the YAML content ("IITM", "Credly").
// This module owns the two things that were previously repeated inline: joining
// the base and appending the .png extension.

import config from '@/content/profile_info'

/** Used when the YAML base is blank, so the in-repo copies still resolve. */
const LOCAL_LOGOS = '/logo'
const LOCAL_ICONS = '/icons'

function baseUrl(configured: unknown, fallback: string): string {
  const value = typeof configured === 'string' ? configured.trim() : ''
  // Trailing slashes are easy to leave in a YAML value and would produce a
  // double slash in every URL built from it.
  return (value || fallback).replace(/\/+$/, '')
}

const LOGOS_BASE = baseUrl(config.media?.logosBaseUrl, LOCAL_LOGOS)
const ICONS_BASE = baseUrl(config.media?.iconsBaseUrl, LOCAL_ICONS)

function assetUrl(base: string, name: unknown): string {
  const file = typeof name === 'string' ? name.trim() : ''
  if (!file) return ''

  // Some YAML entries already carry a full URL or a rooted path, meaning "use
  // exactly this"; those must not be rewritten onto the media host.
  if (/^https?:\/\//i.test(file) || file.startsWith('/')) return file

  // Content names the logo, not the file: `logo: IITM` -> IITM.png.
  return `${base}/${/\.[a-z0-9]+$/i.test(file) ? file : `${file}.png`}`
}

/** Institute/organisation logo, e.g. logoUrl('IITM'). */
export function logoUrl(name: unknown): string {
  return assetUrl(LOGOS_BASE, name)
}

/** Service icon, e.g. iconUrl('Credly'). */
export function iconUrl(name: unknown): string {
  return assetUrl(ICONS_BASE, name)
}
