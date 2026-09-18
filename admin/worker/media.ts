import { HttpError } from './http.ts'
import type { R2Listing, ReadOnlyBucket } from './types.ts'

/**
 * The one prefix this admin may list and the host its objects are served from.
 * Both are written here rather than taken from a request: the browser sends a
 * cursor and nothing else, so nothing it sends can widen the listing to the
 * rest of the bucket.
 */
export const logoPolicy = {
  prefix: 'logo/',
  publicBase: 'https://media.samyabrata.codeium.xyz',
  pageSize: 200,
} as const

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
    // not something to map into a URL on trust.
    .filter(key => key.startsWith(logoPolicy.prefix) && !key.includes('..') && SUPPORTED.test(key))
    .map(toLogoItem)
  return listing.truncated && listing.cursor ? { items, cursor: listing.cursor } : { items }
}
