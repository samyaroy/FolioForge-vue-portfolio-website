import {
  DEFAULT_SECTION_TITLES, HEADER_FIELDS, SECTION_SOURCES, entryKey, portfolioRef,
  type ApplicationBuild, type BuildInput, type CvEntry, type CvLibrary, type CvPreset, type EntryField,
  type ItemSectionKind, type PresetItem, type ResolvedItem, type ResolvedLink, type ResolvedSection,
  type TemplateManifest, type WordedRow,
} from './schema.ts'
import { resolveTemplateOptions } from './templates/index.ts'

/**
 * Content and a preset in, the resolved build input out: every fact looked up,
 * every variant chosen, every section in order. A template then only draws it.
 *
 * Run `validateCv` first. This assumes valid content and throws on the first
 * thing it cannot find rather than collecting problems.
 */

/** Bumped whenever resolving or rendering changes the output for the same content. */
export const RENDERER_VERSION = 1

/** Each portfolio collection's entries, as the admin reads them. */
export type PortfolioCollections = ReadonlyMap<string, readonly unknown[]>

export type ResolveContext = {
  library: CvLibrary
  portfolio: PortfolioCollections
  /** Parsed `profile.yml`, for the header. */
  profile: unknown
  /** The portfolio's public address, for the `website` header field. */
  siteUrl: string
  templates: Readonly<Record<string, TemplateManifest>>
  /** SHA-256 of each template's skeleton, by template id. */
  templateHashes: Readonly<Record<string, string>>
  source: BuildInput['source']
}

export class CvResolveError extends Error {}

type Raw = Record<string, unknown>
type Facts = Partial<Record<EntryField, string>>

function isMap(value: unknown): value is Raw {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function text(value: unknown): string | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

/** A plain value, or the `name` of a map such as `organization: { name, web_link }`. */
function named(value: unknown): string | undefined {
  return isMap(value) ? text(value.name) : text(value)
}

function join(parts: (string | undefined)[], separator: string): string | undefined {
  return parts.filter(Boolean).join(separator) || undefined
}

/** Drops absent fields, so a resolved item carries only what it has. */
function defined<T extends object>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, field]) => field !== undefined)) as T
}

/** `Repo: <name>` for GitHub, `DOI: <doi>` for doi.org, the host otherwise. */
export function linkLabel(url: string): string {
  try {
    const parsed = new URL(url)
    const path = parsed.pathname.split('/').filter(Boolean)
    if (parsed.hostname === 'github.com' && path.length >= 2) return `Repo: ${path[1]}`
    if (parsed.hostname === 'doi.org' && path.length) return `DOI: ${decodeURIComponent(path.join('/'))}`
    return parsed.hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

/** A project's link on a CV: its DOI when it has one, its repository otherwise. */
function projectLink(entry: Raw): Facts {
  const doi = text(entry.doi)
  if (doi) return { link: `https://doi.org/${doi}` }
  const github = isMap(entry.cred_link) ? text(entry.cred_link.github) : undefined
  return github ? { link: github } : {}
}

/**
 * What a portfolio entry says, in CV terms. Collections name the same facts
 * differently, so each family has its mapping; the CV's own entry row then
 * replaces any of it.
 */
function portfolioFacts(collection: string, entry: Raw): Facts {
  const period = text(entry.time_period) ?? text(entry.date) ?? text(entry.year)
  if (collection === 'home/education') {
    const degree = join([text(entry.degree), text(entry.field)], ' in ')
    return { title: text(entry.institution), subtitle: join([text(entry.current_level), degree], ' - '), location: text(entry.location), period }
  }
  if (SECTION_SOURCES.experience.includes(collection)) {
    return { title: named(entry.company) ?? named(entry.organization), subtitle: text(entry.job_role) ?? text(entry.role), location: text(entry.location), period }
  }
  if (SECTION_SOURCES.certifications.includes(collection)) {
    const issuer = isMap(entry.issuer) ? join([text(entry.issuer.institution), text(entry.issuer.platform)], ' - ') : named(entry.issuer)
    return { title: text(entry.title), subtitle: issuer, period }
  }
  if (SECTION_SOURCES.projects.includes(collection) || SECTION_SOURCES.publications.includes(collection)) {
    return { title: text(entry.title), tech: text(entry.tech_stack), context: text(entry.affiliation) ?? text(entry.venue), period, ...projectLink(entry) }
  }
  return { title: named(entry.organization) ?? text(entry.title) ?? text(entry.name), subtitle: text(entry.role), location: text(entry.location), period }
}

function entryFacts(entry: CvEntry | undefined): Facts {
  if (!entry) return {}
  return Object.fromEntries(Object.entries(entry).filter(([key, value]) => key !== 'ref' && key !== 'id' && value !== undefined))
}

/**
 * A reference as the builder lists it: the title a CV would print, and a line
 * of detail. Undefined when the reference names nothing.
 */
export function describeRef(ref: string, context: Pick<ResolveContext, 'library' | 'portfolio'>): { title: string; detail: string } | undefined {
  const target = portfolioRef(ref)
  const own = entryFacts(context.library.entries.find(entry => entryKey(entry) === ref))
  let source: Facts = {}
  if (target) {
    const entry = context.portfolio.get(target.collection)?.find(candidate => isMap(candidate) && candidate.id === target.id)
    if (!isMap(entry)) return undefined
    source = portfolioFacts(target.collection, entry)
  } else if (!Object.keys(own).length) {
    return undefined
  }
  const facts = { ...source, ...own }
  return { title: facts.title ?? ref, detail: join([facts.subtitle, facts.period], ' · ') ?? '' }
}

/** The wording a row prints in a preset: its own choice, then `prefer`, then `text`. */
export function wording(row: WordedRow, preset: CvPreset): string {
  const chosen = preset.variants[row.id]
  if (chosen && Object.hasOwn(row.variants, chosen)) return row.variants[chosen]
  const preferred = preset.prefer.find(key => Object.hasOwn(row.variants, key))
  return preferred ? row.variants[preferred] : row.text
}

function byId<T extends { id: string }>(rows: readonly T[]): Map<string, T> {
  return new Map(rows.map(row => [row.id, row]))
}

function resolveItem(item: PresetItem, kind: ItemSectionKind, preset: CvPreset, context: ResolveContext): ResolvedItem {
  const target = portfolioRef(item.ref)
  let source: Facts = {}
  if (target) {
    const entry = context.portfolio.get(target.collection)?.find(candidate => isMap(candidate) && candidate.id === target.id)
    if (!isMap(entry)) throw new CvResolveError(`${preset.id}: no portfolio entry "${item.ref}".`)
    source = portfolioFacts(target.collection, entry)
  }
  const own = entryFacts(context.library.entries.find(entry => entryKey(entry) === item.ref))
  if (!target && !Object.keys(own).length) throw new CvResolveError(`${preset.id}: no CV entry "${item.ref}".`)
  const facts: Facts = { ...source, ...own }

  let title = facts.title
  let subtitle = facts.subtitle
  if (!title) throw new CvResolveError(`${preset.id}: ${item.ref} has no title.`)
  if (item.style === 'compact') {
    title = facts.short_title ?? title
  } else if (kind === 'projects' && !subtitle) {
    // A project titled "Name: what it is" is set as the name, then the rest.
    const colon = title.indexOf(': ')
    if (colon > 0) [title, subtitle] = [title.slice(0, colon), title.slice(colon + 2)]
  }

  const bullets = context.library.bullets
  const shown = (item.bullets ?? []).map(id => {
    const bullet = bullets.find(row => row.id === id)
    if (!bullet) throw new CvResolveError(`${preset.id}: no bullet "${id}".`)
    return bullet
  })
  const lead = shown.find(bullet => bullet.kind === 'lead')
  const link: ResolvedLink | undefined = facts.link ? { url: facts.link, label: facts.link_label ?? linkLabel(facts.link) } : undefined

  return defined({
    key: item.ref,
    style: item.style,
    title,
    subtitle: item.style === 'compact' ? undefined : subtitle,
    tech: facts.tech,
    context: item.style === 'compact' ? facts.short_context ?? facts.context : facts.context,
    link,
    location: facts.location,
    period: facts.period,
    coursework: facts.coursework,
    lead: lead ? wording(lead, preset) : undefined,
    bullets: shown.filter(bullet => bullet.kind === 'item').map(bullet => wording(bullet, preset)),
  })
}

function resolveHeader(preset: CvPreset, context: ResolveContext): BuildInput['header'] {
  const profile = isMap(context.profile) ? context.profile : {}
  const name = isMap(profile.profile) ? text(profile.profile.name) : undefined
  if (!name) throw new CvResolveError('profile.yml has no profile.name.')
  const fields = preset.header.map(key => {
    const field = HEADER_FIELDS[key]
    const value = field.from === 'site'
      ? context.siteUrl
      : text(field.from.split('.').reduce<unknown>((node, part) => (isMap(node) ? node[part] : undefined), profile))
    if (!value) throw new CvResolveError(`${preset.id} shows ${key} in its header, but profile.yml has no ${field.from}.`)
    const label = field.label === 'value' ? value : field.label === 'host' ? value.replace(/^https?:\/\//, '').replace(/\/$/, '') : field.label
    const href = field.link === 'mailto' ? `mailto:${value}` : field.link === 'url' ? value : undefined
    return defined({ key, label, href })
  })
  return { name, fields }
}

/** A preset with an application build's patch laid over it. */
export function applyApplication(preset: CvPreset, application: ApplicationBuild): CvPreset {
  const { patch } = application
  return {
    ...preset,
    sections: patch.sections ?? preset.sections,
    template: patch.template ?? preset.template,
    // Options belong to a template, so switching template starts from its defaults.
    template_options: patch.template_options ?? (patch.template ? {} : preset.template_options),
    variants: { ...preset.variants, ...patch.variants },
  }
}

export function resolvePreset(base: CvPreset, context: ResolveContext, application?: ApplicationBuild): BuildInput {
  const preset = application ? applyApplication(base, application) : base
  const template = Object.hasOwn(context.templates, preset.template) ? context.templates[preset.template] : undefined
  const sha256 = template && context.templateHashes[template.id]
  if (!template || !sha256) throw new CvResolveError(`${preset.id}: no template "${preset.template}".`)

  const summaries = byId(context.library.summaries)
  const skills = byId(context.library.skills)
  const interests = byId(context.library.interests)
  const row = <T>(rows: Map<string, T>, id: string, list: string): T => {
    const found = rows.get(id)
    if (!found) throw new CvResolveError(`${preset.id}: no ${list} row "${id}".`)
    return found
  }

  const sections = preset.sections.map((section): ResolvedSection => {
    const title = section.title ?? DEFAULT_SECTION_TITLES[section.kind]
    const kind = section.kind
    switch (kind) {
      case 'summary':
        return { kind, title, text: wording(row(summaries, section.items[0]?.ref ?? '', 'summaries'), preset) }
      case 'skills':
        return { kind, title, rows: section.items.map(item => {
          const skill = row(skills, item.ref, 'skills')
          return { label: skill.label, text: wording(skill, preset) }
        }) }
      case 'interests':
        return { kind, title, items: section.items.map(item => wording(row(interests, item.ref, 'interests'), preset)) }
      default:
        return { kind, title, items: section.items.map(item => resolveItem(item, kind, preset, context)) }
    }
  })

  return {
    rendererVersion: RENDERER_VERSION,
    template: { id: template.id, version: template.version, sha256, options: resolveTemplateOptions(template, preset.template_options) },
    preset: defined({ id: base.id, name: base.name, filename: base.filename, pages: base.pages }),
    ...(application ? { application: { organization: application.organization, purpose: application.purpose } } : {}),
    header: resolveHeader(preset, context),
    sections,
    source: context.source,
  }
}
