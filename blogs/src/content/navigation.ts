// Typed accessors over navigation.yml.
import { featureFlags, type BlogFeatureFlag } from '../config/featureFlags'
import raw from './navigation.yml'

export interface NavItem {
  to: string
  label: string
  flag: BlogFeatureFlag
}

interface NavigationContent {
  mainSiteUrl: string
  portfolioNavLabel: string
  factsNavLabel: string
  navItems: NavItem[]
}

const navigation = raw as NavigationContent

export const MAIN_SITE_URL = navigation.mainSiteUrl
export const PORTFOLIO_NAV_LABEL = navigation.portfolioNavLabel

// "Did you know?" links to the main (portfolio) site's /facts route.
export const FACTS_NAV_LABEL = navigation.factsNavLabel
export const FACTS_URL = `${MAIN_SITE_URL}/facts`

export const NAV_ITEMS = navigation.navItems

// YAML can't enforce the flag-name union at compile time the way the old
// `satisfies` clause did, so surface typos while developing.
if (import.meta.env.DEV) {
  for (const item of NAV_ITEMS) {
    if (!(item.flag in featureFlags)) {
      console.warn(
        `navigation.yml: unknown feature flag "${item.flag}" on nav item "${item.label}"`,
      )
    }
  }
}
