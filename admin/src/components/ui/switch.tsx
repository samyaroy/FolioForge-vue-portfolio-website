import * as React from 'react'
import { Switch as SwitchPrimitive } from 'radix-ui'
import { Check, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'group/switch inline-flex h-[22px] w-[36px] shrink-0 cursor-pointer items-center rounded-[4px] border border-[#a1a1aa] bg-[#e4e4e7] p-[2px] transition-colors',
        'hover:border-[#71717a] data-[state=checked]:border-[#047857] data-[state=checked]:bg-[#047857] data-[state=checked]:hover:bg-[#065f46]',
        'focus-visible:ring-[#047857]',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none relative grid size-[16px] place-items-center rounded-[2px] bg-white text-[#71717a] shadow-sm transition-transform data-[state=checked]:translate-x-[14px] data-[state=checked]:text-[#047857] data-[state=unchecked]:translate-x-0"
      >
        <Check aria-hidden="true" className="absolute size-[12px] opacity-0 group-data-[state=checked]/switch:opacity-100" strokeWidth={3} />
        <Minus aria-hidden="true" className="absolute size-[10px] group-data-[state=checked]/switch:opacity-0" strokeWidth={2.5} />
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  )
}

export { Switch }
