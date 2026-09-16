import { useMemo, useState } from 'react'
import { Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PortfolioEntry } from '@/data/portfolioEntries'

type EntryEditorDialogProps = {
  entry?: PortfolioEntry
  fieldGroups: string[]
  onClose: () => void
  onSave: (entry: PortfolioEntry) => void
}

function editableValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value)
  return JSON.stringify(value, null, 2)
}

function fieldKey(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '')
}

export function EntryEditorDialog({ entry, fieldGroups, onClose, onSave }: EntryEditorDialogProps) {
  const initialFields = useMemo(() => {
    if (entry) return Object.fromEntries(Object.entries(entry.raw).map(([key, value]) => [key, editableValue(value)]))
    return Object.fromEntries(fieldGroups.map(label => [fieldKey(label), '']))
  }, [entry, fieldGroups])
  const [title, setTitle] = useState(entry?.title ?? '')
  const [subtitle, setSubtitle] = useState(entry?.subtitle ?? '')
  const [fields, setFields] = useState<Record<string, string>>(initialFields)

  const saveEntry = () => {
    const cleanTitle = title.trim() || 'Untitled entry'
    onSave({
      id: entry?.id ?? `local-${Date.now()}`,
      title: cleanTitle,
      subtitle: subtitle.trim(),
      raw: fields,
    })
  }

  return (
    <div className="entry-dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="entry-dialog" role="dialog" aria-modal="true" aria-label={entry ? `Edit ${entry.title}` : 'Add entry'} onMouseDown={event => event.stopPropagation()}>
        <header>
          <div><span>{entry ? 'Edit entry' : 'New entry'}</span><h2>{entry?.title ?? 'Add collection entry'}</h2></div>
          <button type="button" aria-label="Close editor" onClick={onClose}><X aria-hidden="true" /></button>
        </header>
        <div className="entry-dialog-body">
          <label className="field"><span>Display title</span><input autoFocus value={title} onChange={event => setTitle(event.target.value)} placeholder="Entry title" /></label>
          <label className="field"><span>List summary</span><input value={subtitle} onChange={event => setSubtitle(event.target.value)} placeholder="Date, organisation, role, or status" /></label>
          <div className="entry-field-divider"><span>Entry fields</span><small>{Object.keys(fields).length}</small></div>
          {Object.entries(fields).map(([key, value]) => {
            const isStructured = value.includes('\n') || value.startsWith('{') || value.startsWith('[')
            return (
              <label className="field" key={key}>
                <span>{key.replaceAll('_', ' ')}</span>
                {isStructured
                  ? <textarea value={value} onChange={event => setFields(current => ({ ...current, [key]: event.target.value }))} />
                  : <input value={value} onChange={event => setFields(current => ({ ...current, [key]: event.target.value }))} />}
              </label>
            )
          })}
        </div>
        <footer><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={saveEntry}><Save aria-hidden="true" /> Save local change</Button></footer>
      </section>
    </div>
  )
}
