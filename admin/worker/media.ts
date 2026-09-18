import { HttpError } from './http.ts'
import { contentDigest, inspectImage } from './images.ts'
import type { MediaBucket, R2Listing, ReadOnlyBucket } from './types.ts'

/**
 * The one prefix this admin may list and the host its objects are served from.
 * Both are written here rather than taken from a request: the browser sends a
 * cursor and nothing else, so nothing it sends can widen the listing to the
 * rest of the bucket.
 */
export const logoPolicy = {
  prefix: 'logo/',
  // Archiving moves an object here rather than destroying it, so a logo removed
  // by mistake is one copy away from coming back. It stays inside the published
  // bucket, so an archived file is still reachable at its new public URL — it is
  // out of the catalogue and out of the site, not out of existence.
  archivePrefix: 'logo/archived/',
  publicBase: 'https://media.samyabrata.codeium.xyz',
  pageSize: 200,
} as const

/**
 * A logo's name is not decoration: it is the value written into the YAML, which
 * the site joins to the media base. So it has to be a plain token, and it has to
 * be the whole of what reaches a key.
 */
const LOGO_NAME = /^[A-Za-z0-9][A-Za-z0-9 ._-]{0,63}$/

export function assertLogoName(name: string): string {
  const trimmed = name.trim()
  if (!LOGO_NAME.test(trimmed) || trimmed.includes('..') || trimmed.endsWith('.')) throw new HttpError(400, 'invalid_logo_name')
  return trimmed
}

// The formats the pipeline accepts. SVG is excluded deliberately: it is a
// document rather than an image, and nothing in the logo set needs it.
const SUPPORTED = /\.(png|jpe?g|webp|avif)$/i
// R2 cursors are opaque, so the only question worth asking is whether this
// looks like one at all.
const CURSOR = /^[A-Za-z0-9+/=_-]{1,1024}$/

export type LogoItem = { value: string; name: string; url: string }

function toLogoItem(key: string): LogoItem {
  const file = key.slice(logoPolicy.prefix.length)
  // The site's resolver turns a bare name into `<base>/<name>.png`, so only a
  // .png may lose its extension. Anything else has to keep it to name the same
  // object once it is written back into the YAML.
  const value = file.toLowerCase().endsWith('.png') ? file.slice(0, -4) : file
  return { value, name: value, url: new URL(`${logoPolicy.prefix}${file}`, `${logoPolicy.publicBase}/`).href }
}

export async function listLogos(bucket: ReadOnlyBucket, cursor?: string): Promise<{ items: LogoItem[]; cursor?: string }> {
  if (cursor !== undefined && !CURSOR.test(cursor)) throw new HttpError(400, 'invalid_cursor')
  let listing: R2Listing
  try {
    listing = await bucket.list({ prefix: logoPolicy.prefix, limit: logoPolicy.pageSize, cursor })
  } catch {
    throw new HttpError(502, 'storage_unavailable', 'list_failed')
  }
  const items = listing.objects
    .map(object => object.key)
    // The prefix was asked for, but a key that escapes it or walks upward is
    // not something to map into a URL on trust. Archived logos live under this
    // prefix too and are deliberately not part of the catalogue.
    .filter(key => key.startsWith(logoPolicy.prefix) && !key.startsWith(logoPolicy.archivePrefix) && !key.includes('..') && SUPPORTED.test(key))
    .map(toLogoItem)
  return listing.truncated && listing.cursor ? { items, cursor: listing.cursor } : { items }
}

/* ------------------------------ changing it ------------------------------ */

function storedName(name: string, extension: string) {
  return `${name}.${extension}`
}

/** Look up which stored file a catalogue value refers to. */
async function findLogoKey(bucket: MediaBucket, name: string) {
  for (const extension of ['png', 'jpg', 'jpeg', 'webp', 'avif']) {
    const key = `${logoPolicy.prefix}${storedName(name, extension)}`
    if (await bucket.get(key)) return key
  }
  // The catalogue value may already carry its own extension.
  const literal = `${logoPolicy.prefix}${name}`
  if (SUPPORTED.test(literal) && await bucket.get(literal)) return literal
  return undefined
}

/**
 * Move a logo out of the catalogue. The object is copied to the archive prefix
 * before the original is removed, so a failure part-way leaves the archive copy
 * rather than nothing at all.
 */
export async function archiveLogo(bucket: MediaBucket, rawName: string): Promise<{ archivedAs: string }> {
  const name = assertLogoName(rawName)
  const key = await findLogoKey(bucket, name)
  if (!key) throw new HttpError(404, 'not_found', 'logo_missing')
  const file = key.slice(logoPolicy.prefix.length)
  const destination = `${logoPolicy.archivePrefix}${file}`
  try {
    const object = await bucket.get(key)
    if (!object?.body) throw new HttpError(502, 'storage_unavailable', 'archive_source_unreadable')
    const bytes = await new Response(object.body).arrayBuffer()
    await bucket.put(destination, bytes, { httpMetadata: { contentType: object.httpMetadata?.contentType ?? 'application/octet-stream' } })
    await bucket.delete(key)
  } catch (error) {
    if (error instanceof HttpError) throw error
    throw new HttpError(502, 'storage_unavailable', 'archive_failed')
  }
  return { archivedAs: destination }
}

/**
 * Add a logo under the name the catalogue will show and the YAML will carry.
 * An existing name is never silently overwritten: replacing a live logo is a
 * different decision from adding one, and it archives the old file first.
 */
export async function storeLogo(bucket: MediaBucket, rawName: string, body: ArrayBuffer, declaredType: string | null, replace: boolean): Promise<LogoItem & { digest: string }> {
  const name = assertLogoName(rawName)
  const image = inspectImage(body, declaredType)
  const existing = await findLogoKey(bucket, name)
  if (existing && !replace) throw new HttpError(409, 'logo_exists', 'name_taken')
  if (existing) await archiveLogo(bucket, name)
  const key = `${logoPolicy.prefix}${storedName(name, image.extension)}`
  try {
    await bucket.put(key, image.bytes as unknown as ArrayBuffer, { httpMetadata: { contentType: image.contentType } })
  } catch {
    throw new HttpError(502, 'storage_unavailable', 'put_failed')
  }
  return { ...toLogoItem(key), digest: await contentDigest(image.bytes) }
}
