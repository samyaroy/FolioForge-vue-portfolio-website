import { isCollaboratorsTabEnabled, isFeatureEnabled } from '@/config/featureFlags'

/**
 * The name of the Affiliations page, from the tabs it shows. The page heading
 * and the footer link both use it, so switching a tab off in featureFlags.ts
 * takes it out of both.
 */

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
