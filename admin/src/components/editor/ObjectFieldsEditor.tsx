import { TextField } from '@/components/form'
import { fieldCaption } from '@/lib/fieldNames'
import type { ObjectFieldsDraft } from '@/lib/objectFields'

type ObjectFieldsEditorProps = {
  /** The entry key being edited, e.g. `guide` or `publication`. */
  name: string
  draft: ObjectFieldsDraft
  onChange: (draft: ObjectFieldsDraft) => void
}

export function ObjectFieldsEditor({ name, draft, onChange }: ObjectFieldsEditorProps) {
  const entries = Object.entries(draft)
  const [head] = entries[0] ?? []

  return (
    <div className="object-fields-editor">
      <div className="faculty-editor-heading"><span>{fieldCaption(name)}</span></div>
      <div className="object-fields-grid">
        {entries.map(([key, value]) => (
          <TextField
            key={key}
            label={fieldCaption(key)}
            // The head field carries the rest, so it is only mandatory once
            // something else in the group is filled in.
            required={key === head && entries.some(([other, text]) => other !== head && text.trim())}
            value={value}
            onChange={next => onChange({ ...draft, [key]: next })}
          />
        ))}
      </div>
    </div>
  )
}
