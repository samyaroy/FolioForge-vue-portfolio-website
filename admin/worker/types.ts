export type R2Listing = {
  objects: { key: string }[]
  truncated: boolean
  cursor?: string
}

export type R2Body = { body: ReadableStream | null; httpMetadata?: { contentType?: string }; size?: number }

/**
 * An R2 binding carries full read and write authority — the platform has no
 * read-only mode for one — so the narrowest type a handler can be given is the
 * thing that limits it. `ReadOnlyBucket` cannot express a write at all.
 */
export type ReadOnlyBucket = {
  list: (options: { prefix: string; limit: number; cursor?: string }) => Promise<R2Listing>
}

/**
 * The published media bucket when a handler must change it. Archiving moves an
 * object and uploading adds one, so this needs get, put and delete — which is
 * real authority over live media, and why every caller checks references first
 * and why an archive is a move rather than a destruction.
 */
export type MediaBucket = ReadOnlyBucket & {
  get: (key: string) => Promise<R2Body | null>
  put: (key: string, value: ArrayBuffer, options?: {
    httpMetadata?: { contentType?: string; cacheControl?: string }
  }) => Promise<unknown>
  delete: (key: string) => Promise<void>
}

export type R2StoredObject = {
  key: string
  size?: number
  uploaded?: Date
  httpMetadata?: { contentType?: string }
  customMetadata?: Record<string, string>
}

/**
 * The drafts bucket. Staging is private and nothing here is referenced by the
 * site, so the owner can discard an upload they no longer want — that is a
 * different thing from expiry, which stays a bucket lifecycle rule.
 */
export type DraftBucket = {
  delete: (key: string) => Promise<void>
  put: (key: string, value: ArrayBuffer, options?: {
    httpMetadata?: { contentType?: string; cacheControl?: string }
    customMetadata?: Record<string, string>
  }) => Promise<unknown>
  get: (key: string) => Promise<R2Body | null>
  list: (options: { prefix: string; limit: number; cursor?: string }) => Promise<{ objects: R2StoredObject[]; truncated: boolean; cursor?: string }>
}

export type WorkerEnv = {
  ASSETS: { fetch: (request: Request) => Promise<Response> }
  /** The published media bucket. */
  MEDIA?: MediaBucket
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
