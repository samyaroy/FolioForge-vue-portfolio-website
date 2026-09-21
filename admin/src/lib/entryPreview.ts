import { AtSign, Award, BookOpen, Building, Building2, CalendarDays, Clock3, FileBadge, FileDown, FlaskConical, Github, Globe, GraduationCap, Hash, Heading1, House, ImageIcon, Images, Linkedin, Mail, MapPin, MonitorPlay, PanelBottom, Phone, Puzzle, Quote, Shapes, Share2, Sparkles, Star, Tag, TriangleAlert, Users, UserRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { isAnimatedIcon, researchInterestIcon, researchInterestName, RESEARCH_INTEREST_FALLBACK_ICON } from '../../../src/config/researchInterestIcons'
import { ongoingProjectLinkCategories } from '../../../src/config/projectLinkCategories'
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
  return items.map(item => item && typeof item === 'object' ? text((item as Record<string, unknown>)[key]) : text(item)).filter(Boolean).join(', ')
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
      ...fact(GraduationCap, raw.sub_field),
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
  return [
    'home/profile', 'home/education', 'home/experience', 'home/research-interests',
    'projects-publications/projects', 'projects-publications/articles',
    'internships-certifications/internships', 'internships-certifications/certifications',
    'ongoing-projects/projects',
    'affiliations/memberships',
  ].includes(collection)
}
