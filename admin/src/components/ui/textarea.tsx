import * as React from 'react'
import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex min-h-16 w-full resize-y rounded-[5px] border border-[#cbd8e3] bg-background px-2.5 py-2 text-[12px] font-normal text-[#15283a] transition-colors',
        'placeholder:text-[#8193a3] selection:bg-primary selection:text-primary-foreground',
        'disabled:cursor-not-allowed disabled:opacity-60',
        'aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
