import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { LocalNotice } from '@/components/admin/LocalNotice'
import { PageHeader } from '@/components/admin/PageHeader'
import { Button } from '@/components/ui/button'

const initialTags = ['Academic Milestone', 'Article', 'Bootcamp', 'Conference', 'Event', 'Guest Event', 'Mentoring', 'New Role', 'Workshop']

export function MetadataPage() {
  const [tags, setTags] = useState(initialTags)
  const [newTag, setNewTag] = useState('')

  const addTag = () => {
    const value = newTag.trim()
    if (!value || tags.some(tag => tag.toLowerCase() === value.toLowerCase())) return
    setTags(current => [...current, value])
    setNewTag('')
  }

  return (
    <>
      <PageHeader title="Metadata & Tags" description={<>Manage gallery taxonomy mapped from <code>src/metadata/galleryTags.yml</code>.</>} />
      <LocalNotice>Taxonomy edits are session-local. Referenced tag impact checks will run server-side later.</LocalNotice>
      <section className="form-panel narrow-panel">
        <div className="panel-heading"><div><span>Taxonomy</span><h2>Career Unlock tags</h2></div><span>{tags.length} tags</span></div>
        <form className="inline-form" onSubmit={event => { event.preventDefault(); addTag() }}>
          <label className="field"><span>New tag</span><input data-page-search value={newTag} onChange={event => setNewTag(event.target.value)} placeholder="Add a unique label" /></label>
          <Button type="submit"><Plus aria-hidden="true" /> Add tag</Button>
        </form>
        <div className="tag-editor-list">
          {tags.map(tag => <span className="editable-tag" key={tag}>{tag}<button type="button" aria-label={`Remove ${tag}`} onClick={() => setTags(current => current.filter(item => item !== tag))}><X aria-hidden="true" /></button></span>)}
        </div>
      </section>
    </>
  )
}
