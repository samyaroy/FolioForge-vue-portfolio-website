import { parseDocument, type Document } from 'yaml'
import { HttpError } from '../http.ts'
import type { ContentSource } from './registry.ts'

/**
 * Editing one entry inside a YAML file without disturbing anything else.
 *
 * The document API is used rather than parsing to plain JSON and back, because
 * the files carry comments that explain the content, an ordering the owner
 * chose, and fields nothing here knows about. Replacing a single node leaves all
 * of that in place.
 *
 * Rendering still normalises some cosmetics the parser does not model: trailing
 * whitespace, spacing inside flow collections, and blank lines that contain
 * spaces. Measured across the portfolio content that is five to ten per cent of
 * lines, semantically identical, and it happens once per file — a file that has
 * been written once is already in this shape, so later edits diff cleanly.
 * `lineWidth: 0` is not cosmetic and must stay: without it long strings are
 * re-wrapped and a no-op round trip rewrites most of a file.
 */
const RENDER = { lineWidth: 0 } as const

/** Nodes carry the comments written around them; both survive an edit. */
type Commented = { comment?: string; commentBefore?: string }

/** Where an entry lives: the path to its sequence, and its place in it. */
export type EntryLocation = { path: (string | number)[]; index: number }

/**
 * A registry key is a path to a sequence, and content nests sequences in three
 * shapes this has to reach:
 *
 *   projects.research_projects          a sequence under a plain key
 *   projects_mentored.*.projects        one per item of an outer sequence
 *   co_curriculars[title=x].entries     the item of an outer sequence named x
 *
 * `*` expands to every item in order, so a collection presented as one list is
 * addressed as one list. `[field=value]` picks a named group, which survives the
 * groups being reordered in the file — a positional index would not.
 */
export function sequencePath(key: string): string[] {
  return key.split('.')
}

/** Every concrete path a registry key resolves to, in order. */
export function resolvePaths(document: Document, key: string): (string | number)[][] {
  let paths: (string | number)[][] = [[]]
  for (const segment of sequencePath(key)) {
    const next: (string | number)[][] = []
    for (const base of paths) {
      if (segment === '*') {
        const node = document.getIn(base, true) as { items?: unknown[] } | undefined
        const length = Array.isArray(node?.items) ? node.items.length : 0
        for (let index = 0; index < length; index++) next.push([...base, index])
        continue
      }
      const selector = /^([^[]+)\[([^=]+)=(.+)\]$/.exec(segment)
      if (selector) {
        const [, outerKey, field, value] = selector
        const node = document.getIn([...base, outerKey], true) as { items?: unknown[] } | undefined
        const items = Array.isArray(node?.items) ? node.items : []
        const index = items.findIndex(item => String((item as { get?: (k: string) => unknown })?.get?.(field) ?? '') === value)
        if (index >= 0) next.push([...base, outerKey, index])
        continue
      }
      next.push([...base, segment])
    }
    paths = next
  }
  return paths
}

function sequencesFor(document: Document, key: string) {
  return resolvePaths(document, key)
    .map(path => ({ path, node: document.getIn(path, true) as { items?: unknown[] } | undefined }))
    .filter((entry): entry is { path: (string | number)[]; node: { items: unknown[] } } => Array.isArray(entry.node?.items))
}

/**
 * Whether the file has this key at all. A collection whose entries are all
 * commented out parses as null, which is an empty collection rather than a
 * mistake; a key that is simply absent is a registry error.
 */
export function hasSequenceKey(document: Document, key: string): boolean {
  const paths = resolvePaths(document, key)
  return paths.length > 0 && paths.some(path => document.hasIn(path))
}

/** How many entries a collection holds, across every sequence it draws from. */
export function countEntries(document: Document, source: ContentSource): number {
  return source.arrayKeys.reduce((total, key) => total + sequencesFor(document, key).reduce((sum, entry) => sum + entry.node.items.length, 0), 0)
}

/**
 * Turn a flat index into the array that really holds it. A collection drawn
 * from two sequences is presented as one list, so entry 5 may be entry 1 of the
 * second array; writing to the wrong one would silently move the entry.
 */
export function locateEntry(document: Document, source: ContentSource, index: number): EntryLocation {
  if (!Number.isInteger(index) || index < 0) throw new HttpError(400, 'invalid_index')
  let remaining = index
  for (const arrayKey of source.arrayKeys) {
    for (const sequence of sequencesFor(document, arrayKey)) {
      if (remaining < sequence.node.items.length) return { path: sequence.path, index: remaining }
      remaining -= sequence.node.items.length
    }
  }
  throw new HttpError(404, 'entry_not_found')
}

/** Where a new entry goes: the end of the collection's last sequence. */
export function appendLocation(document: Document, source: ContentSource): EntryLocation {
  const arrayKey = source.arrayKeys[source.arrayKeys.length - 1]
  const sequences = sequencesFor(document, arrayKey)
  // A new entry joins the last sequence the collection draws from.
  const last = sequences[sequences.length - 1]
  if (last) return { path: last.path, index: last.node.items.length }
  const paths = resolvePaths(document, arrayKey)
  if (!paths.length || !document.hasIn(paths[0])) throw new HttpError(404, 'collection_not_found')
  return { path: paths[0], index: 0 }
}

export function parseContent(text: string): Document {
  const document = parseDocument(text)
  if (document.errors.length) throw new HttpError(502, 'content_unreadable', 'yaml_errors')
  return document
}

export function replaceEntry(document: Document, location: EntryLocation, entry: unknown): string {
  document.setIn([...location.path, location.index], entry)
  return document.toString(RENDER)
}

export function insertEntry(document: Document, location: EntryLocation, entry: unknown): string {
  // A collection with every entry commented out is null rather than an empty
  // sequence, and `addIn` has nothing to add to. Creating the sequence replaces
  // that null node, which is where the owner's commented-out template is
  // attached, so it is carried across rather than dropped.
  const existing = document.getIn(location.path, true) as Commented | null | undefined
  if (existing && Array.isArray((existing as { items?: unknown[] }).items)) {
    document.addIn(location.path, entry)
  } else {
    // Build the sequence first so the comments written against the old null
    // node can be carried onto it before it replaces that node.
    const sequence = document.createNode([entry]) as Commented
    if (existing?.comment) sequence.comment = existing.comment
    if (existing?.commentBefore) sequence.commentBefore = existing.commentBefore
    document.setIn(location.path, sequence)
  }
  return document.toString(RENDER)
}

export function removeEntry(document: Document, location: EntryLocation): string {
  document.deleteIn([...location.path, location.index])
  return document.toString(RENDER)
}

/** Render with no edit at all, to compare a file against its own normal form. */
export function renderUnchanged(document: Document): string {
  return document.toString(RENDER)
}

export function readEntry(document: Document, location: EntryLocation): unknown {
  return document.getIn([...location.path, location.index])
}
