import * as React from 'react'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

export type SwitchFieldProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  /** Row content shown to the left of the switch. */
  label?: React.ReactNode
  disabled?: boolean
  className?: string
  fieldClassName?: string
  'aria-label'?: string
}

export function SwitchField({ checked, onChange, label, disabled, className, fieldClassName, ...props }: SwitchFieldProps) {
  const control = (
    <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} className={className} aria-label={props['aria-label']} />
  )
  if (label === undefined) return control
  return (
    <label className={cn('switch-field', fieldClassName)}>
      {label}
      {control}
    </label>
  )
}
