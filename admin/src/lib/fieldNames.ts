/**
 * Turns a YAML key into a field caption: `job_role` becomes `Job role`.
 * Only the first letter is raised, so wording inside the name keeps its case
 * (`cred_link (Drive file ID / URL)` stays readable).
 */
export function fieldCaption(key: string): string {
  // A dotted column names a nested value; the path reads as a phrase rather
  // than as a path, so `organization.web_link` becomes "Organization web link".
  const spaced = key.replaceAll('.', ' ').replaceAll('_', ' ').trim()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}
