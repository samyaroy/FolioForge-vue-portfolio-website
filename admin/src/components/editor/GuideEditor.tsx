import { TextField } from '@/components/form'
import { fieldCaption } from '@/lib/fieldNames'
import type { GuideDraft } from '@/lib/guide'

type GuideEditorProps = {
  guide: GuideDraft
  onChange: (guide: GuideDraft) => void
}

export function GuideEditor({ guide, onChange }: GuideEditorProps) {
  return (
    <div className="guide-editor">
      <div className="faculty-editor-heading"><span>Guide</span></div>
      <div className="guide-editor-fields">
        {Object.entries(guide).map(([key, value]) => (
          <TextField
            key={key}
            label={fieldCaption(key)}
            // Only the name is needed; the card appends whatever else is filled in.
            required={key === 'name' && Object.entries(guide).some(([other, text]) => other !== 'name' && text.trim())}
            value={value}
            onChange={next => onChange({ ...guide, [key]: next })}
          />
        ))}
      </div>
    </div>
  )
}
