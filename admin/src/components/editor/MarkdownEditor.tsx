import { useRef } from 'react'
import { Bold, Code, Heading2, Italic, Link as LinkIcon, List } from 'lucide-react'

type MarkdownEditorProps = {
  value: string
  onChange: (value: string) => void
}

const controls = [
  { label: 'Heading', icon: Heading2, before: '## ', after: '' },
  { label: 'Bold', icon: Bold, before: '**', after: '**' },
  { label: 'Italic', icon: Italic, before: '_', after: '_' },
  { label: 'Link', icon: LinkIcon, before: '[', after: '](https://)' },
  { label: 'List', icon: List, before: '- ', after: '' },
  { label: 'Inline code', icon: Code, before: '`', after: '`' },
]

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const wrapSelection = (before: string, after: string) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const nextValue = `${value.slice(0, start)}${before}${value.slice(start, end)}${after}${value.slice(end)}`
    onChange(nextValue)
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, end + before.length)
    })
  }

  return (
    <div className="markdown-editor">
      <div className="editor-toolbar" aria-label="Markdown formatting">
        {controls.map(control => {
          const Icon = control.icon
          return <button key={control.label} type="button" title={control.label} aria-label={control.label} onClick={() => wrapSelection(control.before, control.after)}><Icon aria-hidden="true" /></button>
        })}
      </div>
      <textarea ref={textareaRef} value={value} onChange={event => onChange(event.target.value)} aria-label="Post body" placeholder="Start writing in Markdown..." />
    </div>
  )
}
