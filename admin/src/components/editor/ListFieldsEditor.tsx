import { Plus, Trash2 } from 'lucide-react'
import { Button, IconButton, TextField } from '@/components/form'
import { fieldCaption } from '@/lib/fieldNames'
import { blankRow, visibleColumns, type ListFieldsRow } from '@/lib/listFields'

type ListFieldsEditorProps = {
  /** The entry key being edited, e.g. `students`. */
  name: string
  fields: readonly string[]
  rows: ListFieldsRow[]
  onChange: (rows: ListFieldsRow[]) => void
}

export function ListFieldsEditor({ name, fields, rows, onChange }: ListFieldsEditorProps) {
  const label = fieldCaption(name)
  const columns = visibleColumns(rows[0], fields)
  const singular = fieldCaption(name.replace(/s$/, ''))
  const stacked = columns.length > 3
  const update = (index: number, key: string, value: string) => {
    onChange(rows.map((row, position) => position === index ? { ...row, [key]: value } : row))
  }

  return (
    <div className="list-fields-editor" style={{ '--list-columns': columns.length } as React.CSSProperties}>
      <div className="faculty-editor-heading">
        <span>{label} <small>{rows.length}</small></span>
        <Button variant="outline" size="sm" onClick={() => onChange([...rows, blankRow(columns)])}><Plus aria-hidden="true" /> Add {singular.toLowerCase()}</Button>
      </div>
      {/* A couple of columns read well as a row; more than that needs a card,
          or each box is too narrow to show what is in it. */}
      {!stacked && rows.length > 0 && (
        <div className="list-fields-row list-fields-captions" aria-hidden="true">
          {columns.map(key => <span key={key}>{fieldCaption(key)}</span>)}
        </div>
      )}
      {rows.map((row, index) => stacked ? (
        <section className="list-fields-card" key={index} aria-label={`${singular} ${index + 1}`}>
          <header>
            <h4>{singular} {index + 1}</h4>
            <IconButton label={`Remove ${singular.toLowerCase()} ${index + 1}`} title="Remove" onClick={() => onChange(rows.filter((_, position) => position !== index))}><Trash2 aria-hidden="true" /></IconButton>
          </header>
          <div className="list-fields-card-fields">
            {columns.map(key => (
              <TextField
                key={key}
                label={fieldCaption(key)}
                value={row[key] ?? ''}
                onChange={value => update(index, key, value)}
              />
            ))}
          </div>
        </section>
      ) : (
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
