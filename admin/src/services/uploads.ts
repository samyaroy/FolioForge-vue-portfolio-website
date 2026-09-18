export type StoredDraft = {
  name: string
  contentType: string
  width: number
  height: number
  size: number
}

// The CSRF token is bound to the Access session, so it is fetched once and
// reused. A rejected mutation clears it, because the likeliest cause is that
// the Access session rolled over underneath us.
let pendingToken: Promise<string> | undefined

async function csrfToken(): Promise<string> {
  pendingToken ??= (async () => {
    const response = await fetch('/api/session', { credentials: 'same-origin', headers: { Accept: 'application/json' } })
    if (!response.ok) throw new Error('Your session has expired. Reload the page to sign in again.')
    const body: unknown = await response.json()
    const token = body && typeof body === 'object' ? (body as { csrfToken?: unknown }).csrfToken : undefined
    if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) throw new Error('Session response was not usable.')
    return token
  })()
  try {
    return await pendingToken
  } catch (error) {
    pendingToken = undefined
    throw error
  }
}

const MESSAGES: Record<string, string> = {
  unsupported_image: 'That file is not a JPEG, PNG or WebP.',
  image_too_large: 'That image is over the 10 MB / 25 megapixel limit.',
  uploads_not_connected: 'Upload storage is not connected.',
  storage_unavailable: 'Storage did not accept the file. Try again.',
  invalid_csrf_token: 'Your session has expired. Reload the page to sign in again.',
}

export async function uploadImage(file: File, signal: AbortSignal): Promise<StoredDraft> {
  const response = await fetch('/api/media/uploads', {
    method: 'POST',
    signal,
    credentials: 'same-origin',
    // The browser sets Origin itself; the Worker checks it against the exact
    // admin origin alongside this token.
    headers: { 'Content-Type': file.type, 'X-CSRF-Token': await csrfToken(), Accept: 'application/json' },
    body: file,
  })
  if (!response.ok) {
    const failure: unknown = await response.json().catch(() => null)
    const code = failure && typeof failure === 'object' ? String((failure as { error?: unknown }).error ?? '') : ''
    if (code === 'invalid_csrf_token') pendingToken = undefined
    throw new Error(MESSAGES[code] ?? `Upload failed (${response.status}).`)
  }
  const body: unknown = await response.json()
  if (!body || typeof body !== 'object') throw new Error('Upload response was not usable.')
  const { name, contentType, width, height, size } = body as Record<string, unknown>
  if (typeof name !== 'string' || !/^[a-f0-9]{64}\.(jpg|png|webp)$/.test(name)) throw new Error('Upload response named no stored file.')
  return { name, contentType: String(contentType ?? ''), width: Number(width ?? 0), height: Number(height ?? 0), size: Number(size ?? 0) }
}

/** Staged bytes are private; this is the only way to see them. */
export function draftPreviewUrl(name: string): string {
  return `/api/media/drafts/${encodeURIComponent(name)}`
}
