import { createContext, useContext } from 'react'

export type VisibilityDraft = {
  flags: Record<string, boolean>
  originalFlags: Record<string, boolean>
  setFlag: (path: string, value: boolean) => void
  resetFlags: () => void
}

export const VisibilityContext = createContext<VisibilityDraft | null>(null)

export function useVisibilityDraft() {
  const context = useContext(VisibilityContext)
  if (!context) throw new Error('Visibility controls require VisibilityProvider')
  return context
}
