import assert from 'node:assert/strict'
import { test } from 'node:test'
import { contentDigest, imagePolicy, inspectImage } from '../images.ts'
import { draftPolicy, listDrafts, readDraft, storeDraft } from '../drafts.ts'

/* --------------------------- fixture builders --------------------------- */

function png({ width = 4, height = 3, extras = [] } = {}) {
  const chunks = []
  const chunk = (type, data) => {
    const out = new Uint8Array(12 + data.length)
    new DataView(out.buffer).setUint32(0, data.length)
    out.set([...type].map(c => c.charCodeAt(0)), 4)
    out.set(data, 8)
    return out
  }
  const ihdr = new Uint8Array(13)
  const view = new DataView(ihdr.buffer)
  view.setUint32(0, width)
  view.setUint32(4, height)
  chunks.push(chunk('IHDR', ihdr))
  for (const [type, text] of extras) chunks.push(chunk(type, new TextEncoder().encode(text)))
  chunks.push(chunk('IDAT', new Uint8Array([1, 2, 3])))
  chunks.push(chunk('IEND', new Uint8Array(0)))
  return join([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), ...chunks])
}

function jpeg({ width = 8, height = 6, withExif = false } = {}) {
  const parts = [new Uint8Array([0xff, 0xd8])]
  const segment = (marker, data) => {
    const out = new Uint8Array(4 + data.length)
    out[0] = 0xff
    out[1] = marker
    new DataView(out.buffer).setUint16(2, data.length + 2)
    out.set(data, 4)
    return out
  }
  if (withExif) {
    // APP1 carrying an Exif header and a recognisable GPS-ish payload.
    parts.push(segment(0xe1, new TextEncoder().encode('Exif\0\0GPSLatitude 22.5726 GPSLongitude 88.3639')))
  }
  const sof = new Uint8Array(13)
  const view = new DataView(sof.buffer)
  sof[0] = 8
  view.setUint16(1, height)
  view.setUint16(3, width)
  parts.push(segment(0xc0, sof))
  parts.push(new Uint8Array([0xff, 0xda, 0x00, 0x02, 0x01, 0x02, 0x03, 0xff, 0xd9]))
  return join(parts)
}

function webp({ width = 5, height = 7, withExif = false } = {}) {
  const chunk = (fourcc, data) => {
    const padded = data.length + (data.length % 2)
    const out = new Uint8Array(8 + padded)
    out.set([...fourcc].map(c => c.charCodeAt(0)))
    new DataView(out.buffer).setUint32(4, data.length, true)
    out.set(data, 8)
    return out
  }
  const vp8x = new Uint8Array(10)
  const w = width - 1
  const h = height - 1
  vp8x.set([0, 0, 0, 0, w & 255, (w >> 8) & 255, (w >> 16) & 255, h & 255, (h >> 8) & 255, (h >> 16) & 255])
  const body = [chunk('VP8X', vp8x)]
  if (withExif) body.push(chunk('EXIF', new TextEncoder().encode('GPSLatitude 22.5726')))
  body.push(chunk('VP8 ', new Uint8Array([1, 2, 3, 4])))
  const payload = join(body)
  const header = new Uint8Array(12)
  header.set([...'RIFF'].map(c => c.charCodeAt(0)))
  new DataView(header.buffer).setUint32(4, payload.length + 4, true)
  header.set([...'WEBP'].map(c => c.charCodeAt(0)), 8)
  return join([header, payload])
}

function join(parts) {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0))
  let at = 0
  for (const p of parts) { out.set(p, at); at += p.length }
  return out
}

const buffer = bytes => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
const textOf = bytes => new TextDecoder().decode(bytes)

/* ------------------------------ what it is ------------------------------ */

test('each accepted format is recognised and measured from its own bytes', () => {
  assert.deepEqual(pick(inspectImage(buffer(png({ width: 4, height: 3 })), null)), { contentType: 'image/png', extension: 'png', width: 4, height: 3 })
  assert.deepEqual(pick(inspectImage(buffer(jpeg({ width: 8, height: 6 })), null)), { contentType: 'image/jpeg', extension: 'jpg', width: 8, height: 6 })
  assert.deepEqual(pick(inspectImage(buffer(webp({ width: 5, height: 7 })), null)), { contentType: 'image/webp', extension: 'webp', width: 5, height: 7 })
})

function pick({ contentType, extension, width, height }) {
  return { contentType, extension, width, height }
}

test('the signature decides the format, not the declared content type', () => {
  // A PNG announced as a JPEG is a disagreement worth refusing outright.
  assert.throws(() => inspectImage(buffer(png()), 'image/jpeg'), error => error.reason === 'declared_type_mismatch')
  // Agreement, with parameters, is fine.
  assert.equal(inspectImage(buffer(png()), 'image/png; charset=binary').contentType, 'image/png')
})

test('SVG is named as the thing it is rather than lumped in with junk', () => {
  const svg = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>')
  assert.throws(() => inspectImage(buffer(svg), 'image/svg+xml'), error => error.reason === 'svg_not_accepted')
})

test('a file renamed to look like an image is refused', () => {
  const script = new TextEncoder().encode('#!/bin/sh\nrm -rf /\n')
  assert.throws(() => inspectImage(buffer(script), 'image/png'), error => error.code === 'unsupported_image')
  assert.throws(() => inspectImage(new ArrayBuffer(0), 'image/png'), error => error.reason === 'empty_body')
})

/* -------------------------------- limits -------------------------------- */

test('an oversized file is refused by bytes and by pixels', () => {
  const huge = new Uint8Array(imagePolicy.maxBytes + 1)
  huge.set([0x89, 0x50, 0x4e, 0x47])
  assert.throws(() => inspectImage(buffer(huge), null), error => error.status === 413)
  // 25 megapixels is the ceiling; a 6000x5000 image is over it.
  assert.throws(() => inspectImage(buffer(png({ width: 6000, height: 5000 })), null), error => error.status === 413 && error.reason.startsWith('pixels_'))
})

/* ------------------------------- metadata ------------------------------- */

test('EXIF is removed from a JPEG, so location does not travel with the photo', () => {
  const withGps = jpeg({ withExif: true })
  assert.ok(textOf(withGps).includes('GPSLatitude'), 'fixture should carry GPS to begin with')
  const cleaned = inspectImage(buffer(withGps), null)
  assert.equal(textOf(cleaned.bytes).includes('GPSLatitude'), false)
  assert.equal(textOf(cleaned.bytes).includes('Exif'), false)
  // The picture itself survives: still a JPEG, still the same size.
  assert.equal(cleaned.width, 8)
  assert.equal(cleaned.bytes[0], 0xff)
  assert.equal(cleaned.bytes[1], 0xd8)
})

test('PNG text chunks and WebP EXIF go the same way', () => {
  const taggedPng = png({ extras: [['tEXt', 'Comment\0taken at home'], ['eXIf', 'GPSLatitude']] })
  const cleanedPng = inspectImage(buffer(taggedPng), null)
  assert.equal(textOf(cleanedPng.bytes).includes('taken at home'), false)
  assert.equal(textOf(cleanedPng.bytes).includes('GPSLatitude'), false)
  assert.ok(textOf(cleanedPng.bytes).includes('IDAT'), 'image data must survive')

  const cleanedWebp = inspectImage(buffer(webp({ withExif: true })), null)
  assert.equal(textOf(cleanedWebp.bytes).includes('GPSLatitude'), false)
  assert.equal(textOf(cleanedWebp.bytes).slice(0, 4), 'RIFF')
  assert.equal(cleanedWebp.width, 5)
})

/* -------------------------------- storage ------------------------------- */

function draftBucket() {
  const written = new Map()
  return {
    written,
    binding: {
      put: async (key, value, options) => { written.set(key, { value, options }); return {} },
      get: async key => written.has(key) ? { body: null, httpMetadata: written.get(key).options?.httpMetadata } : null,
      list: async () => ({
        objects: [...written].map(([key, entry]) => ({ key, size: entry.value.byteLength, httpMetadata: entry.options?.httpMetadata, customMetadata: entry.options?.customMetadata })),
        truncated: false,
      }),
    },
  }
}

test('a stored draft is named by its content and lands under the drafts prefix', async () => {
  const bucket = draftBucket()
  const stored = await storeDraft(bucket.binding, buffer(png()), 'image/png')
  assert.match(stored.name, /^[a-f0-9]{64}\.png$/)
  const [key] = [...bucket.written.keys()]
  assert.ok(key.startsWith(draftPolicy.prefix), `${key} should sit under ${draftPolicy.prefix}`)
  assert.equal(key, `${draftPolicy.prefix}${stored.name}`)
  assert.equal(bucket.written.get(key).options.httpMetadata.contentType, 'image/png')
})

test('the key is the digest of the cleaned bytes, not of what was uploaded', async () => {
  const bucket = draftBucket()
  // The same picture with and without EXIF must store as one object, because
  // what is kept is identical once the metadata is gone.
  const withGps = await storeDraft(bucket.binding, buffer(jpeg({ withExif: true })), 'image/jpeg')
  const without = await storeDraft(bucket.binding, buffer(jpeg({ withExif: false })), 'image/jpeg')
  assert.equal(withGps.name, without.name)
  assert.equal(bucket.written.size, 1)
  assert.equal(withGps.name, `${await contentDigest(inspectImage(buffer(jpeg({ withExif: false })), null).bytes)}.jpg`)
})

test('a draft name the caller invented is never turned into a key', async () => {
  const bucket = draftBucket()
  for (const name of ['../../secret.png', 'drafts/x.png', 'not-a-digest.png', `${'a'.repeat(64)}.svg`, `${'a'.repeat(63)}.png`]) {
    await assert.rejects(readDraft(bucket.binding, name), error => error.status === 404)
  }
})

test('a listing only reports objects that are really drafts', async () => {
  const bucket = draftBucket()
  await storeDraft(bucket.binding, buffer(png()), 'image/png')
  bucket.written.set('drafts/not-a-digest.png', { value: new Uint8Array(1), options: {} })
  bucket.written.set('elsewhere/thing.png', { value: new Uint8Array(1), options: {} })
  const { items } = await listDrafts(bucket.binding)
  assert.equal(items.length, 1)
  assert.match(items[0].name, /^[a-f0-9]{64}\.png$/)
})

test('a cursor the browser invented never reaches storage', async () => {
  const bucket = draftBucket()
  await assert.rejects(listDrafts(bucket.binding, '../../etc'), error => error.code === 'invalid_cursor')
})

/* ------------------------------ discarding ------------------------------ */

import { discardDraft } from '../drafts.ts'

function deletableBucket() {
  const base = draftBucket()
  const removed = []
  return { ...base, removed, binding: { ...base.binding, delete: async key => { base.written.delete(key); removed.push(key) } } }
}

test('a staged upload can be discarded, and only by its real name', async () => {
  const bucket = deletableBucket()
  const stored = await storeDraft(bucket.binding, buffer(png()), 'image/png')
  await discardDraft(bucket.binding, stored.name)
  assert.deepEqual(bucket.removed, [`${draftPolicy.prefix}${stored.name}`])
  assert.equal(bucket.written.size, 0)
})

test('discarding something that is not staged removes nothing', async () => {
  const bucket = deletableBucket()
  await storeDraft(bucket.binding, buffer(png()), 'image/png')
  await assert.rejects(discardDraft(bucket.binding, `${'b'.repeat(64)}.png`), error => error.reason === 'draft_missing')
  assert.deepEqual(bucket.removed, [])
  assert.equal(bucket.written.size, 1, 'the real draft must survive')
})

test('a discard name the caller invented never reaches storage', async () => {
  const bucket = deletableBucket()
  for (const name of ['../../secret.png', 'drafts/x.png', 'not-a-digest.png']) {
    await assert.rejects(discardDraft(bucket.binding, name), error => error.reason === 'bad_draft_name')
  }
  assert.deepEqual(bucket.removed, [])
})
