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

export type EntryLocation = { arrayKey: string; index: number }

function sequenceAt(document: Document, key: string) {
  const node = document.getIn([key], true) as { items?: unknown[] } | undefined
  return node && Array.isArray(node.items) ? node : undefined
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
    if (remaining < length) return { arrayKey, index: remaining }
    remaining -= length
  }
  throw new HttpError(404, 'entry_not_found')
}

/** Where a new entry goes: the end of the collection's last sequence. */
export function appendLocation(document: Document, source: ContentSource): EntryLocation {
  const arrayKey = source.arrayKeys[source.arrayKeys.length - 1]
  const sequence = sequenceAt(document, arrayKey)
  if (!sequence) throw new HttpError(404, 'collection_not_found')
  return { arrayKey, index: sequence.items?.length ?? 0 }
}

export function parseContent(text: string): Document {
  const document = parseDocument(text)
  if (document.errors.length) throw new HttpError(502, 'content_unreadable', 'yaml_errors')
  return document
}

export function replaceEntry(document: Document, location: EntryLocation, entry: unknown): string {
  document.setIn([location.arrayKey, location.index], entry)
  return document.toString(RENDER)
}

export function insertEntry(document: Document, location: EntryLocation, entry: unknown): string {
  document.addIn([location.arrayKey], entry)
  return document.toString(RENDER)
}

export function removeEntry(document: Document, location: EntryLocation): string {
  document.deleteIn([location.arrayKey, location.index])
  return document.toString(RENDER)
}

/** Render with no edit at all, to compare a file against its own normal form. */
export function renderUnchanged(document: Document): string {
  return document.toString(RENDER)
}

export function readEntry(document: Document, location: EntryLocation): unknown {
  return document.getIn([location.arrayKey, location.index])
}
