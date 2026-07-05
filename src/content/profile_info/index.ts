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
