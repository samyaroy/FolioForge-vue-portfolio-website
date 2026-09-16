export type WorkerEnv = {
  ASSETS: { fetch: (request: Request) => Promise<Response> }
  ADMIN_ORIGIN: string
  ACCESS_ISSUER: string
  ACCESS_AUDIENCE: string
  ACCESS_OWNER_EMAIL: string
  CSRF_SECRET: string
}

export type AccessIdentity = {
  subject: string
  email: string
  expiresAt: number
  token: string
}
