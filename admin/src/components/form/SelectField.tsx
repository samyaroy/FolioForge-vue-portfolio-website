import * as React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

export type SelectOption = { value: string; label: string }

export type SelectFieldProps = {
  label?: React.ReactNode
  /** An empty string means nothing is chosen yet, and shows the placeholder. */
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
  fieldClassName?: string
  'aria-label'?: string
}

export function SelectField({ label, value, onChange, options, placeholder = 'Select', disabled, className, fieldClassName, ...props }: SelectFieldProps) {
  const select = (
    <Select value={value || undefined} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={className} aria-label={props['aria-label']}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
      </SelectContent>
    </Select>
  )
  if (label === undefined) return select
  // A select is not a labelable element, so this stays a plain wrapper.
  return (
    <div className={cn('field', fieldClassName)}>
      <span>{label}</span>
      {select}
    </div>
  )
}
