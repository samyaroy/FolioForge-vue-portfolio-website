import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fetchBadgeSnapshot, isBadgeSnapshot, issuerNames } from '../src/credly.ts'

// Trimmed to the fields the reader uses; the real payload carries far more.
function badge(...issuers) {
  return {
    id: crypto.randomUUID(),
    issuer: {
      summary: `issued by ${issuers[0]?.name ?? ''}`,
      entities: issuers.map(({ name, primary = true, label = 'Issued by' }) => ({
        label,
        primary,
        entity: { type: 'Organization', name },
      })),
    },
  }
}

function page(data, { total = data.length, next = null } = {}) {
  return { data, metadata: { count: data.length, total_count: total, per: 48, next_page_url: next } }
}

/** A fetch that answers from `routes` (url -> body) and records what it was asked. */
function fakeFetch(routes) {
  const calls = []
  const impl = async url => {
    calls.push(url)
    if (!(url in routes)) return new Response('{}', { status: 404 })
    const body = routes[url]
    return body instanceof Response ? body : Response.json(body)
  }
  return { impl, calls }
}

const FIRST = 'https://www.credly.com/users/someone/badges.json?page=1'
const SECOND = 'https://www.credly.com/users/someone/badges.json?page=2'
const NOW = new Date('2026-09-01T06:00:00.000Z')

test('the count is metadata.total_count and issuers are tallied across pages', async () => {
  const { impl, calls } = fakeFetch({
    [FIRST]: page([badge({ name: 'IBM' }), badge({ name: 'MongoDB' })], { total: 3, next: SECOND }),
    [SECOND]: page([badge({ name: 'IBM' })], { total: 3 }),
  })

  const snapshot = await fetchBadgeSnapshot('someone', { fetch: impl, now: NOW })

  assert.deepEqual(snapshot, {
    count: 3,
    issuers: [{ name: 'IBM', count: 2 }, { name: 'MongoDB', count: 1 }],
    updatedAt: '2026-09-01T06:00:00.000Z',
  })
  assert.deepEqual(calls, [FIRST, SECOND])
})

test('issuers with equal counts are ordered by name', async () => {
  const { impl } = fakeFetch({ [FIRST]: page([badge({ name: 'Zeta' }), badge({ name: 'Alpha' })]) })
  const { issuers } = await fetchBadgeSnapshot('someone', { fetch: impl, now: NOW })
  assert.deepEqual(issuers.map(issuer => issuer.name), ['Alpha', 'Zeta'])
})

test('a profile with no badges is a zero count, not an error', async () => {
  const { impl } = fakeFetch({ [FIRST]: page([]) })
  assert.deepEqual(await fetchBadgeSnapshot('someone', { fetch: impl, now: NOW }), {
    count: 0,
    issuers: [],
    updatedAt: NOW.toISOString(),
  })
})

test('the primary entity is the issuer when a badge lists several', () => {
  const coIssued = badge({ name: 'Coursera', primary: false, label: 'Authorized by' }, { name: 'IBM' })
  assert.deepEqual(issuerNames(coIssued), ['IBM'])
})

test('with no primary entity every entity counts, and a missing list falls back to the summary', () => {
  assert.deepEqual(issuerNames(badge({ name: 'A', primary: false }, { name: 'B', primary: false })), ['A', 'B'])
  assert.deepEqual(issuerNames({ issuer: { summary: 'issued by Google Cloud' } }), ['Google Cloud'])
  assert.deepEqual(issuerNames({}), [])
})

test('a non-2xx response from Credly throws', async () => {
  const { impl } = fakeFetch({ [FIRST]: new Response('rate limited', { status: 429 }) })
  await assert.rejects(fetchBadgeSnapshot('someone', { fetch: impl }), /Credly responded 429/)
})

test('a response without metadata.total_count throws instead of guessing', async () => {
  const { impl } = fakeFetch({ [FIRST]: { data: [badge({ name: 'IBM' })], metadata: {} } })
  await assert.rejects(fetchBadgeSnapshot('someone', { fetch: impl }), /total_count/)
})

test('an HTML page where JSON was expected throws', async () => {
  const { impl } = fakeFetch({ [FIRST]: new Response('<!doctype html>', { headers: { 'content-type': 'text/html' } }) })
  await assert.rejects(fetchBadgeSnapshot('someone', { fetch: impl }))
})

test('pagination is only followed on credly.com', async () => {
  const { impl, calls } = fakeFetch({ [FIRST]: page([], { next: 'https://evil.example/badges.json' }) })
  await assert.rejects(fetchBadgeSnapshot('someone', { fetch: impl }), /Refusing to follow/)
  assert.deepEqual(calls, [FIRST])
})

test('a pagination loop is cut off', async () => {
  const { impl } = fakeFetch({ [FIRST]: page([], { next: FIRST }) })
  await assert.rejects(fetchBadgeSnapshot('someone', { fetch: impl }), /did not end/)
})

test('a username that is not a Credly slug is rejected before any request', async () => {
  const { impl, calls } = fakeFetch({})
  await assert.rejects(fetchBadgeSnapshot('../admin', { fetch: impl }), /Invalid CREDLY_USERNAME/)
  assert.equal(calls.length, 0)
})

test('isBadgeSnapshot accepts a stored snapshot and rejects anything malformed', () => {
  const good = { count: 3, issuers: [{ name: 'IBM', count: 2 }], updatedAt: '2026-09-01T06:00:00.000Z' }
  assert.equal(isBadgeSnapshot(good), true)
  assert.equal(isBadgeSnapshot(null), false)
  assert.equal(isBadgeSnapshot({ ...good, count: -1 }), false)
  assert.equal(isBadgeSnapshot({ ...good, count: '3' }), false)
  assert.equal(isBadgeSnapshot({ ...good, updatedAt: 'yesterday' }), false)
  assert.equal(isBadgeSnapshot({ ...good, issuers: [{ name: 'IBM' }] }), false)
})
