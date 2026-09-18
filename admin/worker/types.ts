export type WorkerEnv = {
  ASSETS: { fetch: (request: Request) => Promise<Response> }
  // `ADMIN_ORIGIN` is a tracked variable; the rest are Worker secrets, kept out
  // of this public repository. All of them are optional here because a fresh
  // deployment has none of them installed yet, and `securityConfig` is what
  // decides whether the admin may open at all.
  ADMIN_ORIGIN?: string
  ACCESS_ISSUER?: string
  ACCESS_AUDIENCE?: string
  ACCESS_OWNER_EMAIL?: string
  CSRF_SECRET?: string
}

export type AccessIdentity = {
  subject: string
  email: string
  expiresAt: number
  token: string
}
