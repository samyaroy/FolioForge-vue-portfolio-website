import * as React from 'react'
import { Input } from '@/components/ui/input'
import { FieldLabel } from './FieldLabel'
import { cn } from '@/lib/utils'

export type TextFieldProps = Omit<React.ComponentProps<'input'>, 'onChange' | 'required' | 'value'> & {
  /** Caption above the control. Omit it for bare inputs and pass aria-label instead. */
  label?: React.ReactNode
  value: string
  onChange: (value: string) => void
  /** Marks the field mandatory: red asterisk on the label, aria-required on the control. */
  required?: boolean
  /** Extra classes for the wrapping label, e.g. `field-wide`. */
  fieldClassName?: string
}

export function TextField({ label, value, onChange, required, className, fieldClassName, ...props }: TextFieldProps) {
  const input = <Input value={value} onChange={event => onChange(event.target.value)} aria-required={required || undefined} className={className} {...props} />
  if (label === undefined) return input
  return (
    <label className={cn('field', fieldClassName)}>
      <FieldLabel label={label} required={required} />
      {input}
    </label>
  )
}
