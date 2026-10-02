import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { changeCohortProject } from '../../src/lib/mentoringProjects.ts'
import { contentSources } from '../content/registry.ts'
import { locateEntry, parseContent, readEntry, replaceEntry } from '../content/entries.ts'
import { withoutDisabledEntries } from '../../../src/config/entryStatus.ts'

const fixture = () => parseContent(readFileSync(new URL('../../../src/content/profile_info/teaching.yml', import.meta.url), 'utf8'))
const source = contentSources['teaching/mentoring']

test('creating a project targets the selected cohort and preserves the other cohorts', () => {
  const document = fixture()
  const before = document.toJS().projects_mentored
  const location = locateEntry(document, source, 0)
  const cohort = JSON.parse(JSON.stringify(readEntry(document, location)))
  const next = changeCohortProject(cohort, cohort, { kind: 'create', project: { title: 'Summer project' } })
  const saved = parseContent(replaceEntry(document, location, next)).toJS().projects_mentored
  assert.equal(saved[0].projects.at(-1).title, 'Summer project')
  assert.deepEqual(saved.slice(1), before.slice(1))
  assert.equal(saved[0].programme, before[0].programme)
})

test('editing and deleting project indices does not affect their siblings', () => {
  const cohort = { programme: 'Summer', projects: [{ title: 'A' }, { title: 'B' }, { title: 'C' }] }
  const edited = changeCohortProject(cohort, cohort, { kind: 'update', index: 1, project: { title: 'B edited' } })
  assert.deepEqual(edited.projects, [{ title: 'A' }, { title: 'B edited' }, { title: 'C' }])
  const deleted = changeCohortProject(edited, edited, { kind: 'delete', index: 1 })
  assert.deepEqual(deleted.projects, [{ title: 'A' }, { title: 'C' }])
  assert.equal(deleted.programme, 'Summer')
})

test('new projects can be added to a cohort without a project list', () => {
  const cohort = { semester: 'Autumn 2026', enabled: false }
  assert.deepEqual(changeCohortProject(cohort, cohort, { kind: 'create', project: { title: 'First' } }), { ...cohort, projects: [{ title: 'First' }] })
})

test('project saves preserve newer cohort metadata and reject stale project lists', () => {
  const expected = { programme: 'Summer', projects: [{ title: 'A' }] }
  const current = { ...expected, role: 'Updated mentor', custom: { retained: true } }
  const saved = changeCohortProject(current, expected, { kind: 'update', index: 0, project: { title: 'Edited' } })
  assert.equal(saved.role, 'Updated mentor')
  assert.deepEqual(saved.custom, { retained: true })
  assert.throws(() => changeCohortProject({ ...current, projects: [{ title: 'External edit' }] }, expected, { kind: 'delete', index: 0 }), /changed since/)
  assert.throws(() => changeCohortProject(current, current, { kind: 'delete', index: 5 }), /no longer exists/)
})

test('disabled projects remain editable but disappear from public content', () => {
  const cohort = { semester: 'Summer', projects: [{ title: 'A' }, { title: 'B' }] }
  const disabled = changeCohortProject(cohort, cohort, { kind: 'update', index: 0, project: { title: 'A', enabled: false } })
  assert.equal(disabled.projects.length, 2)
  assert.deepEqual(withoutDisabledEntries(disabled).projects, [{ title: 'B' }])
  const enabled = changeCohortProject(disabled, disabled, { kind: 'update', index: 0, project: { title: 'A', enabled: true } })
  assert.equal(withoutDisabledEntries(enabled).projects.length, 2)
})
