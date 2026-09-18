import { useState } from 'react'
import { Archive, RefreshCw, Upload } from 'lucide-react'
import { toast } from 'react-toastify'
import { useLogoCatalog } from '@/hooks/logoContext'
import { Button, FileField, IconButton, TextField } from '@/components/form'
import { isLogoReferenced } from '@/lib/logoReferences'
import { archiveLogo, uploadLogo } from '@/services/uploads'

export function LogoLibrary() {
  const { logos, loading, error, refresh, stage } = useLogoCatalog()
  const [name, setName] = useState('')
  const [busy, setBusy] = useState('')
  // Archiving is reversible but still changes the live site, so it is confirmed
  // on the card rather than behind a single click.
  const [confirming, setConfirming] = useState('')

  const addLogo = async (file: File | undefined) => {
    if (!file) return
    const chosen = name.trim()
    if (!chosen) { toast.error('Name the logo first — that name is what your YAML will carry.'); return }
    setBusy(chosen)
    try {
      await uploadLogo(chosen, file, false)
      toast.success(`Added ${chosen}.`)
      setName('')
      refresh()
    } catch (uploadError) {
      toast.error(uploadError instanceof Error ? uploadError.message : 'Upload failed.')
      stage(file, chosen)
    } finally {
      setBusy('')
    }
  }

  const archive = async (value: string) => {
    setBusy(value)
    try {
      await archiveLogo(value)
      toast.success(`${value} moved to logo/archived/.`)
      setConfirming('')
      refresh()
    } catch (archiveError) {
      toast.error(archiveError instanceof Error ? archiveError.message : 'Could not archive that logo.')
    } finally {
      setBusy('')
    }
  }

  return (
    <section className="logo-library">
      <div className="section-heading">
        <div><h2>Logos</h2><span>{logos.length} available</span></div>
        <div className="logo-library-actions">
          <TextField aria-label="New logo name" value={name} onChange={setName} placeholder="Name, e.g. IITM" />
          <IconButton variant="outline" label="Refresh logos" disabled={loading} onClick={refresh}><RefreshCw aria-hidden="true" /></IconButton>
          <FileField fieldClassName="logo-upload" accept="image/png,image/jpeg,image/webp" onSelect={files => void addLogo(files?.[0])}>
            <Upload aria-hidden="true" /><span>Add logo</span>
          </FileField>
        </div>
      </div>
      {error && <p className="logo-catalog-notice">{error} Uploads and replacements remain local.</p>}
      <div className="media-grid">
        {logos.map(logo => {
          const referenced = isLogoReferenced(logo.value)
          return (
            <article className="media-card logo-library-item" key={logo.value}>
              <img src={logo.url} alt={logo.name} />
              <div>
                <strong>{logo.name}</strong>
                <span>{logo.source === 'r2' ? 'R2' : logo.source === 'local' ? 'Local draft' : 'Repository'}{referenced && ' - in use'}</span>
                {confirming === logo.value
                  ? (
                    <span className="logo-confirm">
                      <Button size="sm" variant="outline" disabled={busy === logo.value} onClick={() => void archive(logo.value)}>
                        {busy === logo.value ? 'Archiving...' : 'Confirm archive'}
                      </Button>
                      <Button size="sm" variant="bare" onClick={() => setConfirming('')}>Cancel</Button>
                    </span>
                  )
                  : (
                    <span className="logo-card-actions">
                      <FileField fieldClassName="logo-upload" aria-label={`Replace logo ${logo.name}`} accept="image/png,image/jpeg,image/webp" onSelect={files => { const file = files?.[0]; if (file) stage(file, logo.value) }}>
                        <Upload aria-hidden="true" /><span>Replace</span>
                      </FileField>
                      <IconButton
                        variant="bare"
                        size="none"
                        label={referenced ? `${logo.name} is used by your content and cannot be archived` : `Archive ${logo.name}`}
                        title={referenced ? 'Used by your content — remove the reference first' : 'Move to logo/archived/'}
                        disabled={referenced || logo.source !== 'r2'}
                        onClick={() => setConfirming(logo.value)}
                      >
                        <Archive aria-hidden="true" />
                      </IconButton>
                    </span>
                  )}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
