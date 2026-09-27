import type { LucideIcon } from 'lucide-react'

export type NavigationItem = {
  label: string
  path: string
  icon: LucideIcon
  count?: number
  children?: Array<{
    label: string
    path: string
  }>
}

export type NavigationGroup = {
  label: string
  items: NavigationItem[]
}
