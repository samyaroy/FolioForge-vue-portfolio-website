import * as React from 'react'

// A mandatory field is marked with a red asterisk after its caption, the
// convention Material UI and Tailwind UI use. `aria-required` on the control
// carries the same meaning for screen readers, so the mark itself is hidden.
export function FieldLabel({ label, required }: { label: React.ReactNode; required?: boolean }) {
  return (
    <span>
      {label}
      {required ? <span className="field-required" title="Required" aria-hidden="true">*</span> : null}
    </span>
  )
}
