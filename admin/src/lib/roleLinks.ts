// A co-curricular role points at one thing: a credential document
// (`cred_link`, opened in the site's viewer) or a website (`ext_link`, opened
// in a new tab). Never both — the card shows the credential if both are set —
// so the editor offers one choice rather than two unrelated boxes.
export const CREDENTIAL_KEY = 'cred_link'
export const WEBSITE_KEY = 'ext_link'

export type RoleLinkKind = 'none' | 'credential' | 'website'

/** Whether a set of keys holds both halves of a role link. */
export function hasRoleLink(keys: readonly string[]): boolean {
  return keys.includes(CREDENTIAL_KEY) && keys.includes(WEBSITE_KEY)
}

/** Which link the card shows: the credential wins, as it does on the site. */
export function roleLinkKind(credential: string, website: string): RoleLinkKind {
  if (credential.trim()) return 'credential'
  if (website.trim()) return 'website'
  return 'none'
}

/**
 * ExternalLink.vue renders only an absolute http(s) URL and silently drops
 * anything else, so a website the site would not show is caught on save.
 */
export function isWebsiteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim())
}

export const WEBSITE_URL_ERROR = 'Enter a website link that starts with https://, or the site will not show it.'
