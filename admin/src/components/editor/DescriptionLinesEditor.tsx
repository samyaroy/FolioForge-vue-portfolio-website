import { Plus, Trash2 } from 'lucide-react'
import { Button, IconButton, TextareaField } from '@/components/form'

type DescriptionLinesEditorProps = {
  lines: string[]
  onChange: (lines: string[]) => void
}

export function DescriptionLinesEditor({ lines, onChange }: DescriptionLinesEditorProps) {
  return (
    <div className="description-lines-editor">
      <div className="experience-projects-heading">
        <h3>Description <span>{lines.length}</span></h3>
        <Button variant="outline" size="sm" onClick={() => onChange([...lines, ''])}><Plus aria-hidden="true" /> Add line</Button>
      </div>
      {lines.map((line, index) => (
        <div className="description-line" key={index}>
          <TextareaField label={`Line ${index + 1}`} required value={line} onChange={value => onChange(lines.map((current, position) => position === index ? value : current))} />
          <IconButton label={`Remove description line ${index + 1}`} title="Remove line" onClick={() => onChange(lines.filter((_, position) => position !== index))}><Trash2 aria-hidden="true" /></IconButton>
        </div>
      ))}
    </div>
  )
}
