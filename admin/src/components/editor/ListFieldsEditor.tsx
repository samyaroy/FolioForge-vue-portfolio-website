import { Plus, Trash2 } from 'lucide-react'
import { Button, IconButton, TextField } from '@/components/form'
import { RoleLinkField } from '@/components/editor/RoleLinkField'
import { fieldCaption } from '@/lib/fieldNames'
import { blankRow, keptCount, rowKey, visibleColumns, type ListFieldsRow } from '@/lib/listFields'
import { CREDENTIAL_KEY, hasRoleLink, WEBSITE_KEY } from '@/lib/roleLinks'

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
  // A role's credential and website are one choice, which needs a card's width.
  const linked = hasRoleLink(columns)
  const stacked = columns.length > 3 || linked
  const update = (index: number, change: ListFieldsRow) => {
    onChange(rows.map((row, position) => position === index ? { ...row, ...change } : row))
  }
  /** One column of a card: the link choice, a kept value, or a text box. */
  const cardField = (row: ListFieldsRow, index: number, key: string) => {
    if (linked && key === WEBSITE_KEY) return null
    if (linked && key === CREDENTIAL_KEY) {
      return (
        <RoleLinkField
          key={key}
          credential={row[CREDENTIAL_KEY] ?? ''}
          website={row[WEBSITE_KEY] ?? ''}
          keptCredentials={keptCount(row, CREDENTIAL_KEY)}
          onChange={link => update(index, { [CREDENTIAL_KEY]: link.credential, [WEBSITE_KEY]: link.website })}
        />
      )
    }
    const kept = keptCount(row, key)
    if (kept !== undefined) {
      return <TextField key={key} label={fieldCaption(key)} value={`${kept} item${kept === 1 ? '' : 's'}, kept as is (edit in the YAML)`} readOnly disabled onChange={() => undefined} />
    }
    return <TextField key={key} label={fieldCaption(key)} value={row[key] ?? ''} onChange={value => update(index, { [key]: value })} />
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
        <section className="list-fields-card" key={rowKey(row, index)} aria-label={`${singular} ${index + 1}`}>
          <header>
            <h4>{singular} {index + 1}</h4>
            <IconButton label={`Remove ${singular.toLowerCase()} ${index + 1}`} title="Remove" onClick={() => onChange(rows.filter((_, position) => position !== index))}><Trash2 aria-hidden="true" /></IconButton>
          </header>
          <div className="list-fields-card-fields">
            {columns.map(key => cardField(row, index, key))}
          </div>
        </section>
      ) : (
        <div className="list-fields-row" key={rowKey(row, index)}>
          {columns.map(key => (
            <TextField
              key={key}
              aria-label={`${label} ${index + 1} ${fieldCaption(key).toLowerCase()}`}
              value={row[key] ?? ''}
              onChange={value => update(index, { [key]: value })}
            />
          ))}
          <IconButton label={`Remove ${label.toLowerCase()} ${index + 1}`} title="Remove" onClick={() => onChange(rows.filter((_, position) => position !== index))}><Trash2 aria-hidden="true" /></IconButton>
        </div>
      ))}
    </div>
  )
}
