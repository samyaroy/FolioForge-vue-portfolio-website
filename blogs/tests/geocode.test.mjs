import assert from 'node:assert/strict'
import { test } from 'node:test'
import { geocodeCities } from '../src/views/Travel/components/geocode.ts'

function environment(t, response) {
  const storage = new Map()
  const calls = []
  const originalFetch = globalThis.fetch
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
  } })
  globalThis.fetch = async (url, options) => {
    calls.push({ url: new URL(url), options })
    return response(url, options)
  }
  t.after(() => {
    globalThis.fetch = originalFetch
    if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage)
    else delete globalThis.localStorage
  })
  return { storage, calls }
}

test('a foreign namesake is rejected rather than centring an India route abroad', async t => {
  const { calls } = environment(t, () => Response.json({ results: [{ name: 'Rambam', country_code: 'IL', latitude: 32.83529, longitude: 34.98599 }] }))
  assert.deepEqual(await geocodeCities([{ name: 'Rambam' }]), [])
  assert.equal(calls[0].url.searchParams.get('countryCode'), 'IN')
  assert.ok(calls[0].options.signal instanceof AbortSignal)
})

test('India lookup uses a state qualifier and ignores foreign results', async t => {
  const { calls } = environment(t, () => Response.json({ results: [
    { country_code: 'US', latitude: 30, longitude: -90 },
    { country_code: 'IN', admin1: 'Tamil Nadu', latitude: 13.08, longitude: 80.27 },
  ] }))
  const result = await geocodeCities([{ name: 'Chennai', state: 'Tamil Nadu', visits: 5 }])
  assert.equal(calls[0].url.searchParams.get('name'), 'Chennai, Tamil Nadu')
  assert.deepEqual(result, [{ name: 'Chennai', state: 'Tamil Nadu', visits: 5, lat: 13.08, lng: 80.27 }])
})

test('previous unscoped cached coordinates are not reused', async t => {
  const { storage, calls } = environment(t, () => Response.json({ results: [] }))
  storage.set('travel-geocode-v1', JSON.stringify({ Rambam: { lat: 32.83529, lng: 34.98599 } }))
  assert.deepEqual(await geocodeCities([{ name: 'Rambam' }]), [])
  assert.equal(calls.length, 1)
})

test('explicit coordinates work for villages missing from the geocoder', async t => {
  const { calls } = environment(t, () => { throw new Error('should not fetch') })
  const stops = [{ name: 'Village', lat: 27.12, lng: 88.05 }]
  assert.deepEqual(await geocodeCities(stops), stops)
  assert.equal(calls.length, 0)
})

test('concurrent duplicate stops share a lookup and retain their own trip metadata', async t => {
  const { calls } = environment(t, () => Response.json({ results: [{ country_code: 'IN', latitude: 22.56, longitude: 88.36 }] }))
  const [first, second] = await Promise.all([
    geocodeCities([{ name: 'Kolkata', mode: 'train' }]),
    geocodeCities([{ name: 'Kolkata', mode: 'flight' }]),
  ])
  assert.equal(calls.length, 1)
  assert.equal(first[0].mode, 'train')
  assert.equal(second[0].mode, 'flight')
})

test('a failed lookup can retry and malformed browser cache cannot break the map', async t => {
  let attempts = 0
  const { storage, calls } = environment(t, () => {
    if (++attempts === 1) throw new Error('network failure')
    return Response.json({ results: [{ country_code: 'IN', latitude: 22.56, longitude: 88.36 }] })
  })
  storage.set('travel-geocode-in-v2', 'null')
  assert.deepEqual(await geocodeCities([{ name: 'Kolkata' }]), [])
  assert.equal((await geocodeCities([{ name: 'Kolkata' }]))[0].lat, 22.56)
  assert.equal(calls.length, 2)
})
