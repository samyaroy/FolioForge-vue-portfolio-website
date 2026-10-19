import affiliationsYaml from '../../../src/content/profile_info/affiliations.yml'
import awardsYaml from '../../../src/content/profile_info/awards.yml'
import certificationsYaml from '../../../src/content/profile_info/certifications.yml'
import cocurricularYaml from '../../../src/content/profile_info/cocurricular.yml'
import educationYaml from '../../../src/content/profile_info/education.yml'
import experienceYaml from '../../../src/content/profile_info/experience.yml'
import factsYaml from '../../../src/content/profile_info/facts.yml'
import galleryYaml from '../../../src/content/profile_info/gallery.yml'
import internshipsYaml from '../../../src/content/profile_info/internships.yml'
import ongoingProjectsYaml from '../../../src/content/profile_info/ongoing_projects.yml'
import pageQuotesYaml from '../../../src/content/profile_info/page_quotes.yml'
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
import cvLibraryYaml from '../../../src/content/cv/library.yml'

import { repositoryEntries, mentoringCohorts } from './collectionEntries'
import type { PortfolioEntry } from './collectionEntries'
export type { PortfolioEntry } from './collectionEntries'
export { mentoringCohorts } from './collectionEntries'

type UnknownRecord = Record<string, unknown>

const documents = {
  affiliations: affiliationsYaml as UnknownRecord,
  awards: awardsYaml as UnknownRecord,
  cvLibrary: cvLibraryYaml as UnknownRecord,
  certifications: certificationsYaml as UnknownRecord,
  cocurricular: cocurricularYaml as UnknownRecord,
  education: educationYaml as UnknownRecord,
  experience: experienceYaml as UnknownRecord,
  facts: factsYaml as UnknownRecord,
  gallery: galleryYaml as UnknownRecord,
  internships: internshipsYaml as UnknownRecord,
  ongoingProjects: ongoingProjectsYaml as UnknownRecord,
  pageQuotes: pageQuotesYaml as UnknownRecord,
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

function asRecord(value: unknown): UnknownRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as UnknownRecord : {}
}

function asRecords(value: unknown): UnknownRecord[] {
  return Array.isArray(value) ? value.map(asRecord).filter(item => Object.keys(item).length) : []
}

function readPath(record: UnknownRecord, path: string): unknown {
  return path.split('.').reduce<unknown>((value, key) => asRecord(value)[key], record)
}

export function mentoringCohortFor(semester: string): PortfolioEntry | undefined {
  return mentoringCohorts(arrayAt(documents.teaching, 'projects_mentored')).find(cohort => displayText(cohort.raw.semester) === semester)
}

function arrayAt(document: UnknownRecord, path: string) {
  return asRecords(readPath(document, path))
}

function groupedEntries(groupName: string) {
  const group = arrayAt(documents.cocurricular, 'co_curriculars').find(item => item.title === groupName)
  return asRecords(group?.entries)
}

/**
 * The site groups courses by semester, as it does mentored projects, so a
 * `courses_taught` item is a semester rather than a course. Flatten to the
 * courses themselves and carry the semester on each, or every row would list
 * as an untitled group.
 */
function coursesTaught() {
  return arrayAt(documents.teaching, 'courses_taught').flatMap(semester => {
    const semesterName = displayText(semester.semester)
    return asRecords(semester.courses).map(course => ({ ...course, semester: semesterName }))
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
  'quotes/default': () => repositoryEntries('quotes/default', arrayAt(documents.pageQuotes, 'page_quotes.default')),
  'quotes/Home': () => repositoryEntries('quotes/Home', arrayAt(documents.pageQuotes, 'page_quotes.Home')),
  'quotes/ProjectsPublications': () => repositoryEntries('quotes/ProjectsPublications', arrayAt(documents.pageQuotes, 'page_quotes.ProjectsPublications')),
  'quotes/Teachings': () => repositoryEntries('quotes/Teachings', arrayAt(documents.pageQuotes, 'page_quotes.Teachings')),
  'quotes/OngoingProjects': () => repositoryEntries('quotes/OngoingProjects', arrayAt(documents.pageQuotes, 'page_quotes.OngoingProjects')),
  'quotes/Affilications': () => repositoryEntries('quotes/Affilications', arrayAt(documents.pageQuotes, 'page_quotes.Affilications')),
  'quotes/InternshipCertification': () => repositoryEntries('quotes/InternshipCertification', arrayAt(documents.pageQuotes, 'page_quotes.InternshipCertification')),
  'quotes/Workshops': () => repositoryEntries('quotes/Workshops', arrayAt(documents.pageQuotes, 'page_quotes.Workshops')),
  'quotes/Cocurricular': () => repositoryEntries('quotes/Cocurricular', arrayAt(documents.pageQuotes, 'page_quotes.Cocurricular')),
  'quotes/ProfessionalAcitivity': () => repositoryEntries('quotes/ProfessionalAcitivity', arrayAt(documents.pageQuotes, 'page_quotes.ProfessionalAcitivity')),
  'quotes/Gallery': () => repositoryEntries('quotes/Gallery', arrayAt(documents.pageQuotes, 'page_quotes.Gallery')),
  'quotes/Resources': () => repositoryEntries('quotes/Resources', arrayAt(documents.pageQuotes, 'page_quotes.Resources')),
  'quotes/Contact': () => repositoryEntries('quotes/Contact', arrayAt(documents.pageQuotes, 'page_quotes.Contact')),
  'quotes/PrivacyPolicy': () => repositoryEntries('quotes/PrivacyPolicy', arrayAt(documents.pageQuotes, 'page_quotes.PrivacyPolicy')),
  'home/research-interests': () => repositoryEntries('home/research-interests', arrayAt(documents.researchInterests, 'research_interests')),
  'home/experience': () => repositoryEntries('home/experience', arrayAt(documents.experience, 'experience')),
  'home/education': () => repositoryEntries('home/education', arrayAt(documents.education, 'education')),
  'home/awards': () => repositoryEntries('home/awards', arrayAt(documents.awards, 'awards')),
  'home/achievements': () => repositoryEntries('home/achievements', arrayAt(documents.awards, 'achievements')),
  'home/announcements': () => repositoryEntries('home/announcements', arrayAt(documents.ribbon, 'ribbon')),
  'projects-publications/projects': () => repositoryEntries('projects-publications/projects', [
    ...arrayAt(documents.projects, 'projects.research_projects'),
    ...arrayAt(documents.projects, 'projects.technical_projects'),
    ...arrayAt(documents.projects, 'projects.minor_projects'),
    ...arrayAt(documents.projects, 'projects.other_projects'),
  ]),
  'projects-publications/research': () => repositoryEntries('projects-publications/research', arrayAt(documents.projects, 'projects.research_projects')),
  'projects-publications/technical': () => repositoryEntries('projects-publications/technical', arrayAt(documents.projects, 'projects.technical_projects')),
  'projects-publications/minor': () => repositoryEntries('projects-publications/minor', arrayAt(documents.projects, 'projects.minor_projects')),
  'projects-publications/other': () => repositoryEntries('projects-publications/other', arrayAt(documents.projects, 'projects.other_projects')),
  'projects-publications/articles': () => repositoryEntries('projects-publications/articles', arrayAt(documents.publications, 'articles')),
  'projects-publications/publications': () => repositoryEntries('projects-publications/publications', arrayAt(documents.publications, 'publications')),
  'projects-publications/posters': () => repositoryEntries('projects-publications/posters', arrayAt(documents.publications, 'posters')),
  'teaching/courses': () => repositoryEntries('teaching/courses', coursesTaught()),
  'teaching/projects': () => repositoryEntries('teaching/projects', mentoredProjects()),
  'teaching/mentoring': () => repositoryEntries('teaching/mentoring', arrayAt(documents.teaching, 'projects_mentored')),
  'teaching/others': () => repositoryEntries('teaching/others', arrayAt(documents.teaching, 'other_teachings')),
  'ongoing-projects/projects': () => repositoryEntries('ongoing-projects/projects', arrayAt(documents.ongoingProjects, 'ongoing_projects')),
  'affiliations/affiliations': () => repositoryEntries('affiliations/affiliations', arrayAt(documents.affiliations, 'affiliations')),
  'affiliations/collaborators': () => repositoryEntries('affiliations/collaborators', arrayAt(documents.affiliations, 'collaborators')),
  'affiliations/memberships': () => repositoryEntries('affiliations/memberships', arrayAt(documents.affiliations, 'memberships')),
  'internships-certifications/internships': () => repositoryEntries('internships-certifications/internships', arrayAt(documents.internships, 'internships')),
  'internships-certifications/certifications': () => repositoryEntries('internships-certifications/certifications', [
    ...arrayAt(documents.certifications, 'certifications'),
    ...arrayAt(documents.certifications, 'more_certifications'),
  ]),
  'workshops/conferences': () => repositoryEntries('workshops/conferences', arrayAt(documents.workshops, 'attended_conferences')),
  'workshops/fdps': () => repositoryEntries('workshops/fdps', arrayAt(documents.workshops, 'attended_fdps')),
  'workshops/main': () => repositoryEntries('workshops/main', arrayAt(documents.workshops, 'attended_workshops')),
  'workshops/additional': () => repositoryEntries('workshops/additional', arrayAt(documents.workshops, 'attended_other_workshops')),
  'workshops/bootcamps': () => repositoryEntries('workshops/bootcamps', arrayAt(documents.workshops, 'attended_bootcamps')),
  'workshops/other': () => repositoryEntries('workshops/other', arrayAt(documents.workshops, 'attended_webinars_n_others')),
  'cocurricular/leadership': () => repositoryEntries('cocurricular/leadership', groupedEntries('leadership_roles')),
  'cocurricular/volunteering': () => repositoryEntries('cocurricular/volunteering', groupedEntries('volunteering_roles')),
  'professional-activity/invited-talks': () => repositoryEntries('professional-activity/invited-talks', arrayAt(documents.professionalActivity, 'invited_talks')),
  'professional-activity/hosted-events': () => repositoryEntries('professional-activity/hosted-events', [
    ...arrayAt(documents.professionalActivity, 'hosted_events'),
    ...arrayAt(documents.professionalActivity, 'other_hosted_events'),
  ]),
  'gallery/career-unlocks': () => repositoryEntries('gallery/career-unlocks', arrayAt(documents.gallery, 'items')),
  'resources/study-material': () => repositoryEntries('resources/study-material', arrayAt(documents.resources, 'subjects')),
  'resources/worth-exploring': () => repositoryEntries('resources/worth-exploring', arrayAt(documents.resources, 'explore')),
  'resources/worth-subscribing': () => repositoryEntries('resources/worth-subscribing', arrayAt(documents.resources, 'subscribe')),
  'facts/facts': () => repositoryEntries('facts/facts', arrayAt(documents.facts, 'facts')),
  'recommended/items': () => repositoryEntries('recommended/items', arrayAt(documents.blogRecommended, 'items')),
  'readings/items': () => repositoryEntries('readings/items', arrayAt(documents.blogReadings, 'items')),
  'movies/items': () => repositoryEntries('movies/items', arrayAt(documents.blogMovies, 'items')),
  'travel/states': () => repositoryEntries('travel/states', arrayAt(documents.blogTravel, 'states')),
  'hobbies/tiles': () => repositoryEntries('hobbies/tiles', arrayAt(documents.blogHobbies, 'tiles')),
  'cv/bullets': () => repositoryEntries('cv/bullets', arrayAt(documents.cvLibrary, 'bullets')),
  'cv/entries': () => repositoryEntries('cv/entries', arrayAt(documents.cvLibrary, 'entries')),
  'cv/summaries': () => repositoryEntries('cv/summaries', arrayAt(documents.cvLibrary, 'summaries')),
  'cv/skills': () => repositoryEntries('cv/skills', arrayAt(documents.cvLibrary, 'skills')),
  'cv/interests': () => repositoryEntries('cv/interests', arrayAt(documents.cvLibrary, 'interests')),
}

export function getPortfolioEntries(pageId: string, sectionId: string): PortfolioEntry[] {
  return entryRegistry[`${pageId}/${sectionId}`]?.() ?? []
}
