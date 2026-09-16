import { useState } from 'react'
import { ExternalLink, Save } from 'lucide-react'
import { LocalNotice } from '@/components/admin/LocalNotice'
import { PageHeader } from '@/components/admin/PageHeader'
import { Button } from '@/components/ui/button'
import { VisibilitySwitches } from '@/components/admin/VisibilityPane'
import { globalVisibility, sectionVisibility } from '@/config/visibility'
import { useVisibilityDraft } from '@/hooks/visibilityContext'

const visibilityControls = [...new Map([...Object.values(sectionVisibility).flat(), ...globalVisibility].map(control => [control.path, control])).values()]

export function SettingsPage() {
  const { flags, originalFlags, resetFlags } = useVisibilityDraft()
  const [siteName, setSiteName] = useState('Samyabrata Roy')
  const [saved, setSaved] = useState(false)

  const changedCount = Object.keys(flags).filter(path => flags[path] !== originalFlags[path]).length

  return (
    <>
      <PageHeader title="Settings" description="Preview global identity and visibility values planned for validated content files." actions={<Button variant="outline" onClick={() => { setSaved(true); window.setTimeout(() => setSaved(false), 1600) }}><Save aria-hidden="true" />{saved ? 'Saved locally' : 'Save locally'}</Button>} />
      <LocalNotice>Visibility is initialized from the Vue feature flags. {changedCount} local changes; nothing is published until the V1 Worker integration is connected.</LocalNotice>
      <div className="settings-layout">
        <section className="form-panel">
          <div className="panel-heading"><div><span>Identity</span><h2>Site branding</h2></div></div>
          <div className="form-grid"><label className="field field-wide"><span>Site name</span><input data-page-search value={siteName} onChange={event => setSiteName(event.target.value)} /></label><label className="field field-wide"><span>Portfolio URL</span><div className="input-with-icon"><input value="https://samyabrata.codeium.xyz" readOnly /><ExternalLink aria-hidden="true" /></div></label></div>
        </section>
        <section className="form-panel">
          <div className="panel-heading"><div><span>Visibility</span><h2>Published sections</h2></div></div>
          <VisibilitySwitches controls={visibilityControls} />
          <div className="aside-form-body"><Button variant="outline" onClick={resetFlags} disabled={!changedCount}>Discard visibility changes</Button></div>
        </section>
      </div>
    </>
  )
}
