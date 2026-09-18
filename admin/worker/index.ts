import type { JWTVerifyGetKey } from 'jose'
import { authenticate } from './auth/access.ts'
import { protectMutation } from './auth/csrf.ts'
import { securityConfig } from './config.ts'
import { HttpError, json, secureResponse } from './http.ts'
import { apiResponse } from './routes/api.ts'
import type { WorkerEnv } from './types.ts'

/**
 * A denial is the only event worth alerting on while the admin is read-only, so
 * it is the only thing recorded. The entry identifies the request and nothing
 * else: no Access token, no headers, no query string, no identity.
 */
function logDenial(request: Request, error: unknown): HttpError {
  const denial = error instanceof HttpError ? error : new HttpError(503, 'service_unavailable')
  console.warn(JSON.stringify({
    event: 'admin_request_denied',
    status: denial.status,
    code: denial.code,
    reason: denial.reason ?? (error instanceof HttpError ? undefined : error instanceof Error ? error.name : 'unknown'),
    method: request.method,
    path: new URL(request.url).pathname,
    ray: request.headers.get('cf-ray'),
  }))
  return denial
}

export function createAdminWorker(keys?: JWTVerifyGetKey) {
  return {
    async fetch(request: Request, env: WorkerEnv): Promise<Response> {
      try {
        const config = securityConfig(env)
        const url = new URL(request.url)
        if (url.origin !== config.origin) throw new HttpError(403, 'hostname_not_allowed')
        const identity = await authenticate(request, config, keys)
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) await protectMutation(request, identity, config.origin, config.csrfSecret)
        if (!['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) throw new HttpError(405, 'method_not_allowed')
        if (url.pathname === '/api' || url.pathname.startsWith('/api/')) return secureResponse(await apiResponse(request, env, config, identity))
        if (request.method !== 'GET' && request.method !== 'HEAD') throw new HttpError(405, 'method_not_allowed')
        return secureResponse(await env.ASSETS.fetch(request))
      } catch (error) {
        const denial = logDenial(request, error)
        return secureResponse(json({ error: denial.code }, denial.status))
      }
    },
  }
}

export default createAdminWorker()
