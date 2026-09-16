import type { LogoAsset } from '@/types/logos'

export async function fetchLogos(signal: AbortSignal): Promise<LogoAsset[]> {
  const items: LogoAsset[] = []
  const cursors = new Set<string>()
  let cursor: string | undefined
  do {
    const url = `/api/media/logos${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`
    const response = await fetch(url, { signal, credentials: 'same-origin', headers: { Accept: 'application/json' } })
    if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('R2 logo service is not connected. Repository logos are shown instead.')
    const body: unknown = await response.json()
    if (!body || typeof body !== 'object' || !('items' in body) || !Array.isArray(body.items)) throw new Error('Invalid logo catalog response.')
    for (const item of body.items) {
      if (!item || typeof item.value !== 'string' || typeof item.name !== 'string' || typeof item.url !== 'string') throw new Error('Invalid logo asset response.')
      const imageUrl = new URL(item.url, location.origin)
      if (imageUrl.protocol !== 'https:' && imageUrl.origin !== location.origin) throw new Error('Invalid logo preview URL.')
      items.push({ value: item.value, name: item.name, url: imageUrl.href, source: 'r2' })
    }
    cursor = 'cursor' in body && typeof body.cursor === 'string' && body.cursor ? body.cursor : undefined
    if (cursor && cursors.has(cursor)) throw new Error('Invalid logo catalog pagination.')
    if (cursor) cursors.add(cursor)
  } while (cursor)
  return items
}
