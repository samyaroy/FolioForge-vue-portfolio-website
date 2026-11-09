import { entryPresentation, type EntryPresentation } from '../lib/entryPresentation.ts'

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

function asRecord(value: unknown): UnknownRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as UnknownRecord : {}
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

export function mentoringCohorts(records: unknown[]): PortfolioEntry[] {
  return toEntries(records as UnknownRecord[], ['programme', 'semester'], ['time_period', 'semester'])
    .map(entry => ({ ...entry, readOnlyFields: ['projects'] }))
}

function withGroupedRoleTitles(entries: PortfolioEntry[], groupedBy = 'roles'): PortfolioEntry[] {
  return entries.map(entry => {
    if (!entry.presentation) return entry
    const presentation = { ...entry.presentation, groupedBy }
    return { ...entry, ...entryPresentation(entry.raw, presentation), presentation }
  })
}


const adapters: Record<string, (records: UnknownRecord[]) => PortfolioEntry[]> = {
  'quotes/default': records => toEntries(records, ['text'], ['author', 'source']),
  'quotes/Home': records => toEntries(records, ['text'], ['author', 'source']),
  'quotes/ProjectsPublications': records => toEntries(records, ['text'], ['author', 'source']),
  'quotes/Teachings': records => toEntries(records, ['text'], ['author', 'source']),
  'quotes/OngoingProjects': records => toEntries(records, ['text'], ['author', 'source']),
  'quotes/Affilications': records => toEntries(records, ['text'], ['author', 'source']),
  'quotes/InternshipCertification': records => toEntries(records, ['text'], ['author', 'source']),
  'quotes/Workshops': records => toEntries(records, ['text'], ['author', 'source']),
  'quotes/Cocurricular': records => toEntries(records, ['text'], ['author', 'source']),
  'quotes/ProfessionalAcitivity': records => toEntries(records, ['text'], ['author', 'source']),
  'quotes/Gallery': records => toEntries(records, ['text'], ['author', 'source']),
  'quotes/Resources': records => toEntries(records, ['text'], ['author', 'source']),
  'quotes/Contact': records => toEntries(records, ['text'], ['author', 'source']),
  'quotes/PrivacyPolicy': records => toEntries(records, ['text'], ['author', 'source']),
  'home/research-interests': records => toEntries(records, ['title', 'name', 'key']),
  'home/experience': records => toEntries(records, ['job_role', 'title'], ['company', 'time_period']),
  'home/education': records => toEntries(records, ['degree', 'title'], ['institution', 'time_period']),
  'home/awards': records => toEntries(records, ['title'], ['organization', 'year']),
  'home/achievements': records => toEntries(records, ['title'], ['organization', 'year']),
  'home/announcements': records => toEntries(records, ['message'], ['icon']),
  'projects-publications/projects': records => toEntries(records, ['title'], ['type', 'time_period']),
  'projects-publications/research': records => toEntries(records, ['title'], ['type', 'time_period']),
  'projects-publications/technical': records => toEntries(records, ['title'], ['type', 'time_period']),
  'projects-publications/minor': records => toEntries(records, ['title'], ['type', 'time_period']),
  'projects-publications/other': records => toEntries(records, ['title'], ['type', 'time_period']),
  'projects-publications/articles': records => toEntries(records, ['title'], ['article_type', 'date']),
  'projects-publications/publications': records => toEntries(records, ['title'], ['publication', 'date']),
  'projects-publications/posters': records => toEntries(records, ['title'], ['event', 'date']),
  'teaching/courses': records => toEntries(records, ['title', 'course'], ['institution', 'semester']).map(entry => ({ ...entry, readOnlyFields: ['semester'] })),
  'teaching/projects': records => toEntries(records, ['title'], ['course', 'semester']).map(entry => ({ ...entry, readOnlyFields: ['semester'] })),
  'teaching/mentoring': records => mentoringCohorts(records),
  'teaching/others': records => toEntries(records, ['title'], ['role', 'duration']),
  'ongoing-projects/projects': records => toEntries(records, ['title'], ['status', 'type']),
  'affiliations/affiliations': records => toEntries(records, ['organization', 'name'], ['role', 'period']),
  'affiliations/collaborators': records => toEntries(records, ['name', 'person'], ['affiliation', 'period']),
  'affiliations/memberships': records => toEntries(records, ['organization'], ['role', 'period']),
  'internships-certifications/internships': records => toEntries(records, ['role', 'title'], ['company', 'time_period']),
  'internships-certifications/certifications': records => toEntries(records, ['title'], ['issuer', 'date']),
  'workshops/conferences': records => toEntries(records, ['title'], ['location', 'date']),
  'workshops/fdps': records => toEntries(records, ['title'], ['institution', 'date']),
  'workshops/main': records => toEntries(records, ['title'], ['institution', 'date']),
  'workshops/additional': records => toEntries(records, ['title'], ['institution', 'date']),
  'workshops/bootcamps': records => toEntries(records, ['title'], ['institution', 'date']),
  'workshops/other': records => toEntries(records, ['title'], ['type', 'date']),
  'cocurricular/leadership': records => withGroupedRoleTitles(toEntries(records, ['role', 'title'], ['affiliation', 'time_period']), 'affiliation'),
  'cocurricular/volunteering': records => withGroupedRoleTitles(toEntries(records, ['role', 'title'], ['organization', 'time_period'])),
  'professional-activity/invited-talks': records => toEntries(records, ['title'], ['institution', 'date']),
  'professional-activity/hosted-events': records => toEntries(records, ['title'], ['event_type', 'date']),
  'gallery/career-unlocks': records => toEntries(records, ['title'], ['date', 'type']),
  'resources/study-material': records => toEntries(records, ['title'], [],),
  'resources/worth-exploring': records => toEntries(records, ['group', 'title']),
  'resources/worth-subscribing': records => toEntries(records, ['group', 'title']),
  'facts/facts': records => toEntries(records, ['title'], ['icon']),
  'recommended/items': records => toEntries(records, ['title'], ['author', 'source']),
  'readings/items': records => toEntries(records, ['title'], ['author', 'genre']),
  'movies/items': records => toEntries(records, ['title'], ['director', 'year']),
  'travel/states': records => toEntries(records, ['state'], ['purpose']),
  'hobbies/tiles': records => toEntries(records, ['label'], ['icon']),
  'cv/bullets': records => toEntries(records, ['text'], ['ref', 'kind']),
  'cv/entries': records => toEntries(records, ['title', 'ref', 'id'], ['ref', 'period']),
  'cv/summaries': records => toEntries(records, ['id'], ['text']),
  'cv/skills': records => toEntries(records, ['label'], ['text']),
  'cv/interests': records => toEntries(records, ['text'], ['id']),
}

/** Present fetched rows in repository order, including hidden rows. */
export function repositoryEntries(collection: string, records: unknown[]): PortfolioEntry[] {
  if (records.some(row => !row || typeof row !== 'object' || Array.isArray(row))) {
    throw new Error('Unreadable collection entry. Reload before editing.')
  }
  const adapter = adapters[collection]
  if (!adapter) throw new Error('This collection has no entry adapter.')
  return adapter(records as UnknownRecord[])
}
