import type { BlogFeatureFlag } from '../config/featureFlags'

export const MAIN_SITE_URL = 'https://samyabrata.codeium.xyz'
export const PORTFOLIO_NAV_LABEL = 'Portfolio'

// "Did you know?" links to the main (portfolio) site's /facts route.
export const FACTS_NAV_LABEL = 'Did you know?'
export const FACTS_URL = `${MAIN_SITE_URL}/facts`

export const NAV_ITEMS = [
  { to: '/', label: 'Blog', flag: 'showBlogHome' },
  { to: '/readings', label: 'Readings', flag: 'showReadings' },
  { to: '/travel', label: 'Travel', flag: 'showTravel' },
  { to: '/hobbies', label: 'Hobbies', flag: 'showHobbies' },
  { to: '/gallery', label: 'Gallery', flag: 'showGallery' },
] as const satisfies ReadonlyArray<{
  to: string
  label: string
  flag: BlogFeatureFlag
}>
