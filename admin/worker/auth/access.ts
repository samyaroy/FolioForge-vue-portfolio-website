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
  if (!token || token.length > 16384) throw new HttpError(401, 'authentication_required')
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
    throw new HttpError(401, 'invalid_access_token')
  }
}
