import { AtSign, Award, BookOpen, Link2, Building, Building2, CalendarDays, Clock3, FileBadge, FileDown, FlaskConical, Github, Globe, GraduationCap, Hash, Heading1, House, ImageIcon, Images, Linkedin, Mail, MapPin, MonitorPlay, PanelBottom, Phone, Presentation, Puzzle, Quote, Shapes, Share2, Sparkles, Star, Tag, TriangleAlert, Users, UserRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { isAnimatedIcon, researchInterestIcon, researchInterestName, RESEARCH_INTEREST_FALLBACK_ICON } from '../../../src/config/researchInterestIcons'
import { mentoredProjectLinkCategories, ongoingProjectLinkCategories } from '../../../src/config/projectLinkCategories'
import { ENTRY_ENABLED_KEY } from '../../../src/config/entryStatus'

/**
 * A row's preview, shaped like the card the site renders rather than a list of
 * labelled values: the same facts, in the same order, behind the same icons, so
 * what the editor shows and what a visitor sees line up.
 *
 * Only what an entry fills in appears, so a sparse entry stays short.
 */
export type PreviewFact = { icon: LucideIcon; text: string }

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : typeof value === 'number' ? String(value) : ''
}

function fact(icon: LucideIcon, value: unknown): PreviewFact[] {
  const content = text(value)
  return content ? [{ icon, text: content }] : []
}

/** Authored for `v-html`, so its line breaks have to be flattened onto one row. */
function oneLine(value: unknown): string {
  return text(value).replace(/<br\s*\/?>/gi, ' · ').replace(/\s+/g, ' ').trim()
}

function wordCount(value: unknown): number {
  const content = text(value)
  return content ? content.split(/\s+/).length : 0
}

/** Where a link points, for links too long to read inside a row. */
function host(value: unknown): string {
  const link = text(value)
  const match = link.match(/^https?:\/\/(?:www\.)?([^/?#]+)/i)
  return match ? match[1] : link
}

/** The readable end of a link: a profile handle, or an image's file name. */
function lastSegment(value: unknown): string {
  const path = text(value).split('?')[0].replace(/\/+$/, '')
  return path.slice(path.lastIndexOf('/') + 1) || host(value)
}

/**
 * The named things behind a key, however the content writes them: a list, a
 * single object, or one plain cell. A project's collaborators, an internship's
 * two host organisations and the project it produced are all this shape.
 */
function names(value: unknown, key = 'name'): string {
  const items = Array.isArray(value) ? value : [value]
  // A dotted key reaches into what the item nests, because content nests: a
  // leadership role carries an organisation object rather than a flat name.
  const read = (item: unknown) => key.split('.').reduce<unknown>((node, part) => block(node)[part], item)
  return items.map(item => item && typeof item === 'object' ? text(read(item)) : text(item)).filter(Boolean).join(', ')
}

/**
 * An education entry's sub-fields as the site words them: "Minor in A and B".
 * Each one's name may be a list; a bare string or list is a Minor.
 */
function subFieldsLine(value: unknown): string {
  const joined = (list: unknown) => {
    const all = (Array.isArray(list) ? list : [list]).map(text).filter(Boolean)
    return all.length > 1 ? `${all.slice(0, -1).join(', ')} and ${all[all.length - 1]}` : all.join('')
  }
  const items = Array.isArray(value) && value.some(item => item && typeof item === 'object') ? value : [value]
  return items.map(item => {
    const entry = item && typeof item === 'object' && !Array.isArray(item) ? block(item) : { name: item } as Record<string, unknown>
    const names = joined(entry.name)
    if (!names) return ''
    const label = text(entry.label) || 'Minor'
    return `${label} in ${names}`
  }).filter(Boolean).join(' · ')
}

/** "3 projects" — what a row holds, when naming each one would flood it. */
function counted(value: unknown, noun: string): string {
  const total = Array.isArray(value) ? value.length : 0
  return total ? `${total} ${noun}${total === 1 ? '' : 's'}` : ''
}

/**
 * The credential categories an entry carries, under the names its card gives
 * them. Only the categories that card renders count: a key outside them is
 * kept in the file but never appears on the site, so it is not a link yet.
 */
function linkLabels(value: unknown, categories: Readonly<Record<string, string>>): string {
  const links = block(value)
  return Object.entries(categories).filter(([key]) => text(links[key])).map(([, label]) => label).join(', ')
}

/** A nested block, for content that nests a guide, an issuer or a publication. */
function block(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

/** A base URL short enough for a row; the scheme carries nothing here. */
function bareUrl(value: unknown): string {
  return text(value).replace(/^https?:\/\//i, '').replace(/\/+$/, '')
}

/** The names the site puts on social links, for keys that are not the label. */
const socialNames: Record<string, string> = {
  github: 'GitHub', github2: 'GitHub (second)', kaggle: 'Kaggle', linkedin: 'LinkedIn', twitter: 'Twitter',
  google_scholar: 'Google Scholar', researchgate: 'ResearchGate', orcid_id: 'ORCID iD', credly: 'Credly', blog: 'Blog',
}

/**
 * profile.yml holds four blocks rather than a list, so here the row — not the
 * collection — decides which facts a preview carries.
 */
function profileFacts(raw: Record<string, unknown>, row: string): PreviewFact[] {
  if (row === 'profile') {
    // The hero, top to bottom, then the line the footer signs off with.
    const words = wordCount(raw.about)
    return [
      ...fact(UserRound, raw.name),
      ...fact(Heading1, oneLine(raw.heading)),
      // The biography is a paragraph; spelled out it would push everything
      // else off the row, and its length is what you check at a glance.
      ...fact(Quote, words ? `${words}-word biography` : ''),
      ...fact(ImageIcon, lastSegment(raw.heroImage)),
      // The portrait is a CSS background, so its alt text is all a screen
      // reader gets — a missing one is invisible until someone hits it.
      ...(text(raw.heroImage) && !text(raw.heroImageAlt) ? [{ icon: TriangleAlert, text: 'Portrait has no alt text' }] : []),
      ...fact(FileDown, host(raw.cv)),
      ...fact(PanelBottom, raw.footer),
      ...fact(FlaskConical, host(raw.betaVersionUrl)),
    ]
  }
  if (row === 'contacts') {
    return [
      ...fact(Mail, raw.gmail),
      ...fact(AtSign, raw.email),
      ...fact(Phone, raw.phone),
      ...fact(MapPin, raw.location),
      ...fact(House, oneLine(raw.address)),
    ]
  }
  if (row === 'socials') {
    // The hero links these three; the rest are reached from Contact and the
    // footer, so they are named in one fact rather than a row of bare URLs.
    const inHero = ['linkedin', 'github', 'blog']
    const others = Object.keys(raw).filter(key => key !== ENTRY_ENABLED_KEY && !inHero.includes(key) && text(raw[key]))
    return [
      ...fact(Linkedin, lastSegment(raw.linkedin)),
      ...fact(Github, lastSegment(raw.github)),
      ...fact(Globe, host(raw.blog)),
      ...fact(Share2, others.length ? `${others.length} more: ${others.map(key => socialNames[key] ?? key.replace(/_/g, ' ')).join(', ')}` : ''),
    ]
  }
  if (row === 'media') {
    // A cleared base is a setting, not a gap: the site falls back to the
    // copies still in public/, so say which rather than showing nothing.
    return [
      ...fact(Images, bareUrl(raw.logosBaseUrl) || 'Logos from /logo in public/'),
      ...fact(Shapes, bareUrl(raw.iconsBaseUrl) || 'Icons from /icons in public/'),
    ]
  }
  return []
}

/** The heading the site builds: a degree "in" its field, or a role. */
export function previewHeading(raw: Record<string, unknown>, collection: string): string {
  if (collection === 'home/research-interests') return researchInterestName(text(raw.key))
  if (collection.startsWith('projects-publications/')) return text(raw.title)
  if (collection === 'affiliations/memberships') return text(raw.organization)
  if (collection === 'home/education') {
    const degree = text(raw.degree)
    const field = text(raw.field)
    return field ? `${degree} in ${field}` : degree
  }
  return text(raw.job_role) || text(raw.title)
}

export function previewFacts(raw: Record<string, unknown>, collection: string, row = ''): PreviewFact[] {
  // One collection, four different blocks: see profileFacts.
  if (collection === 'home/profile') return profileFacts(raw, row)
  if (collection === 'home/education') {
    return [
      // The site orders these as time, progress, then where it happened.
      ...fact(CalendarDays, raw.time_period),
      ...fact(Clock3, raw.current_level),
      ...fact(Building2, raw.campus),
      ...fact(Building, raw.institution),
      ...fact(MapPin, raw.location),
      ...fact(Star, raw.gpa),
      ...fact(GraduationCap, subFieldsLine(raw.sub_field)),
    ]
  }
  if (collection === 'home/research-interests') {
    const icon = researchInterestIcon(text(raw.key))
    // An unmapped key still renders on the site, just with a question mark, so
    // say that here rather than leaving it to be noticed there.
    if (icon === RESEARCH_INTEREST_FALLBACK_ICON) {
      return [{ icon: TriangleAlert, text: `No icon for this key — falls back to ${RESEARCH_INTEREST_FALLBACK_ICON}` }]
    }
    // The sparkle already says animated; repeating the word would be noise.
    return isAnimatedIcon(icon)
      ? [{ icon: Sparkles, text: `${icon.slice('anim:'.length)} (animated)` }]
      : [{ icon: Shapes, text: icon }]
  }
  if (collection === 'projects-publications/projects') {
    const guide = raw.guide && typeof raw.guide === 'object' ? raw.guide as Record<string, unknown> : {}
    return [
      ...fact(Tag, raw.type),
      ...fact(CalendarDays, raw.time_period),
      ...fact(Building, raw.affiliation),
      ...fact(UserRound, [text(guide.name), text(guide.title)].filter(Boolean).join(', ')),
      ...fact(Users, names(raw.collaborators)),
      // The tech stack is a long list that pushed the useful facts off the row;
      // it belongs in the editor, not the summary.
      ...fact(Hash, raw.doi),
    ]
  }
  if (collection === 'projects-publications/articles') {
    const publication = raw.publication && typeof raw.publication === 'object' ? raw.publication as Record<string, unknown> : {}
    return [
      ...fact(FileBadge, raw.article_type),
      ...fact(CalendarDays, raw.date),
      // The venue: the publication's name, and who hosts it.
      ...fact(BookOpen, text(publication.name) || raw.publication),
      ...fact(Building, publication.host),
      // `field` is a long tag list, and `type` is the dropdown above the list,
      // so neither earns a place on the row.
    ]
  }
  if (collection === 'affiliations/memberships') {
    return [
      ...fact(UserRound, raw.role),
      ...fact(Building, raw.chapter),
      ...fact(CalendarDays, raw.period),
      ...fact(MapPin, raw.location),
      // The membership number is the thing you come to this page to look up.
      ...fact(Hash, raw.membership_id),
    ]
  }
  if (collection === 'home/awards' || collection === 'home/achievements') {
    return [
      ...fact(Award, raw.prize),
      ...fact(Tag, raw.category),
      ...fact(Building, raw.organization),
      ...fact(CalendarDays, raw.year),
      ...fact(Quote, raw.description),
    ]
  }
  if (collection === 'projects-publications/publications') {
    return [
      ...fact(Users, names(raw.authors)),
      ...fact(BookOpen, raw.journal),
      ...fact(CalendarDays, raw.year),
      ...fact(Globe, host(raw.link)),
    ]
  }
  if (collection === 'projects-publications/posters') {
    return [
      ...fact(Presentation, raw.event),
      ...fact(Users, names(raw.authors)),
      ...fact(CalendarDays, raw.date),
      ...fact(ImageIcon, lastSegment(raw.image)),
    ]
  }
  if (collection === 'teaching/courses') {
    const students = text(raw.students)
    return [
      // The semester the course sat in; it belongs to the group, not the row,
      // so it is carried here rather than edited.
      ...fact(CalendarDays, raw.semester),
      ...fact(UserRound, raw.role),
      ...fact(Building, raw.institution),
      ...fact(Users, names(raw.collaborators)),
      ...fact(GraduationCap, students && `${students} students`),
    ]
  }
  if (collection === 'affiliations/affiliations') {
    return [
      ...fact(Puzzle, raw.department),
      ...fact(CalendarDays, raw.period),
      ...fact(MapPin, raw.location),
    ]
  }
  if (collection === 'affiliations/collaborators') {
    return [
      ...fact(Building, raw.affiliation),
      ...fact(MapPin, raw.location),
      ...fact(CalendarDays, raw.period),
      ...fact(Puzzle, names(raw.projects)),
    ]
  }
  if (collection === 'professional-activity/invited-talks') {
    return [
      ...fact(Presentation, raw.event),
      ...fact(Building, names(raw.organizer)),
      ...fact(MapPin, raw.location),
      ...fact(CalendarDays, raw.date),
      ...fact(Globe, host(raw.link)),
    ]
  }
  if (collection.startsWith('quotes/')) {
    // The quote is the row's heading; who said it, and what it is from.
    return [
      ...fact(UserRound, raw.author),
      ...fact(BookOpen, raw.source),
    ]
  }
  if (collection === 'home/announcements') {
    // The message is the row's heading, so its icon is all that is left to say.
    return fact(Shapes, raw.icon)
  }
  if (collection === 'teaching/mentoring') {
    const institution = block(raw.institution)
    return [
      ...fact(Tag, raw.semester),
      ...fact(UserRound, raw.role),
      ...fact(CalendarDays, raw.time_period),
      ...fact(Building, institution.name),
      ...fact(MapPin, institution.location),
      ...fact(Puzzle, counted(raw.projects, 'project')),
    ]
  }
  if (collection === 'teaching/projects') {
    return [
      ...fact(BookOpen, raw.course),
      ...fact(CalendarDays, raw.semester),
      ...fact(Users, names(raw.students)),
      ...fact(Hash, raw.registration_number),
      ...fact(FileBadge, linkLabels(raw.cred_link, mentoredProjectLinkCategories)),
    ]
  }
  if (collection === 'teaching/others') {
    const institution = block(raw.institution)
    return [
      ...fact(UserRound, raw.role),
      ...fact(Building, institution.name),
      ...fact(MapPin, institution.location),
      ...fact(Clock3, raw.duration),
      ...fact(Tag, raw.audience),
      ...fact(Users, raw.students),
    ]
  }
  if (collection === 'cocurricular/leadership') {
    // One entry can hold several roles, each at its own organisation, with its
    // own host and period; the row names them all.
    return [
      ...fact(UserRound, names(raw.affiliation, 'role')),
      ...fact(Building, names(raw.affiliation, 'organization.name')),
      ...fact(Building2, names(raw.affiliation, 'host.name')),
      ...fact(GraduationCap, names(raw.affiliation, 'institute')),
      ...fact(CalendarDays, names(raw.affiliation, 'time_period')),
    ]
  }
  if (collection === 'cocurricular/volunteering') {
    // An entry is either a single role or a `roles` list of them.
    return [
      ...fact(UserRound, names(raw.roles, 'role')),
      ...fact(Building, text(raw.organization) || names(raw.roles, 'organization')),
      ...fact(CalendarDays, text(raw.time_period) || names(raw.roles, 'time_period')),
      ...fact(Shapes, names(raw.field, 'sub_field')),
    ]
  }
  if (collection === 'professional-activity/hosted-events') {
    return [
      ...fact(Tag, raw.event_type),
      ...fact(Users, names(raw.guest_speakers)),
      ...fact(Building, names(raw.institution)),
      ...fact(CalendarDays, raw.date),
      ...fact(MonitorPlay, raw.mode),
    ]
  }
  // A subject and a group are containers: the count is the summary, and what
  // they hold is the editor's business.
  if (collection === 'resources/study-material') return fact(BookOpen, counted(raw.materials, 'material'))
  if (collection === 'resources/worth-exploring') return fact(Link2, counted(raw.links, 'link'))
  if (collection === 'facts/facts') {
    return [
      ...fact(Shapes, raw.icon),
      ...fact(Quote, raw.description),
    ]
  }
  if (collection === 'recommended/items') {
    return [
      ...fact(UserRound, raw.author),
      ...fact(BookOpen, raw.source),
      ...fact(CalendarDays, raw.year),
      ...fact(Globe, host(raw.url)),
      ...fact(Quote, raw.note),
    ]
  }
  if (collection === 'readings/items') {
    return [
      ...fact(UserRound, raw.author),
      ...fact(Tag, raw.genre),
      ...fact(Globe, host(raw.link)),
      ...fact(ImageIcon, lastSegment(raw.image)),
    ]
  }
  if (collection === 'movies/items') {
    return [
      ...fact(UserRound, raw.director),
      ...fact(Tag, raw.genre),
      ...fact(CalendarDays, raw.year),
      ...fact(Globe, host(raw.link)),
      ...fact(ImageIcon, lastSegment(raw.image)),
    ]
  }
  if (collection === 'travel/states') {
    return [
      ...fact(Tag, raw.purpose),
      ...fact(MapPin, names(raw.cities)),
    ]
  }
  if (collection === 'hobbies/tiles') return fact(Shapes, raw.icon)
  if (collection.startsWith('workshops/')) {
    // The five collections on Conferences, Workshops & Bootcamps share a shape:
    // who ran it, where it sat, and when. `organizer`, `instructor`, `speaker`,
    // `institution` and `host` are each written as a list of objects, so read
    // every name rather than the first one and a silent remainder.
    return [
      ...fact(Tag, raw.type),
      ...fact(Users, names(raw.organizer) || names(raw.speaker)),
      ...fact(UserRound, names(raw.instructor)),
      // An FDP names its institution; a talk names its host. One line either way.
      ...fact(Building, names(raw.institution) || names(raw.host)),
      ...fact(Clock3, raw.duration),
      ...fact(CalendarDays, raw.date),
      ...fact(MonitorPlay, raw.mode),
      ...fact(MapPin, raw.location),
    ]
  }
  if (collection === 'ongoing-projects/projects') {
    return [
      // The card's type badge is commented out at the moment, but the type is
      // what tells one row from the next here.
      ...fact(Tag, raw.type),
      ...fact(CalendarDays, raw.time_period),
      // `instructor` is what the card renders; `guide` is the same role under
      // the name the other project collections use.
      ...fact(UserRound, names(raw.instructor) || names(raw.guide)),
      ...fact(Building2, names(raw.institution)),
      ...fact(Clock3, raw.duration),
      ...fact(Building, raw.affiliation),
      ...fact(Users, names(raw.collaborators)),
      // The tech stack is a long list, as on the Projects card, and belongs in
      // the editor rather than the row.
      ...fact(FileBadge, linkLabels(raw.cred_link, ongoingProjectLinkCategories)),
    ]
  }
  if (collection === 'internships-certifications/internships') {
    // The card leads with the type badge, then who it was with.
    const guide = block(raw.guide)
    return [
      ...fact(Tag, raw.type),
      // An internship can be hosted by two organisations at once.
      ...fact(Building, names(raw.company)),
      ...fact(UserRound, text(raw.guide) || [text(guide.name), text(guide.designation)].filter(Boolean).join(', ')),
      ...fact(MapPin, raw.location),
      ...fact(CalendarDays, raw.time_period),
      ...fact(Puzzle, names(raw.project, 'title')),
    ]
  }
  if (collection === 'internships-certifications/certifications') {
    const issuer = block(raw.issuer)
    return [
      // Who issued it and where it was taken: the card's first line is the
      // institution and the platform, either of which may stand alone.
      ...fact(Building, text(issuer.institution) || text(raw.issuer)),
      ...fact(MonitorPlay, issuer.platform),
      ...fact(UserRound, raw.instructor),
      ...fact(CalendarDays, raw.date),
      ...fact(Clock3, raw.duration),
      ...fact(MapPin, issuer.location),
      // The corner badge: "Elite", "Grade: A".
      ...fact(Award, raw.tag),
    ]
  }
  if (collection === 'home/experience') {
    const supervisor = raw.supervisor && typeof raw.supervisor === 'object' ? raw.supervisor as Record<string, unknown> : {}
    return [
      ...fact(CalendarDays, raw.time_period),
      ...fact(Building, raw.company),
      ...fact(Puzzle, raw.department),
      ...fact(MapPin, raw.location),
      ...fact(UserRound, [text(supervisor.name), text(supervisor.title)].filter(Boolean).join(', ')),
    ]
  }
  return []
}

/** Collections whose rows are drawn as the site draws them. */
export function hasSitePreview(collection: string): boolean {
  // Every Conferences, Workshops & Bootcamps collection is drawn the same way,
  // so a section added there is covered without being listed again below.
  if (collection.startsWith('workshops/')) return true
  // One collection per route name, all drawn the same way.
  if (collection.startsWith('quotes/')) return true
  return [
    'home/profile', 'home/education', 'home/experience', 'home/research-interests',
    'projects-publications/projects', 'projects-publications/articles',
    'internships-certifications/internships', 'internships-certifications/certifications',
    'ongoing-projects/projects',
    'affiliations/memberships',
    'home/announcements', 'facts/facts', 'home/awards', 'home/achievements',
    'projects-publications/publications', 'projects-publications/posters',
    'teaching/courses', 'affiliations/affiliations', 'affiliations/collaborators',
    'professional-activity/invited-talks',
    'teaching/mentoring', 'teaching/projects', 'teaching/others',
    'cocurricular/leadership', 'cocurricular/volunteering',
    'professional-activity/hosted-events',
    'resources/study-material', 'resources/worth-exploring',
    'recommended/items', 'readings/items', 'movies/items', 'travel/states', 'hobbies/tiles',
  ].includes(collection)
}
