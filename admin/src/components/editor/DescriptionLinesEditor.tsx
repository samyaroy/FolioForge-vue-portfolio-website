import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
          <label className="field"><span>Line {index + 1}</span><textarea value={line} onChange={event => onChange(lines.map((value, position) => position === index ? event.target.value : value))} /></label>
          <Button variant="ghost" size="icon-sm" title="Remove line" aria-label={`Remove description line ${index + 1}`} onClick={() => onChange(lines.filter((_, position) => position !== index))}><Trash2 aria-hidden="true" /></Button>
        </div>
      ))}
    </div>
  )
}
