import * as React from 'react'
import { Button } from './Button'

export type IconButtonProps = Omit<React.ComponentProps<typeof Button>, 'aria-label'> & {
  /** Names the action for screen readers, and is the tooltip unless `title` says otherwise. */
  label: string
}

export function IconButton({ label, title, variant = 'ghost', size = 'icon-sm', type = 'button', ...props }: IconButtonProps) {
  return <Button aria-label={label} title={title ?? label} variant={variant} size={size} type={type} {...props} />
}
