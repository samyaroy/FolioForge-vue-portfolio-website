import affiliationsYaml from '../../../src/content/profile_info/affiliations.yml'
import certificationsYaml from '../../../src/content/profile_info/certifications.yml'
import cocurricularYaml from '../../../src/content/profile_info/cocurricular.yml'
import educationYaml from '../../../src/content/profile_info/education.yml'
import experienceYaml from '../../../src/content/profile_info/experience.yml'
import internshipsYaml from '../../../src/content/profile_info/internships.yml'
import professionalActivityYaml from '../../../src/content/profile_info/professional_activity.yml'
import projectsYaml from '../../../src/content/profile_info/projects.yml'
import publicationsYaml from '../../../src/content/profile_info/publications.yml'
import resourcesYaml from '../../../src/content/profile_info/resources.yml'
import teachingYaml from '../../../src/content/profile_info/teaching.yml'
import workshopsYaml from '../../../src/content/profile_info/workshops.yml'

// Keys whose value names a logo. A logo value is sometimes a bare string and
// sometimes a list, and both shapes appear across the content.
const LOGO_KEYS = new Set(['logo', 'logos', 'icon', 'icons'])

function collect(value: unknown, key: string | undefined, found: Set<string>) {
  if (typeof value === 'string') {
    if (key && LOGO_KEYS.has(key)) found.add(value.trim())
    return
  }
  if (Array.isArray(value)) {
    for (const item of value) collect(item, key, found)
    return
  }
  if (value && typeof value === 'object') {
    for (const [childKey, child] of Object.entries(value)) collect(child, childKey, found)
  }
}

/**
 * Every logo value the portfolio content currently names. Archiving one of
 * these would leave a broken image on the site, so the catalogue refuses it.
 *
 * Deliberately generous: it gathers any value under a logo-ish key anywhere in
 * the tree, because a missed reference means a broken page while an extra one
 * only means a logo has to be unreferenced by hand first.
 */
export const referencedLogos: ReadonlySet<string> = (() => {
  const found = new Set<string>()
  for (const document of [
    affiliationsYaml, certificationsYaml, cocurricularYaml, educationYaml,
    experienceYaml, internshipsYaml, professionalActivityYaml, projectsYaml,
    publicationsYaml, resourcesYaml, teachingYaml, workshopsYaml,
  ]) collect(document, undefined, found)
  found.delete('')
  return found
})()

export function isLogoReferenced(value: string): boolean {
  const name = value.trim()
  // A catalogue value may carry its extension while the YAML omits it.
  return referencedLogos.has(name) || referencedLogos.has(name.replace(/\.[a-z0-9]+$/i, ''))
}
