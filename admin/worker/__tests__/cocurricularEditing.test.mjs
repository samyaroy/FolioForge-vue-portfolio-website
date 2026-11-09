import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { entryFields, fieldKeys, listFieldsOf, nestedListFieldsOf } from '../../../src/config/entryFields.ts'
import { withoutDisabledEntries } from '../../../src/config/entryStatus.ts'
import { repositoryEntries } from '../../src/data/collectionEntries.ts'
import { entryPresentation } from '../../src/lib/entryPresentation.ts'
import { blankRow, listFieldsDraft, serializeListFields } from '../../src/lib/listFields.ts'
import { contentSources } from '../content/registry.ts'
import { collectionRows } from '../content/index.ts'
import { locateEntry, parseContent, replaceEntry } from '../content/entries.ts'

const source = contentSources['cocurricular/leadership']
const fixture = () => parseContent(readFileSync(new URL(`../../../${source.path}`, import.meta.url), 'utf8'))
const affiliationFields = listFieldsOf(entryFields.leadership).affiliation

test('leadership edits preserve shared descriptions, sibling roles and credential lists', () => {
  const document = fixture()
  const original = collectionRows(document, source)
  const entry = original[0]
  const rows = listFieldsDraft(entry.affiliation, affiliationFields)
  rows[0].description = 'Description specific to the first role.'
  rows[0].enabled = 'true'
  const updated = { ...entry, affiliation: serializeListFields(rows, entry.affiliation, affiliationFields, 'affiliation') }
  const saved = collectionRows(parseContent(replaceEntry(document, locateEntry(document, source, 0), updated)), source)
  assert.equal(saved[0].role, undefined)
  assert.equal(saved[0].description, entry.description)
  assert.equal(saved[0].affiliation[0].description, rows[0].description)
  assert.equal(saved[0].affiliation[0].enabled, true)
  assert.deepEqual(saved[0].affiliation[1].cred_link, entry.affiliation[1].cred_link)
  assert.deepEqual(saved.slice(1), original.slice(1))
})

test('new leadership roles have independent descriptions and boolean visibility without a parent role', () => {
  assert.deepEqual(fieldKeys(entryFields.leadership), ['affiliation', 'description'])
  const first = { ...blankRow(affiliationFields), role: 'Organizer', description: 'First description', enabled: 'false' }
  const second = { ...blankRow(affiliationFields), role: 'Speaker', description: 'Second description' }
  const affiliation = serializeListFields([first, second], undefined, affiliationFields, 'affiliation')
  assert.equal(affiliation[0].enabled, false)
  assert.equal(affiliation[1].enabled, true)
  assert.deepEqual(affiliation.map(role => role.description), ['First description', 'Second description'])
  assert.deepEqual(withoutDisabledEntries({ affiliation }).affiliation, [affiliation[1]])
  assert.throws(() => serializeListFields([{ ...first, role: '' }], undefined, affiliationFields, 'affiliation'), /Enter a role/)
})

test('nested volunteering fields can be switched, edited and removed without losing role metadata', () => {
  const fields = listFieldsOf(entryFields.volunteering).roles
  const children = nestedListFieldsOf(entryFields.volunteering).roles
  const original = [{ role: 'Teaching Assistant', enabled: true, organization: 'Club', field: [
    { sub_field: 'Statistics I', enabled: true, time_period: '2025', custom: 'keep' },
    { sub_field: 'Statistics II', enabled: false, time_period: '2026' },
  ], cred_link: [{ label: 'Certificate', url: 'https://example.com/certificate' }] }]
  const rows = listFieldsDraft(original, fields, children)
  const nested = JSON.parse(rows[0].field)
  nested[0].enabled = 'false'
  nested[1].enabled = 'true'
  rows[0].field = JSON.stringify(nested)
  const saved = serializeListFields(rows, original, fields, 'roles', children)
  assert.deepEqual(saved[0].cred_link, original[0].cred_link)
  assert.equal(saved[0].field[0].custom, 'keep')
  assert.deepEqual(saved[0].field.map(field => field.enabled), [false, true])
  assert.equal(withoutDisabledEntries(saved)[0].field[0].sub_field, 'Statistics II')
  rows[0].field = JSON.stringify([nested[1]])
  assert.deepEqual(serializeListFields(rows, original, fields, 'roles', children)[0].field, [saved[0].field[1]])
})

test('grouped leadership titles derive from children and refresh when roles change', () => {
  const raw = { affiliation: [{ role: 'Founder', enabled: false }, { role: 'Secretary', enabled: true }] }
  const [entry] = repositoryEntries('cocurricular/leadership', [raw])
  assert.equal(entry.title, 'Founder + Secretary')
  raw.affiliation[1].role = 'President'
  assert.equal(entryPresentation(raw, entry.presentation).title, 'Founder + President')
  assert.equal(entry.raw.affiliation.length, 2)
})
