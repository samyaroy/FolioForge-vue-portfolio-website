type DriveMode = 'download' | 'view' | 'preview'
const fileIdPattern = /^[A-Za-z0-9_-]+$/

function driveFile(value: unknown) {
  if (typeof value !== 'string') return null
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.hostname !== 'drive.google.com') return null
    const match = url.pathname.match(/^\/file\/d\/([A-Za-z0-9_-]+)\/(view|preview)\/?$/)
    const id = match?.[1] ?? (url.pathname === '/uc' || url.pathname === '/open' ? url.searchParams.get('id') : null)
    if (!id || !fileIdPattern.test(id)) return null
    const mode: DriveMode = url.searchParams.get('export') === 'download' ? 'download' : match?.[2] === 'preview' ? 'preview' : 'view'
    return { id, mode, resourceKey: url.searchParams.get('resourcekey') }
  } catch {
    return null
  }
}

function fieldMode(key: string): DriveMode | null {
  if (key === 'cv') return 'download'
  if (key === 'report') return 'view'
  if (key === 'cred_link' || key.endsWith('_cred_link') || key === 'details_cred') return 'preview'
  return null
}

export function driveFieldMode(key: string, original: unknown) {
  return driveFile(original)?.mode ?? fieldMode(key)
}

export function toDriveEditorValue(value: unknown): unknown {
  const file = driveFile(value)
  if (file) return file.id
  if (Array.isArray(value)) return value.map(toDriveEditorValue)
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, toDriveEditorValue(item)]))
  return value
}

export function fromDriveEditorValue(value: unknown, original: unknown, key: string): unknown {
  if (Array.isArray(value)) return value.map((item, index) => fromDriveEditorValue(item, Array.isArray(original) ? original[index] : undefined, key))
  if (value && typeof value === 'object') {
    const previous = original && typeof original === 'object' ? original as Record<string, unknown> : {}
    return Object.fromEntries(Object.entries(value).map(([name, item]) => [name, fromDriveEditorValue(item, previous[name], name)]))
  }
  const previous = driveFile(original)
  const pasted = driveFile(value)
  const mode = previous?.mode ?? fieldMode(key) ?? pasted?.mode
  if (!mode || typeof value !== 'string' || !value.trim()) return value
  const id = pasted?.id ?? value.trim()
  if (!fileIdPattern.test(id)) {
    if (previous) throw new Error(`Invalid Google Drive file ID in ${key}.`)
    return value
  }
  const url = mode === 'download'
    ? new URL(`https://drive.google.com/uc?export=download&id=${id}`)
    : new URL(`https://drive.google.com/file/d/${id}/${mode}`)
  const resourceKey = pasted?.resourceKey ?? (previous?.id === id ? previous.resourceKey : null)
  if (resourceKey) url.searchParams.set('resourcekey', resourceKey)
  return url.href
}
