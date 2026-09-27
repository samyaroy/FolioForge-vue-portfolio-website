import * as React from 'react'
import { Textarea } from '@/components/ui/textarea'
import { FieldLabel } from './FieldLabel'
import { cn } from '@/lib/utils'

export type TextareaFieldProps = Omit<React.ComponentProps<'textarea'>, 'onChange' | 'required' | 'value'> & {
  label?: React.ReactNode
  value: string
  onChange: (value: string) => void
  /** Marks the field mandatory: red asterisk on the label, aria-required on the control. */
  required?: boolean
  fieldClassName?: string
}

export function TextareaField({ label, value, onChange, required, className, fieldClassName, ...props }: TextareaFieldProps) {
  const textarea = <Textarea value={value} onChange={event => onChange(event.target.value)} aria-required={required || undefined} className={className} {...props} />
  if (label === undefined) return textarea
  return (
    <label className={cn('field', fieldClassName)}>
      <FieldLabel label={label} required={required} />
      {textarea}
    </label>
  )
}
