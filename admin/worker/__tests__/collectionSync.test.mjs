import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { repositoryEntries } from '../../src/data/collectionEntries.ts'
import { scalarFieldsOf, serializeScalarField } from '../../src/lib/entryScalarFields.ts'
import { entryFields, fieldKeys } from '../../../src/config/entryFields.ts'
import { contentSources } from '../content/registry.ts'
import { collectionRows } from '../content/index.ts'
import { countEntries, locateEntry, parseContent, readEntry, replaceEntry } from '../content/entries.ts'

const ROOT = new URL('../../../', import.meta.url)

test('every writable collection hydrates every current row in write-index order', () => {
  for (const [collection, source] of Object.entries(contentSources)) {
    const document = parseContent(readFileSync(new URL(source.path, ROOT), 'utf8'))
    const rows = collectionRows(document, source)
    assert.equal(rows.length, countEntries(document, source), collection)
    // These collections use dedicated editors rather than PortfolioContent.
    if (['metadata/institutes', 'metadata/people', 'cv/presets', 'travel/trips'].includes(collection)) continue
    const entries = repositoryEntries(collection, rows)
    assert.equal(entries.length, rows.length, collection)
    entries.forEach((entry, index) => {
      const original = readEntry(document, locateEntry(document, source, index)).toJSON()
      // Semester is added to flat teaching rows for the filter, not stored in the child.
      const { semester: _semester, ...raw } = entry.raw
      const { semester: _originalSemester, ...stored } = original
      assert.deepEqual(raw, stored, `${collection} row ${index}`)
    })
  }
})

test('a reordered or newly inserted repository entry keeps its own title and write index', () => {
  const source = contentSources['readings/items']
  const document = parseContent('items:\n  - {id: new, title: Newly inserted, author: N}\n  - {id: old, title: Original, author: O, enabled: false}\n')
  const entries = repositoryEntries('readings/items', collectionRows(document, source))
  assert.deepEqual(entries.map(entry => entry.title), ['Newly inserted', 'Original'])
  const target = entries.findIndex(entry => entry.id === 'old')
  const text = replaceEntry(document, locateEntry(document, source, target), { ...entries[target].raw, note: 'Updated' })
  const saved = collectionRows(parseContent(text), source)
  assert.equal(saved[0].note, undefined)
  assert.equal(saved[1].note, 'Updated')
  assert.equal(saved[1].enabled, false)
})

test('grouped roles and mentoring restrictions survive repository hydration', () => {
  const [role] = repositoryEntries('cocurricular/volunteering', [{ roles: [{ role: 'Mentor' }, { role: 'Speaker' }] }])
  assert.equal(role.title, 'Mentor + Speaker')
  const [cohort] = repositoryEntries('teaching/mentoring', [{ semester: 'Summer', programme: 'Internship', projects: [] }])
  assert.equal(cohort.title, 'Internship')
  assert.deepEqual(cohort.readOnlyFields, ['projects'])
  assert.throws(() => repositoryEntries('readings/items', [null, { title: 'Second' }]), /Unreadable/)
})

test('blog forms declare all optional review and hobby fields even for new entries', () => {
  for (const schema of [entryFields.blogReadings, entryFields.blogMovies]) {
    for (const key of ['date', 'note', 'rating']) assert.ok(fieldKeys(schema).includes(key), key)
  }
  for (const key of ['imageId', 'image', 'tint']) assert.ok(fieldKeys(entryFields.blogHobbies).includes(key), key)
  assert.ok(fieldKeys(entryFields.blogTravel).includes('home'))
})

test('new optional fields serialize to the public blog types and can be cleared', () => {
  const movie = scalarFieldsOf(entryFields.blogMovies)
  assert.equal(serializeScalarField('4', movie.rating), 4)
  assert.equal(serializeScalarField('1920', movie.year), 1920)
  assert.equal(serializeScalarField('2026-10-20', movie.date), '2026-10-20')
  assert.equal(serializeScalarField('', movie.rating), undefined)
  assert.throws(() => serializeScalarField('6', movie.rating))
  assert.throws(() => serializeScalarField('2.5', movie.rating))
  assert.throws(() => serializeScalarField('2026-02-30', movie.date))
  const hobby = scalarFieldsOf(entryFields.blogHobbies)
  assert.equal(serializeScalarField('false', hobby.tint), false)
  assert.equal(serializeScalarField('true', hobby.tint), true)
  assert.equal(serializeScalarField('hobby/hike1', hobby.imageId), 'hobby/hike1')
  assert.deepEqual(serializeScalarField('["hobby/hike1", "hobby/hike2"]', hobby.imageId), ['hobby/hike1', 'hobby/hike2'])
  assert.throws(() => serializeScalarField('[1]', hobby.image))
  const travel = scalarFieldsOf(entryFields.blogTravel)
  assert.deepEqual(serializeScalarField('[{"name":"Chennai","visits":2,"stayed":true,"lat":13.08}]', travel.cities), [{ name: 'Chennai', visits: 2, stayed: true, lat: 13.08 }])
  assert.throws(() => serializeScalarField('[{"visits":2}]', travel.cities))
})
