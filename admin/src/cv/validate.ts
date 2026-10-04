import {
  ROW_SECTION_LISTS, SECTION_SOURCES, entryKey, isRowSection, portfolioRef, templateStyles,
  type CvIssue, type CvLibrary, type CvPreset, type TemplateManifest, type TemplateOption,
  type TemplateOptionValue, type WordedRow,
} from './schema.ts'

/**
 * Checks that span rows and files, which no single schema can see: ids are
 * unique, references land, each preset suits its template, and every variant
 * is wanted by some preset. The schemas have already checked each row's shape.
 */

/** Entry ids per portfolio collection, read from the portfolio YAML. */
export type PortfolioIndex = ReadonlyMap<string, ReadonlySet<string>>

export type CvContent = {
  library: CvLibrary
  presets: readonly CvPreset[]
  templates: Readonly<Record<string, TemplateManifest>>
  /** Without it, portfolio references are checked for form only. */
  portfolio?: PortfolioIndex
}

export function validateCv({ library, presets, templates, portfolio }: CvContent): CvIssue[] {
  const issues: CvIssue[] = []
  const report = (path: string, message: string) => issues.push({ path, message })

  // A preset's `variants` map names rows by id alone, so ids are unique across
  // every list that has wording, not just within one.
  const wordedLists: Record<string, readonly WordedRow[]> = {
    bullets: library.bullets, summaries: library.summaries, skills: library.skills, interests: library.interests,
  }
  const worded = new Map<string, WordedRow>()
  for (const [list, rows] of Object.entries(wordedLists)) {
    for (const row of rows) {
      if (worded.has(row.id)) report(`library.yml/${list}/${row.id}`, `The id "${row.id}" is already used by another row.`)
      else worded.set(row.id, row)
    }
  }

  const entryKeys = new Set<string>()
  for (const entry of library.entries) {
    const key = entryKey(entry)
    if (entryKeys.has(key)) report(`library.yml/entries/${key}`, 'This entry has two rows; merge them.')
    entryKeys.add(key)
  }
  const cvOnly = new Set(library.entries.flatMap(entry => (entry.ref ? [] : [entryKey(entry)])))

  const exists = (ref: string) => {
    const target = portfolioRef(ref)
    if (!target) return cvOnly.has(ref)
    return !portfolio || (portfolio.get(target.collection)?.has(target.id) ?? false)
  }
  const missing = (ref: string) => (portfolioRef(ref) ? `No portfolio entry "${ref}".` : `No CV entry with the id "${ref}".`)

  for (const entry of library.entries) {
    if (entry.ref && !exists(entry.ref)) report(`library.yml/entries/${entry.ref}`, missing(entry.ref))
  }

  const leads = new Set<string>()
  for (const bullet of library.bullets) {
    const path = `library.yml/bullets/${bullet.id}`
    if (!exists(bullet.ref)) report(`${path}/ref`, missing(bullet.ref))
    if (bullet.kind !== 'lead') continue
    if (leads.has(bullet.ref)) report(path, `${bullet.ref} already has a lead.`)
    leads.add(bullet.ref)
  }

  const rowIds = {
    summaries: new Set(library.summaries.map(row => row.id)),
    skills: new Set(library.skills.map(row => row.id)),
    interests: new Set(library.interests.map(row => row.id)),
  }
  const bullets = new Map(library.bullets.map(bullet => [bullet.id, bullet]))
  const presetIds = new Set<string>()
  const filenames = new Set<string>()

  for (const preset of presets) {
    const path = `presets.yml/presets/${preset.id}`
    if (presetIds.has(preset.id)) report(path, `The id "${preset.id}" is already used by another preset.`)
    presetIds.add(preset.id)
    if (filenames.has(preset.filename)) report(`${path}/filename`, `Another preset already downloads as "${preset.filename}".`)
    filenames.add(preset.filename)

    const template = Object.hasOwn(templates, preset.template) ? templates[preset.template] : undefined
    if (!template) report(`${path}/template`, `No template "${preset.template}". Templates: ${Object.keys(templates).join(', ')}.`)
    else checkOptions(template, preset.template_options, `${path}/template_options`, report)

    preset.sections.forEach((section, index) => {
      const sectionPath = `${path}/sections/${index}`
      if (template && !template.sections.kinds.includes(section.kind)) {
        report(`${sectionPath}/kind`, `The ${template.name} template cannot draw ${section.kind} sections.`)
      }
      if (section.kind === 'summary' && section.items.length !== 1) report(sectionPath, 'A summary section shows exactly one summary.')

      const listed = new Set<string>()
      section.items.forEach((item, itemIndex) => {
        const itemPath = `${sectionPath}/items/${itemIndex}`
        if (listed.has(item.ref)) report(itemPath, `${item.ref} is already in this section.`)
        listed.add(item.ref)

        if (isRowSection(section.kind)) {
          const list = ROW_SECTION_LISTS[section.kind]
          if (!rowIds[list].has(item.ref)) report(itemPath, `No ${list} row "${item.ref}".`)
          if (item.bullets || item.style !== 'full') report(itemPath, `A ${section.kind} row takes no bullets or style.`)
          return
        }

        const target = portfolioRef(item.ref)
        if (target && !SECTION_SOURCES[section.kind].includes(target.collection)) {
          report(itemPath, `${target.collection} entries cannot appear in ${section.kind} sections.`)
        } else if (!exists(item.ref)) {
          report(itemPath, missing(item.ref))
        }
        if (template && !templateStyles(template, section.kind).includes(item.style)) {
          report(`${itemPath}/style`, `The ${template.name} template has no ${item.style} style for ${section.kind}.`)
        }

        const shown = new Set<string>()
        let lead = false
        for (const bulletId of item.bullets ?? []) {
          const bullet = bullets.get(bulletId)
          if (shown.has(bulletId)) report(`${itemPath}/bullets`, `${bulletId} is listed twice.`)
          shown.add(bulletId)
          if (!bullet) report(`${itemPath}/bullets`, `No bullet "${bulletId}".`)
          else if (bullet.ref !== item.ref) report(`${itemPath}/bullets`, `${bulletId} belongs to ${bullet.ref}, not ${item.ref}.`)
          else if (bullet.kind === 'lead') {
            if (lead) report(`${itemPath}/bullets`, 'An item shows one lead at most.')
            lead = true
          }
        }
      })
    })

    for (const [rowId, key] of Object.entries(preset.variants)) {
      const row = worded.get(rowId)
      if (!row) report(`${path}/variants/${rowId}`, `No row "${rowId}".`)
      else if (!Object.hasOwn(row.variants, key)) report(`${path}/variants/${rowId}`, `"${rowId}" has no ${key} wording.`)
    }
  }

  // A variant no preset asks for is never printed, and is usually a typo.
  const wanted = new Set(presets.flatMap(preset => [...preset.prefer, ...Object.values(preset.variants)]))
  for (const [list, rows] of Object.entries(wordedLists)) {
    for (const row of rows) {
      for (const key of Object.keys(row.variants)) {
        if (!wanted.has(key)) report(`library.yml/${list}/${row.id}/${key}`, `No preset prefers "${key}". Check the spelling, or add it to a preset's prefer list.`)
      }
    }
  }

  return issues
}

function checkOptions(
  template: TemplateManifest,
  chosen: Readonly<Record<string, TemplateOptionValue>>,
  path: string,
  report: (path: string, message: string) => void,
) {
  for (const [name, value] of Object.entries(chosen)) {
    const option = Object.hasOwn(template.options, name) ? template.options[name] : undefined
    const problem = option ? optionProblem(option, value) : `The ${template.name} template has no option "${name}".`
    if (problem) report(`${path}/${name}`, problem)
  }
}

function optionProblem(option: TemplateOption, value: TemplateOptionValue): string | undefined {
  if (option.type === 'boolean') return typeof value === 'boolean' ? undefined : 'Must be true or false.'
  if (typeof value !== 'string') return 'Must be text.'
  if (option.type === 'choice') return option.choices.includes(value) ? undefined : `One of: ${option.choices.join(', ')}.`
  return /^#[0-9a-f]{6}$/i.test(value) ? undefined : 'A colour such as #1f4e79.'
}
