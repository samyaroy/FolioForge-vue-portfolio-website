import { HttpError } from '../http.ts'
import type { AccessIdentity } from '../types.ts'

const encoder = new TextEncoder()

function csrfKey(secret: string) {
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
}

function sessionData(identity: AccessIdentity, origin: string) {
  return encoder.encode(JSON.stringify([origin, identity.subject, identity.token]))
}

export async function issueCsrfToken(identity: AccessIdentity, origin: string, secret: string) {
  const signature = await crypto.subtle.sign('HMAC', await csrfKey(secret), sessionData(identity, origin))
  return [...new Uint8Array(signature)].map(value => value.toString(16).padStart(2, '0')).join('')
}

export async function protectMutation(request: Request, identity: AccessIdentity, origin: string, secret: string) {
  if (request.headers.get('Origin') !== origin) throw new HttpError(403, 'origin_not_allowed')
  const token = request.headers.get('X-CSRF-Token') ?? ''
  if (!/^[a-f0-9]{64}$/.test(token)) throw new HttpError(403, 'invalid_csrf_token')
  const signature = Uint8Array.from(token.match(/../g)!, pair => parseInt(pair, 16))
  if (!await crypto.subtle.verify('HMAC', await csrfKey(secret), signature, sessionData(identity, origin))) throw new HttpError(403, 'invalid_csrf_token')
}
