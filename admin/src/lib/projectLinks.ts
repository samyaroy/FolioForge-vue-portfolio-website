export type ProjectLinkDraft = { category: string; url: string }

// A project's `cred_link` is a map of category to URL, so a project carries at
// most one link per category. Links are stored as typed, with no Drive
// rewriting: these point at GitHub, Kaggle and websites as often as Drive.
export function projectLinksDraft(value: unknown): ProjectLinkDraft[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return []
  return Object.entries(value as Record<string, unknown>)
    .filter(([category, url]) => category.trim() && typeof url === 'string' && url.trim())
    .map(([category, url]) => ({ category, url: String(url) }))
}

export function serializeProjectLinks(links: ProjectLinkDraft[], original: unknown): unknown {
  const filled = links.map(link => ({ category: link.category.trim(), url: link.url.trim() })).filter(link => link.category || link.url)
  if (filled.some(link => !link.category)) throw new Error('Choose a category for each project link.')
  if (filled.some(link => !link.url)) throw new Error('Enter a URL for each project link.')

  const duplicate = filled.find((link, index) => filled.findIndex(other => other.category === link.category) !== index)
  if (duplicate) throw new Error(`Only one ${duplicate.category} link is allowed per project.`)

  // An emptied map is written as a blank key, the shape the YAML already uses
  // for a project with nothing to link.
  if (!filled.length) return original === undefined ? undefined : null
  return Object.fromEntries(filled.map(link => [link.category, link.url]))
}
