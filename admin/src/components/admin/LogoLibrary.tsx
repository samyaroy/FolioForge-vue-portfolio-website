import { RefreshCw, Upload } from 'lucide-react'
import { useLogoCatalog } from '@/hooks/logoContext'
import { Button } from '@/components/ui/button'

export function LogoLibrary() {
  const { logos, loading, error, refresh, stage } = useLogoCatalog()
  return (
    <section className="logo-library">
      <div className="section-heading"><div><h2>Logos</h2><span>{logos.length} available</span></div><div className="logo-library-actions"><Button variant="outline" size="icon-sm" title="Refresh logos" aria-label="Refresh logos" disabled={loading} onClick={refresh}><RefreshCw aria-hidden="true" /></Button><label className="logo-upload"><Upload aria-hidden="true" /><span>Add logo</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={event => { const file = event.target.files?.[0]; if (file) stage(file); event.target.value = '' }} /></label></div></div>
      {error && <p className="logo-catalog-notice">{error} Uploads and replacements remain local.</p>}
      <div className="media-grid">{logos.map(logo => <article className="media-card logo-library-item" key={logo.value}><img src={logo.url} alt={logo.name} /><div><strong>{logo.name}</strong><span>{logo.source === 'r2' ? 'R2' : logo.source === 'local' ? 'Local draft' : 'Repository'}</span><label className="logo-upload"><Upload aria-hidden="true" /><span>Replace</span><input type="file" aria-label={`Replace logo ${logo.name}`} accept="image/png,image/jpeg,image/webp" onChange={event => { const file = event.target.files?.[0]; if (file) stage(file, logo.value); event.target.value = '' }} /></label></div></article>)}</div>
    </section>
  )
}
