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
  // GitHub App credentials. Absent means "not connected", which the admin
  // reports and carries on without; the private key is a credential and never
  // leaves the Worker.
  GITHUB_APP_ID?: string
  GITHUB_INSTALLATION_ID?: string
  GITHUB_PRIVATE_KEY?: string
}

export type AccessIdentity = {
  subject: string
  email: string
  expiresAt: number
  token: string
}
