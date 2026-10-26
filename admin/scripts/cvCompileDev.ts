/**
 * `vite dev` only: compiles the CV builder's .tex with this machine's pdflatex,
 * so the preview works locally while the browser engine is not yet vendored
 * (cv_architecture.md §8). `apply: 'serve'` keeps it out of the build, so the
 * deployed admin never has this route.
 *
 * One work folder is reused for the whole dev session, as the engine reuses its
 * /work: the .aux and .out from the last compile save hyperref its second pass.
 * Compiles therefore run one at a time.
 */
import { spawn } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { tmpdir } from 'node:os'
import path from 'node:path'
import type { Plugin } from 'vite'
import { parseLog } from '../src/cv/compile/parseLog.ts'

export const CV_COMPILE_ENDPOINT = '/__cv/compile'
const MAX_TEX_BYTES = 1_000_000
// The same limit the engine wrapper puts on a compile (§7.2).
const TIMEOUT_MS = 30_000
const MAX_PASSES = 3

class HttpError extends Error {
  readonly status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export function cvCompileDev(): Plugin {
  let workDir: Promise<string> | undefined
  let queue: Promise<unknown> = Promise.resolve()

  const exclusive = <T>(job: () => Promise<T>): Promise<T> => {
    const next = queue.then(job, job)
    queue = next.catch(() => undefined)
    return next
  }

  return {
    name: 'cv-compile-dev',
    apply: 'serve',
    configureServer(server) {
      server.httpServer?.once('close', () => {
        void workDir?.then(dir => rm(dir, { recursive: true, force: true }))
      })
      server.middlewares.use(CV_COMPILE_ENDPOINT, (req, res) => {
        const aborted = new AbortController()
        res.once('close', () => { if (!res.writableEnded) aborted.abort() })
        void handle(req, aborted.signal)
          .then(body => send(res, 200, body))
          .catch(error => send(res, error instanceof HttpError ? error.status : 500, { error: error instanceof Error ? error.message : 'The compile failed.' }))
      })
    },
  }

  async function handle(req: IncomingMessage, signal: AbortSignal) {
    if (req.method !== 'POST') throw new HttpError(405, 'POST the .tex to compile.')
    // The custom header makes a cross-site request preflight, which this route
    // never answers; the origin check covers other local pages.
    const origin = req.headers.origin
    if (req.headers['x-cv-compile'] !== '1' || (origin && origin !== `http://${req.headers.host}`)) {
      throw new HttpError(403, 'Only the admin may compile.')
    }
    const tex = await readBody(req)
    workDir ??= mkdtemp(path.join(tmpdir(), 'folioforge-cv-'))
    const dir = await workDir
    return exclusive(() => compile(dir, tex, signal))
  }
}

async function compile(dir: string, tex: string, signal: AbortSignal) {
  // Superseded while it waited its turn.
  if (signal.aborted) throw new HttpError(499, 'The compile was cancelled.')
  const started = Date.now()
  await writeFile(path.join(dir, 'main.tex'), tex)
  // A run that stops early leaves the last PDF behind; never return that one.
  await rm(path.join(dir, 'main.pdf'), { force: true })
  let log = ''
  let passes = 0
  while (passes < MAX_PASSES) {
    passes++
    await run(dir, signal)
    log = await readFile(path.join(dir, 'main.log'), 'utf8').catch(() => '')
    const parsed = parseLog(log)
    if (!parsed.rerun || parsed.errors.length) break
  }
  const pdf = await readFile(path.join(dir, 'main.pdf')).catch(() => null)
  return { log, pdf: pdf?.toString('base64') ?? null, passes, ms: Date.now() - started }
}

function run(dir: string, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn('pdflatex', ['-interaction=nonstopmode', '-no-shell-escape', 'main.tex'], {
      cwd: dir,
      // Paranoid reads: TeX may open what kpathsea finds and files beside
      // main.tex, but not an absolute path an edited .tex names.
      env: { ...process.env, openin_any: 'p', openout_any: 'p' },
      stdio: 'ignore',
      signal,
      timeout: TIMEOUT_MS,
    })
    child.once('error', error => {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') reject(new HttpError(501, 'pdflatex is not installed, or not on the PATH vite was started from.'))
      else if (error.name === 'AbortError') reject(new HttpError(499, 'The compile was cancelled.'))
      else reject(error)
    })
    // A non-zero exit only means TeX reported errors; the log says which.
    child.once('close', (_code, killedBy) => {
      if (killedBy === 'SIGTERM' && !signal.aborted) reject(new HttpError(504, `The compile ran past ${TIMEOUT_MS / 1000} s and was stopped.`))
      else resolve()
    })
  })
}

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req) {
    size += (chunk as Buffer).length
    if (size > MAX_TEX_BYTES) throw new HttpError(413, 'The .tex is larger than 1 MB.')
    chunks.push(chunk as Buffer)
  }
  return Buffer.concat(chunks).toString('utf8')
}

function send(res: ServerResponse, status: number, body: unknown) {
  if (res.writableEnded || res.destroyed) return
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}
