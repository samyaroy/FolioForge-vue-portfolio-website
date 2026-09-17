import { RefreshCw, Upload } from 'lucide-react'
import { useLogoCatalog } from '@/hooks/logoContext'
import { FileField, IconButton } from '@/components/form'

export function LogoLibrary() {
  const { logos, loading, error, refresh, stage } = useLogoCatalog()
  return (
    <section className="logo-library">
      <div className="section-heading"><div><h2>Logos</h2><span>{logos.length} available</span></div><div className="logo-library-actions"><IconButton variant="outline" label="Refresh logos" disabled={loading} onClick={refresh}><RefreshCw aria-hidden="true" /></IconButton><FileField fieldClassName="logo-upload" accept="image/png,image/jpeg,image/webp" onSelect={files => { const file = files?.[0]; if (file) stage(file) }}><Upload aria-hidden="true" /><span>Add logo</span></FileField></div></div>
      {error && <p className="logo-catalog-notice">{error} Uploads and replacements remain local.</p>}
      <div className="media-grid">{logos.map(logo => <article className="media-card logo-library-item" key={logo.value}><img src={logo.url} alt={logo.name} /><div><strong>{logo.name}</strong><span>{logo.source === 'r2' ? 'R2' : logo.source === 'local' ? 'Local draft' : 'Repository'}</span><FileField fieldClassName="logo-upload" aria-label={`Replace logo ${logo.name}`} accept="image/png,image/jpeg,image/webp" onSelect={files => { const file = files?.[0]; if (file) stage(file, logo.value) }}><Upload aria-hidden="true" /><span>Replace</span></FileField></div></article>)}</div>
    </section>
  )
}
