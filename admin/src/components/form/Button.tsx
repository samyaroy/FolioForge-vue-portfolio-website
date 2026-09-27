import * as React from 'react'
import { Button as UiButton } from '@/components/ui/button'

export type ButtonProps = React.ComponentProps<typeof UiButton>

// The app's button: shadcn's underneath, defaulting to type="button" so a
// button inside a form never submits it by accident.
export function Button({ asChild, type, ...props }: ButtonProps) {
  return <UiButton asChild={asChild} type={asChild ? type : type ?? 'button'} {...props} />
}
