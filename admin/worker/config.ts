import type { WorkerEnv } from './types.ts'
import { HttpError } from './http.ts'

export const publishingPolicy = { branch: 'V1', ref: 'refs/heads/V1', environment: 'Beta' } as const

/**
 * Read the settings the admin refuses to open without. A missing secret is the
 * normal state of a fresh deployment rather than an impossibility, so anything
 * absent, unreadable or misshapen leaves the admin closed: the caller gets 503
 * and no request reaches an asset or an API route.
 */
export function securityConfig(env: WorkerEnv) {
  try {
    const adminOrigin = env.ADMIN_ORIGIN ?? ''
    const accessIssuer = env.ACCESS_ISSUER ?? ''
    const audience = env.ACCESS_AUDIENCE ?? ''
    const ownerEmail = env.ACCESS_OWNER_EMAIL ?? ''
    const csrfSecret = env.CSRF_SECRET ?? ''
    const origin = new URL(adminOrigin)
    const issuer = new URL(accessIssuer)
    if (origin.protocol !== 'https:' || origin.origin !== adminOrigin || origin.username || origin.password) throw new Error()
    if (issuer.protocol !== 'https:' || !/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(issuer.hostname) || issuer.origin !== accessIssuer) throw new Error()
    // An Access application's AUD tag is 64 hex characters. Requiring that shape
    // turns the easiest misconfiguration — pasting the 32-character account ID —
    // into a refusal to start rather than a sign-in loop with no stated cause.
    if (!/^[a-f0-9]{64}$/.test(audience)) throw new Error()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail) || csrfSecret.length < 32) throw new Error()
    return { origin: origin.origin, issuer: issuer.origin, audience, ownerEmail: ownerEmail.toLowerCase(), csrfSecret }
  } catch {
    throw new HttpError(503, 'security_not_configured')
  }
}

export type SecurityConfig = ReturnType<typeof securityConfig>
