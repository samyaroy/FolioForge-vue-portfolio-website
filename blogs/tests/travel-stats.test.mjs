import assert from 'node:assert/strict'
import { test } from 'node:test'
import { registerHooks } from 'node:module'
import { existsSync, readFileSync } from 'node:fs'
import { contentYaml } from '../scripts/content-yaml.ts'

// Load the real content accessors through the same YAML transform as Vite.
const plugin = contentYaml()
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('.') && context.parentURL && !/\.[a-z]+$/i.test(specifier)) {
      const url = new URL(`${specifier}.ts`, context.parentURL)
      if (existsSync(url)) return nextResolve(url.href, context)
    }
    return nextResolve(specifier, context)
  },
  load(url, context, nextLoad) {
    if (/\.ya?ml$/.test(url)) {
      const result = plugin.transform(readFileSync(new URL(url), 'utf8'), url)
      return { format: 'module', source: result.code, shortCircuit: true }
    }
    return nextLoad(url, context)
  },
})

const { buildTravelOverview, routePreview, tripMapTargets } = await import(
  '../src/views/Travel/components/travelStats.ts'
)

const trip = (id, date, places, extra = {}) => ({ id, title: id, date, places, ...extra })

test('overview counts legs per mode, photos and the first year', () => {
  const overview = buildTravelOverview([
    trip('a', '2025-02-15', ['Kolkata', { name: 'Puri', mode: 'train' }], { gallery: ['1', '2'] }),
    trip('b', '2023-03', [
      'Kolkata',
      { name: 'Delhi', mode: 'flight' },
      { name: 'Agra', mode: 'train' },
    ]),
  ])
  assert.equal(overview.trips, 2)
  assert.equal(overview.photos, 2)
  assert.equal(overview.since, 2023)
  assert.deepEqual(overview.modes, [
    { mode: 'train', legs: 2 },
    { mode: 'flight', legs: 1 },
  ])
})

test('route preview folds a long middle into a count, but never a lone stop', () => {
  const stops = (n) => Array.from({ length: n }, (_, i) => `Stop ${i}`)
  const five = routePreview(trip('five', '2025-01-01', stops(5)))
  assert.equal(five.hidden, 0)
  assert.equal(five.head.length, 5)

  const eleven = routePreview(trip('eleven', '2025-01-01', stops(11)))
  assert.deepEqual(eleven.head.map((s) => s.name), ['Stop 0', 'Stop 1', 'Stop 2'])
  assert.equal(eleven.hidden, 7)
  assert.deepEqual(eleven.tail.map((s) => s.name), ['Stop 10'])
})

test('map targets match stops to map cities and states, leaving out home', () => {
  const targets = tripMapTargets(
    trip('t', '2025-01-01', ['Kolkata', { name: 'dehradun', mode: 'car' }, { name: 'Delhi', mode: 'train' }], {
      location: 'Somewhere, Uttar Pradesh',
    }),
  )
  assert.deepEqual(targets.cities, ['Dehradun'])
  assert.deepEqual(targets.states.sort(), ['Delhi', 'Uttar Pradesh', 'Uttarakhand'])
})
