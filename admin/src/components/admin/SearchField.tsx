import { Search, X } from 'lucide-react'
import { IconButton, TextField } from '@/components/form'

type SearchFieldProps = {
  value: string
  onChange: (value: string) => void
  placeholder: string
  label?: string
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
