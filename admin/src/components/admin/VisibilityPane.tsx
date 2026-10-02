import { SwitchField } from '@/components/form'
import { FileCode2 } from 'lucide-react'
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

export function VisibilityPane({ pageId, sectionId, sources = [], entryCount }: {
  pageId: string
  sectionId: string
  sources?: readonly string[]
  entryCount?: { enabled: number; total: number }
}) {
  const controls = sectionVisibility[`${pageId}/${sectionId}`] ?? []
  if (!controls.length && !sources.length && !entryCount) return null
  return (
    <section className="form-panel visibility-panel">
      <div className="panel-heading">
        <div><h2>SECTION METAINFO</h2></div>
        {entryCount && (
          <span className="visibility-entry-count" aria-live="polite" aria-label={`${entryCount.enabled} enabled entries out of ${entryCount.total} total entries`} title="Enabled entries / Total entries">
            {entryCount.enabled}/{entryCount.total}
          </span>
        )}
      </div>
      {sources.length > 0 && (
        <div className="source-strip">
          <FileCode2 aria-hidden="true" />
          <span><small>Content source</small><strong>{sources.join(', ')}</strong></span>
        </div>
      )}
      <VisibilitySwitches controls={controls} />
    </section>
  )
}
