import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { parse } from 'yaml'
import { renderGalleryManifest } from '../../../shared/gallery/manifest.js'
import { derivedFiles, generatedPaths } from '../content/derived.ts'
import { contentSources } from '../content/registry.ts'
import { appendLocation, insertEntry, locateEntry, parseContent, removeEntry, replaceEntry } from '../content/entries.ts'

const REPO = new URL('../../../', import.meta.url).pathname
const GALLERY = 'src/content/profile_info/gallery.yml'
const MANIFEST = 'src/content/galleryImageManifest.yml'

const galleryText = () => readFileSync(REPO + GALLERY, 'utf8')

test('the admin renders the manifest the committed one already is', () => {
  // If these ever differ, the repository holds a manifest nothing can reproduce.
  const rendered = renderGalleryManifest(parse(galleryText()))
  assert.equal(rendered, readFileSync(REPO + MANIFEST, 'utf8'))
})

test('the CLI and the Worker share one definition of that file', () => {
  // The CLI is a filesystem wrapper; running it must change nothing.
  execSync('node scripts/sync-gallery-image-manifest.js', { cwd: REPO })
  const afterCli = execSync(`git diff --name-only -- ${MANIFEST}`, { cwd: REPO, encoding: 'utf8' }).trim()
  assert.equal(afterCli, '', 'running the CLI changed the manifest the Worker would produce')
})

test('editing the gallery produces both files, and only those', () => {
  const source = contentSources['gallery/career-unlocks']
  const document = parseContent(galleryText())
  const location = locateEntry(document, source, 0)
  const entry = JSON.parse(JSON.stringify(document.getIn([...location.path, location.index])))
  const text = replaceEntry(document, location, { ...entry, title: 'A different title' })

  const derived = derivedFiles(source.path, parseContent(text).toJS())
  assert.equal(derived.length, 1)
  assert.equal(derived[0].path, MANIFEST)
  assert.ok(generatedPaths.includes(MANIFEST))
  // The title feeds the manifest description, so the generated file moves with it.
  assert.ok(derived[0].text.includes('A different title'), 'the manifest must reflect the edit')
})

test('a file with no generated output commits alone', () => {
  const education = contentSources['home/education']
  assert.deepEqual(derivedFiles(education.path, {}), [])
})

test('adding and removing a gallery entry keeps the manifest in step', () => {
  const source = contentSources['gallery/career-unlocks']
  const document = parseContent(galleryText())
  const added = insertEntry(document, appendLocation(document, source), {
    id: 'test-entry-99', title: 'Newly added unlock', date: '2026-09-20', tags: ['Mentoring'],
  })
  const manifest = derivedFiles(source.path, parseContent(added).toJS())[0].text
  assert.ok(manifest.includes('test-entry-99'), 'a new item must appear in the manifest')
  assert.ok(manifest.includes('Newly added unlock'))
  // It is categorised by its tags, not by where it sits in the file.
  const mentoring = manifest.slice(manifest.indexOf('category: Mentoring'))
  assert.ok(mentoring.indexOf('test-entry-99') < mentoring.indexOf('category:', 1) || !mentoring.includes('category:', 1))

  const reopened = parseContent(galleryText())
  const removed = removeEntry(reopened, locateEntry(reopened, source, 0))
  const afterRemoval = derivedFiles(source.path, parseContent(removed).toJS())[0].text
  const firstId = String(parseContent(galleryText()).toJS().items[0].id)
  assert.equal(afterRemoval.includes(`id: ${firstId}`), false, 'a removed item must leave the manifest')
})

test('an item with no id is left out of the manifest, as the CLI leaves it out', () => {
  const rendered = renderGalleryManifest({ items: [{ title: 'No id here' }, { id: 'kept', title: 'Kept', tags: ['Event'] }] })
  assert.equal(rendered.includes('No id here'), false)
  assert.ok(rendered.includes('kept'))
})
