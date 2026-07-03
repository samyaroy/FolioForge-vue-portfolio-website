// Typed accessors over site.yml. The content lives in the YAML file; this
// module only pins the shapes so consumers keep compile-time checking.
import raw from './site.yml'

export interface SiteProfile {
  name: string
  profileIconPath: string
}

export interface HomeHero {
  imagePath: string
  fallbackImage: string
  alt: string
  caption: string
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
}

interface SiteContent {
  profile: SiteProfile
  hero: HomeHero
  socialLinks: LabeledLink[]
  footer: FooterContent
}

const site = raw as SiteContent

export const SITE_PROFILE = site.profile
export const HOME_HERO = site.hero
export const SOCIAL_LINKS = site.socialLinks
export const FOOTER_CONTENT = site.footer
