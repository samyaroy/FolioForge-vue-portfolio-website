import { useCallback, useEffect, useRef, useState } from 'react'
import { cvCompiler, type CompileResult } from '@/cv/compile/compiler'

/** On Compile is the default; Auto Compile follows the source (cv_architecture.md §7.2). */
export type CompileMode = 'manual' | 'auto'

const AUTO_COMPILE_DELAY_MS = 1500

type CompileState = {
  running: boolean
  /** The last compile that finished, kept on screen while the next one runs. */
  result: CompileResult | null
  /** The .tex `result` was built from, to tell when the preview is out of date. */
  compiledTex: string | null
  /** The compile could not run at all, as opposed to TeX reporting errors. */
  error: string | null
}

/**
 * Compiles the builder's source: once when the builder opens, then on demand or,
 * in auto mode, 1.5 s after the last change. A newer compile cancels the one
 * still running, so the preview never lands out of order.
 */
export function useCvCompile(tex: string | null, mode: CompileMode) {
  const [state, setState] = useState<CompileState>({ running: false, result: null, compiledTex: null, error: null })
  const inFlight = useRef<AbortController | null>(null)

  const run = useCallback(async (source: string) => {
    if (!cvCompiler) return
    inFlight.current?.abort()
    const controller = new AbortController()
    inFlight.current = controller
    setState(current => ({ ...current, running: true, error: null }))
    try {
      const result = await cvCompiler.compile(source, controller.signal)
      if (!controller.signal.aborted) setState({ running: false, result, compiledTex: source, error: null })
    } catch (error) {
      if (!controller.signal.aborted) setState(current => ({ ...current, running: false, error: error instanceof Error ? error.message : 'The compile failed.' }))
    } finally {
      if (inFlight.current === controller) inFlight.current = null
    }
  }, [])

  // The first source the builder has is compiled straight away, so the preview
  // is never blank on arrival; later sources wait for the mode to ask.
  const nothingYet = state.compiledTex === null && !state.running && state.error === null
  useEffect(() => {
    if (tex === null || !nothingYet) return
    const timer = setTimeout(() => void run(tex), 0)
    return () => clearTimeout(timer)
  }, [tex, nothingYet, run])

  useEffect(() => {
    if (mode !== 'auto' || tex === null || tex === state.compiledTex) return
    const timer = setTimeout(() => void run(tex), AUTO_COMPILE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [mode, tex, state.compiledTex, run])

  useEffect(() => () => inFlight.current?.abort(), [])

  return {
    available: cvCompiler !== null,
    label: cvCompiler?.label ?? null,
    ...state,
    outdated: state.result !== null && tex !== null && tex !== state.compiledTex,
    compile: useCallback(() => { if (tex !== null) void run(tex) }, [tex, run]),
  }
}
