import * as React from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

// `onSelect` is excluded: the DOM event of that name means text selection.
export type FileFieldProps = Omit<React.ComponentProps<'input'>, 'onChange' | 'onSelect' | 'type' | 'value'> & {
  onSelect: (files: FileList | null) => void
  /** The visible target: a dropzone or upload button the caller styles. */
  children: React.ReactNode
  /** Classes for the wrapping label, e.g. `media-dropzone`. */
  fieldClassName?: string
}

export function FileField({ onSelect, children, className, fieldClassName, title, ...props }: FileFieldProps) {
  return (
    // The input is hidden, so the tooltip and the disabled marker belong on the
    // label: it is the thing someone looks at and clicks.
    <label className={fieldClassName} title={title} data-disabled={props.disabled || undefined}>
      {children}
      <Input
        type="file"
        // Visually hidden: the label around it is what people click.
        className={cn('absolute size-px opacity-0', className)}
        // Clearing the value afterwards lets the same file be picked again.
        onChange={event => { onSelect(event.target.files); event.target.value = '' }}
        {...props}
      />
    </label>
  )
}
