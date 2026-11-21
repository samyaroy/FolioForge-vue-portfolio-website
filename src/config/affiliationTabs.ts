import { isFeatureEnabled } from '@/config/featureFlags'

/**
 * Which tabs the Affiliations page shows, and the name that follows from them.
 * The page heading and the footer link both use the name, so switching a tab off
 * in featureFlags.ts takes it out of both.
 */

// The Collaborators tab needs its own switch and at least one of its two groups
// switched on; with neither group showing it would only ever say it was empty.
export function isCollaboratorsTabEnabled(): boolean {
  return isFeatureEnabled('showAffiliations.showCollaborators.main')
    && (isFeatureEnabled('showAffiliations.showCollaborators.showMentors')
      || isFeatureEnabled('showAffiliations.showCollaborators.showPeers'))
}

// Names only the tabs the page shows: with Collaborators off, "Affiliations,
// Collaborators & Memberships" becomes "Affiliations & Memberships".
export function affiliationsPageTitle(): string {
  const tabs: Array<[boolean, string]> = [
    [isFeatureEnabled('showAffiliations.showAffiliations'), 'Affiliations'],
    [isCollaboratorsTabEnabled(), 'Collaborators'],
    [isFeatureEnabled('showAffiliations.showMemberships'), 'Memberships'],
  ]
  const names = tabs.filter(([shown]) => shown).map(([, name]) => name)
  if (names.length > 1) return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`
  return names[0] ?? 'Affiliations & Memberships'
}
