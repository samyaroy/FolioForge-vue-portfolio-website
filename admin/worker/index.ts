import type { JWTVerifyGetKey } from 'jose'
import { authenticate } from './auth/access.ts'
import { protectMutation } from './auth/csrf.ts'
import { securityConfig } from './config.ts'
import { HttpError, json, secureResponse } from './http.ts'
import { apiResponse } from './routes/api.ts'
import type { WorkerEnv } from './types.ts'

export function createAdminWorker(keys?: JWTVerifyGetKey) {
  return {
    async fetch(request: Request, env: WorkerEnv): Promise<Response> {
      try {
        const config = securityConfig(env)
        const url = new URL(request.url)
        if (url.origin !== config.origin) throw new HttpError(403, 'hostname_not_allowed')
        const identity = await authenticate(request, config, keys)
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) await protectMutation(request, identity, config.origin, env.CSRF_SECRET)
        if (!['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) throw new HttpError(405, 'method_not_allowed')
        if (url.pathname === '/api' || url.pathname.startsWith('/api/')) return secureResponse(await apiResponse(request, env, identity))
        if (request.method !== 'GET' && request.method !== 'HEAD') throw new HttpError(405, 'method_not_allowed')
        return secureResponse(await env.ASSETS.fetch(request))
      } catch (error) {
        if (error instanceof HttpError) return secureResponse(json({ error: error.code }, error.status))
        return secureResponse(json({ error: 'service_unavailable' }, 503))
      }
    },
  }
}

export default createAdminWorker()
