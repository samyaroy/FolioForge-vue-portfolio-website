/**
 * Turns a YAML key into a field caption: `job_role` becomes `Job role`.
 * Only the first letter is raised, so wording inside the name keeps its case
 * (`cred_link (Drive file ID / URL)` stays readable).
 */
export function fieldCaption(key: string): string {
  const spaced = key.replaceAll('_', ' ').trim()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}
