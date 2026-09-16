import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Trash2, UploadCloud } from 'lucide-react'
import { LocalNotice } from '@/components/admin/LocalNotice'
import { PageHeader } from '@/components/admin/PageHeader'
import { Button } from '@/components/ui/button'

type PreviewFile = { name: string; size: string; url: string }

export function MediaLibraryPage() {
  const [files, setFiles] = useState<PreviewFile[]>([])
  const filesRef = useRef(files)

  useEffect(() => { filesRef.current = files }, [files])
  useEffect(() => () => filesRef.current.forEach(file => URL.revokeObjectURL(file.url)), [])

  const addFiles = (selected: FileList | null) => {
    if (!selected) return
    const additions = [...selected].map(file => ({ name: file.name, size: `${(file.size / 1024 / 1024).toFixed(2)} MB`, url: URL.createObjectURL(file) }))
    setFiles(current => [...current, ...additions])
  }

  const removeFile = (url: string) => {
    URL.revokeObjectURL(url)
    setFiles(current => current.filter(file => file.url !== url))
  }

  return (
    <>
      <PageHeader title="Media & Gallery" description="Stage image previews and inspect their final upload metadata." actions={<Button variant="outline"><UploadCloud aria-hidden="true" /> Upload queue ({files.length})</Button>} />
      <LocalNotice>Selected files stay in your browser. No image reaches R2 until the protected Worker is implemented.</LocalNotice>
      <label className="media-dropzone">
        <ImagePlus aria-hidden="true" /><strong>Add portfolio images</strong><span>Choose JPEG, PNG, or WebP files for a local preview.</span><Button asChild variant="outline"><span>Choose files</span></Button>
        <input data-page-search type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={event => addFiles(event.target.files)} />
      </label>
      {files.length ? <div className="media-grid">{files.map(file => <article className="media-card" key={file.url}><img src={file.url} alt="" /><div><strong>{file.name}</strong><span>{file.size}</span></div><button type="button" aria-label={`Remove ${file.name}`} onClick={() => removeFile(file.url)}><Trash2 aria-hidden="true" /></button></article>)}</div> : <div className="simple-empty">No staged media in this session.</div>}
    </>
  )
}
