type FeatureFlagLeaf = boolean
type FeatureFlagNode = {
  readonly [key: string]: FeatureFlagLeaf | FeatureFlagNode
}

const DEFAULT_FEATURE_FLAGS = Object.freeze({
  showBlogHome: true,
  showRecommended: true,
  showReadings: true,
  showMovies: true,
  showTravel: true,
  showHobbies: true,
  showGallery: true,
  // "Worth Your Time" nav link to /recommended. Separate from showRecommended
  // so the page and the blog home teaser can stay on while the header link is
  // off -- the teaser's "All N recommendations" link is then the way in.
  showRecommendedNavLink: false,
  // "Did you know?" nav link to the main site's /facts route.
  showFactsLink: false,
  showPortfolioLink: true,

  // Post page: the scroll-position bar pinned to the top of the viewport, and
  // the estimated reading time in the byline.
  showReadingProgress: true,
  showReadingTime: true,

  // Controls the subtitle/description line under each page's title.
  // Text for each page lives in blogs/src/content/sections.yml.
  // `enabled` is the master switch: when false, every page description is hidden
  // regardless of its per-page flag. When true, each page's own flag decides.
  showPageDescriptions: {
    enabled: true,
    blogs: true,
    recommended: true,
    readings: true,
    movies: true,
    travel: true,
    hobbies: false,
    gallery: false,
  },
}) satisfies FeatureFlagNode

type BooleanFeatureKeys<T> = {
  [K in keyof T]: T[K] extends boolean ? K : never
}[keyof T]

export const featureFlags: FeatureFlagNode = DEFAULT_FEATURE_FLAGS

export type BlogFeatureFlag = Extract<
  BooleanFeatureKeys<typeof DEFAULT_FEATURE_FLAGS>,
  string
>

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function resolveFlagNode(
  flagPath?: string | string[],
  source: FeatureFlagNode = featureFlags,
): FeatureFlagLeaf | FeatureFlagNode | undefined {
  if (!flagPath) return source

  const segments = Array.isArray(flagPath)
    ? flagPath
    : String(flagPath).split('.').filter(Boolean)

  let node: FeatureFlagLeaf | FeatureFlagNode | undefined = source

  for (const segment of segments) {
    if (!isPlainObject(node) || !(segment in node)) return undefined
    node = node[segment] as FeatureFlagLeaf | FeatureFlagNode
  }

  return node
}

function evaluateAll(node: FeatureFlagLeaf | FeatureFlagNode | undefined): boolean {
  if (typeof node === 'boolean') return node
  if (!isPlainObject(node)) return false

  const children = Object.values(node)
  if (children.length === 0) return false

  return children.every((child) =>
    evaluateAll(child as FeatureFlagLeaf | FeatureFlagNode),
  )
}

export function isFeatureEnabled(flagPath?: string | string[]): boolean {
  return evaluateAll(resolveFlagNode(flagPath, featureFlags))
}

export function isPageDescriptionEnabled(page: string): boolean {
  return (
    isFeatureEnabled('showPageDescriptions.enabled') &&
    isFeatureEnabled(`showPageDescriptions.${page}`)
  )
}
