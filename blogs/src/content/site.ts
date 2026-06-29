export const SITE_PROFILE = {
  name: 'Samyabrata Roy',
  profileIconPath: '/profile-icon.png',
}

// Full-bleed hero shown at the top of the blog home page.
// Drop your own image at blogs/public/hero.jpg (any wide image works).
// If that file is missing, the fallback below renders so the page is never empty.
export const HOME_HERO = {
  imagePath: '/hero.jpg',
  fallbackImage: 'https://picsum.photos/1600/900?grayscale',
  alt: 'Featured artwork',
  caption: 'Generated using Gemini 3.1 Pro',
}

// Social links rendered vertically on the right edge of the hero.
// Edit the hrefs to point at your own profiles; remove any you don't use.
export const SOCIAL_LINKS = [
  { label: 'X', href: 'https://x.com/' },
  { label: 'Instagram', href: 'https://www.instagram.com/the_pessimist_one/' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/samyabrata23/' },
] as const satisfies ReadonlyArray<{ label: string; href: string }>

export const FOOTER_CONTENT = {
  privacyLabel: 'Privacy Policy',
  privacyPath: '/#/privacy-policy',
  rightsText: 'Rights Reserved',
  lastUpdatedLabel: 'Last updated',
  lastUpdated: 'June 2026',
  iconAttributionIntro: 'ⓘ Some icons used are made by',
  iconAttributionSource: 'from',
  iconAttributionLinks: [
    {
      label: 'Freepik',
      href: 'https://www.flaticon.com/authors/freepik',
    },
    {
      label: 'Smashicons',
      href: 'https://www.flaticon.com/authors/smashicons',
    },
    {
      label: 'Flaticon',
      href: 'https://www.flaticon.com/free-icons/class',
    },
  ],
}
