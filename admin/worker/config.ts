import type { WorkerEnv } from './types.ts'
import { HttpError } from './http.ts'

export const publishingPolicy = { branch: 'V1', ref: 'refs/heads/V1', environment: 'Beta' } as const

export function securityConfig(env: WorkerEnv) {
  try {
    const origin = new URL(env.ADMIN_ORIGIN)
    const issuer = new URL(env.ACCESS_ISSUER)
    if (origin.protocol !== 'https:' || origin.origin !== env.ADMIN_ORIGIN || origin.username || origin.password) throw new Error()
    if (issuer.protocol !== 'https:' || !/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(issuer.hostname) || issuer.origin !== env.ACCESS_ISSUER) throw new Error()
    if (!env.ACCESS_AUDIENCE.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.ACCESS_OWNER_EMAIL) || env.CSRF_SECRET.length < 32) throw new Error()
    return { origin: origin.origin, issuer: issuer.origin, audience: env.ACCESS_AUDIENCE, ownerEmail: env.ACCESS_OWNER_EMAIL.toLowerCase() }
  } catch {
    throw new HttpError(503, 'security_not_configured')
  }
}

export type SecurityConfig = ReturnType<typeof securityConfig>
