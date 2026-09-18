export class HttpError extends Error {
  status: number
  code: string
  /** Why the request was denied. Written to the log, never sent to the caller. */
  reason?: string

  constructor(status: number, code: string, reason?: string) {
    super(code)
    this.status = status
    this.code = code
    this.reason = reason
  }
}

export function json(body: unknown, status = 200) {
  return Response.json(body, { status })
}

export function secureResponse(response: Response) {
  const headers = new Headers(response.headers)
  headers.set('cache-control', 'no-store')
  // Everything the admin needs is served from this origin. `unsafe-inline` stays
  // only for style, which the dialog and select primitives set as attributes;
  // script has no such exception. `img-src https:` is deliberately wide, because
  // logo and cover fields may name any host the owner has authored.
  headers.set('content-security-policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https: blob: data:; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'")
  headers.set('x-content-type-options', 'nosniff')
  headers.set('referrer-policy', 'no-referrer')
  headers.set('permissions-policy', 'camera=(), microphone=(), geolocation=()')
  headers.set('x-frame-options', 'DENY')
  headers.set('strict-transport-security', 'max-age=31536000')
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
}
