import { useRef } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button, FieldLabel, IconButton, TextareaField } from '@/components/form'
import { FormattingToolbar } from '@/components/editor/FormattingToolbar'
import { MarkupPreview } from '@/components/editor/MarkupPreview'
// SUB-BULLET FEATURE (unused)
import { isSubBullet, subBulletOrdinal, toggleSubBullet } from '../../../../src/utils/bulletLines'

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
        <DescriptionLine
          // Lines have no id, so position is the only handle; removing one
          // re-renders the rest, which is cheap at this size.
          key={index}
          index={index}
          value={line}
          ordinal={subBulletOrdinal(lines, index)} // SUB-BULLET FEATURE (unused)
          onChange={value => onChange(lines.map((current, position) => position === index ? value : current))}
          onRemove={() => onChange(lines.filter((_, position) => position !== index))}
        />
      ))}
    </div>
  )
}

type DescriptionLineProps = {
  index: number
  value: string
  /** SUB-BULLET FEATURE (unused): where this line falls in its run. */
  ordinal: number
  onChange: (value: string) => void
  onRemove: () => void
}

/** One line, owning the textarea its own toolbar writes into. */
function DescriptionLine({ index, value, ordinal, onChange, onRemove }: DescriptionLineProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const label = `Line ${index + 1}`
  const nested = isSubBullet(value) // SUB-BULLET FEATURE (unused): always false today

  return (
    <div className="description-line">
      <div className="description-line-body">
        {/* The label is drawn here rather than by the field, so the toolbar can
            sit between it and the box it writes into. */}
        <FieldLabel label={label} required />
        <FormattingToolbar
          textareaRef={textareaRef}
          value={value}
          onChange={onChange}
          context={label}
          // SUB-BULLET FEATURE (unused): drop this prop to take the button away
          subBullet={{ active: nested, onToggle: () => onChange(toggleSubBullet(value)) }}
          crossReference
        />
        <TextareaField ref={textareaRef} aria-label={label} required value={value} onChange={onChange} />
        {/* Only worth the room once there is formatting to check. */}
        <MarkupPreview value={value} ordinal={ordinal} />
      </div>
      <IconButton label={`Remove description line ${index + 1}`} title="Remove line" onClick={onRemove}><Trash2 aria-hidden="true" /></IconButton>
    </div>
  )
}
