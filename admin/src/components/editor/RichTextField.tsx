import { useRef } from 'react'
import { FieldLabel, TextareaField } from '@/components/form'
import { FormattingToolbar } from '@/components/editor/FormattingToolbar'
import { MarkupPreview } from '@/components/editor/MarkupPreview'

type RichTextFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
}

/**
 * A prose field with the formatting the site renders.
 *
 * Any string SmartLink draws can carry **bold**, *italic* and __underline__, so
 * a description written anywhere gets the same controls the experience editor
 * has rather than only the one collection that was wired first.
 */
export function RichTextField({ label, value, onChange, required }: RichTextFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  return (
    <div className="description-line-body rich-text-field">
      {/* Drawn here rather than by the field, so the toolbar can sit between
          the caption and the box it writes into. */}
      <FieldLabel label={label} required={required} />
      <FormattingToolbar textareaRef={textareaRef} value={value} onChange={onChange} context={label} crossReference />
      <TextareaField ref={textareaRef} aria-label={label} required={required} value={value} onChange={onChange} />
      <MarkupPreview value={value} />
    </div>
  )
}
