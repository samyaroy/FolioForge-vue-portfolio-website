import type { ReactNode } from 'react'
import { EMPTY_TEXT_CLASS } from '../lib/ui'

type EmptyStateProps = {
  /** Material Design Icons class shown above the message, e.g. "mdi-popcorn". */
  icon: string
  /** "status" when the message replaces results the reader just filtered. */
  role?: 'status'
  children: ReactNode
}

/** An empty-list message with its icon above it. */
export function EmptyState({ icon, role, children }: EmptyStateProps) {
  return (
    <p className={EMPTY_TEXT_CLASS} role={role}>
      <span className={`mdi ${icon} mb-2 block text-4xl leading-none text-faint`} aria-hidden="true" />
      {children}
    </p>
  )
}
