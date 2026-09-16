import { useState } from 'react'
import type { ReactNode } from 'react'
import { featureFlags } from '../../../../src/config/featureFlags'
import { VisibilityContext } from '@/hooks/visibilityContext'

function flattenFlags(node: unknown, prefix = ''): Record<string, boolean> {
  if (!node || typeof node !== 'object') return {}
  return Object.fromEntries(Object.entries(node).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    return typeof value === 'boolean' ? [[path, value]] : Object.entries(flattenFlags(value, path))
  }))
}

const originalFlags = flattenFlags(featureFlags)

export function VisibilityProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState(originalFlags)

  const setFlag = (path: string, value: boolean) => {
    if (!(path in originalFlags)) throw new Error(`Unknown feature flag: ${path}`)
    setFlags(current => ({ ...current, [path]: value }))
  }

  return (
    <VisibilityContext.Provider value={{ flags, originalFlags, setFlag, resetFlags: () => setFlags(originalFlags) }}>
      {children}
    </VisibilityContext.Provider>
  )
}
