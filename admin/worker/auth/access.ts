import { createRemoteJWKSet, jwtVerify } from 'jose'
import type { JWTVerifyGetKey } from 'jose'
import type { SecurityConfig } from '../config.ts'
import { HttpError } from '../http.ts'
import type { AccessIdentity } from '../types.ts'

const keySets = new Map<string, JWTVerifyGetKey>()

function accessKeys(issuer: string) {
  let keys = keySets.get(issuer)
  if (!keys) {
    keys = createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`))
    keySets.set(issuer, keys)
  }
  return keys
}

export async function authenticate(request: Request, config: SecurityConfig, keys?: JWTVerifyGetKey): Promise<AccessIdentity> {
  const token = request.headers.get('Cf-Access-Jwt-Assertion')
  if (!token) throw new HttpError(401, 'authentication_required', 'missing_assertion')
  if (token.length > 16384) throw new HttpError(401, 'authentication_required', 'assertion_too_large')
  try {
    const { payload } = await jwtVerify(token, keys ?? accessKeys(config.issuer), {
      issuer: config.issuer,
      audience: config.audience,
      algorithms: ['RS256'],
      requiredClaims: ['iss', 'aud', 'exp', 'iat', 'sub', 'email'],
    })
    if (typeof payload.email !== 'string' || payload.email.toLowerCase() !== config.ownerEmail || typeof payload.sub !== 'string' || !payload.sub) throw new HttpError(403, 'identity_not_allowed')
    return { subject: payload.sub, email: payload.email.toLowerCase(), expiresAt: payload.exp!, token }
  } catch (error) {
    if (error instanceof HttpError) throw error
    // The library's error name says which check failed — expiry, signature,
    // issuer, audience — and carries none of the token itself.
    throw new HttpError(401, 'invalid_access_token', error instanceof Error ? error.name : undefined)
  }
}
