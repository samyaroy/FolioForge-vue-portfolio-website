import { Plus, Trash2 } from 'lucide-react'
import { Button, IconButton, TextField } from '@/components/form'

type SubField = Record<string, unknown>
type EducationSubFieldsEditorProps = {
  subFields: SubField[]
  onChange: (subFields: SubField[]) => void
}

/** A sub-field's names, however the file writes them: one string or a list. */
function subFieldNames(value: unknown): string[] {
  if (Array.isArray(value)) return value.length ? value.map(name => String(name ?? '')) : ['']
  return [String(value ?? '')]
}

export function EducationSubFieldsEditor({ subFields, onChange }: EducationSubFieldsEditorProps) {
  const update = (index: number, key: string, value: unknown) => {
    onChange(subFields.map((item, position) => position === index ? { ...item, [key]: value } : item))
  }
  // One name stays a plain string, so the file only grows a list when it holds several.
  const updateNames = (index: number, names: string[]) => update(index, 'name', names.length === 1 ? names[0] : names)

  return (
    <div className="education-subfields-editor">
      <div className="experience-projects-heading"><h3>Sub-fields <span>{subFields.length}</span></h3><Button variant="outline" size="sm" onClick={() => onChange([...subFields, { label: '', name: '', cred_link: '' }])}><Plus aria-hidden="true" /> Add sub-field</Button></div>
      {subFields.map((item, index) => {
        const names = subFieldNames(item.name)
        return (
          <section className="education-subfield" key={index} aria-label={`Sub-field ${index + 1}`}>
            <header><h4>Sub-field {index + 1}</h4><IconButton label={`Remove sub-field ${index + 1}`} title="Remove sub-field" onClick={() => onChange(subFields.filter((_, position) => position !== index))}><Trash2 aria-hidden="true" /></IconButton></header>
            <div className="education-subfield-inputs">
              <TextField label="Label" required value={String(item.label ?? '')} placeholder="Minor or Specialization" onChange={value => update(index, 'label', value)} />
              <TextField label="Credential (Drive file ID / URL)" value={String(item.cred_link ?? '')} onChange={value => update(index, 'cred_link', value)} />
            </div>
            {/* The site joins these with "and": "Minor in A and B". */}
            <div className="education-subfield-names">
              <span className="education-subfield-names-caption">Names <small>joined with “and”</small></span>
              {names.map((name, nameIndex) => (
                <div className="education-subfield-name" key={nameIndex}>
                  <TextField aria-label={`Sub-field ${index + 1} name ${nameIndex + 1}`} required value={name} onChange={value => updateNames(index, names.map((current, position) => position === nameIndex ? value : current))} />
                  {names.length > 1 && <IconButton label={`Remove sub-field ${index + 1} name ${nameIndex + 1}`} title="Remove name" onClick={() => updateNames(index, names.filter((_, position) => position !== nameIndex))}><Trash2 aria-hidden="true" /></IconButton>}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => updateNames(index, [...names, ''])}><Plus aria-hidden="true" /> Add name</Button>
            </div>
          </section>
        )
      })}
    </div>
  )
}
