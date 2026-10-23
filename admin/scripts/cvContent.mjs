import { execFile } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { parse, parseDocument } from 'yaml'
import { portfolioPublicUrl } from '../src/config/publishing.ts'
import { templateHashes } from '../src/cv/render.ts'
import { parseLibrary, parsePresets, portfolioRef } from '../src/cv/schema.ts'
import { templates } from '../src/cv/templates/index.ts'
import { validateCv } from '../src/cv/validate.ts'
import { resolvePaths } from '../worker/content/entries.ts'
import { contentSources } from '../worker/content/registry.ts'

/**
 * The committed CV content, read from a checkout the way the admin reads it
 * from V1: the CV files, profile.yml, and every portfolio collection a preset
 * or library row points at, each read through its registry entry. Node only;
 * the build script and the tests share it.
 */

export const REPO_ROOT = fileURLToPath(new URL('../../', import.meta.url))

const CV_LIBRARY = 'src/content/cv/library.yml'
const CV_PRESETS = 'src/content/cv/presets.yml'
const PROFILE = 'src/content/profile_info/profile.yml'

/** A collection's entries, as `readCollection` in the Worker reads them. */
function collectionEntries(text, source) {
  const document = parseDocument(text)
  const data = document.toJS()
  return source.arrayKeys.flatMap(key => resolvePaths(document, key).flatMap(keys => {
    const sequence = keys.reduce((node, part) => (node && typeof node === 'object' ? node[part] : undefined), data)
    return Array.isArray(sequence) ? sequence : []
  }))
}

function referencedCollections(library, presets) {
  const refs = [
    ...library.entries.map(entry => entry.ref ?? ''),
    ...library.bullets.map(bullet => bullet.ref),
    ...presets.flatMap(preset => preset.sections.flatMap(section => section.items.map(item => item.ref))),
  ]
  return [...new Set(refs.flatMap(ref => portfolioRef(ref)?.collection ?? []))]
}

async function headSha(root) {
  try {
    const { stdout } = await promisify(execFile)('git', ['rev-parse', 'HEAD'], { cwd: root })
    return stdout.trim()
  } catch {
    return '0'.repeat(40)
  }
}

/**
 * Everything a build needs, or every problem that stops one. `issues` holds
 * parse and validation problems; when it is not empty, nothing else is set.
 */
export async function loadCvContent(root = REPO_ROOT) {
  const read = file => readFile(path.join(root, file), 'utf8')
  const library = parseLibrary(parse(await read(CV_LIBRARY)))
  const presets = parsePresets(parse(await read(CV_PRESETS)))
  if (!library.ok || !presets.ok) return { issues: [...(library.ok ? [] : library.issues), ...(presets.ok ? [] : presets.issues)] }

  const portfolio = new Map()
  for (const collection of referencedCollections(library.value, presets.value)) {
    const source = Object.hasOwn(contentSources, collection) ? contentSources[collection] : undefined
    portfolio.set(collection, source ? collectionEntries(await read(source.path), source) : [])
  }
  const index = new Map([...portfolio].map(([collection, entries]) => [
    collection, new Set(entries.flatMap(entry => (entry && typeof entry.id === 'string' ? [entry.id] : []))),
  ]))

  const issues = validateCv({ library: library.value, presets: presets.value, templates, portfolio: index })
  if (issues.length) return { issues }

  return {
    issues: [],
    presets: presets.value,
    context: {
      library: library.value,
      portfolio,
      profile: parse(await read(PROFILE)),
      siteUrl: portfolioPublicUrl,
      templates,
      templateHashes: await templateHashes(),
      source: { v1Sha: await headSha(root), pending: false },
    },
  }
}
