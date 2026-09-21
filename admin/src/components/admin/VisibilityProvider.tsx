import { useMemo, useState } from 'react'
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
  // Only the edits live here. Holding the whole map in state instead froze it
  // at mount: a flag added to featureFlags.ts afterwards was missing from that
  // snapshot, so its switch read as unavailable until the page was reloaded.
  const [changes, setChanges] = useState<Record<string, boolean>>({})
  const flags = useMemo(() => ({ ...originalFlags, ...changes }), [changes])

  const setFlag = (path: string, value: boolean) => {
    if (!(path in originalFlags)) throw new Error(`Unknown feature flag: ${path}`)
    setChanges(current => ({ ...current, [path]: value }))
  }

  return (
    <VisibilityContext.Provider value={{ flags, originalFlags, setFlag, resetFlags: () => setChanges({}) }}>
      {children}
    </VisibilityContext.Provider>
  )
}
