import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fetchLegGeometry } from '../src/views/Travel/components/routeGeometry.ts'

// Stub the router and localStorage; each test answers with its own route.
function environment(t, distanceMeters) {
  const storage = new Map()
  const originalFetch = globalThis.fetch
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
  } })
  globalThis.fetch = async () => Response.json({
    code: 'Ok',
    routes: [{ distance: distanceMeters, geometry: { coordinates: [[88.07637, 27.13193], [88.079, 27.145], [88.08007, 27.15772]] } }],
  })
  t.after(() => {
    globalThis.fetch = originalFetch
    if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage)
    else delete globalThis.localStorage
  })
}

// Srikhola -> Rammam: about 2.9 km in a straight line.
const SRIKHOLA = { lat: 27.13193, lng: 88.07637 }
const RAMMAM = { lat: 27.15772, lng: 88.08007, mode: 'foot' }

test('a walking route far longer than the straight line falls back to a straight leg', async t => {
  environment(t, 42_100)
  assert.equal(await fetchLegGeometry(SRIKHOLA, RAMMAM), null)
})

test('a winding but plausible walking route is kept', async t => {
  environment(t, 6_500)
  assert.equal((await fetchLegGeometry(SRIKHOLA, RAMMAM)).length, 3)
})

test('road legs are not held to the walking detour limit', async t => {
  environment(t, 42_100)
  assert.equal((await fetchLegGeometry(SRIKHOLA, { ...RAMMAM, mode: 'car' })).length, 3)
})
