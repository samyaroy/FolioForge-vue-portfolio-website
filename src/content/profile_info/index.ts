// Central aggregator for the portfolio content.
//
// `profile_info.yml` was split into the section files in this folder for easier
// editing. YAML has no native "include", so this module imports each split file
// (parsed to objects by @modyfi/vite-plugin-yaml) and merges them back into a
// single config object — a drop-in replacement for the old `@/profile_info.yml`.
//
// To add a new section: create `<section>.yml` here and add it to the spread below.
import meta from './meta.yml'
import profile from './profile.yml'
import researchInterests from './research_interests.yml'
import education from './education.yml'
import experience from './experience.yml'
import internships from './internships.yml'
import certifications from './certifications.yml'
import projects from './projects.yml'
import publications from './publications.yml'
import ongoingProjects from './ongoing_projects.yml'
import cocurricular from './cocurricular.yml'
import workshops from './workshops.yml'
import teaching from './teaching.yml'
import affiliations from './affiliations.yml'
import professionalActivity from './professional_activity.yml'
import pageQuotes from './page_quotes.yml'
import ribbon from './ribbon.yml'

export const profileInfoSources = [
  { source: 'src/content/profile_info/meta.yml', data: meta },
  { source: 'src/content/profile_info/profile.yml', data: profile },
  { source: 'src/content/profile_info/research_interests.yml', data: researchInterests },
  { source: 'src/content/profile_info/education.yml', data: education },
  { source: 'src/content/profile_info/experience.yml', data: experience },
  { source: 'src/content/profile_info/internships.yml', data: internships },
  { source: 'src/content/profile_info/certifications.yml', data: certifications },
  { source: 'src/content/profile_info/projects.yml', data: projects },
  { source: 'src/content/profile_info/publications.yml', data: publications },
  { source: 'src/content/profile_info/ongoing_projects.yml', data: ongoingProjects },
  { source: 'src/content/profile_info/cocurricular.yml', data: cocurricular },
  { source: 'src/content/profile_info/workshops.yml', data: workshops },
  { source: 'src/content/profile_info/teaching.yml', data: teaching },
  { source: 'src/content/profile_info/affiliations.yml', data: affiliations },
  { source: 'src/content/profile_info/professional_activity.yml', data: professionalActivity },
  { source: 'src/content/profile_info/page_quotes.yml', data: pageQuotes },
  { source: 'src/content/profile_info/ribbon.yml', data: ribbon },
] as const

// Same reasoning as the `*.yml` shim in ./yml.d.ts — the merged config is
// schemaless by design and is read with dotted property access everywhere.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const config: Record<string, any> = {
  ...meta,
  ...profile,
  ...researchInterests,
  ...education,
  ...experience,
  ...internships,
  ...certifications,
  ...projects,
  ...publications,
  ...ongoingProjects,
  ...cocurricular,
  ...workshops,
  ...teaching,
  ...affiliations,
  ...professionalActivity,
  ...pageQuotes,
  ...ribbon,
}

export default config
