import { useId } from 'react'
import type { ReactNode } from 'react'
import { Info } from 'lucide-react'

type InfoHintProps = {
  label: string
  /** `warning` tints the icon, so a problem shows without opening it. */
  tone?: 'info' | 'warning'
  children: ReactNode
}

/**
 * A notice that waits behind its icon: the same mark LocalNotice uses, with the
 * text shown on hover or keyboard focus, for something worth knowing but not
 * worth a banner on every visit.
 */
export function InfoHint({ label, tone = 'info', children }: InfoHintProps) {
  const id = useId()
  return (
    <span className="info-hint" data-tone={tone}>
      <button type="button" className="info-hint-trigger" aria-label={label} aria-describedby={id}><Info aria-hidden="true" /></button>
      <span className="info-hint-text" role="tooltip" id={id}>{children}</span>
    </span>
  )
}

type SaveStatusHintProps = {
  /** Whether the file has been read, so a save has a revision to quote. */
  saveable: boolean
  /** Why the file could not be read; empty while it is still being read. */
  failure: string
  /** How saving works, once it can. */
  children: ReactNode
}

/** Where an editor page stands on saving, behind one icon under its action. */
export function SaveStatusHint({ saveable, failure, children }: SaveStatusHintProps) {
  if (saveable) return <InfoHint label="How saving works">{children}</InfoHint>
  if (failure) return <InfoHint label="Why saving is off" tone="warning">{failure} Saving is off until it can be read.</InfoHint>
  return <InfoHint label="Checking whether this can be saved">Checking whether this can be saved...</InfoHint>
}
