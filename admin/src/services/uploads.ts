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

export async function mutate(url: string, init: RequestInit, failures: Record<string, string>) {
  const response = await fetch(url, {
    ...init,
    credentials: 'same-origin',
    headers: { ...init.headers, 'X-CSRF-Token': await csrfToken(), Accept: 'application/json' },
  })
  if (!response.ok) {
    const failure: unknown = await response.json().catch(() => null)
    const code = failure && typeof failure === 'object' ? String((failure as { error?: unknown }).error ?? '') : ''
    if (code === 'invalid_csrf_token') pendingToken = undefined
    throw new Error(failures[code] ?? MESSAGES[code] ?? `Request failed (${response.status}).`)
  }
  return response.json() as Promise<unknown>
}

/** Move a logo out of the catalogue. The bytes stay, under logo/archived/. */
export async function archiveLogo(value: string): Promise<string> {
  const body = await mutate(`/api/media/logos/${encodeURIComponent(value)}/archive`, { method: 'POST' }, {
    invalid_logo_name: 'That logo name cannot be used.',
    not_found: 'That logo is no longer in the catalogue.',
  })
  const archivedAs = body && typeof body === 'object' ? (body as { archivedAs?: unknown }).archivedAs : undefined
  return typeof archivedAs === 'string' ? archivedAs : ''
}

export async function uploadLogo(name: string, file: File, replace: boolean): Promise<void> {
  await mutate(`/api/media/logos?name=${encodeURIComponent(name)}${replace ? '&replace=true' : ''}`, {
    method: 'POST',
    headers: { 'Content-Type': file.type },
    body: file,
  }, {
    invalid_logo_name: 'Use letters, digits, spaces, dots, hyphens or underscores.',
    logo_exists: 'A logo already uses that name. Choose Replace to archive the old one.',
  })
}

export type PublishedMedia = { key: string; url: string; replaced?: string }

/** Move a staged upload into the published media bucket under a content name. */
export async function publishDraft(draft: string, name: string, replace: boolean): Promise<PublishedMedia> {
  const body = await mutate('/api/media/publish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ draft, name, replace }),
  }, {
    invalid_media_name: 'Use letters, digits, spaces, dots, hyphens or underscores — and not a name starting with logo, icons or archived.',
    media_exists: 'A file already uses that name. Choose Replace to archive the old one.',
    not_found: 'That upload is no longer staged. Upload it again.',
  })
  const { key, url, replaced } = (body ?? {}) as Record<string, unknown>
  if (typeof key !== 'string' || typeof url !== 'string') throw new Error('Publish response was not usable.')
  return { key, url, ...(typeof replaced === 'string' ? { replaced } : {}) }
}

/** Every upload still sitting in staging, including from earlier sessions. */
export async function listDrafts(signal: AbortSignal): Promise<StoredDraft[]> {
  const response = await fetch('/api/media/drafts', { signal, credentials: 'same-origin', headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error('Staged uploads are unavailable.')
  const body: unknown = await response.json()
  const items = body && typeof body === 'object' ? (body as { items?: unknown }).items : undefined
  if (!Array.isArray(items)) throw new Error('Unreadable staging response.')
  return items.flatMap(item => {
    if (!item || typeof item !== 'object') return []
    const { name, contentType, width, height, size } = item as Record<string, unknown>
    if (typeof name !== 'string' || !/^[a-f0-9]{64}\.(jpg|png|webp)$/.test(name)) return []
    return [{ name, contentType: String(contentType ?? ''), width: Number(width ?? 0), height: Number(height ?? 0), size: Number(size ?? 0) }]
  })
}

/** Discard a staged upload for good. Nothing published references a draft. */
export async function discardDraft(name: string): Promise<void> {
  await mutate(`/api/media/drafts/${encodeURIComponent(name)}`, { method: 'DELETE' }, {
    not_found: 'That upload is no longer staged.',
  })
}

/** Take a published file out of service; the bytes move to archived/. */
export async function archiveMedia(name: string): Promise<string> {
  const body = await mutate(`/api/media/files/${encodeURIComponent(name)}/archive`, { method: 'POST' }, {
    not_found: 'That file is not on the media host.',
    invalid_media_name: 'That name cannot be used.',
  })
  const archivedAs = body && typeof body === 'object' ? (body as { archivedAs?: unknown }).archivedAs : ''
  return typeof archivedAs === 'string' ? archivedAs : ''
}
