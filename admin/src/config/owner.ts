import profileYaml from '../../../src/content/profile_info/profile.yml'

// The name and portrait the portfolio itself publishes. Reading them from the
// same YAML the site renders means the admin shows the owner the face their own
// site shows, and changing it stays a content edit rather than a code one.
const profile = (profileYaml as { profile?: Record<string, unknown> }).profile ?? {}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

export const owner = {
  name: text(profile.name) || 'Account',
  /** A hosted URL or a path served from public/. Blank when unset. */
  image: text(profile.heroImage),
  imageAlt: text(profile.heroImageAlt) || text(profile.name),
}
