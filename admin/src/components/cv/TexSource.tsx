import { Suspense, lazy, type Ref } from 'react'
import { Copy, Download, PencilLine, RotateCcw, TriangleAlert } from 'lucide-react'
import { toast } from 'react-toastify'
import { Button } from '@/components/form'
import type { TexEditorHandle } from '@/components/cv/TexEditor'
import { downloadText } from '@/lib/download'

// CodeMirror is a third of a megabyte that only the builder needs, so it loads
// with the builder rather than with every admin page.
const TexEditor = lazy(() => import('@/components/cv/TexEditor').then(module => ({ default: module.TexEditor })))

/**
 * An editable copy of the generated .tex (cv_architecture.md §7.1). `base` is
 * the generated text it was made from, to tell when the configuration has
 * moved on since.
 */
export type TexOverride = { text: string; base: string }

type TexSourceProps = {
  /** Null while the configuration has problems and generates nothing. */
  generated: string | null
  override: TexOverride | null
  onOverride: (override: TexOverride | null) => void
  filename: string
  errorLines: number[]
  onCompile: () => void
  editorRef: Ref<TexEditorHandle>
}

/**
 * The LaTeX the CV compiles from. Generated mode is read-only and follows the
 * configuration beside it; an editable copy is for the odd fix the
 * configuration cannot express, applies to this build only, and never writes
 * back to CV content.
 */
export function TexSource({ generated, override, onOverride, filename, errorLines, onCompile, editorRef }: TexSourceProps) {
  const text = override?.text ?? generated
  const copy = () => navigator.clipboard.writeText(text ?? '').then(() => toast.success('LaTeX copied.'), () => toast.error('The browser would not copy.'))
  const leave = () => {
    if (override && override.text !== override.base && !window.confirm('Discard the edits to this copy and go back to the generated LaTeX?')) return
    onOverride(null)
  }

  return (
    <section className="cv-panel cv-source" aria-label="LaTeX source">
      <div className="cv-panel-heading">
        <div><span>{override ? 'Source · editable copy' : 'Source · generated'}</span><h2>{filename}.tex</h2></div>
        <div className="cv-panel-actions">
          {override
            ? <Button variant="outline" size="sm" onClick={leave}><RotateCcw aria-hidden="true" />Generated</Button>
            : <Button variant="outline" size="sm" disabled={generated === null} onClick={() => onOverride({ text: generated!, base: generated! })}><PencilLine aria-hidden="true" />Edit a copy</Button>}
          <Button variant="outline" size="sm" disabled={text === null} onClick={() => void copy()}><Copy aria-hidden="true" />Copy</Button>
          <Button variant="outline" size="sm" disabled={text === null} onClick={() => downloadText(`${filename}.tex`, text ?? '')}><Download aria-hidden="true" />.tex</Button>
        </div>
      </div>
      {override && (
        <div className="cv-source-note">
          <p><TriangleAlert aria-hidden="true" />Manual edits apply to this build only and never change CV content.</p>
          {generated !== null && generated !== override.base && (
            <p>
              The configuration has changed since this copy was made.
              <Button variant="link" size="xs" onClick={() => onOverride({ text: generated, base: generated })}>Replace with the new generated LaTeX</Button>
            </p>
          )}
        </div>
      )}
      {text === null
        ? <p className="cv-source-empty">The LaTeX appears once the problems above are fixed.</p>
        : (
          <Suspense fallback={<div className="cv-editor" aria-busy="true" />}>
            <TexEditor ref={editorRef} value={text} readOnly={!override} errorLines={errorLines} onChange={value => override && onOverride({ ...override, text: value })} onCompile={onCompile} />
          </Suspense>
        )}
      <p className="cv-panel-foot">
        {text === null ? 'Nothing generated yet' : `${text.split('\n').length} lines`}
        {' · '}
        {override ? 'your copy; Generated drops it' : 'generated from the configuration, so edit it there'}
        {' · '}⌘/Ctrl+Enter recompiles
      </p>
    </section>
  )
}
