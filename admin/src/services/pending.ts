import { mutate } from './uploads'

export type PendingFile = { path: string; summaries: string[]; updatedAt: string }

/** Everything edited but not yet published. */
export async function fetchPending(signal: AbortSignal): Promise<PendingFile[]> {
  const response = await fetch('/api/pending', { signal, credentials: 'same-origin', headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error('Pending changes are unavailable.')
  const body: unknown = await response.json()
  const files = body && typeof body === 'object' ? (body as { files?: unknown }).files : undefined
  if (!Array.isArray(files)) throw new Error('Unreadable pending response.')
  return files.flatMap(file => {
    if (!file || typeof file !== 'object') return []
    const { path, summaries, updatedAt } = file as Record<string, unknown>
    if (typeof path !== 'string') return []
    return [{ path, summaries: Array.isArray(summaries) ? summaries.map(String) : [], updatedAt: String(updatedAt ?? '') }]
  })
}

const FAILURES: Record<string, string> = {
  nothing_to_publish: 'There is nothing waiting to publish.',
  content_conflict: 'V1 moved on since one of these edits was made. Discard and redo it, or reload.',
  github_permission_denied: 'The GitHub App has read-only access. Grant Contents: Read and write to publish.',
}

/** Commit everything waiting as one revision. */
export async function publishPending(message?: string): Promise<{ commit: string; files: string[] }> {
  const body = await mutate('/api/pending/publish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message ? { message } : {}),
  }, FAILURES)
  const { commit, files } = (body ?? {}) as Record<string, unknown>
  return { commit: typeof commit === 'string' ? commit : '', files: Array.isArray(files) ? files.map(String) : [] }
}

export async function discardPending(path?: string): Promise<number> {
  const body = await mutate(`/api/pending${path ? `?path=${encodeURIComponent(path)}` : ''}`, { method: 'DELETE' }, FAILURES)
  const discarded = body && typeof body === 'object' ? (body as { discarded?: unknown }).discarded : 0
  return typeof discarded === 'number' ? discarded : 0
}
