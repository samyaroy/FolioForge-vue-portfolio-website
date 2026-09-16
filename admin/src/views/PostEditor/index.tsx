import { useEffect, useState } from 'react'
import { Eye, ImagePlus, Save } from 'lucide-react'
import { LocalNotice } from '@/components/admin/LocalNotice'
import { PageHeader } from '@/components/admin/PageHeader'
import { MarkdownEditor } from '@/components/editor/MarkdownEditor'
import { Button } from '@/components/ui/button'

export function PostEditorPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [tags, setTags] = useState('')
  const [body, setBody] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => () => {
    if (coverUrl) URL.revokeObjectURL(coverUrl)
  }, [coverUrl])

  const saveDraft = () => {
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1800)
  }

  const changeCover = (file?: File) => {
    if (coverUrl) URL.revokeObjectURL(coverUrl)
    setCoverUrl(file ? URL.createObjectURL(file) : '')
  }

  return (
    <>
      <PageHeader
        title="New Post"
        description="Compose a Markdown article and review its metadata before connecting publication."
        actions={<Button variant="outline" onClick={saveDraft}><Save aria-hidden="true" /> {saved ? 'Saved locally' : 'Save draft'}</Button>}
      />
      <LocalNotice>This draft is held only in React state and will reset when the page reloads.</LocalNotice>
      <div className="editor-layout">
        <section className="form-panel" aria-labelledby="post-content-heading">
          <div className="panel-heading"><div><span>Article</span><h2 id="post-content-heading">Post content</h2></div></div>
          <div className="form-grid">
            <label className="field field-wide"><span>Title</span><input data-page-search value={title} onChange={event => setTitle(event.target.value)} placeholder="A clear post title" /></label>
            <label className="field field-wide"><span>Description</span><textarea className="short-textarea" value={description} onChange={event => setDescription(event.target.value)} placeholder="Summary used on listings and social previews" /></label>
            <label className="field"><span>Publish date</span><input type="date" value={date} onChange={event => setDate(event.target.value)} /></label>
            <label className="field"><span>Tags</span><input value={tags} onChange={event => setTags(event.target.value)} placeholder="research, notes" /></label>
            <div className="field field-wide"><span>Body</span><MarkdownEditor value={body} onChange={setBody} /></div>
          </div>
        </section>

        <aside className="editor-aside">
          <section className="form-panel">
            <div className="panel-heading"><div><span>Media</span><h2>Cover image</h2></div></div>
            <label className="upload-zone">
              {coverUrl ? <img src={coverUrl} alt="Cover preview" /> : <><ImagePlus aria-hidden="true" /><strong>Choose an image</strong><span>JPEG, PNG, or WebP</span></>}
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => changeCover(event.target.files?.[0])} />
            </label>
          </section>
          <section className="form-panel preview-panel">
            <div className="panel-heading"><div><span>Preview</span><h2><Eye aria-hidden="true" /> Article card</h2></div></div>
            {coverUrl && <img className="preview-cover" src={coverUrl} alt="" />}
            <span className="preview-date">{date || 'No date'} {tags && `| ${tags}`}</span>
            <h3>{title || 'Untitled post'}</h3>
            <p>{description || 'Your post description will appear here.'}</p>
            {body && <pre className="markdown-preview">{body}</pre>}
          </section>
        </aside>
      </div>
    </>
  )
}
