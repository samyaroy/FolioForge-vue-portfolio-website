#!/usr/bin/env node
/**
 * Publishes the CVs to Google Drive from this machine, by the folder rule of
 * docs/cv_architecture.md §10.2:
 *
 *   npm run cv:publish                        every preset with a Drive target
 *   npm run cv:publish -- consolidated        only the presets named
 *   npm run cv:publish -- --keep-previous     keep, for good, the version each update replaces
 *   npm run cv:publish -- --dry-run           say what would happen; build and send nothing
 *
 * Every target is found in Drive before anything is built or sent. A file of
 * the target's name is updated in place, keeping its link; a missing one is
 * created. The presets are then built with pdflatex (cv:build --pdf), and if
 * any build fails nothing is sent. Drive keeps a replaced version for 30 days
 * on its own; --keep-previous marks it "Keep forever" first.
 *
 * Credentials are the Worker's, read from admin/.dev.vars or the environment:
 * GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET,
 * GOOGLE_OAUTH_REFRESH_TOKEN and CV_DRIVE_ROOT.
 */
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { accessToken, driveClient, planTargets, publishTarget } from '../worker/cv/drive.ts'
import { REPO_ROOT, loadCvContent } from './cvContent.mjs'

const ADMIN = path.join(REPO_ROOT, 'admin')
const CREDENTIALS = ['GOOGLE_OAUTH_CLIENT_ID', 'GOOGLE_OAUTH_CLIENT_SECRET', 'GOOGLE_OAUTH_REFRESH_TOKEN', 'CV_DRIVE_ROOT']

const args = process.argv.slice(2)
const keepPrevious = args.includes('--keep-previous')
const dryRun = args.includes('--dry-run')
const wanted = args.filter(arg => !arg.startsWith('--'))

/** `.dev.vars` is dotenv: KEY=value lines, values optionally quoted. */
async function devVars() {
  const text = await readFile(path.join(ADMIN, '.dev.vars'), 'utf8').catch(() => '')
  return Object.fromEntries(text.split('\n').flatMap(line => {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line)
    return match ? [[match[1], match[2].replace(/^(["'])(.*)\1$/, '$2')]] : []
  }))
}

const content = await loadCvContent()
if (content.issues.length) {
  for (const issue of content.issues) console.error(`✗ ${issue.path}: ${issue.message}`)
  console.error(`\n${content.issues.length} problem(s) in the CV content; nothing was published.`)
  process.exit(1)
}

const unknown = wanted.filter(id => !content.presets.some(preset => preset.id === id))
if (unknown.length) {
  console.error(`No preset ${unknown.join(', ')}. Presets: ${content.presets.map(preset => preset.id).join(', ')}.`)
  process.exit(1)
}
const presets = content.presets.filter(preset => (wanted.length ? wanted.includes(preset.id) : preset.drive.length))
const unpublished = presets.filter(preset => !preset.drive.length)
if (unpublished.length) {
  console.error(`${unpublished.map(preset => preset.id).join(', ')} has no Drive target. Add one under \`drive\` in presets.yml.`)
  process.exit(1)
}
if (!presets.length) {
  console.error('No preset has a Drive target. Add one under `drive` in presets.yml.')
  process.exit(1)
}

const vars = { ...(await devVars()), ...Object.fromEntries(CREDENTIALS.flatMap(name => (process.env[name] ? [[name, process.env[name]]] : []))) }
const missing = CREDENTIALS.filter(name => !vars[name])
if (missing.length) {
  console.error(`Missing ${missing.join(', ')}. Put them in admin/.dev.vars (git ignores it), for example:`)
  console.error('  node scripts/cv-drive-auth.mjs ~/Downloads/client_secret_….json >> .dev.vars')
  console.error('  echo "CV_DRIVE_ROOT=<the CVs folder\'s ID>" >> .dev.vars')
  process.exit(1)
}

const drive = driveClient(await accessToken({
  clientId: vars.GOOGLE_OAUTH_CLIENT_ID,
  clientSecret: vars.GOOGLE_OAUTH_CLIENT_SECRET,
  refreshToken: vars.GOOGLE_OAUTH_REFRESH_TOKEN,
}).catch(error => {
  console.error(error.message)
  process.exit(1)
}))

const targets = presets.flatMap(preset => preset.drive.map(target => ({ preset: preset.id, folder: target.folder, name: target.name ?? preset.filename })))
const plans = await planTargets(drive, vars.CV_DRIVE_ROOT, targets).catch(error => {
  console.error(`✗ ${error.message}\nNothing was built or sent.`)
  process.exit(1)
})

const where = plan => `${plan.folder}/${plan.name}.pdf`
const width = Math.max(...plans.map(plan => plan.preset.length))
console.log(`${dryRun ? 'Would publish' : 'Publishing'} to Google Drive${keepPrevious ? ', keeping each replaced version' : ''}:`)
for (const plan of plans) console.log(`  ${plan.fileId ? 'update' : 'create'}  ${plan.preset.padEnd(width)}  ${where(plan)}`)
if (dryRun) process.exit(0)

console.log('')
const built = await new Promise(resolve => {
  // execArgv carries any --import a caller ran this script with.
  const child = spawn(process.execPath, [...process.execArgv, path.join(ADMIN, 'scripts/cv-build.mjs'), '--pdf', ...presets.map(preset => preset.id)], { stdio: 'inherit' })
  child.on('close', code => resolve(code === 0))
})
if (!built) {
  console.error('\nA build failed, so nothing was sent to Drive.')
  process.exit(1)
}

const pdfs = new Map()
for (const preset of presets) {
  const bytes = new Uint8Array(await readFile(path.join(ADMIN, '.cv-build', `${preset.filename}.pdf`)))
  pdfs.set(preset.id, { bytes, md5: createHash('md5').update(bytes).digest('hex') })
}

const when = time => new Date(time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
console.log('')
let failed = 0
let updated = 0
for (const plan of plans) {
  try {
    const result = await publishTarget(drive, plan, pdfs.get(plan.preset), { keepPrevious })
    if (result.action === 'updated') updated++
    const kept = result.kept ? `  (kept the version of ${when(result.kept.modifiedTime)})` : ''
    console.log(`✓ ${result.action.padEnd(7)}  ${plan.preset.padEnd(width)}  ${where(plan)}${kept}`)
  } catch (error) {
    failed++
    console.log(`✗ failed   ${plan.preset.padEnd(width)}  ${where(plan)}: ${error.message}`)
  }
}

if (failed) {
  console.error(`\n${failed} of ${plans.length} not published. Run it again to retry: what was published is only updated again, never duplicated.`)
  process.exit(1)
}
if (updated && !keepPrevious) console.log('\nDrive keeps each replaced version for 30 days. Add --keep-previous to keep it for good.')
