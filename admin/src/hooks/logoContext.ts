import { createContext, useContext } from 'react'
import type { LogoAsset } from '@/types/logos'

export type LogoCatalog = {
  logos: LogoAsset[]
  loading: boolean
  error: string | null
  refresh: () => void
}

export const LogoContext = createContext<LogoCatalog | null>(null)

export function useLogoCatalog() {
  const context = useContext(LogoContext)
  if (!context) throw new Error('Logo catalog provider is missing.')
  return context
}
