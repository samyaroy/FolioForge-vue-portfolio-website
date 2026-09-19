import { mutate } from './uploads'

export type CollectionState = { path: string; baseSha: string; entries: unknown[] }

/** Read a collection as it stands on the publishing branch. */
export async function fetchCollection(collection: string, signal: AbortSignal): Promise<CollectionState> {
  const response = await fetch(`/api/content/${encodeURIComponent(collection)}`, { signal, credentials: 'same-origin', headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(response.status === 503 ? 'GitHub is not connected.' : 'Could not read this collection.')
  const body: unknown = await response.json()
  if (!body || typeof body !== 'object') throw new Error('Unreadable collection response.')
  const { path, baseSha, entries } = body as Record<string, unknown>
  if (typeof path !== 'string' || typeof baseSha !== 'string' || !Array.isArray(entries)) throw new Error('Unreadable collection response.')
  return { path, baseSha, entries }
}

const FAILURES: Record<string, string> = {
  content_conflict: 'This file changed on V1 since you opened it. Reload to pick up the new version before saving.',
  github_permission_denied: 'The GitHub App has read-only access. Grant Contents: Read and write to save.',
  unknown_collection: 'This collection cannot be saved yet.',
  entry_not_found: 'That entry is no longer in the file. Reload and try again.',
  base_revision_required: 'The editor lost track of which revision it was editing. Reload the page.',
}

/**
 * An edit does not commit. It joins the batch waiting to be published, and the
 * answer is how many files are now waiting.
 */
async function change(collection: string, method: string, body: Record<string, unknown>) {
  const result = await mutate(`/api/content/${encodeURIComponent(collection)}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }, FAILURES)
  const pending = result && typeof result === 'object' ? (result as { pending?: unknown }).pending : 0
  return typeof pending === 'number' ? pending : 0
}

export const saveEntry = (collection: string, index: number, entry: unknown, baseSha: string): Promise<number> =>
  change(collection, 'PUT', { index, entry, baseSha })

export const createEntry = (collection: string, entry: unknown, baseSha: string): Promise<number> =>
  change(collection, 'POST', { entry, baseSha })

export const deleteEntry = (collection: string, index: number, baseSha: string): Promise<number> =>
  change(collection, 'DELETE', { index, baseSha })
