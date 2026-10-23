import { entryIds } from './collections.ts'
import type { PortfolioCollections } from './resolve.ts'
import {
  ROW_SECTION_LISTS, SECTION_SOURCES, entryKey, isRowSection,
  type CvBullet, type CvLibrary, type CvPreset, type PresetItem, type SectionKind,
} from './schema.ts'

/**
 * The builder's edits to a preset, as plain functions over the preset: each
 * returns a new preset and leaves the one it was given alone, so the builder
 * can compare a draft with what was loaded.
 */

/** A copy of a list with one element moved by `delta`, clamped to the ends. */
export function move<T>(list: readonly T[], index: number, delta: number): T[] {
  const target = Math.max(0, Math.min(list.length - 1, index + delta))
  const next = [...list]
  const [item] = next.splice(index, 1)
  next.splice(target, 0, item)
  return next
}

export function updateSection(preset: CvPreset, index: number, change: (section: CvPreset['sections'][number]) => CvPreset['sections'][number]): CvPreset {
  return { ...preset, sections: preset.sections.map((section, at) => (at === index ? change(section) : section)) }
}

export function updateItem(preset: CvPreset, sectionIndex: number, ref: string, change: (item: PresetItem) => PresetItem): CvPreset {
  return updateSection(preset, sectionIndex, section => ({ ...section, items: section.items.map(item => (item.ref === ref ? change(item) : item)) }))
}

/** What a section may list: library rows for a row section, otherwise CV-only entries and portfolio entries with an id. */
export function candidates(kind: SectionKind, library: CvLibrary, portfolio: PortfolioCollections): string[] {
  if (isRowSection(kind)) return library[ROW_SECTION_LISTS[kind]].map(row => row.id)
  const cvOnly = library.entries.flatMap(entry => (entry.ref ? [] : [entryKey(entry)]))
  const fromPortfolio = SECTION_SOURCES[kind].flatMap(collection => [...entryIds(portfolio.get(collection) ?? [])].map(id => `${collection}#${id}`))
  return [...fromPortfolio, ...cvOnly]
}

/** Entries in a section's collections that carry no id yet, so a CV cannot name them. */
export function unnamedCount(kind: SectionKind, portfolio: PortfolioCollections): number {
  if (isRowSection(kind)) return 0
  return SECTION_SOURCES[kind].reduce((total, collection) => {
    const entries = portfolio.get(collection) ?? []
    return total + entries.length - entryIds(entries).size
  }, 0)
}

export function bulletsOf(ref: string, library: CvLibrary): CvBullet[] {
  return library.bullets.filter(bullet => bullet.ref === ref)
}

/**
 * A preset as its YAML row: defaults left out, so a saved preset reads like
 * the hand-written ones. An item with nothing but its ref is written as the
 * bare ref.
 */
export function presetRow(preset: CvPreset): Record<string, unknown> {
  const sections = preset.sections.map(section => ({
    kind: section.kind,
    ...(section.title ? { title: section.title } : {}),
    items: section.items.map(item => (item.style === 'full' && !item.bullets
      ? item.ref
      : { ref: item.ref, ...(item.bullets ? { bullets: [...item.bullets] } : {}), ...(item.style !== 'full' ? { style: item.style } : {}) })),
  }))
  return {
    id: preset.id,
    name: preset.name,
    filename: preset.filename,
    template: preset.template,
    ...(Object.keys(preset.template_options).length ? { template_options: { ...preset.template_options } } : {}),
    ...(preset.prefer.length ? { prefer: [...preset.prefer] } : {}),
    ...(preset.pages ? { pages: preset.pages } : {}),
    header: [...preset.header],
    sections,
    ...(Object.keys(preset.variants).length ? { variants: { ...preset.variants } } : {}),
  }
}
