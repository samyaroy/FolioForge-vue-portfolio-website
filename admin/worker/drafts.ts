import { HttpError } from './http.ts'
import { contentDigest, inspectImage } from './images.ts'
import type { DraftBucket } from './types.ts'

/**
 * Staged uploads. Every object lands under one prefix in a bucket with no
 * public domain, so nothing uploaded here is reachable from the internet: the
 * only way to see it is an authenticated request to this Worker. Publication
 * to the public media bucket is a separate, reviewed step that does not exist
 * yet, which is what keeps a stolen session from defacing the live site.
 */
export const draftPolicy = {
  prefix: 'drafts/',
  pageSize: 100,
} as const

// A stored name is a digest and an extension, nothing else. Anything that is
// not exactly that shape never becomes a key or a lookup.
const STORED_NAME = /^[a-f0-9]{64}\.(jpg|png|webp)$/

export type StoredDraft = {
  name: string
  contentType: string
  width: number
  height: number
  size: number
  uploadedAt?: string
}

export async function storeDraft(bucket: DraftBucket, body: ArrayBuffer, declaredType: string | null): Promise<StoredDraft> {
  const image = inspectImage(body, declaredType)
  // Content addressing: the same picture is the same object, so a retry after a
  // dropped connection overwrites itself instead of littering the bucket, and
  // no caller-supplied string ever reaches a key.
  const name = `${await contentDigest(image.bytes)}.${image.extension}`
  const stored: StoredDraft = { name, contentType: image.contentType, width: image.width, height: image.height, size: image.bytes.length }
  try {
    await bucket.put(`${draftPolicy.prefix}${name}`, image.bytes as unknown as ArrayBuffer, {
      httpMetadata: { contentType: image.contentType, cacheControl: 'no-store' },
      customMetadata: { width: String(image.width), height: String(image.height) },
    })
  } catch {
    throw new HttpError(502, 'storage_unavailable', 'put_failed')
  }
  return stored
}

export async function readDraft(bucket: DraftBucket, name: string) {
  if (!STORED_NAME.test(name)) throw new HttpError(404, 'not_found', 'bad_draft_name')
  const object = await bucket.get(`${draftPolicy.prefix}${name}`)
  if (!object) throw new HttpError(404, 'not_found', 'draft_missing')
  return object
}

export async function listDrafts(bucket: DraftBucket, cursor?: string): Promise<{ items: StoredDraft[]; cursor?: string }> {
  if (cursor !== undefined && !/^[A-Za-z0-9+/=_-]{1,1024}$/.test(cursor)) throw new HttpError(400, 'invalid_cursor')
  let listing
  try {
    listing = await bucket.list({ prefix: draftPolicy.prefix, limit: draftPolicy.pageSize, cursor })
  } catch {
    throw new HttpError(502, 'storage_unavailable', 'list_failed')
  }
  const items = listing.objects.flatMap(object => {
    const name = object.key.slice(draftPolicy.prefix.length)
    if (!object.key.startsWith(draftPolicy.prefix) || !STORED_NAME.test(name)) return []
    return [{
      name,
      contentType: object.httpMetadata?.contentType ?? 'application/octet-stream',
      width: Number(object.customMetadata?.width ?? 0),
      height: Number(object.customMetadata?.height ?? 0),
      size: object.size ?? 0,
      uploadedAt: object.uploaded instanceof Date ? object.uploaded.toISOString() : undefined,
    }]
  })
  return listing.truncated && listing.cursor ? { items, cursor: listing.cursor } : { items }
}
