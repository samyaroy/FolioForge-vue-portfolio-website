type FeatureFlagLeaf = boolean

type FeatureFlagNode = {
  [key: string]: FeatureFlagLeaf | FeatureFlagNode
}

const DEFAULT_FEATURE_FLAGS = Object.freeze({
  showHome: {
    showHeroSection: true,
    showResearchInterests: true,
    showExperience: true,
    showEducation: true,
    showAwards: true,
  },

  showProjectsPublications: {
    showArticles: {
      showGeneralArticles: true,
      showJournalArticles: true,
    },
    showProjects: {
      showResearchProjects: true,
      showTechnicalProjects: true,
    },
    showPublications: true,
    showPosters: false,
  },

  showGallery: true,

  showCocurricular: {
    showLeadershipOrganizations: true,
    showVolunteering: true,
  },

  showOngoingProjects: true,

  showInternshipCertifications: {
    showInternships: true,
    showCertifications: true,
  },

  showWorkshopsAttended: {
    showConferences: true,
    showFDPs: false,
    showWorkshops: true,
    showBootcamps: true,
    showOther: false,
  },

  showTeachings: {
    showCoursesTaught: false,
    showProjectsMentored: false,
    showOtherTeachings: false,
  },

  showAffiliations: {
    showAffiliations: false,
    showCollaborators: false,
    showMemberships: false,
  },

  showProfessionalActivity: {
    showInvitedTalks: false,
    showHostedEvents: false,
  },
}) satisfies FeatureFlagNode

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

function evaluateAny(node: FeatureFlagLeaf | FeatureFlagNode | undefined): boolean {
  if (typeof node === 'boolean') return node
  if (!isPlainObject(node)) return false

  const children = Object.values(node)
  if (children.length === 0) return false

  return children.some((child) =>
    evaluateAny(child as FeatureFlagLeaf | FeatureFlagNode),
  )
}

export const featureFlags: FeatureFlagNode = DEFAULT_FEATURE_FLAGS

type FeatureCheckOptions = {
  mode?: 'all' | 'any'
}

export function isFeatureEnabled(
  flagPath?: string | string[],
  options: FeatureCheckOptions = {},
): boolean {
  const mode = options.mode === 'any' ? 'any' : 'all'
  const target = resolveFlagNode(flagPath, featureFlags)
  return mode === 'any' ? evaluateAny(target) : evaluateAll(target)
}