export type R2Listing = {
  objects: { key: string }[]
  truncated: boolean
  cursor?: string
}

/**
 * An R2 binding carries full read and write authority — the platform has no
 * read-only mode for one. Declaring it with only `list` is what holds the line:
 * the Worker cannot express a put or a delete, because no such method exists on
 * the type it is handed.
 */
export type ReadOnlyBucket = {
  list: (options: { prefix: string; limit: number; cursor?: string }) => Promise<R2Listing>
}

export type R2StoredObject = {
  key: string
  size?: number
  uploaded?: Date
  httpMetadata?: { contentType?: string }
  customMetadata?: Record<string, string>
}

export type R2Body = { body: ReadableStream | null; httpMetadata?: { contentType?: string }; size?: number }

/**
 * The drafts bucket. It can be written and read but not emptied: no `delete`
 * exists on this type, so nothing in the Worker can remove a staged object,
 * and expiry belongs to a bucket lifecycle rule rather than to a request.
 */
export type DraftBucket = {
  put: (key: string, value: ArrayBuffer, options?: {
    httpMetadata?: { contentType?: string; cacheControl?: string }
    customMetadata?: Record<string, string>
  }) => Promise<unknown>
  get: (key: string) => Promise<R2Body | null>
  list: (options: { prefix: string; limit: number; cursor?: string }) => Promise<{ objects: R2StoredObject[]; truncated: boolean; cursor?: string }>
}

export type WorkerEnv = {
  ASSETS: { fetch: (request: Request) => Promise<Response> }
  /** The published media bucket, read-only by type. */
  MEDIA?: ReadOnlyBucket
  /** Private staging. Has no public domain, so nothing here is reachable. */
  DRAFTS?: DraftBucket
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
