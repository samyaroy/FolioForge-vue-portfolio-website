const DEFAULT_FEATURE_FLAGS = Object.freeze({
  showProjectsPublications: {
    showArticles: true,
    showProjects: {
      showResearchProjects: true,
      showTechnicalProjects: true,
    },
    showPublications: true,
    showPosters: false,
  },

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
})

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function resolveFlagNode(flagPath, source = featureFlags) {
  if (!flagPath) return source

  const segments = Array.isArray(flagPath)
    ? flagPath
    : String(flagPath).split('.').filter(Boolean)

  let node = source
  for (const segment of segments) {
    if (!isPlainObject(node) || !(segment in node)) return undefined
    node = node[segment]
  }

  return node
}

function evaluateAll(node) {
  if (typeof node === 'boolean') return node
  if (!isPlainObject(node)) return false

  const children = Object.values(node)
  if (children.length === 0) return false

  return children.every(evaluateAll)
}

function evaluateAny(node) {
  if (typeof node === 'boolean') return node
  if (!isPlainObject(node)) return false

  const children = Object.values(node)
  if (children.length === 0) return false

  return children.some(evaluateAny)
}

export const featureFlags = DEFAULT_FEATURE_FLAGS

export function isFeatureEnabled(flagPath, options = {}) {
  const mode = options.mode === 'any' ? 'any' : 'all'
  const target = resolveFlagNode(flagPath, featureFlags)
  return mode === 'any' ? evaluateAny(target) : evaluateAll(target)
}
