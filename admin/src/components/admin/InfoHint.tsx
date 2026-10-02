import { useId } from 'react'
import type { ReactNode } from 'react'
import { Info } from 'lucide-react'

/**
 * A notice that waits behind its icon: the same mark LocalNotice uses, with the
 * text shown on hover or keyboard focus, for something worth knowing but not
 * worth a banner on every visit.
 */
export function InfoHint({ label, children }: { label: string; children: ReactNode }) {
  const id = useId()
  return (
    <span className="info-hint">
      <button type="button" className="info-hint-trigger" aria-label={label} aria-describedby={id}><Info aria-hidden="true" /></button>
      <span className="info-hint-text" role="tooltip" id={id}>{children}</span>
    </span>
  )
}
