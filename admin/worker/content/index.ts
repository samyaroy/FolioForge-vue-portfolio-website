import { HttpError } from '../http.ts'
import type { GithubConfig } from '../github.ts'
import { readFile, writeFile } from './files.ts'
import { contentSource } from './registry.ts'
import { appendLocation, insertEntry, locateEntry, parseContent, readEntry, removeEntry, replaceEntry, sequencePath } from './entries.ts'

export type EntryWrite = {
  collection: string
  index?: number
  entry?: unknown
  /** The file revision the edit was made against. */
  baseSha: string
}

function sourceOf(collection: string) {
  const source = contentSource(collection)
  if (!source) throw new HttpError(404, 'unknown_collection')
  return source
}

export async function readCollection(config: GithubConfig, collection: string) {
  const source = sourceOf(collection)
  const file = await readFile(config, source.path)
  const document = parseContent(file.text)
  // `getIn` hands back YAML nodes; the caller wants plain data, so the whole
  // document is converted once and read from that.
  const data = document.toJS() as Record<string, unknown>
  const entries: unknown[] = []
  for (const arrayKey of source.arrayKeys) {
    const sequence = sequencePath(arrayKey).reduce<unknown>((value, key) => (value && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined), data)
    if (Array.isArray(sequence)) entries.push(...sequence)
  }
  return { path: source.path, baseSha: file.sha, entries }
}

/**
 * Apply one change to one collection and commit it. The base revision is what
 * makes a concurrent edit a conflict rather than a silent overwrite: GitHub
 * refuses the write if the file moved on, and that refusal reaches the caller
 * as `content_conflict` so the editor can reload instead of clobbering.
 */
export async function applyEntryChange(
  config: GithubConfig,
  action: 'update' | 'create' | 'delete',
  request: EntryWrite,
): Promise<{ commit: string; baseSha: string }> {
  const source = sourceOf(request.collection)
  const file = await readFile(config, source.path)
  if (file.sha !== request.baseSha) throw new HttpError(409, 'content_conflict', 'stale_base')

  const document = parseContent(file.text)
  let text: string
  let summary: string

  if (action === 'create') {
    if (request.entry === undefined) throw new HttpError(400, 'entry_required')
    text = insertEntry(document, appendLocation(document, source), request.entry)
    summary = `add an entry to ${request.collection}`
  } else {
    const location = locateEntry(document, source, request.index ?? -1)
    if (readEntry(document, location) === undefined) throw new HttpError(404, 'entry_not_found')
    if (action === 'delete') {
      text = removeEntry(document, location)
      summary = `remove an entry from ${request.collection}`
    } else {
      if (request.entry === undefined) throw new HttpError(400, 'entry_required')
      text = replaceEntry(document, location, request.entry)
      summary = `update an entry in ${request.collection}`
    }
  }

  if (text === file.text) return { commit: '', baseSha: file.sha }
  const { commit } = await writeFile(config, { ...file, text }, `content(admin): ${summary}`)
  return { commit, baseSha: file.sha }
}
