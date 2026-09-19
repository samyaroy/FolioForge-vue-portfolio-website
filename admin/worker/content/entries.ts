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
 * A collection's arrays are not always at the top level — projects.yml keeps
 * all four of its sequences under a single `projects:` key — so a registry key
 * is a dotted path rather than a plain name.
 */
export function sequencePath(key: string): string[] {
  return key.split('.')
}

function sequenceAt(document: Document, key: string) {
  const node = document.getIn(sequencePath(key), true) as { items?: unknown[] } | undefined
  return node && Array.isArray(node.items) ? node : undefined
}

/**
 * Whether the file has this key at all. A collection whose entries are all
 * commented out parses as null, which is an empty collection rather than a
 * mistake; a key that is simply absent is a registry error.
 */
export function hasSequenceKey(document: Document, key: string): boolean {
  return document.hasIn(sequencePath(key))
}

/** How many entries a collection holds, across every sequence it draws from. */
export function countEntries(document: Document, source: ContentSource): number {
  return source.arrayKeys.reduce((total, key) => total + (sequenceAt(document, key)?.items?.length ?? 0), 0)
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
    const sequence = sequenceAt(document, arrayKey)
    const length = sequence?.items?.length ?? 0
    if (remaining < length) return { path: sequencePath(arrayKey), index: remaining }
    remaining -= length
  }
  throw new HttpError(404, 'entry_not_found')
}

/** Where a new entry goes: the end of the collection's last sequence. */
export function appendLocation(document: Document, source: ContentSource): EntryLocation {
  const arrayKey = source.arrayKeys[source.arrayKeys.length - 1]
  if (!hasSequenceKey(document, arrayKey)) throw new HttpError(404, 'collection_not_found')
  const sequence = sequenceAt(document, arrayKey)
  return { path: sequencePath(arrayKey), index: sequence?.items?.length ?? 0 }
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
