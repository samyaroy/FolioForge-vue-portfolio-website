import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { entryFields, listFieldsOf } from '../../../src/config/entryFields.ts'
import { blankRow, listFieldsDraft, serializeListFields } from '../../src/lib/listFields.ts'
import { contentSources } from '../content/registry.ts'
import { collectionRows } from '../content/index.ts'
import { locateEntry, parseContent, replaceEntry } from '../content/entries.ts'

// Each workshops-page collection, with the entry fields its editor uses.
const collections = {
  'workshops/conferences': entryFields.conferences,
  'workshops/fdps': entryFields.fdps,
  'workshops/main': entryFields.workshops,
  'workshops/additional': entryFields.workshops,
  'workshops/bootcamps': entryFields.bootcamps,
}

const fixture = collection => parseContent(readFileSync(new URL(`../../../${contentSources[collection].path}`, import.meta.url), 'utf8'))

/** A host as the editor saves it: keys left empty in the YAML are dropped. */
const filled = hosts => hosts.map(host => Object.fromEntries(Object.entries(host).filter(([, value]) => value !== null && value !== '')))

test('every host on the workshops page is a list of named rows, never a text box', () => {
  for (const [collection, fields] of Object.entries(collections)) {
    for (const [index, row] of collectionRows(fixture(collection), contentSources[collection]).entries()) {
      for (const key of Object.keys(listFieldsOf(fields))) {
        if (row[key] === undefined || row[key] === null) continue
        assert.ok(Array.isArray(row[key]), `${collection} row ${index} ${key} is ${JSON.stringify(row[key])}`)
        for (const host of row[key]) assert.ok(host?.name, `${collection} row ${index} ${key} has a host without a name`)
      }
    }
  }
})

test('opening and saving any workshops-page entry leaves its hosts as they were', () => {
  for (const [collection, fields] of Object.entries(collections)) {
    for (const [index, row] of collectionRows(fixture(collection), contentSources[collection]).entries()) {
      for (const [key, columns] of Object.entries(listFieldsOf(fields))) {
        if (!Array.isArray(row[key])) continue
        const saved = serializeListFields(listFieldsDraft(row[key], columns), row[key], columns, key)
        assert.deepEqual(saved, filled(row[key]), `${collection} row ${index} ${key}`)
      }
    }
  }
})

test('a workshop gains a second host with its own department and role', () => {
  const collection = 'workshops/main'
  const source = contentSources[collection]
  const document = fixture(collection)
  const original = collectionRows(document, source)
  const index = original.findIndex(row => row.institution?.length === 1)
  const columns = listFieldsOf(entryFields.workshops).institution
  assert.deepEqual(columns, ['name', 'department', 'role', 'location'])

  const rows = listFieldsDraft(original[index].institution, columns)
  rows[0].role = 'Host'
  rows.push({ ...blankRow(columns), name: 'IBM Research', role: 'Industry Partner' })
  const institution = serializeListFields(rows, original[index].institution, columns, 'institution')
  const saved = collectionRows(parseContent(replaceEntry(document, locateEntry(document, source, index), { ...original[index], institution })), source)

  assert.deepEqual(saved[index].institution, [
    { ...original[index].institution[0], role: 'Host' },
    { name: 'IBM Research', role: 'Industry Partner' },
  ])
  assert.deepEqual(saved.filter((_, position) => position !== index), original.filter((_, position) => position !== index))
})

test('a new workshop with no hosts leaves the key out, and a host needs a name', () => {
  const columns = listFieldsOf(entryFields.workshops).institution
  assert.equal(serializeListFields([], undefined, columns, 'institution'), undefined)
  assert.throws(() => serializeListFields([{ ...blankRow(columns), role: 'Host' }], undefined, columns, 'institution'), /Enter a name for each institution entry/)
})
