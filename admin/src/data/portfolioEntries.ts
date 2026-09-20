import affiliationsYaml from '../../../src/content/profile_info/affiliations.yml'
import certificationsYaml from '../../../src/content/profile_info/certifications.yml'
import cocurricularYaml from '../../../src/content/profile_info/cocurricular.yml'
import educationYaml from '../../../src/content/profile_info/education.yml'
import experienceYaml from '../../../src/content/profile_info/experience.yml'
import factsYaml from '../../../src/content/profile_info/facts.yml'
import galleryYaml from '../../../src/content/profile_info/gallery.yml'
import internshipsYaml from '../../../src/content/profile_info/internships.yml'
import ongoingProjectsYaml from '../../../src/content/profile_info/ongoing_projects.yml'
import professionalActivityYaml from '../../../src/content/profile_info/professional_activity.yml'
import profileYaml from '../../../src/content/profile_info/profile.yml'
import projectsYaml from '../../../src/content/profile_info/projects.yml'
import publicationsYaml from '../../../src/content/profile_info/publications.yml'
import researchInterestsYaml from '../../../src/content/profile_info/research_interests.yml'
import resourcesYaml from '../../../src/content/profile_info/resources.yml'
import ribbonYaml from '../../../src/content/profile_info/ribbon.yml'
import teachingYaml from '../../../src/content/profile_info/teaching.yml'
import workshopsYaml from '../../../src/content/profile_info/workshops.yml'
import blogRecommendedYaml from '../../../blogs/src/content/recommended/data.yml'
import blogReadingsYaml from '../../../blogs/src/content/readings/data.yml'
import blogMoviesYaml from '../../../blogs/src/content/movies/data.yml'
import blogTravelYaml from '../../../blogs/src/content/travel/data.yml'
import blogHobbiesYaml from '../../../blogs/src/content/hobbies/data.yml'

import type { EntryPresentation } from '@/lib/entryPresentation'

type UnknownRecord = Record<string, unknown>

export type PortfolioEntry = {
  id: string
  title: string
  subtitle: string
  /** False only when the entry is switched off in the content. */
  enabled?: boolean
  raw: UnknownRecord
  presentation?: EntryPresentation
  readOnlyFields?: string[]
}

const documents = {
  affiliations: affiliationsYaml as UnknownRecord,
  certifications: certificationsYaml as UnknownRecord,
  cocurricular: cocurricularYaml as UnknownRecord,
  education: educationYaml as UnknownRecord,
  experience: experienceYaml as UnknownRecord,
  facts: factsYaml as UnknownRecord,
  gallery: galleryYaml as UnknownRecord,
  internships: internshipsYaml as UnknownRecord,
  ongoingProjects: ongoingProjectsYaml as UnknownRecord,
  professionalActivity: professionalActivityYaml as UnknownRecord,
  profile: profileYaml as UnknownRecord,
  projects: projectsYaml as UnknownRecord,
  publications: publicationsYaml as UnknownRecord,
  researchInterests: researchInterestsYaml as UnknownRecord,
  resources: resourcesYaml as UnknownRecord,
  ribbon: ribbonYaml as UnknownRecord,
  teaching: teachingYaml as UnknownRecord,
  workshops: workshopsYaml as UnknownRecord,
  blogRecommended: blogRecommendedYaml as UnknownRecord,
  blogReadings: blogReadingsYaml as UnknownRecord,
  blogMovies: blogMoviesYaml as UnknownRecord,
  blogTravel: blogTravelYaml as UnknownRecord,
  blogHobbies: blogHobbiesYaml as UnknownRecord,
}

function asRecord(value: unknown): UnknownRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as UnknownRecord : {}
}

function asRecords(value: unknown): UnknownRecord[] {
  return Array.isArray(value) ? value.map(asRecord).filter(item => Object.keys(item).length) : []
}

function readPath(record: UnknownRecord, path: string): unknown {
  return path.split('.').reduce<unknown>((value, key) => asRecord(value)[key], record)
}

function displayText(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (Array.isArray(value)) return value.map(displayText).filter(Boolean).join(', ')
  if (value && typeof value === 'object') {
    const record = asRecord(value)
    return displayText(record.name ?? record.title ?? record.organization ?? record.institution)
  }
  return ''
}

function firstText(record: UnknownRecord, paths: string[]): string {
  for (const path of paths) {
    const value = displayText(readPath(record, path))
    if (value) return value
  }
  return ''
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'entry'
}

function toEntries(records: UnknownRecord[], titlePaths: string[], subtitlePaths: string[] = []): PortfolioEntry[] {
  return records.map((raw, index) => {
    const title = firstText(raw, titlePaths) || `Untitled entry ${index + 1}`
    const subtitle = subtitlePaths.map(path => displayText(readPath(raw, path))).filter(Boolean).slice(0, 2).join(' · ')
    const sourceId = firstText(raw, ['id', 'key', 'membership_id'])
    return { id: sourceId || `${slugify(title)}-${index}`, title, subtitle, raw, presentation: { titlePaths, subtitlePaths, fallbackTitle: title } }
  })
}

function arrayAt(document: UnknownRecord, path: string) {
  return asRecords(readPath(document, path))
}

function groupedEntries(groupName: string) {
  const group = arrayAt(documents.cocurricular, 'co_curriculars').find(item => item.title === groupName)
  return asRecords(group?.entries)
}

/**
 * An entry that holds several roles has no `role` of its own, so it would list
 * as untitled. Name it by the roles it carries instead — that is what the card
 * shows and what someone is looking for in the list.
 */
function withGroupedRoleTitles(entries: UnknownRecord[]): UnknownRecord[] {
  return entries.map(entry => {
    if (entry.role || !Array.isArray(entry.roles)) return entry
    const named = asRecords(entry.roles).map(item => displayText(item.role)).filter(Boolean)
    return named.length ? { ...entry, role: named.join(' + ') } : entry
  })
}

function mentoredProjects() {
  return arrayAt(documents.teaching, 'projects_mentored').flatMap(semester => {
    const semesterName = displayText(semester.semester)
    return asRecords(semester.projects).map(project => ({ ...project, semester: semesterName }))
  })
}

const entryRegistry: Record<string, () => PortfolioEntry[]> = {
  'home/profile': () => [
    ['profile', 'Profile info', []],
    ['contacts', 'Contact details', []],
    ['socials', 'Social profiles', []],
    ['media', 'Media settings', []],
  ].map(([source, label, paths]) => {
    const raw = asRecord(documents.profile[String(source)])
    const titlePaths = paths as string[]
    const title = firstText(raw, titlePaths) || String(label)
    return { id: String(source), title, subtitle: firstText(raw, ['location']), raw, presentation: { titlePaths, subtitlePaths: ['location'], fallbackTitle: String(label) } }
  }),
  'home/research-interests': () => toEntries(arrayAt(documents.researchInterests, 'research_interests'), ['title', 'name', 'key']),
  'home/experience': () => toEntries(arrayAt(documents.experience, 'experience'), ['job_role', 'title'], ['company', 'time_period']),
  'home/education': () => toEntries(arrayAt(documents.education, 'education'), ['degree', 'title'], ['institution', 'time_period']),
  'home/awards': () => [],
  'home/announcements': () => toEntries(arrayAt(documents.ribbon, 'ribbon'), ['message'], ['icon']),

  'projects-publications/projects': () => toEntries([
    ...arrayAt(documents.projects, 'projects.research_projects'),
    ...arrayAt(documents.projects, 'projects.technical_projects'),
    ...arrayAt(documents.projects, 'projects.minor_projects'),
    ...arrayAt(documents.projects, 'projects.other_projects'),
  ], ['title'], ['type', 'time_period']),
  'projects-publications/research': () => toEntries(arrayAt(documents.projects, 'projects.research_projects'), ['title'], ['type', 'time_period']),
  'projects-publications/technical': () => toEntries(arrayAt(documents.projects, 'projects.technical_projects'), ['title'], ['type', 'time_period']),
  'projects-publications/minor': () => toEntries(arrayAt(documents.projects, 'projects.minor_projects'), ['title'], ['type', 'time_period']),
  'projects-publications/other': () => toEntries(arrayAt(documents.projects, 'projects.other_projects'), ['title'], ['type', 'time_period']),
  'projects-publications/articles': () => toEntries(arrayAt(documents.publications, 'articles'), ['title'], ['article_type', 'date']),
  'projects-publications/publications': () => toEntries(arrayAt(documents.publications, 'publications'), ['title'], ['publication', 'date']),
  'projects-publications/posters': () => toEntries(arrayAt(documents.publications, 'posters'), ['title'], ['event', 'date']),

  'teaching/courses': () => toEntries(arrayAt(documents.teaching, 'courses_taught'), ['title', 'course'], ['institution', 'term']),
  'teaching/projects': () => toEntries(mentoredProjects(), ['title'], ['course', 'semester']).map(entry => ({ ...entry, readOnlyFields: ['semester'] })),
  // `projects` is its own collection; it is carried through a save untouched
  // rather than shown here as a raw blob.
  'teaching/mentoring': () => toEntries(arrayAt(documents.teaching, 'projects_mentored'), ['programme', 'semester'], ['time_period', 'semester'])
    .map(entry => ({ ...entry, readOnlyFields: ['projects'] })),
  'teaching/others': () => toEntries(arrayAt(documents.teaching, 'other_teachings'), ['title'], ['role', 'duration']),
  'ongoing-projects/projects': () => toEntries(arrayAt(documents.ongoingProjects, 'ongoing_projects'), ['title'], ['status', 'type']),

  'affiliations/affiliations': () => toEntries(arrayAt(documents.affiliations, 'affiliations'), ['organization', 'name'], ['role', 'period']),
  'affiliations/collaborators': () => toEntries(arrayAt(documents.affiliations, 'collaborators'), ['name', 'person'], ['affiliation', 'period']),
  'affiliations/memberships': () => toEntries(arrayAt(documents.affiliations, 'memberships'), ['organization'], ['role', 'period']),

  'internships-certifications/internships': () => toEntries(arrayAt(documents.internships, 'internships'), ['role', 'title'], ['company', 'time_period']),
  'internships-certifications/certifications': () => toEntries([
    ...arrayAt(documents.certifications, 'certifications'),
    ...arrayAt(documents.certifications, 'more_certifications'),
  ], ['title'], ['issuer', 'date']),

  'workshops/conferences': () => toEntries(arrayAt(documents.workshops, 'attended_conferences'), ['title'], ['location', 'date']),
  'workshops/fdps': () => toEntries(arrayAt(documents.workshops, 'attended_fdps'), ['title'], ['institution', 'date']),
  'workshops/main': () => toEntries(arrayAt(documents.workshops, 'attended_workshops'), ['title'], ['institution', 'date']),
  'workshops/additional': () => toEntries(arrayAt(documents.workshops, 'attended_other_workshops'), ['title'], ['institution', 'date']),
  'workshops/bootcamps': () => toEntries(arrayAt(documents.workshops, 'attended_bootcamps'), ['title'], ['institution', 'date']),
  'workshops/other': () => toEntries(arrayAt(documents.workshops, 'attended_webinars_n_others'), ['title'], ['type', 'date']),

  'cocurricular/leadership': () => toEntries(withGroupedRoleTitles(groupedEntries('leadership_roles')), ['role', 'title'], ['affiliation', 'time_period']),
  'cocurricular/volunteering': () => toEntries(withGroupedRoleTitles(groupedEntries('volunteering_roles')), ['role', 'title'], ['organization', 'time_period']),
  'professional-activity/invited-talks': () => toEntries(arrayAt(documents.professionalActivity, 'invited_talks'), ['title'], ['institution', 'date']),
  'professional-activity/hosted-events': () => toEntries([
    ...arrayAt(documents.professionalActivity, 'hosted_events'),
    ...arrayAt(documents.professionalActivity, 'other_hosted_events'),
  ], ['title'], ['event_type', 'date']),

  'gallery/career-unlocks': () => toEntries(arrayAt(documents.gallery, 'items'), ['title'], ['date', 'type']),
  'resources/study-material': () => toEntries(arrayAt(documents.resources, 'subjects'), ['title'], [],),
  'resources/worth-exploring': () => toEntries(arrayAt(documents.resources, 'explore'), ['group', 'title']),
  'contact/details': () => [{ id: 'contacts', title: 'Contact details', subtitle: firstText(asRecord(documents.profile.contacts), ['location']), raw: { ...asRecord(documents.profile.contacts), socials: documents.profile.socials }, presentation: { titlePaths: [], subtitlePaths: ['location'], fallbackTitle: 'Contact details' } }],
  'facts/facts': () => toEntries(arrayAt(documents.facts, 'facts'), ['title'], ['icon']),

  'recommended/items': () => toEntries(arrayAt(documents.blogRecommended, 'items'), ['title'], ['author', 'source']),
  'readings/items': () => toEntries(arrayAt(documents.blogReadings, 'items'), ['title'], ['author', 'genre']),
  'movies/items': () => toEntries(arrayAt(documents.blogMovies, 'items'), ['title'], ['director', 'year']),
  'travel/states': () => toEntries(arrayAt(documents.blogTravel, 'states'), ['state'], ['purpose']),
  'hobbies/tiles': () => toEntries(arrayAt(documents.blogHobbies, 'tiles'), ['label'], ['icon']),
}

export function getPortfolioEntries(pageId: string, sectionId: string): PortfolioEntry[] {
  return entryRegistry[`${pageId}/${sectionId}`]?.() ?? []
}
