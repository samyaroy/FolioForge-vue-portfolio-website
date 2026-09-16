import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
          <header><h4>Sub-field {index + 1}</h4><Button variant="ghost" size="icon-sm" title="Remove sub-field" aria-label={`Remove sub-field ${index + 1}`} onClick={() => onChange(subFields.filter((_, position) => position !== index))}><Trash2 aria-hidden="true" /></Button></header>
          <div className="education-subfield-inputs">
            <label className="field"><span>Label</span><input value={String(item.label ?? '')} placeholder="Minor or Specialization" onChange={event => update(index, 'label', event.target.value)} /></label>
            <label className="field"><span>Name</span><input value={String(item.name ?? '')} onChange={event => update(index, 'name', event.target.value)} /></label>
            <label className="field"><span>Credential (Drive file ID / URL)</span><input value={String(item.cred_link ?? '')} onChange={event => update(index, 'cred_link', event.target.value)} /></label>
          </div>
        </section>
      ))}
    </div>
  )
}
