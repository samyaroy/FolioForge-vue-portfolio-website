import { z } from 'zod'

/**
 * The shape of CV content, as zod schemas with the TypeScript types inferred
 * from them: what `src/content/cv/library.yml` and `presets.yml` hold, an
 * application build kept in R2, what a template promises, and the resolved
 * input a template renders and a snapshot archives as build.json.
 *
 * Content and presentation stay apart. Nothing here names a LaTeX macro: a
 * template reads the resolved input and decides how it looks, which is what
 * lets a second template draw the same presets.
 *
 * The browser, the Worker and the Node tests all load this file as it is, so
 * its only import is zod. See admin/docs/cv_architecture.md §5.
 */

// zod compiles fast paths with `new Function` when it can. The admin's CSP has
// no 'unsafe-eval' and Workers forbid eval, and zod's probe for that is itself
// reported as a CSP violation, so it runs without compiling anything.
z.config({ jitless: true })

export const ROW_SECTION_KINDS = ['summary', 'skills', 'interests'] as const
export const ITEM_SECTION_KINDS = [
  'education', 'experience', 'projects', 'publications', 'certifications', 'positions', 'awards',
] as const
export const SECTION_KINDS = [...ROW_SECTION_KINDS, ...ITEM_SECTION_KINDS] as const
export type RowSectionKind = (typeof ROW_SECTION_KINDS)[number]
export type ItemSectionKind = (typeof ITEM_SECTION_KINDS)[number]
export type SectionKind = (typeof SECTION_KINDS)[number]

export function isRowSection(kind: SectionKind): kind is RowSectionKind {
  return (ROW_SECTION_KINDS as readonly string[]).includes(kind)
}

/** The library list each row section reads. */
export const ROW_SECTION_LISTS = { summary: 'summaries', skills: 'skills', interests: 'interests' } as const satisfies Record<RowSectionKind, string>

/**
 * The portfolio collections an item section may draw from, named by their keys
 * in `worker/content/registry.ts`. An entry only the CV has may join any item
 * section.
 */
export const SECTION_SOURCES: Readonly<Record<ItemSectionKind, readonly string[]>> = {
  education: ['home/education'],
  experience: ['home/experience', 'internships-certifications/internships'],
  projects: [
    'projects-publications/research', 'projects-publications/technical',
    'projects-publications/minor', 'projects-publications/other', 'ongoing-projects/projects',
  ],
  publications: ['projects-publications/publications', 'projects-publications/articles', 'projects-publications/posters'],
  certifications: ['internships-certifications/certifications'],
  positions: ['cocurricular/leadership', 'cocurricular/volunteering', 'teaching/mentoring'],
  awards: ['home/awards', 'home/achievements'],
}

/** Headings as the current CVs word them; a preset section may rename its own. */
export const DEFAULT_SECTION_TITLES: Readonly<Record<SectionKind, string>> = {
  summary: 'Profile Summary',
  education: 'Education',
  experience: 'Experience',
  projects: 'Projects',
  publications: 'Publications',
  certifications: 'Certifications',
  positions: 'Positions of Responsibilities',
  awards: 'Awards',
  interests: 'Interests',
  skills: 'Technical Skills',
}

/** Lowercase words joined by hyphens, the form every CV id takes. */
export const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
/** An audience key such as `research` or `data`. */
export const VARIANT_PATTERN = /^[a-z][a-z0-9-]*$/
/** `<collection>#<id>`: a portfolio entry, addressed by its registry collection. */
export const PORTFOLIO_REF_PATTERN = /^([a-z0-9-]+\/[a-z0-9-]+)#([a-z0-9]+(?:-[a-z0-9]+)*)$/
/** Download names: no spaces or path separators. */
export const FILENAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/

export function portfolioRef(ref: string): { collection: string; id: string } | null {
  const match = PORTFOLIO_REF_PATTERN.exec(ref)
  return match ? { collection: match[1], id: match[2] } : null
}

// ---------------------------------------------------------------------------
// Building blocks

function isMap(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** How YAML writes a field the editor cleared: `research:` with nothing after it. */
function isBlank(value: unknown): boolean {
  return value === null || value === undefined || (typeof value === 'string' && !value.trim())
}

/** Drops blank values from a map, so a cleared field reads as absent. */
function withoutBlanks(value: unknown): unknown {
  return isMap(value) ? Object.fromEntries(Object.entries(value).filter(([, field]) => !isBlank(field))) : value
}

/** Text, trimmed. Numbers count, since YAML reads `period: 2026` as one. */
const text = z.preprocess(
  value => (typeof value === 'number' && Number.isFinite(value) ? String(value) : value),
  z.string({ error: issue => (issue.input === undefined ? 'Missing.' : 'Must be text.') })
    .trim()
    .min(1, 'Must not be blank.'),
)

const id = text.refine(value => ID_PATTERN.test(value), 'Use lowercase words joined by hyphens.')
const variantKey = text.refine(value => VARIANT_PATTERN.test(value), 'A variant key is lowercase letters, digits and hyphens.')

/** What a bullet or preset item points at: a portfolio entry, or the id of an entry only the CV has. */
const itemRef = text.refine(
  value => PORTFOLIO_REF_PATTERN.test(value) || ID_PATTERN.test(value),
  'A ref is collection#id for a portfolio entry, or the id of an entry only the CV has.',
)

const httpsUrl = text.refine(value => {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}, 'Must be an https:// address.')

/**
 * The message for input that is not a map at all. Every other problem the
 * object finds, an unrecognised key above all, keeps zod's own wording.
 */
function notAMap(message: string) {
  return { error: (issue: z.core.$ZodRawIssue) => (issue.code === 'invalid_type' ? message : undefined) }
}

/** A list; blank or absent reads as empty. */
function list<T extends z.ZodType>(item: T) {
  return z.preprocess(value => (isBlank(value) ? [] : value), z.array(item, { error: 'Must be a list.' }))
}

/** A map whose keys must match a pattern; blank or absent reads as empty. */
function keyedMap<T extends z.ZodType>(keyPattern: RegExp, keyMessage: string, value: T) {
  return z.preprocess(
    value => (isBlank(value) ? {} : withoutBlanks(value)),
    z.record(z.string(), value, { error: 'Must be a map.' }).superRefine((map, ctx) => {
      for (const key of Object.keys(map)) {
        if (!keyPattern.test(key)) ctx.addIssue({ code: 'custom', path: [key], message: `"${key}": ${keyMessage}` })
      }
    }),
  )
}

// ---------------------------------------------------------------------------
// library.yml

/**
 * A row's variants. In YAML they sit beside `text` as sibling keys, which keeps
 * every row flat enough for the admin's list editor; here every key a row does
 * not declare is gathered into `variants`, where it has to be a variant key
 * holding text.
 */
const variants = z.record(z.string(), text).superRefine((map, ctx) => {
  for (const key of Object.keys(map)) {
    if (!VARIANT_PATTERN.test(key)) {
      ctx.addIssue({ code: 'custom', path: [key], message: `"${key}" is not a field here, nor a variant key (lowercase letters, digits and hyphens).` })
    }
  }
})

function gatherVariants(declared: readonly string[]) {
  return (value: unknown): unknown => {
    if (!isMap(value)) return value
    const row: Record<string, unknown> = {}
    const gathered: Record<string, unknown> = {}
    for (const [key, field] of Object.entries(value)) {
      if (isBlank(field)) continue
      if (declared.includes(key)) row[key] = field
      else gathered[key] = field
    }
    return { ...row, variants: gathered }
  }
}

/** Facts an entry row may set or replace. All are authored markup except `link`. */
const entryFields = {
  title: text.optional(),
  subtitle: text.optional(),
  tech: text.optional(),
  context: text.optional(),
  link: httpsUrl.optional(),
  link_label: text.optional(),
  location: text.optional(),
  period: text.optional(),
  coursework: text.optional(),
  short_title: text.optional(),
  short_context: text.optional(),
}
export type EntryField = keyof typeof entryFields
export const ENTRY_FIELDS = Object.keys(entryFields) as EntryField[]

/**
 * CV facts. With a `ref`, the fields replace that portfolio entry's facts on
 * the CV only. Without one, the row is an entry only the CV has, known by its
 * `id`, and has to carry at least a title.
 */
export const cvEntrySchema = z.preprocess(
  withoutBlanks,
  z.strictObject({ ref: text.optional(), id: id.optional(), ...entryFields }, notAMap('An entry is a map of fields.'))
    .superRefine((entry, ctx) => {
      if (entry.ref !== undefined && !PORTFOLIO_REF_PATTERN.test(entry.ref)) {
        ctx.addIssue({ code: 'custom', path: ['ref'], message: `"${entry.ref}" is not a portfolio reference (collection#id).` })
      }
      if (entry.ref && entry.id) ctx.addIssue({ code: 'custom', path: ['id'], message: 'An entry with a ref is known by it; remove the id.' })
      if (!entry.ref && !entry.id) ctx.addIssue({ code: 'custom', path: [], message: 'Needs a ref to a portfolio entry, or an id for an entry only the CV has.' })
      if (!entry.ref && !entry.title) ctx.addIssue({ code: 'custom', path: ['title'], message: 'An entry only the CV has needs a title.' })
    }),
)
export type CvEntry = z.output<typeof cvEntrySchema>

export function entryKey(entry: CvEntry): string {
  return entry.ref ?? entry.id ?? ''
}

/** `lead` is the paragraph under an experience heading; `item` is a bullet. */
export const BULLET_KINDS = ['item', 'lead'] as const
export type BulletKind = (typeof BULLET_KINDS)[number]

export const cvBulletSchema = z.preprocess(
  gatherVariants(['id', 'ref', 'kind', 'text', 'tags']),
  z.strictObject({
    id,
    ref: itemRef,
    kind: z.enum(BULLET_KINDS, { error: 'Kind is "item" or "lead".' }).default('item'),
    text,
    tags: list(text),
    variants,
  }, notAMap('A bullet is a map of fields.')),
)
export type CvBullet = z.output<typeof cvBulletSchema>

export const cvSummarySchema = z.preprocess(
  gatherVariants(['id', 'text']),
  z.strictObject({ id, text, variants }, notAMap('A summary is a map of fields.')),
)
export type CvSummary = z.output<typeof cvSummarySchema>

export const cvSkillSchema = z.preprocess(
  gatherVariants(['id', 'label', 'text']),
  z.strictObject({ id, label: text, text, variants }, notAMap('A skill row is a map of fields.')),
)
export type CvSkill = z.output<typeof cvSkillSchema>

export const cvInterestSchema = z.preprocess(
  gatherVariants(['id', 'text']),
  z.strictObject({ id, text, variants }, notAMap('An interest is a map of fields.')),
)
export type CvInterest = z.output<typeof cvInterestSchema>

/** Any library row with wording: it has an id, canonical text and variants. */
export type WordedRow = CvBullet | CvSummary | CvSkill | CvInterest

/** `src/content/cv/library.yml`. */
export const cvLibrarySchema = z.preprocess(
  value => (isBlank(value) ? {} : value),
  z.strictObject({
    entries: list(cvEntrySchema),
    bullets: list(cvBulletSchema),
    summaries: list(cvSummarySchema),
    skills: list(cvSkillSchema),
    interests: list(cvInterestSchema),
  }, notAMap('library.yml is a map of lists.')),
)
export type CvLibrary = z.output<typeof cvLibrarySchema>

// ---------------------------------------------------------------------------
// presets.yml. Preset fields keep their YAML names: the builder edits a preset
// and writes the same row back.

export const ITEM_STYLES = ['full', 'compact'] as const
export type ItemStyle = (typeof ITEM_STYLES)[number]

/**
 * One thing a section shows, written as a bare ref or as a map. In a row section
 * the ref is a library row id and nothing else applies. In an item section
 * `bullets` lists the bullet ids shown, in order, a lead among them; absent
 * shows none.
 */
export const presetItemSchema = z.preprocess(
  value => (typeof value === 'string' ? { ref: value } : withoutBlanks(value)),
  z.strictObject({
    ref: itemRef,
    bullets: z.array(id, { error: 'Must be a list of bullet ids.' }).optional(),
    style: z.enum(ITEM_STYLES, { error: 'Style is "full" or "compact".' }).default('full'),
  }, notAMap('An item is a ref, or a map with a ref.')),
)
export type PresetItem = z.output<typeof presetItemSchema>

export const presetSectionSchema = z.preprocess(
  withoutBlanks,
  z.strictObject({
    kind: z.enum(SECTION_KINDS, { error: `The kind is one of: ${SECTION_KINDS.join(', ')}.` }),
    title: text.optional(),
    items: list(presetItemSchema),
  }, notAMap('A section is a map with a kind and items.')),
)
export type PresetSection = z.output<typeof presetSectionSchema>

/**
 * Contact details a header may show, where each comes from, and how it reads.
 * `from` is a dotted path into `profile.yml`, or `site` for the portfolio's own
 * address, which the resolver is given. `label` is `value` to print the value,
 * `host` to print a URL without its scheme, or fixed text.
 */
export const HEADER_FIELD_KEYS = [
  'phone', 'gmail', 'email', 'location', 'website', 'linkedin', 'github', 'github2',
  'kaggle', 'google_scholar', 'researchgate', 'orcid',
] as const
export type HeaderField = (typeof HEADER_FIELD_KEYS)[number]

export const HEADER_FIELDS: Readonly<Record<HeaderField, { from: string; link: 'none' | 'mailto' | 'url'; label: string }>> = {
  phone: { from: 'contacts.phone', link: 'none', label: 'value' },
  gmail: { from: 'contacts.gmail', link: 'mailto', label: 'value' },
  email: { from: 'contacts.email', link: 'mailto', label: 'value' },
  location: { from: 'contacts.location', link: 'none', label: 'value' },
  website: { from: 'site', link: 'url', label: 'host' },
  linkedin: { from: 'socials.linkedin', link: 'url', label: 'LinkedIn' },
  github: { from: 'socials.github', link: 'url', label: 'GitHub' },
  github2: { from: 'socials.github2', link: 'url', label: 'GitHub' },
  kaggle: { from: 'socials.kaggle', link: 'url', label: 'Kaggle' },
  google_scholar: { from: 'socials.google_scholar', link: 'url', label: 'Google Scholar' },
  researchgate: { from: 'socials.researchgate', link: 'url', label: 'ResearchGate' },
  orcid: { from: 'socials.orcid_id', link: 'url', label: 'ORCID' },
}

const templateOptionValue = z.union([z.boolean(), text], { error: 'An option is text or true/false.' })
export type TemplateOptionValue = z.output<typeof templateOptionValue>

const templateOptions = keyedMap(/^[a-z][a-z0-9_]*$/, 'not an option name.', templateOptionValue)
/** Row id to the variant key that row uses, overriding `prefer`. */
const variantChoices = keyedMap(ID_PATTERN, 'not a row id.', variantKey)

export const cvPresetSchema = z.preprocess(
  withoutBlanks,
  z.strictObject({
    id,
    name: text,
    /** The download name, without `.tex` or `.pdf`. */
    filename: text.refine(value => FILENAME_PATTERN.test(value), 'Use letters, digits, dots, hyphens and underscores.'),
    template: text,
    template_options: templateOptions,
    /** Variant keys in order of preference; `text` is the last resort. */
    prefer: list(variantKey),
    /** Page budget. Running over is a build warning, not an error. */
    pages: z.number({ error: 'Pages is a whole number above zero.' }).int().positive().optional(),
    header: list(z.enum(HEADER_FIELD_KEYS, { error: `A header field is one of: ${HEADER_FIELD_KEYS.join(', ')}.` })),
    sections: list(presetSectionSchema),
    variants: variantChoices,
  }, notAMap('A preset is a map of fields.')),
)
export type CvPreset = z.output<typeof cvPresetSchema>

/** `src/content/cv/presets.yml`. */
export const cvPresetsSchema = z.preprocess(
  value => (isBlank(value) ? {} : value),
  z.strictObject({ presets: list(cvPresetSchema) }, notAMap('presets.yml is a map with a presets list.')),
)

/**
 * A one-off build for an application, kept privately in R2 as JSON. It names a
 * base preset and carries only what differs from it.
 */
export const applicationBuildSchema = z.strictObject({
  id: z.string().regex(/^[0-9A-HJKMNP-TV-Z]{26}$/, 'Not a ULID.'),
  base: id,
  organization: text,
  purpose: text,
  patch: z.strictObject({
    sections: z.array(presetSectionSchema).optional(),
    variants: variantChoices.optional(),
    template: text.optional(),
    template_options: templateOptions.optional(),
  }),
  createdAt: z.iso.datetime({ offset: true }),
})
export type ApplicationBuild = z.output<typeof applicationBuildSchema>

// ---------------------------------------------------------------------------
// Templates are code, not content, so a manifest is a type checked at compile
// time rather than parsed. See ./templates/index.ts.

export const TEX_ENGINES = ['pdftex', 'xetex'] as const
export type TexEngine = (typeof TEX_ENGINES)[number]

export type TemplateOption =
  | { type: 'boolean'; label: string; default: boolean }
  | { type: 'choice'; label: string; choices: readonly string[]; default: string }
  | { type: 'color'; label: string; default: string }

/**
 * What a template promises. The content model never changes for a new
 * template: it declares what it can draw, presets that choose it are checked
 * against that, and presets that don't are unaffected.
 */
export type TemplateManifest = {
  id: string
  name: string
  description: string
  /** Bumped when the template's output changes on purpose. */
  version: number
  /** Which engine compiles it; each engine is a separate vendored build. */
  engine: TexEngine
  paper: 'letter' | 'a4'
  sections: {
    kinds: readonly SectionKind[]
    /** Item styles per item section. A kind not listed accepts `full` only. */
    styles: Readonly<Partial<Record<ItemSectionKind, readonly ItemStyle[]>>>
  }
  /** Options a preset may set in `template_options`, with their defaults. */
  options: Readonly<Record<string, TemplateOption>>
}

export function templateStyles(template: TemplateManifest, kind: ItemSectionKind): readonly ItemStyle[] {
  return template.sections.styles[kind] ?? ['full']
}

// ---------------------------------------------------------------------------
// The resolved input: what a template renders, and what a snapshot archives as
// build.json. The Worker parses it from the browser before archiving, so it is
// a schema too. Its strings are final but still authored markup, not LaTeX:
// converting them is the template's job. Nothing here transforms, so a parsed
// build input is exactly what was sent and hashes the same.

const resolvedItemSchema = z.strictObject({
  key: z.string(),
  style: z.enum(ITEM_STYLES),
  title: z.string(),
  subtitle: z.string().optional(),
  tech: z.string().optional(),
  context: z.string().optional(),
  link: z.strictObject({ url: z.string(), label: z.string() }).optional(),
  location: z.string().optional(),
  period: z.string().optional(),
  coursework: z.string().optional(),
  lead: z.string().optional(),
  bullets: z.array(z.string()),
})
export type ResolvedItem = z.output<typeof resolvedItemSchema>
export type ResolvedLink = NonNullable<ResolvedItem['link']>

export const resolvedSectionSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('summary'), title: z.string(), text: z.string() }),
  z.strictObject({ kind: z.literal('skills'), title: z.string(), rows: z.array(z.strictObject({ label: z.string(), text: z.string() })) }),
  z.strictObject({ kind: z.literal('interests'), title: z.string(), items: z.array(z.string()) }),
  z.strictObject({ kind: z.enum(ITEM_SECTION_KINDS), title: z.string(), items: z.array(resolvedItemSchema) }),
])
export type ResolvedSection = z.output<typeof resolvedSectionSchema>

export const buildInputSchema = z.strictObject({
  rendererVersion: z.number().int().positive(),
  template: z.strictObject({
    id: z.string(),
    version: z.number().int().positive(),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    options: z.record(z.string(), z.union([z.boolean(), z.string()])),
  }),
  preset: z.strictObject({
    id: z.string(),
    name: z.string(),
    filename: z.string().regex(FILENAME_PATTERN),
    pages: z.number().int().positive().optional(),
  }),
  application: z.strictObject({ organization: z.string(), purpose: z.string() }).optional(),
  header: z.strictObject({
    name: z.string(),
    fields: z.array(z.strictObject({ key: z.enum(HEADER_FIELD_KEYS), label: z.string(), href: z.string().optional() })),
  }),
  sections: z.array(resolvedSectionSchema),
  /** Where the content came from. Left out of the input hash. */
  source: z.strictObject({ v1Sha: z.string().regex(/^[a-f0-9]{40}$/), pending: z.boolean() }),
})
export type BuildInput = z.output<typeof buildInputSchema>

// ---------------------------------------------------------------------------

/**
 * A problem in CV content, located by file, list, row and field:
 * `presets.yml/presets/0/sections/2/kind`. Parsing names rows by position,
 * since a broken row may have no usable id; validation names them by id.
 */
export type CvIssue = { path: string; message: string }

export function cvIssues(error: z.ZodError, root: string): CvIssue[] {
  return error.issues.map(issue => ({ path: [root, ...issue.path.map(String)].join('/'), message: issue.message }))
}

export type Parsed<T> = { ok: true; value: T } | { ok: false; issues: CvIssue[] }

/** Parsed YAML of library.yml in; the library, or every problem found, out. */
export function parseLibrary(raw: unknown): Parsed<CvLibrary> {
  const result = cvLibrarySchema.safeParse(raw)
  return result.success ? { ok: true, value: result.data } : { ok: false, issues: cvIssues(result.error, 'library.yml') }
}

/** Parsed YAML of presets.yml in; the presets, or every problem found, out. */
export function parsePresets(raw: unknown): Parsed<CvPreset[]> {
  const result = cvPresetsSchema.safeParse(raw)
  return result.success ? { ok: true, value: result.data.presets } : { ok: false, issues: cvIssues(result.error, 'presets.yml') }
}
