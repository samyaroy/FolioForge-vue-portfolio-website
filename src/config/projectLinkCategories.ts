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

/**
 * The categories a mentored-project card renders. Fewer than a project's: the
 * card in Teachings draws a report and a repository and nothing else, so
 * offering the rest would promise links that never appear.
 * Mirrors `getProjectActionLinks` in
 * views/Teachings/components/ProjectsMentoredTab.vue.
 */
export const mentoredProjectLinkCategories = {
  report: 'Project Report',
  github: 'GitHub Repository',
} as const

export type MentoredProjectLinkCategory = keyof typeof mentoredProjectLinkCategories

/**
 * The categories an ongoing-project card renders. Narrower again: the card in
 * Ongoing Projects draws a repository and a Kaggle notebook and nothing else,
 * so a report or a website set here would never appear.
 * Mirrors the link row in views/OngoingProjects/components/ProjectCard.vue.
 */
export const ongoingProjectLinkCategories = {
  github: 'GitHub',
  kaggle: 'Kaggle',
} as const

export type OngoingProjectLinkCategory = keyof typeof ongoingProjectLinkCategories
