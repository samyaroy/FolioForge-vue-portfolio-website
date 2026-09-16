import { useState } from 'react'
import { ImagePlus, Plus, X } from 'lucide-react'
import { LocalNotice } from '@/components/admin/LocalNotice'
import { PageHeader } from '@/components/admin/PageHeader'
import { Button } from '@/components/ui/button'

export function BlogGalleryPage() {
  const [title, setTitle] = useState('')
  const [tag, setTag] = useState('gallery')
  const [entries, setEntries] = useState<string[]>([])

  const addEntry = () => {
    const value = title.trim()
    if (!value) return
    setEntries(current => [...current, value])
    setTitle('')
  }

  return (
    <>
      <PageHeader title="Blog Gallery" description={<>Create gallery records for <code>blogs/src/content/gallery/data.yml</code>.</>} actions={<Button onClick={addEntry}><Plus aria-hidden="true" /> Add entry</Button>} />
      <LocalNotice>The source collection is currently empty; new entries below are temporary previews.</LocalNotice>
      <div className="editor-layout gallery-editor-layout">
        <section className="form-panel">
          <div className="panel-heading"><div><span>Entry</span><h2>Gallery details</h2></div></div>
          <div className="form-grid">
            <label className="field field-wide"><span>Title</span><input data-page-search value={title} onChange={event => setTitle(event.target.value)} placeholder="Gallery entry title" /></label>
            <label className="field"><span>Tag</span><input value={tag} onChange={event => setTag(event.target.value)} /></label>
            <label className="field"><span>Date</span><input type="date" /></label>
            <label className="media-dropzone compact-dropzone field-wide"><ImagePlus aria-hidden="true" /><strong>Choose gallery images</strong><span>Local preview only</span><input type="file" multiple accept="image/jpeg,image/png,image/webp" /></label>
          </div>
        </section>
        <aside className="form-panel">
          <div className="panel-heading"><div><span>Session</span><h2>Pending entries</h2></div><span>{entries.length}</span></div>
          {entries.length ? <div className="pending-list">{entries.map((entry, index) => <div key={`${entry}-${index}`}><span><strong>{entry}</strong><small>{tag}</small></span><button type="button" aria-label={`Remove ${entry}`} onClick={() => setEntries(current => current.filter((_, itemIndex) => index !== itemIndex))}><X aria-hidden="true" /></button></div>)}</div> : <div className="simple-empty">No entries added.</div>}
        </aside>
      </div>
    </>
  )
}
