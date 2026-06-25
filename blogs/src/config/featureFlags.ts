const DEFAULT_FEATURE_FLAGS = Object.freeze({
  showBlogHome: true,
  showReadings: true,
  showTravel: true,
  showHobbies: true,
  showGallery: true,
  showPortfolioLink: true,
})

export const featureFlags = DEFAULT_FEATURE_FLAGS

export type BlogFeatureFlag = keyof typeof featureFlags

export function isFeatureEnabled(flag: BlogFeatureFlag): boolean {
  return featureFlags[flag] === true
}
