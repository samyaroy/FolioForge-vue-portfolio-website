import assert from 'node:assert/strict'
import { test } from 'node:test'
import { collaboratorKind, groupCollaborators, isCurrentCollaborator } from '../src/utils/collaboratorGroups.ts'

const names = group => group.people.map(person => person.name)
const shape = groups => groups.map(group => `${group.kind}: ${names(group).join(', ')}`)

test('a period that says Present, Ongoing or Current is current; anything else is past', () => {
  assert.ok(isCurrentCollaborator({ period: '2024 – Present' }))
  assert.ok(isCurrentCollaborator({ period: 'Jan 2026 - ongoing' }))
  assert.ok(isCurrentCollaborator({ period: '2025 – current' }))
  assert.ok(!isCurrentCollaborator({ period: '2022 – 2023' }))
  assert.ok(!isCurrentCollaborator({ period: 'Presentations, 2021' }))
  assert.ok(!isCurrentCollaborator({}))
})

test('mentor and guide are mentors; peer, a missing type and anything else are peers', () => {
  assert.equal(collaboratorKind({ type: 'mentor' }), 'mentor')
  assert.equal(collaboratorKind({ type: ' Guide ' }), 'mentor')
  assert.equal(collaboratorKind({ type: 'peer' }), 'peer')
  assert.equal(collaboratorKind({}), 'peer')
  assert.equal(collaboratorKind({ type: 'co-author' }), 'peer')
})

test('each section lists mentors before peers and keeps the content order within a group', () => {
  const sections = groupCollaborators([
    { name: 'Peer now', type: 'peer', period: '2025 – Present' },
    { name: 'Mentor now', type: 'mentor', period: '2024 – Present' },
    { name: 'Teammate now', period: '2026 – Present' },
    { name: 'Old guide', type: 'guide', period: '2021 – 2022' },
    { name: 'Old peer', type: 'peer', period: '2022 – 2023' },
  ])
  assert.deepEqual(shape(sections.current), ['mentor: Mentor now', 'peer: Peer now, Teammate now'])
  assert.deepEqual(shape(sections.past), ['mentor: Old guide', 'peer: Old peer'])
  assert.equal(sections.current[0].label, 'Mentors & guides')
  assert.equal(sections.current[1].label, 'Peers')
})

test('an entry with no period is shown under past rather than dropped', () => {
  const sections = groupCollaborators([{ name: 'Undated' }])
  assert.deepEqual(shape(sections.current), [])
  assert.deepEqual(shape(sections.past), ['peer: Undated'])
})

test('a group with nobody in it is left out', () => {
  const sections = groupCollaborators([{ name: 'Only peer', period: '2024 – Present' }])
  assert.deepEqual(sections.current.map(group => group.kind), ['peer'])
  assert.deepEqual(sections.past, [])
})

test('blank rows in the list are skipped', () => {
  const sections = groupCollaborators([null, { name: 'Real', period: '2024 – Present' }])
  assert.deepEqual(shape(sections.current), ['peer: Real'])
})
