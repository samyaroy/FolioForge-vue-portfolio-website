import type { ClassValue } from "clsx"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// shadcn-vue's init also scaffolds a `valueUpdater` helper for its data-table
// components. Nothing here uses a data table, and it was the only reason
// @tanstack/vue-table was installed, so both are dropped. `shadcn-vue add table`
// puts them back if a table is ever needed.
