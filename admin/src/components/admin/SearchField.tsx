import { Search, X } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { IconButton, TextField } from '@/components/form'

type SearchFieldProps = {
  value: string
  onChange: (value: string) => void
  placeholder: string
  label?: string
}

export function ExpandableSearchField({ value, onChange, placeholder, label = placeholder }: SearchFieldProps) {
  const [expanded, setExpanded] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const inputId = useId()
  const close = () => {
    onChange('')
    setExpanded(false)
    triggerRef.current?.focus()
  }

  return (
    <div className="expandable-search" data-expanded={expanded || undefined}>
      {expanded && (
        <TextField
          id={inputId}
          data-page-search
          autoFocus
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-label={label}
          onKeyDown={event => { if (event.key === 'Escape') close() }}
        />
      )}
      <IconButton
        ref={triggerRef}
        className="section-action-button"
        label={expanded ? 'Close search' : label}
        aria-expanded={expanded}
        aria-controls={expanded ? inputId : undefined}
        onClick={() => expanded ? close() : setExpanded(true)}
      >
        {expanded ? <X aria-hidden="true" /> : <Search aria-hidden="true" />}
      </IconButton>
    </div>
  )
}

export function SearchField({ value, onChange, placeholder, label = placeholder }: SearchFieldProps) {
  return (
    <div className="search-field">
      <Search aria-hidden="true" />
      <TextField
        data-page-search
        className="h-auto flex-1 border-0 bg-transparent px-0"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={label}
      />
      {value && (
        <IconButton variant="bare" size="none" label="Clear search" onClick={() => onChange('')}>
          <X aria-hidden="true" />
        </IconButton>
      )}
    </div>
  )
}
