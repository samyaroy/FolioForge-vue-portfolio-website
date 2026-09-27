import * as React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

export type CheckboxFieldProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  /** Sits beside the box; omit it and pass aria-label for bare checkboxes. */
  label?: React.ReactNode
  disabled?: boolean
  className?: string
  fieldClassName?: string
  'aria-label'?: string
}

export function CheckboxField({ checked, onChange, label, disabled, className, fieldClassName, ...props }: CheckboxFieldProps) {
  const checkbox = (
    <Checkbox
      checked={checked}
      onCheckedChange={state => onChange(state === true)}
      disabled={disabled}
      className={className}
      aria-label={props['aria-label']}
    />
  )
  if (label === undefined) return checkbox
  return (
    <label className={cn('checkbox-field', fieldClassName)}>
      {checkbox}
      {label}
    </label>
  )
}
