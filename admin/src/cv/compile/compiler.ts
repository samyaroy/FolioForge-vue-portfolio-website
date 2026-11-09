import { parseLog, type CompileLog } from './parseLog.ts'

/**
 * What one compile produced. The builder never sees which TeX ran it: today
 * that is this machine's pdflatex behind `vite dev` (scripts/cvCompileDev.ts);
 * the vendored browser engine (cv_architecture.md §8) will be the other.
 */
export type CompileResult = {
  /** `errors`: pdfTeX recovered and wrote a PDF anyway, so it is shown but the build has failed. */
  outcome: 'ok' | 'errors' | 'failed'
  pdf: Uint8Array<ArrayBuffer> | null
  log: string
  parsed: CompileLog
  passes: number
  ms: number
}

export type CvCompiler = {
  /** Names the TeX in the build console, so a preview is never mistaken for the deployed engine's. */
  label: string
  compile: (tex: string, signal: AbortSignal) => Promise<CompileResult>
}

export function compileResult(log: string, pdf: Uint8Array<ArrayBuffer> | null, passes: number, ms: number): CompileResult {
  const parsed = parseLog(log)
  const outcome = !pdf ? 'failed' : parsed.errors.length ? 'errors' : 'ok'
  return { outcome, pdf, log, parsed, passes, ms }
}

const localPdflatex: CvCompiler = {
  label: 'pdflatex on this machine (vite dev)',
  async compile(tex, signal) {
    const response = await fetch('/__cv/compile', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-CV-Compile': '1' },
      body: tex,
      signal,
    })
    const body = await response.json().catch(() => ({})) as { log?: string; pdf?: string | null; passes?: number; ms?: number; error?: string }
    if (!response.ok) throw new Error(body.error ?? `The compile failed (${response.status}).`)
    const pdf = body.pdf ? Uint8Array.from(atob(body.pdf), char => char.charCodeAt(0)) : null
    return compileResult(body.log ?? '', pdf, body.passes ?? 1, body.ms ?? 0)
  },
}

/** Null where nothing can compile yet: the deployed admin, until the engine is vendored. */
export const cvCompiler: CvCompiler | null = import.meta.env.DEV ? localPdflatex : null

export const COMPILE_UNAVAILABLE =
  'Compiling here needs the browser TeX engine, which is not installed yet. Run the admin with npm run dev to preview with this machine’s pdflatex, or download the .tex.'
