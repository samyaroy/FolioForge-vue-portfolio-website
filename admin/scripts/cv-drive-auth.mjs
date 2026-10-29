#!/usr/bin/env node
/**
 * The one-time Drive consent of docs/cv_architecture.md §10.1: signs in as the
 * owner of the CVs folder and prints the refresh token the Worker keeps as
 * GOOGLE_OAUTH_REFRESH_TOKEN.
 *
 *   npm run cv:drive-auth -- ~/Downloads/client_secret_….json
 *
 * The file is the JSON Google offers when a Desktop app client is created.
 * Google redirects back to a port this script listens on at 127.0.0.1, and
 * PKCE ties the code to this run, so nothing else can redeem it. Only Node's
 * own modules are used, so it runs without installing the admin.
 */
import { execFile } from 'node:child_process'
import { createHash, randomBytes } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'

const SCOPE = 'https://www.googleapis.com/auth/drive'

const file = process.argv[2]
if (!file) {
  console.error('Usage: npm run cv:drive-auth -- <client_secret_….json from Google Cloud>')
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

console.log('Sign in as the owner of the CVs folder. Google will say it has not verified')
console.log('this app: choose Advanced, then Go to the app. If no browser opens, visit:\n')
console.log(`${consentUrl}\n`)
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

// Shows whose Drive the token reaches, so a sign-in with the wrong account is
// caught here rather than at the first publish.
const about = await fetch('https://www.googleapis.com/drive/v3/about?fields=user(displayName,emailAddress)', {
  headers: { Authorization: `Bearer ${tokens.access_token}` },
})
const { user } = about.ok ? await about.json() : {}
console.log(`Signed in to the Drive of ${user ? `${user.displayName} <${user.emailAddress}>` : 'an account the Drive API could not name'}.\n`)
console.log('Store these as secrets of the admin Worker (folioforge-admin-beta); never commit them:\n')
console.log(`GOOGLE_OAUTH_CLIENT_ID=${installed.client_id}`)
console.log(`GOOGLE_OAUTH_CLIENT_SECRET=${installed.client_secret}`)
console.log(`GOOGLE_OAUTH_REFRESH_TOKEN=${tokens.refresh_token}`)
