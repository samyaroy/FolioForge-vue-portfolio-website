import { useEffect, useState } from 'react'
import { Archive, RefreshCw, Upload } from 'lucide-react'
import { toast } from 'react-toastify'
import { useLogoCatalog } from '@/hooks/logoContext'
import { Button, FileField, IconButton, TextField } from '@/components/form'
import { isLogoReferenced } from '@/lib/logoReferences'
import { archiveLogo, uploadLogo } from '@/services/uploads'
import { fetchIcons } from '@/services/logos'
import type { IconAsset } from '@/types/logos'

export function LogoLibrary() {
  const { logos, loading, error, refresh } = useLogoCatalog()
  const [name, setName] = useState('')
  const [busy, setBusy] = useState('')
  const [icons, setIcons] = useState<IconAsset[]>([])
  const [iconsLoading, setIconsLoading] = useState(true)
  const [iconsError, setIconsError] = useState<string | null>(null)
  // Archiving is reversible but still changes the live site, so it is confirmed
  // on the card rather than behind a single click.
  const [confirming, setConfirming] = useState('')

  const refreshIcons = (signal?: AbortSignal) => {
    setIconsLoading(true)
    setIconsError(null)
    fetchIcons(signal ?? new AbortController().signal)
      .then(setIcons)
      .catch(error => setIconsError(error instanceof Error ? error.message : 'Could not load icons.'))
      .finally(() => setIconsLoading(false))
  }

  useEffect(() => {
    const controller = new AbortController()
    refreshIcons(controller.signal)
    return () => controller.abort()
  }, [])

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
      // A failed upload is a failure, not a phantom local entry that looks like
      // it worked.
      toast.error(uploadError instanceof Error ? uploadError.message : 'Upload failed.')
    } finally {
      setBusy('')
    }
  }

  const replaceLogo = async (value: string, file: File) => {
    if (!window.confirm(`Replace ${value}? The current file is archived to logo/archived/ and the site picks up the new one.`)) return
    setBusy(value)
    try {
      await uploadLogo(value, file, true)
      toast.success(`${value} replaced. The old file is in logo/archived/.`)
      refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not replace that logo.')
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
      <div className="media-folder">
        <div className="section-heading">
          <div><h2>Logos</h2><span>{logos.length} available</span></div>
          <div className="logo-library-actions">
            <TextField aria-label="New logo name" required value={name} onChange={setName} placeholder="Name, e.g. IITM" />
            <IconButton variant="outline" label="Refresh logos" disabled={loading} onClick={refresh}><RefreshCw aria-hidden="true" /></IconButton>
            {/* The name is what the YAML will carry, so it has to exist before a
                file is chosen. Refusing afterwards reads as a broken upload, so
                the picker stays shut until there is a name to upload under. */}
            <FileField
              fieldClassName="logo-upload"
              accept="image/png,image/jpeg,image/webp"
              disabled={!name.trim()}
              title={name.trim() ? `Upload a PNG, JPEG or WebP as ${name.trim()}` : 'Name the logo first — that name is what your YAML will carry'}
              onSelect={files => void addLogo(files?.[0])}
            >
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
                        <FileField fieldClassName="logo-upload" aria-label={`Replace logo ${logo.name}`} accept="image/png,image/jpeg,image/webp" onSelect={files => { const file = files?.[0]; if (file) void replaceLogo(logo.value, file) }}>
                          <Upload aria-hidden="true" /><span>{busy === logo.value ? 'Uploading...' : 'Replace'}</span>
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
      </div>

      <div className="media-folder">
        <div className="section-heading">
          <div><h2>Icons</h2><span>{iconsLoading ? 'Loading...' : `${icons.length} available`}</span></div>
          <IconButton variant="outline" label="Refresh icons" disabled={iconsLoading} onClick={() => refreshIcons()}><RefreshCw aria-hidden="true" /></IconButton>
        </div>
        {iconsError && <p className="logo-catalog-notice">{iconsError}</p>}
        {icons.length
          ? (
            <div className="media-grid">
              {icons.map(icon => (
                <article className="media-card logo-library-item" key={icon.value}>
                  <img src={icon.url} alt={icon.name} />
                  <div>
                    <strong>{icon.name}</strong>
                    <span>R2 - icons/{icon.value}</span>
                    <code><a href={icon.url} target="_blank" rel="noreferrer">{icon.url.replace('https://', '')}</a></code>
                  </div>
                </article>
              ))}
            </div>
          )
          : !iconsLoading && !iconsError && <div className="simple-empty">No icons found in R2.</div>}
      </div>
    </section>
  )
}
