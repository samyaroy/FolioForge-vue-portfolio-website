import * as React from 'react'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

export type TextareaFieldProps = Omit<React.ComponentProps<'textarea'>, 'onChange' | 'value'> & {
  label?: React.ReactNode
  value: string
  onChange: (value: string) => void
  fieldClassName?: string
}

export function TextareaField({ label, value, onChange, className, fieldClassName, ...props }: TextareaFieldProps) {
  const textarea = <Textarea value={value} onChange={event => onChange(event.target.value)} className={className} {...props} />
  if (label === undefined) return textarea
  return (
    <label className={cn('field', fieldClassName)}>
      <span>{label}</span>
      {textarea}
    </label>
  )
}
