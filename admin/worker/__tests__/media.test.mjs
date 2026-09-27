import assert from 'node:assert/strict'
import { test } from 'node:test'
import { listLogos, logoPolicy } from '../media.ts'

/**
 * A binding that answers `list` and treats every other R2 method as a failure.
 * A write reaching storage would be a bug worth failing a test over, not an
 * assertion about what the code happens to call today.
 */
function bucket(objects, { truncated = false, cursor } = {}) {
  const calls = []
  const forbidden = name => () => { throw new Error(`the Worker called ${name} on the media bucket`) }
  return {
    calls,
    binding: {
      list: async options => { calls.push(options); return { objects: objects.map(key => ({ key })), truncated, cursor } },
      put: forbidden('put'),
      delete: forbidden('delete'),
      get: forbidden('get'),
    },
  }
}

test('the listing is confined to the logo prefix and a bounded page', async () => {
  const media = bucket(['logo/IITM.png'])
  await listLogos(media.binding)
  assert.deepEqual(media.calls[0], { prefix: 'logo/', limit: logoPolicy.pageSize, cursor: undefined })
  assert.equal(logoPolicy.prefix, 'logo/')
})

test('a bare name is what gets written back, and only a .png loses its extension', async () => {
  const media = bucket(['logo/IITM.png', 'logo/NPTEL.webp', 'logo/CU.JPG'])
  const { items } = await listLogos(media.binding)
  assert.deepEqual(items.map(item => item.value), ['IITM', 'NPTEL.webp', 'CU.JPG'])
  // The site resolves a bare name to `<base>/<name>.png`, so anything else has
  // to keep its extension or it would resolve to a different object.
  assert.equal(items[0].url, 'https://media.samyabrata.codeium.xyz/logo/IITM.png')
  assert.equal(items[1].url, 'https://media.samyabrata.codeium.xyz/logo/NPTEL.webp')
})

test('a key with a space is still a usable URL', async () => {
  const { items } = await listLogos(bucket(['logo/Royal Statistical Society.png']).binding)
  assert.equal(items[0].value, 'Royal Statistical Society')
  assert.equal(items[0].url, 'https://media.samyabrata.codeium.xyz/logo/Royal%20Statistical%20Society.png')
})

test('anything that is not a supported image is left out', async () => {
  const media = bucket(['logo/IITM.png', 'logo/notes.pdf', 'logo/script.svg', 'logo/', 'logo/data.json'])
  const { items } = await listLogos(media.binding)
  assert.deepEqual(items.map(item => item.value), ['IITM'])
})

test('a key that escapes the prefix is not mapped into a URL on trust', async () => {
  const media = bucket(['logo/ok.png', 'other/sneak.png', 'logo/../../etc/passwd.png'])
  const { items } = await listLogos(media.binding)
  assert.deepEqual(items.map(item => item.value), ['ok'])
})

test('pagination is passed through only when there is more to read', async () => {
  const more = bucket(['logo/a.png'], { truncated: true, cursor: 'NextPage123' })
  assert.equal((await listLogos(more.binding)).cursor, 'NextPage123')
  const done = bucket(['logo/a.png'], { truncated: false, cursor: 'ignored' })
  assert.equal('cursor' in await listLogos(done.binding), false)
})

test('a cursor the browser invented is refused before it reaches storage', async () => {
  for (const cursor of ['../../etc', 'a'.repeat(1025), 'has space', '<script>', '']) {
    const media = bucket(['logo/a.png'])
    await assert.rejects(listLogos(media.binding, cursor), error => error.status === 400 && error.code === 'invalid_cursor')
    assert.equal(media.calls.length, 0, `storage was reached with cursor ${cursor}`)
  }
})

test('a cursor that came from R2 is handed straight back', async () => {
  const media = bucket(['logo/a.png'])
  await listLogos(media.binding, 'abc123+/=_-')
  assert.equal(media.calls[0].cursor, 'abc123+/=_-')
})

test('a storage failure surfaces as a gateway error, not as its cause', async () => {
  const failing = { list: async () => { throw new Error('bucket exploded: secret detail') } }
  await assert.rejects(listLogos(failing), error => error.status === 502 && error.code === 'storage_unavailable' && !String(error.message).includes('secret'))
})

/* ------------------------- archiving and adding ------------------------- */

import { archiveLogo, assertLogoName, storeLogo } from '../media.ts'

function pngBytes() {
  const chunk = (type, data) => {
    const out = new Uint8Array(12 + data.length)
    new DataView(out.buffer).setUint32(0, data.length)
    out.set([...type].map(c => c.charCodeAt(0)), 4)
    out.set(data, 8)
    return out
  }
  const ihdr = new Uint8Array(13)
  new DataView(ihdr.buffer).setUint32(0, 4)
  new DataView(ihdr.buffer).setUint32(4, 3)
  const parts = [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', new Uint8Array([1])), chunk('IEND', new Uint8Array(0))]
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0))
  let at = 0
  for (const p of parts) { out.set(p, at); at += p.length }
  return out
}

function mediaBucket(initial = ['logo/IITM.png']) {
  const store = new Map(initial.map(key => [key, { bytes: pngBytes(), contentType: 'image/png' }]))
  const deleted = []
  return {
    store,
    deleted,
    binding: {
      list: async ({ prefix }) => ({ objects: [...store.keys()].filter(k => k.startsWith(prefix)).map(key => ({ key })), truncated: false }),
      get: async key => store.has(key) ? { body: new Response(store.get(key).bytes).body, httpMetadata: { contentType: store.get(key).contentType } } : null,
      put: async (key, value, options) => { store.set(key, { bytes: new Uint8Array(value), contentType: options?.httpMetadata?.contentType }); return {} },
      delete: async key => { store.delete(key); deleted.push(key) },
    },
  }
}

test('a logo name must be the kind of token a YAML value can carry', () => {
  for (const good of ['IITM', 'VLED-IITRPR3', 'Royal Statistical Society', 'ideas_isi']) assert.equal(assertLogoName(good), good)
  for (const bad of ['../secret', 'logo/IITM', 'a/b', '', ' ', '..', 'name.', '<script>', 'x'.repeat(65)]) {
    assert.throws(() => assertLogoName(bad), error => error.code === 'invalid_logo_name', `expected ${JSON.stringify(bad)} to be refused`)
  }
})

test('archiving moves the object and leaves it recoverable', async () => {
  const bucket = mediaBucket()
  const { archivedAs } = await archiveLogo(bucket.binding, 'IITM')
  assert.equal(archivedAs, 'logo/archived/IITM.png')
  assert.equal(bucket.store.has('logo/archived/IITM.png'), true, 'the archive copy must exist')
  assert.equal(bucket.store.has('logo/IITM.png'), false, 'the catalogue copy must be gone')
  // The copy is written before the original is removed, so a failure between
  // the two leaves the archive rather than nothing.
  assert.deepEqual(bucket.deleted, ['logo/IITM.png'])
})

test('an archived logo drops out of the catalogue but keeps its bytes', async () => {
  const bucket = mediaBucket(['logo/IITM.png', 'logo/NPTEL.png'])
  await archiveLogo(bucket.binding, 'IITM')
  const { items } = await listLogos(bucket.binding)
  assert.deepEqual(items.map(item => item.value), ['NPTEL'])
  assert.equal(bucket.store.get('logo/archived/IITM.png').bytes.length > 0, true)
})

test('archiving something that is not there changes nothing', async () => {
  const bucket = mediaBucket()
  await assert.rejects(archiveLogo(bucket.binding, 'MISSING'), error => error.status === 404)
  assert.deepEqual(bucket.deleted, [])
})

test('a new logo is stored under the name the YAML will carry', async () => {
  const bucket = mediaBucket([])
  const stored = await storeLogo(bucket.binding, 'IITM', pngBytes().buffer, 'image/png', false)
  assert.equal(stored.value, 'IITM', 'the catalogue value is the name, not a digest')
  assert.equal(stored.url, 'https://media.samyabrata.codeium.xyz/logo/IITM.png')
  assert.equal(bucket.store.has('logo/IITM.png'), true)
})

test('an existing name is not overwritten unless replacing is asked for', async () => {
  const bucket = mediaBucket()
  await assert.rejects(storeLogo(bucket.binding, 'IITM', pngBytes().buffer, 'image/png', false), error => error.status === 409 && error.code === 'logo_exists')
  assert.deepEqual(bucket.deleted, [], 'a refused upload must not disturb the live file')

  await storeLogo(bucket.binding, 'IITM', pngBytes().buffer, 'image/png', true)
  assert.equal(bucket.store.has('logo/archived/IITM.png'), true, 'the replaced file is archived, not dropped')
  assert.equal(bucket.store.has('logo/IITM.png'), true)
})

test('an upload that is not an image never reaches the bucket', async () => {
  const bucket = mediaBucket([])
  const script = new TextEncoder().encode('#!/bin/sh\n')
  await assert.rejects(storeLogo(bucket.binding, 'EVIL', script.buffer, 'image/png', false), error => error.code === 'unsupported_image')
  assert.equal(bucket.store.size, 0)
})

test('a name cannot smuggle a path into a key', async () => {
  const bucket = mediaBucket()
  for (const name of ['../../etc/passwd', 'archived/IITM', 'a/b']) {
    await assert.rejects(storeLogo(bucket.binding, name, pngBytes().buffer, 'image/png', true), error => error.code === 'invalid_logo_name')
    await assert.rejects(archiveLogo(bucket.binding, name), error => error.code === 'invalid_logo_name')
  }
  assert.deepEqual(bucket.deleted, [])
})

/* --------------------------- publishing a draft -------------------------- */

import { assertMediaName, publishDraft } from '../media.ts'

function draftStore(names = ['a'.repeat(64) + '.png']) {
  const store = new Map(names.map(n => [`drafts/${n}`, pngBytes()]))
  return {
    store,
    binding: {
      get: async key => store.has(key) ? { body: new Response(store.get(key)).body, httpMetadata: { contentType: 'image/png' } } : null,
      put: async () => ({}),
      list: async () => ({ objects: [], truncated: false }),
    },
  }
}

const DRAFT = 'a'.repeat(64) + '.png'

test('a media name may not carry a path or squat on a managed prefix', () => {
  for (const good of ['SamyabrataRoy3', 'hero-2026', 'photo_01.jpg']) assert.equal(assertMediaName(good), good)
  for (const bad of ['../escape', 'a/b', '', '..', 'name.']) {
    assert.throws(() => assertMediaName(bad), error => error.code === 'invalid_media_name', `${JSON.stringify(bad)} should be refused`)
  }
  // The logo and icon prefixes are managed by their own flows; general media
  // must not be able to write into them by choosing a clever name.
  for (const reserved of ['logo', 'logoX', 'icons', 'archived']) {
    assert.throws(() => assertMediaName(reserved), error => error.reason === 'reserved_prefix', `${reserved} should be reserved`)
  }
})

test('publishing moves a staged draft to the public bucket under its content name', async () => {
  const media = mediaBucket([])
  const drafts = draftStore()
  const published = await publishDraft(media.binding, drafts.binding, DRAFT, 'SamyabrataRoy3', false)
  assert.equal(published.key, 'SamyabrataRoy3.png')
  assert.equal(published.url, 'https://media.samyabrata.codeium.xyz/SamyabrataRoy3.png')
  assert.equal(media.store.has('SamyabrataRoy3.png'), true)
  assert.equal('replaced' in published, false)
})

test('publishing over an existing file needs saying so, and archives what was there', async () => {
  const media = mediaBucket(['hero.png'])
  const drafts = draftStore()
  await assert.rejects(publishDraft(media.binding, drafts.binding, DRAFT, 'hero', false), error => error.status === 409 && error.code === 'media_exists')
  assert.equal(media.store.size, 1, 'a refused publish must leave the bucket alone')

  const published = await publishDraft(media.binding, drafts.binding, DRAFT, 'hero', true)
  assert.equal(published.replaced, 'archived/hero.png')
  assert.equal(media.store.has('archived/hero.png'), true, 'the previous file is recoverable')
  assert.equal(media.store.has('hero.png'), true)
})

test('a draft name the caller invented never reaches storage', async () => {
  const media = mediaBucket([])
  const drafts = draftStore()
  for (const name of ['../../secret.png', 'drafts/x.png', 'not-a-digest.png']) {
    await assert.rejects(publishDraft(media.binding, drafts.binding, name, 'ok', false), error => error.status === 404)
  }
  assert.equal(media.store.size, 0)
})

test('publishing a draft that is not staged changes nothing', async () => {
  const media = mediaBucket([])
  await assert.rejects(publishDraft(media.binding, draftStore([]).binding, DRAFT, 'ok', false), error => error.reason === 'draft_missing')
  assert.equal(media.store.size, 0)
})

import { archiveMedia } from '../media.ts'

test('a published file is archived rather than destroyed', async () => {
  const bucket = mediaBucket(['hero.png'])
  const { archivedAs } = await archiveMedia(bucket.binding, 'hero')
  assert.equal(archivedAs, 'archived/hero.png')
  assert.equal(bucket.store.has('archived/hero.png'), true, 'the bytes must survive')
  assert.equal(bucket.store.has('hero.png'), false)
})

test('archiving media refuses a name that is not there or not a name', async () => {
  const bucket = mediaBucket(['hero.png'])
  await assert.rejects(archiveMedia(bucket.binding, 'missing'), error => error.reason === 'media_missing')
  for (const bad of ['../../etc/passwd', 'a/b', 'logo']) {
    await assert.rejects(archiveMedia(bucket.binding, bad), error => error.code === 'invalid_media_name')
  }
  assert.deepEqual(bucket.deleted, [], 'nothing was removed')
})
