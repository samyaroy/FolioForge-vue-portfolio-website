import { useState } from 'react'
import { Download, LoaderCircle, Play, TriangleAlert } from 'lucide-react'
import { BuildLog } from '@/components/cv/BuildLog'
import { BuildOutline } from '@/components/cv/BuildOutline'
import { PdfPreview } from '@/components/cv/PdfPreview'
import { Button, IconButton, SwitchField } from '@/components/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { COMPILE_UNAVAILABLE } from '@/cv/compile/compiler'
import type { BuildInput } from '@/cv/schema'
import type { CompileMode, useCvCompile } from '@/hooks/useCvCompile'
import { downloadBytes } from '@/lib/download'

type CompilePanelProps = {
  compile: ReturnType<typeof useCvCompile>
  mode: CompileMode
  onModeChange: (mode: CompileMode) => void
  /** Whether there is any source to compile. */
  canCompile: boolean
  filename: string
  budget?: number
  outline: { input: BuildInput; hash: string } | null
  onGoToLine: (line: number) => void
}

/**
 * What the CV prints: the compiled PDF, the build log, and the content check.
 * The last PDF stays up while the next compile runs, as in Overleaf.
 */
export function CompilePanel({ compile, mode, onModeChange, canCompile, filename, budget, outline, onGoToLine }: CompilePanelProps) {
  const [tab, setTab] = useState('pdf')
  const { result, running, outdated, error, available } = compile
  const pdf = result?.pdf ?? null
  const problems = result ? result.parsed.errors.length : 0
  const notes = result ? result.parsed.warnings.length + result.parsed.boxes.length : 0
  const goTo = (line: number) => onGoToLine(line)

  return (
    <section className="cv-panel cv-preview" aria-label="Preview">
      <div className="cv-panel-heading">
        <div>
          <span>Preview</span>
          <h2>{running ? 'Compiling…' : result ? status(result.parsed.pages, pdf) : available ? 'Not compiled yet' : 'Compiling unavailable'}</h2>
        </div>
        <div className="cv-panel-actions">
          <SwitchField label="Auto" checked={mode === 'auto'} disabled={!available} onChange={on => onModeChange(on ? 'auto' : 'manual')} fieldClassName="cv-auto-switch" />
          <Button size="sm" disabled={!available || !canCompile || (running && mode === 'auto')} onClick={compile.compile} title="Recompile (⌘/Ctrl+Enter)">
            {running ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Play aria-hidden="true" />}Recompile
          </Button>
          <IconButton label="Download PDF" variant="outline" disabled={!pdf} onClick={() => pdf && downloadBytes(`${filename}.pdf`, pdf)}><Download /></IconButton>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="cv-preview-tabs">
        <TabsList variant="line">
          <TabsTrigger value="pdf">PDF</TabsTrigger>
          <TabsTrigger value="logs">
            Logs
            {problems > 0 && <span className="cv-count cv-count-error">{problems}</span>}
            {notes > 0 && <span className="cv-count">{notes}</span>}
          </TabsTrigger>
          <TabsTrigger value="outline">Content check</TabsTrigger>
        </TabsList>

        <TabsContent value="pdf">
          {!available && <p className="cv-preview-note">{COMPILE_UNAVAILABLE}</p>}
          {error && <p className="cv-preview-note cv-preview-note-error"><TriangleAlert aria-hidden="true" />{error}</p>}
          {result?.outcome === 'errors' && (
            <p className="cv-preview-note cv-preview-note-error">
              <TriangleAlert aria-hidden="true" />Built with {problems === 1 ? 'an error' : `${problems} errors`}: this is the PDF pdfTeX recovered, not one to send.
              <Button variant="link" size="xs" onClick={() => setTab('logs')}>See the log</Button>
            </p>
          )}
          {outdated && !running && <p className="cv-preview-note">The source has changed since this PDF. Recompile to update it.</p>}
          {pdf
            ? <PdfPreview pdf={pdf} />
            : result && <BuildLog result={result} budget={budget} onGoToLine={goTo} />}
        </TabsContent>
        <TabsContent value="logs">
          {result
            ? <BuildLog result={result} budget={budget} onGoToLine={goTo} />
            : <p className="cv-preview-note">{available ? 'The log appears after the first compile.' : COMPILE_UNAVAILABLE}</p>}
        </TabsContent>
        <TabsContent value="outline">
          {outline
            ? <BuildOutline input={outline.input} hash={outline.hash} />
            : <p className="cv-preview-note">Nothing to check until the problems above are fixed.</p>}
        </TabsContent>
      </Tabs>

      {compile.label && result && <p className="cv-panel-foot">Compiled by {compile.label}</p>}
    </section>
  )
}

function status(pages: number | null, pdf: Uint8Array | null) {
  if (!pdf) return 'No PDF'
  const size = `${Math.round(pdf.byteLength / 1024)} KB`
  return pages === null ? size : `${pages} ${pages === 1 ? 'page' : 'pages'} · ${size}`
}
