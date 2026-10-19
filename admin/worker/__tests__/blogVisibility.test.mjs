import assert from 'node:assert/strict'
import { test } from 'node:test'
import { registerHooks } from 'node:module'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { parse } from 'yaml'

// Exercise the actual public loaders with hidden fixtures, without modifying content.
const BLOG = new URL('../../../blogs/src/content/', import.meta.url)
const shown = { id: 'shown', title: 'Visible', label: 'Visible', state: 'Visible', purpose: 'travel', date: '2026-01-01', cities: [{ name: 'Visible city' }, { name: 'Hidden city', enabled: false }] }
const hidden = { ...shown, id: 'hidden', title: 'Hidden', label: 'Hidden', state: 'Hidden', enabled: false }
const hiddenText = { ...hidden, id: 'hidden-text', enabled: 'false' }
const fixtures = new Map([
  ...['recommended', 'readings', 'movies', 'gallery'].map(name => [new URL(`${name}/data.yml`, BLOG).href, { items: [hidden, shown, hiddenText] }]),
  [new URL('hobbies/data.yml', BLOG).href, { tiles: [hidden, shown, hiddenText] }],
  [new URL('travel/data.yml', BLOG).href, { states: [hidden, shown, hiddenText], legendLabels: {} }],
  [new URL('travel/trips.yml', BLOG).href, { trips: [hidden, shown, hiddenText] }],
])

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('.') && context.parentURL && !/\.[a-z]+$/i.test(specifier)) {
      const url = new URL(`${specifier}.ts`, context.parentURL)
      if (existsSync(url)) return nextResolve(url.href, context)
    }
    return nextResolve(specifier, context)
  },
  load(url, context, nextLoad) {
    if (url.endsWith('.yml')) {
      const data = fixtures.get(url) ?? parse(readFileSync(fileURLToPath(url), 'utf8'))
      return { format: 'module', source: `export default ${JSON.stringify(data)}`, shortCircuit: true }
    }
    return nextLoad(url, context)
  },
})

test('hidden blog rows disappear before cards, home features and counts are derived', async () => {
  for (const [path, name] of [
    ['recommended/data.ts', 'RECOMMENDED'], ['readings/data.ts', 'READINGS'],
    ['movies/data.ts', 'MOVIES'], ['hobbies/data.ts', 'HOBBY_TILES'],
    ['gallery/data.ts', 'GALLERY_ITEMS'], ['travel/trips.ts', 'TRIPS'],
  ]) {
    const module = await import(new URL(path, BLOG).href)
    assert.equal(module[name].length, 1, name)
    assert.equal(module[name][0].id ?? module[name][0].label, 'shown', name)
    if (name === 'RECOMMENDED') assert.deepEqual(module.FEATURED_RECOMMENDED.map(item => item.id), ['shown'])
    if (name === 'TRIPS') assert.equal(module.getTrip('hidden'), undefined)
  }
})

test('hidden states and nested cities do not appear in the map or state city counts', async () => {
  const travel = await import(new URL('travel/data.ts', BLOG).href)
  assert.deepEqual(travel.STATE_VISITS.map(state => state.state), ['Visible'])
  assert.deepEqual(travel.CITY_VISITS.map(city => city.name), ['Visible city'])
  assert.deepEqual(travel.CITIES_PER_STATE, { Visible: 1 })
})
