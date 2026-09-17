import { Plus, Trash2 } from 'lucide-react'
import { Button, IconButton, TextField } from '@/components/form'
import { fieldCaption } from '@/lib/fieldNames'
import type { ListFieldsRow } from '@/lib/listFields'

type ListFieldsEditorProps = {
  /** The entry key being edited, e.g. `students`. */
  name: string
  fields: readonly string[]
  rows: ListFieldsRow[]
  onChange: (rows: ListFieldsRow[]) => void
}

export function ListFieldsEditor({ name, fields, rows, onChange }: ListFieldsEditorProps) {
  const label = fieldCaption(name)
  const columns = Object.keys(rows[0] ?? {}).length ? Object.keys(rows[0]) : fields
  const update = (index: number, key: string, value: string) => {
    onChange(rows.map((row, position) => position === index ? { ...row, [key]: value } : row))
  }

  return (
    <div className="list-fields-editor" style={{ '--list-columns': columns.length } as React.CSSProperties}>
      <div className="faculty-editor-heading">
        <span>{label} <small>{rows.length}</small></span>
        <Button variant="outline" size="sm" onClick={() => onChange([...rows, Object.fromEntries(columns.map(key => [key, '']))])}><Plus aria-hidden="true" /> Add {label.toLowerCase().replace(/s$/, '')}</Button>
      </div>
      {rows.length > 0 && (
        <div className="list-fields-row list-fields-captions" aria-hidden="true">
          {columns.map(key => <span key={key}>{fieldCaption(key)}</span>)}
        </div>
      )}
      {rows.map((row, index) => (
        <div className="list-fields-row" key={index}>
          {columns.map(key => (
            <TextField
              key={key}
              aria-label={`${label} ${index + 1} ${fieldCaption(key).toLowerCase()}`}
              value={row[key] ?? ''}
              onChange={value => update(index, key, value)}
            />
          ))}
          <IconButton label={`Remove ${label.toLowerCase()} ${index + 1}`} title="Remove" onClick={() => onChange(rows.filter((_, position) => position !== index))}><Trash2 aria-hidden="true" /></IconButton>
        </div>
      ))}
    </div>
  )
}
