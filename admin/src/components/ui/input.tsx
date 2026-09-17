import * as React from 'react'
import { cn } from '@/lib/utils'

// Sized for this admin: 36px tall, 12px text, the same blue-grey border the
// panels use. Pass className to opt out, as the chromeless search fields do.
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-9 w-full min-w-0 rounded-[5px] border border-[#cbd8e3] bg-background px-2.5 py-2 text-[12px] font-normal text-[#15283a] transition-colors',
        'placeholder:text-[#8193a3] selection:bg-primary selection:text-primary-foreground',
        'file:h-full file:border-0 file:bg-transparent file:p-0 file:text-[11px] file:font-medium file:text-foreground',
        'disabled:cursor-not-allowed disabled:opacity-60',
        'aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
