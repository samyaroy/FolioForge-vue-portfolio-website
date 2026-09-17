import * as React from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export type TextFieldProps = Omit<React.ComponentProps<'input'>, 'onChange' | 'value'> & {
  /** Caption above the control. Omit it for bare inputs and pass aria-label instead. */
  label?: React.ReactNode
  value: string
  onChange: (value: string) => void
  /** Extra classes for the wrapping label, e.g. `field-wide`. */
  fieldClassName?: string
}

export function TextField({ label, value, onChange, className, fieldClassName, ...props }: TextFieldProps) {
  const input = <Input value={value} onChange={event => onChange(event.target.value)} className={className} {...props} />
  if (label === undefined) return input
  return (
    <label className={cn('field', fieldClassName)}>
      <span>{label}</span>
      {input}
    </label>
  )
}
