type FeatureFlagLeaf = boolean

type FeatureFlagNode = {
  [key: string]: FeatureFlagLeaf | FeatureFlagNode
}

const DEFAULT_FEATURE_FLAGS = Object.freeze({
  showHome: {
    showRibbon: true,
    showHeroSection: true,
    showResearchInterests: true,
    showExperience: true,
    showEducation: {
      main: true,
      showCourseDetailsInfo: true,
    },
    showAwards: false,
    showAchivement: false,
  },

  showProjectsPublications: {
    showArticles: {
      showGeneralArticles: true,
      showJournalArticles: false,
    },
    showProjects: {
      showResearchProjects: true,
      showTechnicalProjects: true,
      showOtherProjects: true,
    },
    // Controls whether collapsible project sections start expanded (true) or collapsed (false)
    expandProjectSectionsByDefault: {
      technicalProjects: false,
      otherProjects: false,
    },
    showPublications: true,
    showPosters: false,
  },

  showGallery: true,

  showBlog: true,

  showCocurricular: {
    showLeadershipOrganizations: true,
    showVolunteering: true,
  },

  showOngoingProjects: false,

  showInternshipCertifications: {
    showInternships: true,
    showCertifications: true,
  },

  showWorkshopsAttended: {
    showConferences: true,
    showFDPs: false,
    showWorkshops: {
      main: true,
      others: true,
    },
    showBootcamps: true,
    showOther: true,
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
    showHostedEvents: {
      main: false,
      others: false,
    },
  },

  showResources: {
    main: true,
    showRibbon: false,
  },

  // Controls the "Did you know?" facts page (/facts) and its nav link.
  showFacts: false,

  // Controls the quote pane rendered between page content and the footer.
  showPageQuotePane: true,

  // Controls the subtitle/description line under each page's title.
  // Text for each page lives in src/content/profile_info/description.yml.
  // `enabled` is the master switch: when false, every page description is hidden
  // regardless of its per-page flag. When true, each page's own flag decides.
  showPageDescriptions: {
    enabled: false,
    projectsPublications: false,
    internshipCertifications: false,
    cocurricular: false,
    affiliations: false,
    resources: false,
    contact: false,
    ongoingProjects: false,
    professionalActivity: false,
    teachings: false,
    workshopsAttended: false,
    facts: false,
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

// Whether a given page's title description line should render.
// Gated by the master switch `showPageDescriptions.enabled`: if that is off,
// no page description shows; if on, the page's own flag decides.
export function isPageDescriptionEnabled(page: string): boolean {
  return (
    isFeatureEnabled('showPageDescriptions.enabled') &&
    isFeatureEnabled(`showPageDescriptions.${page}`)
  )
}
