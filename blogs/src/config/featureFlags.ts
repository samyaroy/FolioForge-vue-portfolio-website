type FeatureFlagLeaf = boolean
type FeatureFlagNode = {
  readonly [key: string]: FeatureFlagLeaf | FeatureFlagNode
}

const DEFAULT_FEATURE_FLAGS = Object.freeze({
  showBlogHome: true,
  showReadings: true,
  showTravel: true,
  showHobbies: true,
  showGallery: true,
  // "Did you know?" nav link to the main site's /facts route.
  showFactsLink: true,
  showPortfolioLink: true,

  // Controls the subtitle/description line under each page's title.
  // Text for each page lives in blogs/src/content/description.yml.
  // `enabled` is the master switch: when false, every page description is hidden
  // regardless of its per-page flag. When true, each page's own flag decides.
  showPageDescriptions: {
    enabled: true,
    blogs: true,
    readings: true,
    travel: true,
    hobbies: true,
    gallery: true,
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
