import { CircleAlert, CircleCheck, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/form'
import type { CompileResult } from '@/cv/compile/compiler'
import type { LogEntry } from '@/cv/compile/parseLog'

type BuildLogProps = {
  result: CompileResult
  /** The preset's page budget; running over it is a warning, not an error. */
  budget?: number
  onGoToLine: (line: number) => void
}

/** The build console (cv_architecture.md §7.3): the summary, then what TeX reported, then the raw log. */
export function BuildLog({ result, budget, onGoToLine }: BuildLogProps) {
  const { errors, warnings, boxes, pages } = result.parsed
  const overBudget = budget !== undefined && pages !== null && pages > budget

  return (
    <div className="cv-log">
      <p className={`cv-log-summary cv-log-${result.outcome}`}>
        {result.outcome === 'ok' ? <CircleCheck aria-hidden="true" /> : <CircleAlert aria-hidden="true" />}
        {result.outcome === 'ok' && 'Compiled'}
        {result.outcome === 'errors' && 'Built with errors'}
        {result.outcome === 'failed' && 'Build failed: no PDF'}
        <span>
          {pages !== null && `${pages} ${pages === 1 ? 'page' : 'pages'} · `}
          {count(errors.length, 'error')} · {count(warnings.length, 'warning')} · {count(boxes.length, 'box warning')} · {result.ms} ms
          {result.passes > 1 && ` · ${result.passes} passes`}
        </span>
      </p>
      {overBudget && <p className="cv-log-note"><TriangleAlert aria-hidden="true" />{pages} pages is over this preset’s {budget}-page budget.</p>}

      <Entries title="Errors" kind="error" entries={errors} onGoToLine={onGoToLine} />
      <Entries title="Warnings" kind="warning" entries={warnings} onGoToLine={onGoToLine} />
      <Entries title="Box warnings" kind="warning" entries={boxes} onGoToLine={onGoToLine} />

      <details className="cv-log-raw">
        <summary>Full log</summary>
        <pre>{result.log}</pre>
      </details>
    </div>
  )
}

function Entries({ title, kind, entries, onGoToLine }: { title: string; kind: 'error' | 'warning'; entries: LogEntry[]; onGoToLine: (line: number) => void }) {
  if (!entries.length) return null
  return (
    <section className="cv-log-group">
      <h3>{title} <span>{entries.length}</span></h3>
      <ul>
        {entries.map((entry, index) => (
          <li key={index} className={`cv-log-entry cv-log-entry-${kind}`}>
            <div>
              <p>{entry.message}</p>
              {entry.context && <code>l.{entry.line} {entry.context}</code>}
            </div>
            {entry.line !== null && (
              <Button variant="outline" size="xs" onClick={() => onGoToLine(entry.line!)}>Go to line {entry.line}</Button>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

const count = (n: number, noun: string) => `${n} ${noun}${n === 1 ? '' : 's'}`
