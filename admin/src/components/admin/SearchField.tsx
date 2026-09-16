import { Search, X } from 'lucide-react'

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
      <input
        data-page-search
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
      />
      {value && (
        <button type="button" aria-label="Clear search" onClick={() => onChange('')}>
          <X aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
