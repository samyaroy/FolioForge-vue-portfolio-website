import { useState } from 'react'
import { toast } from 'react-toastify'
import { ImagePlus, Plus, X } from 'lucide-react'
import { LocalNotice } from '@/components/admin/LocalNotice'
import { PageHeader } from '@/components/admin/PageHeader'
import { Button, FileField, IconButton, TextField } from '@/components/form'

export function BlogGalleryPage() {
  const [title, setTitle] = useState('')
  const [tag, setTag] = useState('gallery')
  const [date, setDate] = useState('')
  const [entries, setEntries] = useState<string[]>([])

  const addEntry = () => {
    const value = title.trim()
    if (!value) {
      toast.error('Enter a title before adding an entry.')
      return
    }
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
            <TextField label="Title" required fieldClassName="field-wide" data-page-search value={title} onChange={setTitle} placeholder="Gallery entry title" />
            <TextField label="Tag" value={tag} onChange={setTag} />
            <TextField label="Date" type="date" value={date} onChange={setDate} />
            <FileField fieldClassName="media-dropzone compact-dropzone field-wide" aria-label="Gallery images" multiple accept="image/jpeg,image/png,image/webp" onSelect={() => {}}><ImagePlus aria-hidden="true" /><strong>Choose gallery images</strong><span>Local preview only</span></FileField>
          </div>
        </section>
        <aside className="form-panel">
          <div className="panel-heading"><div><span>Session</span><h2>Pending entries</h2></div><span>{entries.length}</span></div>
          {entries.length ? <div className="pending-list">{entries.map((entry, index) => <div key={`${entry}-${index}`}><span><strong>{entry}</strong><small>{tag}</small></span><IconButton variant="bare" size="none" label={`Remove ${entry}`} onClick={() => setEntries(current => current.filter((_, itemIndex) => index !== itemIndex))}><X aria-hidden="true" /></IconButton></div>)}</div> : <div className="simple-empty">No entries added.</div>}
        </aside>
      </div>
    </>
  )
}
