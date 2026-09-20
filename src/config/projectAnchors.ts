import config from '@/content/profile_info'
import { slugify } from '@/utils/slug'

/**
 * Deep links to a single project.
 *
 * A project has no id of its own, so its title is the identity — which is also
 * how other content already refers to one: an internship names the project it
 * produced by title. The slug is derived the same way on both sides, so a link
 * and its target agree without either storing an extra key.
 *
 * A title that has been edited on one side and not the other stops matching,
 * and the link falls back to opening the Projects tab rather than breaking.
 */
export const PROJECT_TAB = 'projects'
export const PROJECT_ANCHOR_PARAM = 'project'

const GROUPS = ['research_projects', 'technical_projects', 'minor_projects', 'other_projects'] as const

export function projectSlug(title: unknown): string {
  return slugify(title)
}

function titles(): string[] {
  const projects = (config as Record<string, unknown>).projects as Record<string, unknown> | undefined
  if (!projects) return []
  return GROUPS.flatMap(group => {
    const items = projects[group]
    return Array.isArray(items) ? items.map(item => String((item as { title?: unknown })?.title ?? '')) : []
  }).filter(Boolean)
}

/** Whether a title names a project the Projects tab actually shows. */
export function isKnownProject(title: unknown): boolean {
  const slug = projectSlug(title)
  return Boolean(slug) && titles().some(candidate => projectSlug(candidate) === slug)
}

/** Where to send someone who clicks a project named elsewhere. */
export function projectRoute(title: unknown) {
  return {
    path: '/projects-publications',
    query: { tab: PROJECT_TAB, [PROJECT_ANCHOR_PARAM]: projectSlug(title) },
  }
}
