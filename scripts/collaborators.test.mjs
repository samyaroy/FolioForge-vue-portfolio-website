import assert from 'node:assert/strict'
import { test } from 'node:test'
import { collaboratorList } from '../src/utils/collaborators.ts'

const kinds = person => person.contacts.map(contact => `${contact.kind} ${contact.href}`)

test('a comma-separated string becomes plain names with no links', () => {
  const people = collaboratorList('Rishav Kumar banerjee, Saunak Datta ,')
  assert.deepEqual(people.map(person => person.name), ['Rishav Kumar banerjee', 'Saunak Datta'])
  assert.ok(people.every(person => person.contacts.length === 0))
})

test('rows get one icon per contact, built from an email, a handle and an ORCID iD', () => {
  const [person] = collaboratorList([
    { name: 'Jane Doe', email: 'jane@example.com', linkedin: 'jane-doe', orcid: '0000-0002-1825-009x' },
  ])
  assert.deepEqual(kinds(person), [
    'email mailto:jane@example.com',
    'linkedin https://www.linkedin.com/in/jane-doe',
    'orcid https://orcid.org/0000-0002-1825-009X',
  ])
  assert.match(person.contacts[2].label, /0000-0002-1825-009X/)
})

test('an older `link` is sorted by where it points', () => {
  const people = collaboratorList([
    { name: 'A', link: 'https://www.linkedin.com/in/a/' },
    { name: 'B', link: 'https://orcid.org/0000-0002-1825-0097' },
    { name: 'C', link: 'mailto:c@example.com' },
    { name: 'D', link: 'https://example.com/d' },
  ])
  assert.deepEqual(people.map(person => person.contacts[0].kind), ['linkedin', 'orcid', 'email', 'website'])
})

test('a link that repeats a dedicated key shows once', () => {
  const [person] = collaboratorList([
    { name: 'A', linkedin: 'https://www.linkedin.com/in/a', link: 'https://www.linkedin.com/in/a' },
  ])
  assert.equal(person.contacts.length, 1)
})

test('values that are not real contacts are dropped rather than linked', () => {
  const [person] = collaboratorList([
    { name: 'A', email: 'not-an-email', orcid: '1234', link: 'javascript:alert(1)', linkedin: 'https://evil.example.com/in/a' },
  ])
  assert.deepEqual(person.contacts, [])
})

test('blank and missing names are skipped, and empty values give nothing', () => {
  assert.deepEqual(collaboratorList([{ name: '' }, '  ', null, { email: 'x@y.z' }]), [])
  assert.deepEqual(collaboratorList(undefined), [])
  assert.deepEqual(collaboratorList(''), [])
})
