import assert from 'node:assert/strict'
import { test } from 'node:test'
import { loadCvContent } from '../../scripts/cvContent.mjs'
import { collectionEntries, entryIds } from '../../src/cv/collections.ts'
import { bulletsOf, candidates, move, presetRow, unnamedCount, updateItem } from '../../src/cv/editing.ts'
import { describeRef } from '../../src/cv/resolve.ts'
import { cvPresetSchema } from '../../src/cv/schema.ts'

const content = await loadCvContent()
const { library, portfolio } = content.context

test('a preset the builder saves parses back to the same preset', () => {
  for (const preset of content.presets) {
    assert.deepEqual(cvPresetSchema.parse(presetRow(preset)), preset, preset.id)
  }
})

test('a saved preset leaves defaults out, as the hand-written ones do', () => {
  const row = presetRow(content.presets.find(preset => preset.id === 'consolidated'))
  assert.equal('template_options' in row, false)
  assert.equal('prefer' in row, false)
  assert.equal('variants' in row, false)
  assert.deepEqual(row.sections[0], { kind: 'summary', items: ['profile'] })
  assert.deepEqual(row.sections[3].items.at(-1), { ref: 'projects-publications/technical#doctor-vaahaan', style: 'compact' })
})

test('edits return a new preset and leave the original alone', () => {
  const preset = content.presets.find(entry => entry.id === 'consolidated')
  const before = JSON.stringify(preset)
  const ref = 'home/experience#ideas-tih-asd'
  const edited = updateItem(preset, 1, ref, item => ({ ...item, bullets: item.bullets.filter(id => id !== 'npcyf-dashboard') }))
  assert.equal(JSON.stringify(preset), before)
  assert.deepEqual(edited.sections[1].items[0].bullets, ['npcyf-lead', 'npcyf-models', 'npcyf-pipeline'])
  assert.deepEqual(move(['a', 'b', 'c'], 0, 1), ['b', 'a', 'c'])
  assert.deepEqual(move(['a', 'b', 'c'], 2, 5), ['a', 'b', 'c'])
})

test('a section offers what it may draw from, and counts what has no id yet', () => {
  const projects = candidates('projects', library, portfolio)
  assert.ok(projects.includes('projects-publications/research#messymashup'))
  assert.ok(projects.includes('chi-square'), 'CV-only entries may join any item section')
  assert.ok(!projects.some(ref => ref.startsWith('home/education')))
  assert.deepEqual(candidates('interests', library, portfolio).slice(0, 2), ['nonparametric', 'bayesian'])
  assert.ok(unnamedCount('projects', portfolio) > 0, 'most projects have no id yet')
  assert.equal(unnamedCount('skills', portfolio), 0)
  assert.deepEqual(bulletsOf('chi-square', library).map(bullet => bullet.id), ['chi-founded', 'chi-events', 'chi-reading-group'])
})

test('a reference is described by the facts a CV would print', () => {
  assert.deepEqual(describeRef('home/education#bsc-snu', content.context), {
    title: 'Sister Nivedita University', detail: 'Bachelor of Science (BSc) in Statistics (Hons.) [CGPA 7.01/10] · 2022 - 2025',
  })
  assert.equal(describeRef('home/education#nope', content.context), undefined)
  assert.equal(describeRef('no-such-entry', content.context), undefined)
})

test('collections are read through registry keys, selectors and all', () => {
  const data = { groups: [{ title: 'a', entries: [{ id: 'x' }] }, { title: 'b', entries: [{ id: 'y' }, { name: 'no id' }] }] }
  assert.deepEqual(collectionEntries(data, ['groups[title=b].entries']), [{ id: 'y' }, { name: 'no id' }])
  assert.deepEqual(collectionEntries(data, ['groups.*.entries']).length, 3)
  assert.deepEqual([...entryIds(collectionEntries(data, ['groups.*.entries']))], ['x', 'y'])
  assert.deepEqual(collectionEntries(data, ['missing.path']), [])
})
