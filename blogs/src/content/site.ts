// Typed accessors over site.yml. The content lives in the YAML file; this
// module only pins the shapes so consumers keep compile-time checking.
import raw from './site.yml'

export interface SiteProfile {
  name: string
  profileIconPath: string
  email: string
}

export interface HomeHero {
  imagePath: string
  fallbackImage: string
  alt: string
  caption: string
}

export interface HomeLatestLabels {
  title: string
  post: string
  readPost: string
  reading: string
  movie: string
  olderTitle: string
  olderNote: string
}

export interface LabeledLink {
  label: string
  href: string
}

export interface FooterContent {
  privacyLabel: string
  privacyPath: string
  rightsText: string
  lastUpdatedLabel: string
  lastUpdated: string
  iconAttributionIntro: string
  iconAttributionSource: string
  iconAttributionLinks: LabeledLink[]
  designCreditIntro: string
  designCreditName: string
  designCreditHref: string
  designCreditOutro: string
  disclosure: string
}

interface SiteContent {
  profile: SiteProfile
  hero: HomeHero
  homeLatest: HomeLatestLabels
  socialLinks: LabeledLink[]
  footer: FooterContent
}

const site = raw as SiteContent

export const SITE_PROFILE = site.profile
export const HOME_HERO = site.hero
export const HOME_LATEST_LABELS = site.homeLatest
export const SOCIAL_LINKS = site.socialLinks
export const FOOTER_CONTENT = site.footer
