#!/usr/bin/env node
/**
 * Builds the CV presets from the committed content, the way the admin will:
 *
 *   npm run cv:build                       every preset, .tex only
 *   npm run cv:build -- --pdf              and compile each with pdflatex
 *   npm run cv:build -- academic --pdf     only the presets named
 *   npm run cv:build -- --out ../dist/cv   somewhere other than .cv-build/
 *
 * Content is validated first, and nothing is written if it has problems. With
 * --pdf any LaTeX error fails the build, which is what compile_all.sh's
 * `-halt-no-error` meant to do: that flag does not exist, so pdflatex ignored
 * it and recovered from every error unseen.
 */
import { execFile } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import { inputHash } from '../src/cv/hash.ts'
import { renderTex } from '../src/cv/render.ts'
import { resolvePreset } from '../src/cv/resolve.ts'
import { REPO_ROOT, loadCvContent } from './cvContent.mjs'

const args = process.argv.slice(2)
const pdf = args.includes('--pdf')
const outFlag = args.indexOf('--out')
const out = path.resolve(outFlag >= 0 ? args[outFlag + 1] : path.join(REPO_ROOT, 'admin/.cv-build'))
const wanted = args.filter((arg, index) => !arg.startsWith('--') && args[index - 1] !== '--out')

const content = await loadCvContent()
if (content.issues.length) {
  for (const issue of content.issues) console.error(`✗ ${issue.path}: ${issue.message}`)
  console.error(`\n${content.issues.length} problem(s) in the CV content; nothing was built.`)
  process.exit(1)
}

const unknown = wanted.filter(id => !content.presets.some(preset => preset.id === id))
if (unknown.length) {
  console.error(`No preset ${unknown.join(', ')}. Presets: ${content.presets.map(preset => preset.id).join(', ')}.`)
  process.exit(1)
}

/** What pdflatex's log says: errors with their lines, warnings, and the page count. */
function readLog(log) {
  const errors = [...log.matchAll(/^! (.*)$(?:[\s\S]*?^l\.(\d+))?/gm)].map(match => (match[2] ? `l.${match[2]}: ${match[1]}` : match[1]))
  const pages = Number(/Output written on [\s\S]*?\((\d+) pages?/.exec(log)?.[1] ?? 0)
  const boxes = (log.match(/^(Overfull|Underfull) \\[hv]box/gm) ?? []).length
  return { errors, pages, boxes }
}

await mkdir(out, { recursive: true })
let failed = false
for (const preset of content.presets.filter(entry => !wanted.length || wanted.includes(entry.id))) {
  const input = resolvePreset(preset, content.context)
  const texFile = path.join(out, `${preset.filename}.tex`)
  await writeFile(texFile, renderTex(input))
  const hash = (await inputHash(input)).slice(7, 19)
  if (!pdf) {
    console.log(`✓ ${preset.id.padEnd(16)} ${path.relative(process.cwd(), texFile)}  ${hash}`)
    continue
  }

  try {
    await promisify(execFile)('pdflatex', ['-interaction=nonstopmode', '-halt-on-error', `-output-directory=${out}`, texFile], { cwd: out, env: { ...process.env, max_print_line: '1000' } })
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('pdflatex is not installed; build without --pdf for the .tex alone.')
      process.exit(1)
    }
  }
  const { errors, pages, boxes } = readLog(await readFile(path.join(out, `${preset.filename}.log`), 'utf8'))
  const budget = preset.pages && pages > preset.pages ? `  ⚠ over its ${preset.pages}-page budget` : ''
  const boxNote = boxes ? `, ${boxes} box warning(s)` : ''
  if (errors.length) {
    failed = true
    console.log(`✗ ${preset.id.padEnd(16)} ${errors.length} error(s)`)
    for (const error of errors) console.log(`    ${error}`)
  } else {
    console.log(`✓ ${preset.id.padEnd(16)} ${pages} page(s)${boxNote}${budget}  ${hash}`)
  }
}
console.log(`\nWritten to ${path.relative(process.cwd(), out) || '.'}`)
process.exit(failed ? 1 : 0)
