import { HttpError } from '../http.ts'
import type { DraftBucket } from '../types.ts'

/**
 * Edits waiting to be published.
 *
 * An edit changes a file here rather than committing it. Publishing then writes
 * every changed file as one commit, so a session of work reads as one change in
 * the history instead of one commit per keystroke-sized edit — and there is a
 * point at which the whole thing can be reviewed or thrown away.
 *
 * The store lives in the private drafts bucket: it survives a reload and is
 * reachable only through an authenticated request to this Worker.
 */
export const pendingPrefix = 'pending/'

export type PendingFile = {
  path: string
  text: string
  /** The revision of the file when it was first edited in this batch. */
  baseSha: string
  summaries: string[]
  updatedAt: string
}

// A stored key must round-trip a repository path without colliding.
function keyFor(path: string) {
  return `${pendingPrefix}${encodeURIComponent(path)}`
}

export async function readPending(bucket: DraftBucket, path: string): Promise<PendingFile | undefined> {
  const object = await bucket.get(keyFor(path))
  if (!object?.body) return undefined
  const text = await new Response(object.body).text()
  const meta = object as unknown as { customMetadata?: Record<string, string> }
  const stored = meta.customMetadata ?? {}
  return {
    path,
    text,
    baseSha: stored.baseSha ?? '',
    summaries: stored.summaries ? JSON.parse(stored.summaries) as string[] : [],
    updatedAt: stored.updatedAt ?? '',
  }
}

export async function writePending(bucket: DraftBucket, file: Omit<PendingFile, 'updatedAt'>): Promise<PendingFile> {
  const updatedAt = new Date().toISOString()
  try {
    await bucket.put(keyFor(file.path), new TextEncoder().encode(file.text).buffer as ArrayBuffer, {
      httpMetadata: { contentType: 'text/yaml; charset=utf-8', cacheControl: 'no-store' },
      // Kept short: R2 metadata is not a place for a whole change log.
      customMetadata: { path: file.path, baseSha: file.baseSha, updatedAt, summaries: JSON.stringify(file.summaries.slice(-25)) },
    })
  } catch {
    throw new HttpError(502, 'storage_unavailable', 'pending_write_failed')
  }
  return { ...file, updatedAt }
}

export async function listPending(bucket: DraftBucket): Promise<PendingFile[]> {
  let listing
  try {
    listing = await bucket.list({ prefix: pendingPrefix, limit: 200 })
  } catch {
    throw new HttpError(502, 'storage_unavailable', 'pending_list_failed')
  }
  const files: PendingFile[] = []
  for (const object of listing.objects) {
    if (!object.key.startsWith(pendingPrefix)) continue
    const path = decodeURIComponent(object.key.slice(pendingPrefix.length))
    const file = await readPending(bucket, path)
    if (file) files.push(file)
  }
  return files.sort((first, second) => first.path.localeCompare(second.path))
}

export async function discardPending(bucket: DraftBucket, path?: string): Promise<number> {
  const files = path ? [{ path }] : await listPending(bucket)
  for (const file of files) await bucket.delete(keyFor(file.path))
  return files.length
}
