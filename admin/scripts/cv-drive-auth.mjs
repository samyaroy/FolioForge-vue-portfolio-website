#!/usr/bin/env node
/**
 * The one-time Drive consent of docs/cv_architecture.md §10.1: signs in as the
 * owner of the CVs folder and prints the refresh token the Worker keeps as
 * GOOGLE_OAUTH_REFRESH_TOKEN.
 *
 *   npm run cv:drive-auth -- ~/Downloads/client_secret_….json
 *   npm run cv:drive-auth -- <file> --check --folder <CVs folder id>
 *
 * The file is the JSON Google offers when a Desktop app client is created.
 * Google redirects back to a port this script listens on at 127.0.0.1, and
 * PKCE ties the code to this run, so nothing else can redeem it. --check signs
 * in the same way but prints no credentials: it reports whose Drive the token
 * reaches, whether Google limits its lifetime, and what the folder holds. Only
 * Node's own modules are used, so it runs without installing the admin.
 *
 * Only the credentials go to stdout; everything meant for a person goes to
 * stderr. So the refresh token can be piped into wrangler without copying it:
 *
 *   TOKEN=$(node scripts/cv-drive-auth.mjs <file> | sed -n 's/^GOOGLE_OAUTH_REFRESH_TOKEN=//p')
 *   [ -n "$TOKEN" ] && printf %s "$TOKEN" | wrangler secret put GOOGLE_OAUTH_REFRESH_TOKEN
 *
 * The test keeps a failed sign-in from uploading an empty secret over the old one.
 */
import { execFile } from 'node:child_process'
import { createHash, randomBytes } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'

const SCOPE = 'https://www.googleapis.com/auth/drive'
const FOLDER_MIME = 'application/vnd.google-apps.folder'

const args = process.argv.slice(2)
const check = args.includes('--check')
const folderAt = args.indexOf('--folder')
const folder = folderAt >= 0 ? args[folderAt + 1] : undefined
const file = args.find((arg, index) => !arg.startsWith('--') && (folderAt < 0 || index !== folderAt + 1))
if (!file || (folderAt >= 0 && !/^[A-Za-z0-9_-]+$/.test(folder ?? ''))) {
  console.error('Usage: npm run cv:drive-auth -- <client_secret_….json from Google Cloud> [--check] [--folder <id>]')
  process.exit(1)
}
const { installed } = JSON.parse(await readFile(file, 'utf8'))
if (!installed?.client_id || !installed?.client_secret) {
  console.error('That file is not a Desktop app client. Create the client with Application type "Desktop app".')
  process.exit(1)
}

const verifier = randomBytes(32).toString('base64url')
const challenge = createHash('sha256').update(verifier).digest('base64url')
const state = randomBytes(16).toString('base64url')

const server = createServer()
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const redirectUri = `http://127.0.0.1:${server.address().port}`

const consentUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
consentUrl.search = new URLSearchParams({
  client_id: installed.client_id,
  redirect_uri: redirectUri,
  response_type: 'code',
  scope: SCOPE,
  // offline + consent: Google returns a refresh token every time, not only on
  // the first consent.
  access_type: 'offline',
  prompt: 'consent',
  code_challenge: challenge,
  code_challenge_method: 'S256',
  state,
}).toString()

console.error('Sign in as the owner of the CVs folder. Google will say it has not verified')
console.error('this app: choose Advanced, then Go to the app. If no browser opens, visit:\n')
console.error(`${consentUrl}\n`)
const opener = { darwin: 'open', win32: 'explorer' }[process.platform] ?? 'xdg-open'
execFile(opener, [consentUrl.href], () => undefined)

const code = await new Promise((resolve, reject) => {
  server.on('request', (request, response) => {
    const url = new URL(request.url ?? '/', redirectUri)
    if (url.pathname !== '/') {
      response.writeHead(404).end()
      return
    }
    const failure = url.searchParams.get('error') ?? (url.searchParams.get('state') === state ? null : 'state mismatch')
    response.writeHead(failure ? 400 : 200, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end(failure ? `Consent failed: ${failure}` : 'Signed in. Close this tab and go back to the terminal.')
    if (failure) reject(new Error(failure))
    else resolve(url.searchParams.get('code'))
  })
}).finally(() => server.close()).catch(error => {
  console.error(`Consent failed: ${error.message}`)
  process.exit(1)
})

const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    client_id: installed.client_id,
    client_secret: installed.client_secret,
    code,
    code_verifier: verifier,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  }),
})
const tokens = await tokenResponse.json()
if (!tokenResponse.ok || !tokens.refresh_token) {
  console.error(`Google refused the code: ${tokens.error_description ?? tokens.error ?? 'no refresh token returned'}`)
  process.exit(1)
}

async function drive(path, params) {
  const url = new URL(`https://www.googleapis.com/drive/v3/${path}`)
  url.search = new URLSearchParams(params).toString()
  const response = await fetch(url, { headers: { Authorization: `Bearer ${tokens.access_token}` } })
  const body = await response.json()
  if (!response.ok) throw new Error(body.error?.message ?? `Drive answered ${response.status}`)
  return body
}

const children = async id => (await drive('files', {
  q: `'${id}' in parents and trashed = false`,
  fields: 'files(id,name,mimeType,capabilities(canEdit,canAddChildren))',
  orderBy: 'name',
  pageSize: '200',
})).files

try {
  // Shows whose Drive the token reaches, so a sign-in with the wrong account is
  // caught here rather than at the first publish.
  const { user } = await drive('about', { fields: 'user(displayName,emailAddress)' })
  console.error(`Signed in to the Drive of ${user.displayName} <${user.emailAddress}>.`)
} catch (error) {
  console.error(`The token works, but Drive refused it: ${error.message}`)
  process.exit(1)
}

// Google sets this only on tokens with a limited life, which is what an app
// still in Testing gets: seven days (cv_architecture.md §10.1).
if (tokens.refresh_token_expires_in) {
  const days = Math.round(tokens.refresh_token_expires_in / 86400)
  console.error(`✗ Google limits this refresh token to ${days} day(s). Publish the app (Audience → Publish app), then sign in again.`)
} else {
  console.error('✓ The refresh token has no expiry set by Google, so the app is in production.')
}

if (folder) {
  try {
    // A folder shared by link is readable by any account, so what matters for
    // publishing is whether this one may update the files and add new ones.
    const root = await drive(`files/${folder}`, { fields: 'name,owners(emailAddress)' })
    console.error(`\n${root.name}/ (owner: ${root.owners?.map(owner => owner.emailAddress).join(', ') ?? 'not shown'}), as the token sees it:`)
    let readOnly = 0
    for (const entry of await children(folder)) {
      if (entry.mimeType !== FOLDER_MIME) continue
      const canAdd = entry.capabilities?.canAddChildren
      if (!canAdd) readOnly++
      console.error(`  ${entry.name}/${canAdd ? '' : '   ✗ cannot add files'}`)
      for (const inner of await children(entry.id)) {
        if (!inner.capabilities?.canEdit) readOnly++
        console.error(`      ${inner.name}${inner.capabilities?.canEdit ? '' : '   ✗ read-only'}`)
      }
    }
    console.error(readOnly
      ? `✗ ${readOnly} of these cannot be written. Sign in as the folder's owner, or share the folder with this account as Editor.`
      : '✓ This account can update every file and add files to every subfolder.')
  } catch (error) {
    console.error(`✗ Could not read the folder: ${error.message}`)
    process.exit(1)
  }
}

if (check) {
  console.error('\n--check: credentials not printed. Run without --check to print them for the Worker.')
} else {
  console.error('\nStore these as secrets of the admin Worker (folioforge-admin-beta); never commit them:\n')
  console.log(`GOOGLE_OAUTH_CLIENT_ID=${installed.client_id}`)
  console.log(`GOOGLE_OAUTH_CLIENT_SECRET=${installed.client_secret}`)
  console.log(`GOOGLE_OAUTH_REFRESH_TOKEN=${tokens.refresh_token}`)
}
