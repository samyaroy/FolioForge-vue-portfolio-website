import { Info } from 'lucide-react'
import type { ReactNode } from 'react'

export function LocalNotice({ children }: { children: ReactNode }) {
  return (
    <div className="local-notice" role="status">
      <Info aria-hidden="true" />
      <span>{children}</span>
    </div>
  )
}
