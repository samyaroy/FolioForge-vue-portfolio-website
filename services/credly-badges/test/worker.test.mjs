import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import worker from '../src/index.ts'

const SNAPSHOT_KEY = 'snapshot'
const ENDPOINT = 'https://api.example/credly-count'
const realFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = realFetch
})

function fakeKv(initial) {
  const store = new Map(initial ? [[SNAPSHOT_KEY, JSON.stringify(initial)]] : [])
  return {
    store,
    async get(key, type) {
      const value = store.get(key)
      if (value === undefined) return null
      return type === 'json' ? JSON.parse(value) : value
    },
    async put(key, value) {
      store.set(key, value)
    },
  }
}

function envWith(snapshot) {
  return { CREDLY_KV: fakeKv(snapshot), CREDLY_USERNAME: 'someone' }
}

function fakeCtx() {
  const pending = []
  return { pending, waitUntil: promise => pending.push(promise), passThroughOnException() {} }
}

/** Stubs the global fetch the Worker uses to reach Credly. */
function credlyAnswers(response) {
  const calls = []
  globalThis.fetch = async url => {
    calls.push(String(url))
    return typeof response === 'function' ? response() : response.clone()
  }
  return calls
}

function credlyPage(names) {
  const data = names.map(name => ({ issuer: { entities: [{ primary: true, entity: { name } }] } }))
  return Response.json({ data, metadata: { total_count: data.length, next_page_url: null } })
}

const STORED = { count: 2, issuers: [{ name: 'IBM', count: 2 }], updatedAt: '2026-08-01T06:00:00.000Z' }

test('a stored snapshot is served with CORS and cache headers, without calling Credly', async () => {
  const calls = credlyAnswers(credlyPage(['IBM']))
  const response = await worker.fetch(new Request(ENDPOINT), envWith(STORED), fakeCtx())

  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), STORED)
  assert.equal(response.headers.get('access-control-allow-origin'), '*')
  assert.equal(response.headers.get('cache-control'), 'public, max-age=21600')
  assert.equal(calls.length, 0)
})

test('with no snapshot yet, the first request reads Credly and stores the result', async () => {
  credlyAnswers(credlyPage(['IBM', 'MongoDB', 'IBM']))
  const env = envWith()
  const ctx = fakeCtx()

  const response = await worker.fetch(new Request(ENDPOINT), env, ctx)
  await Promise.all(ctx.pending)

  assert.equal(response.status, 200)
  const body = await response.json()
  assert.equal(body.count, 3)
  assert.deepEqual(body.issuers, [{ name: 'IBM', count: 2 }, { name: 'MongoDB', count: 1 }])
  assert.deepEqual(JSON.parse(env.CREDLY_KV.store.get(SNAPSHOT_KEY)), body)
})

test('with no snapshot and Credly down, the answer is an uncached 503', async () => {
  credlyAnswers(() => new Response('down', { status: 502 }))
  const response = await worker.fetch(new Request(ENDPOINT), envWith(), fakeCtx())

  assert.equal(response.status, 503)
  assert.equal(response.headers.get('cache-control'), 'no-store')
  assert.equal(response.headers.get('access-control-allow-origin'), '*')
})

test('a corrupt stored value is treated as missing rather than served', async () => {
  credlyAnswers(credlyPage(['IBM']))
  const env = envWith()
  env.CREDLY_KV.store.set(SNAPSHOT_KEY, JSON.stringify({ count: 'lots' }))

  const response = await worker.fetch(new Request(ENDPOINT), env, fakeCtx())
  assert.equal((await response.json()).count, 1)
})

test('preflight, other paths and other methods', async () => {
  const env = envWith(STORED)
  const preflight = await worker.fetch(new Request(ENDPOINT, { method: 'OPTIONS' }), env, fakeCtx())
  assert.equal(preflight.status, 204)
  assert.equal(preflight.headers.get('access-control-allow-origin'), '*')

  assert.equal((await worker.fetch(new Request('https://api.example/'), env, fakeCtx())).status, 404)
  assert.equal((await worker.fetch(new Request(ENDPOINT, { method: 'POST' }), env, fakeCtx())).status, 405)
})

test('the cron leaves a snapshot from the current month alone', async () => {
  const calls = credlyAnswers(credlyPage(['IBM']))
  const env = envWith(STORED)

  await worker.scheduled({ scheduledTime: Date.parse('2026-08-19T06:00:00Z'), cron: '0 6 * * *' }, env, fakeCtx())

  assert.equal(calls.length, 0)
  assert.deepEqual(JSON.parse(env.CREDLY_KV.store.get(SNAPSHOT_KEY)), STORED)
})

test('the cron refreshes a snapshot from an earlier month', async () => {
  credlyAnswers(credlyPage(['IBM', 'IBM', 'MongoDB']))
  const env = envWith(STORED)

  await worker.scheduled({ scheduledTime: Date.parse('2026-09-01T06:00:00Z'), cron: '0 6 * * *' }, env, fakeCtx())

  assert.deepEqual(JSON.parse(env.CREDLY_KV.store.get(SNAPSHOT_KEY)), {
    count: 3,
    issuers: [{ name: 'IBM', count: 2 }, { name: 'MongoDB', count: 1 }],
    updatedAt: '2026-09-01T06:00:00.000Z',
  })
})

test('a failed cron refresh throws and keeps the previous snapshot', async () => {
  credlyAnswers(() => Response.json({ unexpected: true }))
  const env = envWith(STORED)

  await assert.rejects(
    worker.scheduled({ scheduledTime: Date.parse('2026-09-01T06:00:00Z'), cron: '0 6 * * *' }, env, fakeCtx()),
  )
  assert.deepEqual(JSON.parse(env.CREDLY_KV.store.get(SNAPSHOT_KEY)), STORED)
})
