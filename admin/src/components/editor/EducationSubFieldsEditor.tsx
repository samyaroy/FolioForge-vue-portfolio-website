import { Plus, Trash2 } from 'lucide-react'
import { Button, IconButton, TextField } from '@/components/form'

type SubField = Record<string, unknown>
type EducationSubFieldsEditorProps = {
  subFields: SubField[]
  onChange: (subFields: SubField[]) => void
}

export function EducationSubFieldsEditor({ subFields, onChange }: EducationSubFieldsEditorProps) {
  const update = (index: number, key: string, value: string) => {
    onChange(subFields.map((item, position) => position === index ? { ...item, [key]: value } : item))
  }

  return (
    <div className="education-subfields-editor">
      <div className="experience-projects-heading"><h3>Sub-fields <span>{subFields.length}</span></h3><Button variant="outline" size="sm" onClick={() => onChange([...subFields, { label: '', name: '', cred_link: '' }])}><Plus aria-hidden="true" /> Add sub-field</Button></div>
      {subFields.map((item, index) => (
        <section className="education-subfield" key={index} aria-label={`Sub-field ${index + 1}`}>
          <header><h4>Sub-field {index + 1}</h4><IconButton label={`Remove sub-field ${index + 1}`} title="Remove sub-field" onClick={() => onChange(subFields.filter((_, position) => position !== index))}><Trash2 aria-hidden="true" /></IconButton></header>
          <div className="education-subfield-inputs">
            <TextField label="Label" value={String(item.label ?? '')} placeholder="Minor or Specialization" onChange={value => update(index, 'label', value)} />
            <TextField label="Name" value={String(item.name ?? '')} onChange={value => update(index, 'name', value)} />
            <TextField label="Credential (Drive file ID / URL)" value={String(item.cred_link ?? '')} onChange={value => update(index, 'cred_link', value)} />
          </div>
        </section>
      ))}
    </div>
  )
}
