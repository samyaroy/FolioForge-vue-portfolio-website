import { profileInfoSources } from '@/content/profile_info'
import { smartLinkPlainText } from '@/utils/smartLinkText'

const CREDENTIAL_KEYS = new Set([
  'cred_link',
  'details_cred',
  'credential_link',
  'credentialLink',
  'certificate_link',
  'certificateLink',
])

const PAGE_NAMES: Record<string, string> = {
  'education.yml': 'Home',
  'experience.yml': 'Home',
  'projects.yml': 'Projects & Publications',
  'publications.yml': 'Projects & Publications',
  'ongoing_projects.yml': 'Ongoing Projects',
  'cocurricular.yml': 'Co-curricular',
  'workshops.yml': 'Workshops & Bootcamps',
  'teaching.yml': 'Teaching',
  'internships.yml': 'Internships & Certifications',
  'certifications.yml': 'Internships & Certifications',
  'affiliations.yml': 'Affiliations & Memberships',
  'professional_activity.yml': 'Professional Activity',
}

const PAGE_ORDER = [
  'Home',
  'Internships & Certifications',
  'Co-curricular',
]

// YAML section keys whose humanized form reads badly, or where the page shows
// the section under a different name. Everything else humanizes cleanly.
const SECTION_NAMES: Record<string, string> = {
  attended_fdps: 'Attended FDPs',
  attended_webinars_n_others: 'Attended Webinars & Others',
  attended_other_workshops: 'Other Learning Engagements',
  more_certifications: 'More Certificates',
  leadership_roles: 'Leadership & Organizations',
  volunteering_roles: 'Volunteering',
}

interface CredentialSlot {
  /** YAML file the list lives in. */
  file: string
  /** Dotted path to a list item; `*` matches one segment (index or key). */
  path: string
  /** Keys the card's DocumentViewer reads, in the card's own fallback order. */
  keys: string[]
  /** Overrides the section label derived from the path. */
  section?: string
}

/**
 * Every list on the site whose card renders a DocumentViewer, and the keys that
 * viewer is bound to.
 *
 * Rows come from these lists rather than from the presence of a credential key:
 * the card renders the slot either way, so an entry with no key is an unfilled
 * slot, not a different kind of entry. Lists whose credential is rendered as an
 * ordinary link (internship projects, a conference's `link`) are absent on
 * purpose — they never produce a document viewer.
 */
const CREDENTIAL_SLOTS: readonly CredentialSlot[] = [
  { file: 'education.yml', path: 'education.*', keys: ['cred_link'] },
  // Curriculum courses are left out on purpose: CourseCard has a slot, but a
  // per-course credential is the rare exception (1 of 70) and the rows swamp
  // the audit. Add a slot here with section 'Curriculum' to bring them back.
  { file: 'experience.yml', path: 'experience.*', keys: ['cred_link'] },
  { file: 'cocurricular.yml', path: 'co_curriculars.*.entries.*', keys: ['cred_link'] },
  { file: 'internships.yml', path: 'internships.*', keys: ['cred_link'] },
  { file: 'certifications.yml', path: 'certifications.*', keys: ['cred_link'] },
  { file: 'certifications.yml', path: 'more_certifications.*', keys: ['cred_link'] },
  // WorkshopCard falls back cred_link -> details_cred -> link. ConferenceCard
  // renders `link` as a plain anchor instead, so conferences list cred_link only.
  {
    file: 'workshops.yml',
    path: 'attended_workshops.*',
    keys: ['cred_link', 'details_cred', 'link'],
  },
  {
    file: 'workshops.yml',
    path: 'attended_other_workshops.*',
    keys: ['cred_link', 'details_cred', 'link'],
  },
  { file: 'workshops.yml', path: 'attended_webinars_n_others.*', keys: ['cred_link'] },
  { file: 'workshops.yml', path: 'attended_bootcamps.*', keys: ['cred_link'] },
  { file: 'workshops.yml', path: 'attended_conferences.*', keys: ['cred_link'] },
  { file: 'workshops.yml', path: 'attended_fdps.*', keys: ['cred_link'] },
  { file: 'professional_activity.yml', path: 'hosted_events.*', keys: ['cred_link'] },
  { file: 'professional_activity.yml', path: 'other_hosted_events.*', keys: ['cred_link'] },
]

type UnknownRecord = Record<string, unknown>

export interface CredentialLink {
  label: string
  url: string
}

export interface CredentialDashboardRow {
  id: string
  pageRank: number
  page: string
  section: string
  item: string
  detail: string
  source: string
  configPath: string
  links: CredentialLink[]
  hasLink: boolean
}

function isPlainObject(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function humanize(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

// Every displayed string funnels through here, so this is the one place the
// authored link markup has to be reduced to its visible text.
function stringify(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return smartLinkPlainText(String(value))
  }
  return ''
}

function compact(values: unknown[]): string {
  return values.map(stringify).filter(Boolean).join(' · ')
}

// The credential name is one identity, not a concatenation — the organisation
// it belongs to is already carried by the Detail column.
function firstOf(values: unknown[]): string {
  for (const value of values) {
    const text = stringify(value)
    if (text) return text
  }
  return ''
}

function displayName(node: UnknownRecord, ancestry: UnknownRecord[]): string {
  const direct = firstOf([
    node.title,
    node.job_role,
    node.role,
    node.name,
    node.course_name,
    node.company,
    node.institution,
  ])

  if (direct) return direct

  for (const ancestor of [...ancestry].reverse()) {
    const inherited = firstOf([
      ancestor.title,
      ancestor.job_role,
      ancestor.role,
      ancestor.name,
      ancestor.course_name,
    ])
    if (inherited) return inherited
  }

  return 'Untitled credential'
}

/**
 * Renders whatever sits at a dotted path as text. An array maps the rest of the
 * path over its entries, an object carrying a `name` reduces to that name, and
 * any other object joins its own scalars -- so one path covers a plain string,
 * an object, or a list of either, which is how the same idea is spelled
 * differently across the YAML files.
 */
function textAt(value: unknown, segments: string[]): string {
  if (value === null || value === undefined) return ''

  if (Array.isArray(value)) {
    return value
      .map((entry) => textAt(entry, segments))
      .filter(Boolean)
      .join(', ')
  }

  if (segments.length) {
    return isPlainObject(value) ? textAt(value[segments[0]], segments.slice(1)) : ''
  }

  if (isPlainObject(value)) {
    return stringify(value.name) || compact(Object.values(value))
  }

  return stringify(value)
}

/**
 * Where an entry's owning organisation lives, best first: `institution` on
 * education and workshops, `issuer` on certifications, `affiliation` on
 * leadership roles, a plain `organization` string on volunteering roles.
 */
const DETAIL_PATHS = [
  'institution',
  'issuer',
  'affiliation.organization',
  'organization',
]

/**
 * The organisation behind an entry. `name` is what the Credential column
 * already shows, so a path that only repeats it is skipped -- an education
 * entry named by its institution falls through to its type instead.
 */
function displayDetail(node: UnknownRecord, name: string): string {
  for (const path of DETAIL_PATHS) {
    const text = textAt(node, path.split('.'))
    if (text && text !== name) return text
  }

  return compact([node.company, node.host, node.type, node.mode])
}

function pageFromSource(source: string): string {
  const fileName = source.split('/').pop() ?? source
  return PAGE_NAMES[fileName] ?? humanize(fileName.replace(/\.ya?ml$/i, ''))
}

function pageRank(page: string): number {
  const index = PAGE_ORDER.indexOf(page)
  return index === -1 ? PAGE_ORDER.length : index
}

function sectionFromContext(path: string[], ancestry: UnknownRecord[]): string {
  for (const ancestor of [...ancestry].reverse()) {
    if (Array.isArray(ancestor.entries)) {
      const title = stringify(ancestor.title)
      if (title) return SECTION_NAMES[title] ?? humanize(title)
    }
  }

  const firstMeaningful = path.find((part) => Number.isNaN(Number(part)))
  if (!firstMeaningful) return 'Portfolio'
  return SECTION_NAMES[firstMeaningful] ?? humanize(firstMeaningful)
}

function matchesSlotPath(path: string[], pattern: string): boolean {
  const parts = pattern.split('.')
  if (parts.length !== path.length) return false
  return parts.every((part, index) => part === '*' || part === path[index])
}

function slotFor(source: string, path: string[]): CredentialSlot | undefined {
  const fileName = source.split('/').pop() ?? source
  return CREDENTIAL_SLOTS.find(
    (slot) => slot.file === fileName && matchesSlotPath(path, slot.path),
  )
}

function defaultCredentialLabel(key: string): string {
  return key === 'cred_link' || key === 'credential_link' || key === 'certificate_link'
    ? 'Certificate'
    : humanize(key)
}

function createCredentialLink(url: string, label: string): CredentialLink | null {
  const trimmedUrl = url.trim()
  if (!trimmedUrl) return null

  return {
    label: label || 'Certificate',
    url: trimmedUrl,
  }
}

function credentialLinksFrom(value: unknown, fallbackLabel: string): CredentialLink[] {
  if (typeof value === 'string') {
    const link = createCredentialLink(value, fallbackLabel || 'Certificate')
    return link ? [link] : []
  }

  if (isPlainObject(value)) {
    const directUrl = firstOf([value.url, value.href, value.link, value.src])
    if (directUrl) {
      const link = createCredentialLink(
        directUrl,
        stringify(value.label) || stringify(value.title) || stringify(value.name) || 'Certificate',
      )
      return link ? [link] : []
    }

    return Object.entries(value).flatMap(([label, nested]) => credentialLinksFrom(nested, label))
  }

  if (Array.isArray(value)) {
    return value.flatMap((nested) => credentialLinksFrom(nested, 'Certificate'))
  }

  return []
}

function collectFromNode(
  node: unknown,
  source: string,
  path: string[],
  ancestry: UnknownRecord[],
  rows: CredentialDashboardRow[],
): void {
  if (Array.isArray(node)) {
    node.forEach((item, index) =>
      collectFromNode(item, source, [...path, String(index + 1)], ancestry, rows),
    )
    return
  }

  if (!isPlainObject(node)) return

  const slot = slotFor(source, path)
  if (slot) {
    // The card reads its keys in order and shows the first one that resolves,
    // so stop at the first key that yields a link. DocumentViewer renders
    // nothing for a blank value or "#", which is what leaves a row unlinked.
    const item = displayName(node, ancestry)

    let links: CredentialLink[] = []
    for (const key of slot.keys) {
      links = credentialLinksFrom(node[key], defaultCredentialLabel(key)).filter((link) => link.url !== '#')
      if (links.length) break
    }

    const page = pageFromSource(source)

    rows.push({
      id: `${source}:${path.join('.')}`,
      pageRank: pageRank(page),
      page,
      section: slot.section ?? sectionFromContext(path, ancestry),
      item,
      detail: displayDetail(node, item),
      source,
      configPath: path.join('.'),
      links,
      hasLink: links.length > 0,
    })
  }

  const nextAncestry = [...ancestry, node]
  for (const [key, value] of Object.entries(node)) {
    if (CREDENTIAL_KEYS.has(key)) continue
    collectFromNode(value, source, [...path, key], nextAncestry, rows)
  }
}

export function getCredentialDashboardRows(): CredentialDashboardRow[] {
  const rows: CredentialDashboardRow[] = []

  for (const { source, data } of profileInfoSources) {
    collectFromNode(data, source, [], [], rows)
  }

  return rows.sort((a, b) =>
    a.pageRank - b.pageRank ||
    a.page.localeCompare(b.page) ||
    a.section.localeCompare(b.section) ||
    a.item.localeCompare(b.item) ||
    a.source.localeCompare(b.source),
  )
}
