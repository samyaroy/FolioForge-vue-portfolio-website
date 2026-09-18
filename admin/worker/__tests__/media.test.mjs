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
