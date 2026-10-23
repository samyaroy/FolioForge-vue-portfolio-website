import { HttpError } from '../http.ts'
import type { GithubConfig } from '../github.ts'
import { commitFiles, readFile } from './files.ts'
import { derivedFiles, generatedPaths } from './derived.ts'
import { isWritablePath } from './registry.ts'
import { contentSource, type ContentSource } from './registry.ts'
import { appendLocation, insertEntry, locateEntry, parseContent, readEntry, removeEntry, replaceEntry, resolvePaths } from './entries.ts'
import { discardPending, listPending, readPending, writePending, type PendingFile } from './pending.ts'
import { assertTripExists, setTripCover } from './tripCovers.ts'
import type { DraftBucket } from '../types.ts'

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

/** The file as it stands for editing: the pending version if one exists. */
async function currentFile(config: GithubConfig, drafts: DraftBucket | undefined, path: string) {
  const published = await readFile(config, path)
  const pending = drafts ? await readPending(drafts, path) : undefined
  return pending
    ? { path, text: pending.text, sha: published.sha, baseSha: pending.baseSha, summaries: pending.summaries, pending: true }
    : { path, text: published.text, sha: published.sha, baseSha: published.sha, summaries: [], pending: false }
}

export async function readCollection(config: GithubConfig, collection: string, drafts?: DraftBucket) {
  const source = sourceOf(collection)
  const file = await currentFile(config, drafts, source.path)
  const document = parseContent(file.text)
  const entries = collectionRows(document, source)
  return { path: source.path, baseSha: file.baseSha, entries, pending: file.pending }
}

/** Read in the same sequence order that locateEntry uses for writes. */
export function collectionRows(document: ReturnType<typeof parseContent>, source: ContentSource): unknown[] {
  const entries: unknown[] = []
  for (const arrayKey of source.arrayKeys) {
    for (const path of resolvePaths(document, arrayKey)) {
      const sequence = document.getIn(path) as { toJSON?: () => unknown } | undefined
      const rows = sequence?.toJSON?.()
      if (!Array.isArray(rows)) continue
      // Flattened teaching rows retain the semester used by the editor's filter.
      const semester = arrayKey.includes('.*.') ? document.getIn([...path.slice(0, -1), 'semester']) : undefined
      entries.push(...rows.map(row => semester && row && typeof row === 'object'
        ? { ...row, semester } : row))
    }
  }
  return entries
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
  drafts?: DraftBucket,
): Promise<{ baseSha: string; pending: number }> {
  if (!drafts) throw new HttpError(503, 'uploads_not_connected', 'pending_store_missing')
  const source = sourceOf(request.collection)
  const file = await currentFile(config, drafts, source.path)
  if (file.baseSha !== request.baseSha) throw new HttpError(409, 'content_conflict', 'stale_base')

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

  if (text === file.text) return { baseSha: file.baseSha, pending: (await listPending(drafts)).length }

  // The edit waits here. Nothing reaches the branch until it is published.
  await writePending(drafts, { path: source.path, text, baseSha: file.baseSha, summaries: [...file.summaries, summary] })
  return { baseSha: file.baseSha, pending: (await listPending(drafts)).length }
}

/**
 * Get ready to point a trip at a new cover. The file is read and checked now,
 * so a stale editor or a trip that is gone stops the upload before anything
 * reaches the media host; the returned step then records the change as pending
 * and answers how many files are waiting.
 */
export async function prepareTripCover(config: GithubConfig, drafts: DraftBucket, trip: string, baseSha: string): Promise<(url: string) => Promise<number>> {
  const source = sourceOf('travel/trips')
  const file = await currentFile(config, drafts, source.path)
  if (file.baseSha !== baseSha) throw new HttpError(409, 'content_conflict', 'stale_base')
  assertTripExists(file.text, trip)
  return async url => {
    await writePending(drafts, { path: source.path, text: setTripCover(file.text, trip, url), baseSha: file.baseSha, summaries: [...file.summaries, `set the cover of trip ${trip}`] })
    return (await listPending(drafts)).length
  }
}

/** What is waiting, with the generated files each change will bring with it. */
export async function pendingChanges(drafts: DraftBucket): Promise<PendingFile[]> {
  return listPending(drafts)
}

export async function discardChanges(drafts: DraftBucket, path?: string) {
  return { discarded: await discardPending(drafts, path) }
}

/**
 * Commit everything waiting as one revision. Generated files are rendered from
 * the pending content at this moment, so they describe what is actually being
 * published rather than what was true when the edit was made.
 */
export async function publishChanges(config: GithubConfig, drafts: DraftBucket, message?: string): Promise<{ commit: string; files: string[] }> {
  const pending = await listPending(drafts)
  if (!pending.length) throw new HttpError(409, 'nothing_to_publish')

  // Each file was edited from a revision; if the branch has moved on since,
  // publishing would overwrite whatever moved it.
  for (const file of pending) {
    const published = await readFile(config, file.path)
    if (published.sha !== file.baseSha) throw new HttpError(409, 'content_conflict', `stale:${file.path}`)
  }

  const files = pending.flatMap(file => [
    { path: file.path, text: file.text },
    ...derivedFiles(file.path, parseContent(file.text).toJS()),
  ])
  const summaries = pending.flatMap(file => file.summaries)
  const title = message?.trim() || `content(admin): ${summaries.length} change${summaries.length === 1 ? '' : 's'}`
  const body = summaries.map(line => `- ${line}`).join('\n')

  const allowed = (path: string) => isWritablePath(path) || generatedPaths.includes(path)
  const { commit } = await commitFiles(config, files, `${title}\n\n${body}`, allowed)
  await discardPending(drafts)
  return { commit, files: files.map(file => file.path) }
}
