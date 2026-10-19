import assert from 'node:assert/strict'
import { test } from 'node:test'
import { registerHooks } from 'node:module'
import { existsSync, readFileSync } from 'node:fs'
import { contentYaml } from '../scripts/content-yaml.ts'
import { withoutDisabledEntries } from '../../src/config/entryStatus.ts'

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

test('unquoted YAML dates stay strings in the browser content transform', async () => {
  const result = plugin.transform('date: 2026-05-15\n', 'example.yml')
  const module = await import(`data:text/javascript,${encodeURIComponent(result.code)}`)
  assert.equal(module.default.date, '2026-05-15')
})

test('visibility filtering preserves YAML Date instances without changing source entries', () => {
  const date = new Date('2026-05-15T00:00:00Z')
  const content = { trips: [{ title: 'Visible', date }, { title: 'Hidden', date, enabled: false }] }
  const filtered = withoutDisabledEntries(content)
  assert.equal(filtered.trips.length, 1)
  assert.equal(filtered.trips[0].date, date)
  assert.equal(filtered.trips[0].date.toISOString(), '2026-05-15T00:00:00.000Z')
  assert.equal(content.trips.length, 2)
})

test('current trip dates survive filtering and format as renderable text', async () => {
  const { TRIPS } = await import('../src/content/travel/trips.ts')
  const { formatDate } = await import('../src/lib/format.ts')
  for (const trip of TRIPS) {
    assert.equal(typeof trip.date, 'string', trip.id)
    assert.equal(typeof formatDate(trip.date), 'string', trip.id)
    assert.ok(Number.isFinite(Date.parse(trip.date)), trip.id)
  }
  for (let index = 1; index < TRIPS.length; index++) {
    assert.ok(Date.parse(TRIPS[index - 1].date) >= Date.parse(TRIPS[index].date))
  }
})
