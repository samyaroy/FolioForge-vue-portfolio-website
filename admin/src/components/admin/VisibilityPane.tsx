import { SwitchField } from '@/components/form'
import { sectionVisibility } from '@/config/visibility'
import type { VisibilityFlag } from '@/config/visibility'
import { useVisibilityDraft } from '@/hooks/visibilityContext'

export function VisibilitySwitches({ controls }: { controls: VisibilityFlag[] }) {
  const { flags, originalFlags, setFlag } = useVisibilityDraft()
  return (
    <div className="toggle-list">
      {controls.map(control => {
        const isKnown = typeof flags[control.path] === 'boolean'
        const isEnabled = flags[control.path] === true
        const isChanged = flags[control.path] !== originalFlags[control.path]
        return (
          <SwitchField
            key={control.path}
            aria-label={control.label}
            disabled={!isKnown}
            checked={isEnabled}
            onChange={checked => setFlag(control.path, checked)}
            label={<span><strong>{control.label}</strong><span className="visibility-meta"><small>{!isKnown ? 'Flag unavailable' : `${isEnabled ? 'Enabled' : 'Disabled'}${isChanged ? ' · Local change' : ''}`}</small><code className="visibility-flag-path">{control.path}</code></span></span>}
          />
        )
      })}
    </div>
  )
}

export function VisibilityPane({ pageId, sectionId }: { pageId: string; sectionId: string }) {
  const controls = sectionVisibility[`${pageId}/${sectionId}`] ?? []
  const { flags } = useVisibilityDraft()
  // A section with no flag is always on; a panel saying so is a panel's worth
  // of width spent on nothing.
  if (!controls.length) return null
  const controllingFlags = pageId === 'home' && sectionId === 'education' ? controls.slice(0, 1) : controls
  const isEnabled = controllingFlags.some(control => flags[control.path] === true)
  return (
    <section className="form-panel visibility-panel">
      <div className="panel-heading"><div><span>Display</span><h2>Section visibility</h2></div></div>
      {controls.length > 1 && <p className="visibility-summary">Visibility {isEnabled ? 'enabled' : 'disabled'} in this draft</p>}
      <VisibilitySwitches controls={controls} />
    </section>
  )
}
