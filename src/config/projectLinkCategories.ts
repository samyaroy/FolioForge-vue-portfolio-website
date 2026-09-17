// `cred_link` categories a project card renders, in the order they appear on
// the card. The key is the YAML key; a project may carry one link per category,
// and a key outside this list is kept but never shown.
// Mirrors the anchors in
// views/ProjectsPublications/components/ProjectTab/components/*.vue.
export const projectLinkCategories = {
  report: 'Report',
  researchgate: 'ResearchGate',
  github: 'GitHub',
  kaggle: 'Kaggle',
  website: 'Website',
} as const

export type ProjectLinkCategory = keyof typeof projectLinkCategories
