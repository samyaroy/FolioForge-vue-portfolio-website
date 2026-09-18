/**
 * List the installations of a GitHub App, so the installation id does not have
 * to be read off a browser URL.
 *
 * Authenticates as the app itself with a short-lived assertion, exactly as the
 * Worker does. Prints id, account and repository selection; writes nothing.
 *
 *   node scripts/github-installations.mjs <app-id> <pkcs8-key-path>
 */
import { readFile } from 'node:fs/promises'
import { importPKCS8, SignJWT } from 'jose'

const [appId, keyPath] = process.argv.slice(2)
if (!/^\d{1,20}$/.test(appId ?? '') || !keyPath) {
  console.error('usage: node scripts/github-installations.mjs <app-id> <pkcs8-key-path>')
  process.exit(64)
}

const pem = await readFile(keyPath, 'utf8')
if (pem.includes('BEGIN RSA PRIVATE KEY')) {
  console.error('That key is PKCS#1. Convert it first:')
  console.error('  openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in <in> -out <out>')
  process.exit(65)
}

const now = Math.floor(Date.now() / 1000)
const assertion = await new SignJWT({})
  .setProtectedHeader({ alg: 'RS256' })
  .setIssuer(appId)
  .setIssuedAt(now - 30)
  .setExpirationTime(now + 540)
  .sign(await importPKCS8(pem, 'RS256'))

const response = await fetch('https://api.github.com/app/installations', {
  headers: {
    accept: 'application/vnd.github+json',
    authorization: `Bearer ${assertion}`,
    'user-agent': 'folioforge-admin-beta',
    'x-github-api-version': '2022-11-28',
  },
})

if (!response.ok) {
  // 401 here almost always means the key and the app id are from different apps.
  console.error(`GitHub answered ${response.status}. A 401 usually means this key does not belong to app ${appId}.`)
  process.exit(1)
}

const installations = await response.json()
if (!Array.isArray(installations) || installations.length === 0) {
  console.error('This app has no installations yet. Install it on the repository first.')
  process.exit(1)
}

for (const installation of installations) {
  console.log(`${installation.id}\t${installation.account?.login ?? '?'}\t${installation.repository_selection ?? '?'}`)
}
