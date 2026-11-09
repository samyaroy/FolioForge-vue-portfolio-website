/**
 * Google Drive for CV publishing (docs/cv_architecture.md §10): the owner's
 * OAuth token, and the few things publishing does with it. Nothing here
 * deletes, moves, renames or shares a file. Plain fetch, so the Worker and the
 * cv:publish script share it.
 */

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const API = 'https://www.googleapis.com/drive/v3'
const UPLOAD = 'https://www.googleapis.com/upload/drive/v3'
const FOLDER_MIME = 'application/vnd.google-apps.folder'

type Fetch = typeof fetch

export type DriveCredentials = { clientId: string; clientSecret: string; refreshToken: string }

export type DriveErrorCode = 'drive_not_connected' | 'unknown_folder' | 'ambiguous_file' | 'checksum_mismatch' | 'drive_failed'

export class DriveError extends Error {
  code: DriveErrorCode

  constructor(code: DriveErrorCode, message: string) {
    super(message)
    this.code = code
  }
}

/** A string inside single quotes in a Drive query. */
const quote = (value: string) => value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")

/** A short-lived access token from the owner's refresh token. */
export async function accessToken(credentials: DriveCredentials, fetcher: Fetch = fetch): Promise<string> {
  const response = await fetcher(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      refresh_token: credentials.refreshToken,
      grant_type: 'refresh_token',
    }),
  })
  const body = await response.json().catch(() => ({})) as { access_token?: string; error?: string; error_description?: string }
  if (response.ok && body.access_token) return body.access_token
  throw new DriveError('drive_not_connected', body.error === 'invalid_grant'
    ? 'Google refused the refresh token. Sign in again with npm run cv:drive-auth and replace GOOGLE_OAUTH_REFRESH_TOKEN.'
    : `Google refused the token request: ${String(body.error_description ?? body.error ?? response.status).replace(/\.?$/, '.')}`)
}

export type DriveFile = { id: string; name: string }
/** A version of a file's content, in Drive's own history. */
export type DriveVersion = { id: string; modifiedTime: string }

export type DriveClient = ReturnType<typeof driveClient>

export function driveClient(token: string, fetcher: Fetch = fetch) {
  async function call<T>(url: string, init: { method?: string; headers?: Record<string, string>; body?: BodyInit } = {}): Promise<T> {
    const response = await fetcher(url, { ...init, headers: { Authorization: `Bearer ${token}`, ...init.headers } })
    const body = await response.json().catch(() => ({})) as T & { error?: { message?: string } }
    if (!response.ok) throw new DriveError('drive_failed', body.error?.message ?? `Drive answered ${response.status}.`)
    return body
  }

  return {
    /** What a folder holds, not trashed: only its folders, or only files of one name. */
    async children(folderId: string, only: { folders: true } | { name: string }): Promise<DriveFile[]> {
      const q = [`'${quote(folderId)}' in parents`, 'trashed = false',
        'folders' in only ? `mimeType = '${FOLDER_MIME}'` : `name = '${quote(only.name)}'`].join(' and ')
      const files: DriveFile[] = []
      let pageToken = ''
      do {
        const params = new URLSearchParams({ q, fields: 'nextPageToken,files(id,name)', pageSize: '1000', ...(pageToken ? { pageToken } : {}) })
        const page = await call<{ files?: DriveFile[]; nextPageToken?: string }>(`${API}/files?${params}`)
        files.push(...(page.files ?? []))
        pageToken = page.nextPageToken ?? ''
      } while (pageToken)
      return files
    },

    async createPdf(folderId: string, name: string, bytes: Uint8Array): Promise<string> {
      const boundary = `cv-${crypto.randomUUID()}`
      const encoder = new TextEncoder()
      const metadata = JSON.stringify({ name, parents: [folderId], mimeType: 'application/pdf' })
      const body = new Blob([
        encoder.encode(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: application/pdf\r\n\r\n`),
        bytes,
        encoder.encode(`\r\n--${boundary}--`),
      ])
      const file = await call<{ id: string }>(`${UPLOAD}/files?uploadType=multipart&fields=id`, {
        method: 'POST',
        headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
        body,
      })
      return file.id
    },

    /** New content for a file, which keeps its ID, owner, sharing and link. */
    async updatePdf(fileId: string, bytes: Uint8Array): Promise<void> {
      await call(`${UPLOAD}/files/${encodeURIComponent(fileId)}?uploadType=media&fields=id`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/pdf' },
        body: bytes,
      })
    },

    async checksum(fileId: string): Promise<{ md5: string; link?: string }> {
      const file = await call<{ md5Checksum?: string; webViewLink?: string }>(`${API}/files/${encodeURIComponent(fileId)}?fields=md5Checksum,webViewLink`)
      return { md5: file.md5Checksum ?? '', link: file.webViewLink }
    },

    /**
     * Marks the file's current content "Keep forever". Drive keeps a replaced
     * version for 30 days on its own; a kept one stays until it is removed by
     * hand in Manage versions.
     */
    async keepCurrentVersion(fileId: string): Promise<DriveVersion> {
      const versions: (DriveVersion & { keepForever?: boolean })[] = []
      let pageToken = ''
      do {
        const params = new URLSearchParams({ fields: 'nextPageToken,revisions(id,modifiedTime,keepForever)', pageSize: '1000', ...(pageToken ? { pageToken } : {}) })
        const page = await call<{ revisions?: typeof versions; nextPageToken?: string }>(`${API}/files/${encodeURIComponent(fileId)}/revisions?${params}`)
        versions.push(...(page.revisions ?? []))
        pageToken = page.nextPageToken ?? ''
      } while (pageToken)
      const current = versions.at(-1)
      if (!current) throw new DriveError('drive_failed', 'Drive listed no versions for the file being replaced.')
      if (!current.keepForever) {
        await call(`${API}/files/${encodeURIComponent(fileId)}/revisions/${encodeURIComponent(current.id)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keepForever: true }),
        })
      }
      return { id: current.id, modifiedTime: current.modifiedTime }
    },
  }
}

/** One file a preset publishes: a subfolder of the CVs folder, and a name without `.pdf`. */
export type PublishTarget = { preset: string; folder: string; name: string }
/** A target found in Drive: its folder, and the file to update, if there is one yet. */
export type PlannedTarget = PublishTarget & { folderId: string; fileId?: string }

/**
 * Finds every target before any is written, so a folder renamed in Drive or a
 * typo in presets.yml publishes nothing rather than half.
 */
export async function planTargets(drive: DriveClient, rootId: string, targets: readonly PublishTarget[]): Promise<PlannedTarget[]> {
  const folders = await drive.children(rootId, { folders: true })
  const plans: PlannedTarget[] = []
  for (const target of targets) {
    const matches = folders.filter(folder => folder.name === target.folder)
    if (matches.length !== 1) {
      throw new DriveError('unknown_folder', matches.length
        ? `${target.preset}: the CVs folder holds ${matches.length} folders named "${target.folder}".`
        : `${target.preset}: the CVs folder holds no folder named "${target.folder}".`)
    }
    const files = await drive.children(matches[0].id, { name: `${target.name}.pdf` })
    if (files.length > 1) {
      throw new DriveError('ambiguous_file', `${target.preset}: ${target.folder} holds ${files.length} files named "${target.name}.pdf". Remove the extra ones.`)
    }
    plans.push({ ...target, folderId: matches[0].id, fileId: files[0]?.id })
  }
  return plans
}

export type PublishResult = PlannedTarget & {
  action: 'updated' | 'created'
  fileId: string
  link?: string
  /** The version this update replaced, when it was kept. */
  kept?: DriveVersion
}

/**
 * Puts one PDF where its plan says: new content for the file there, or a new
 * file. Going by name makes a retry safe: a file created on the first attempt
 * is found and updated on the second, never duplicated.
 */
export async function publishTarget(drive: DriveClient, plan: PlannedTarget, pdf: { bytes: Uint8Array; md5: string }, options: { keepPrevious?: boolean } = {}): Promise<PublishResult> {
  const kept = plan.fileId && options.keepPrevious ? await drive.keepCurrentVersion(plan.fileId) : undefined
  let fileId = plan.fileId
  if (fileId) await drive.updatePdf(fileId, pdf.bytes)
  else fileId = await drive.createPdf(plan.folderId, `${plan.name}.pdf`, pdf.bytes)
  const { md5, link } = await drive.checksum(fileId)
  if (md5 !== pdf.md5) {
    throw new DriveError('checksum_mismatch', `${plan.preset}: Drive holds different bytes for ${plan.folder}/${plan.name}.pdf than were sent.`)
  }
  return { ...plan, fileId, action: plan.fileId ? 'updated' : 'created', link, ...(kept ? { kept } : {}) }
}
