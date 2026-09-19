import { BookOpen, Building, Building2, CalendarDays, Clock3, FileBadge, GraduationCap, Hash, MapPin, Puzzle, Shapes, Sparkles, Star, Tag, TriangleAlert, Users, UserRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { isAnimatedIcon, researchInterestIcon, researchInterestName, RESEARCH_INTEREST_FALLBACK_ICON } from '../../../src/config/researchInterestIcons'

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

export function previewFacts(raw: Record<string, unknown>, collection: string): PreviewFact[] {
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
      ...fact(Users, raw.collaborators),
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
  return ['home/education', 'home/experience', 'home/research-interests', 'projects-publications/projects', 'projects-publications/articles', 'affiliations/memberships'].includes(collection)
}
