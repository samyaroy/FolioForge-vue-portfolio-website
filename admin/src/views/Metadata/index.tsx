import { useState } from 'react'
import { toast } from 'react-toastify'
import { Plus, X } from 'lucide-react'
import { LocalNotice } from '@/components/admin/LocalNotice'
import { PageHeader } from '@/components/admin/PageHeader'
import { Button, IconButton, TextField } from '@/components/form'

const initialTags = ['Academic Milestone', 'Article', 'Bootcamp', 'Conference', 'Event', 'Guest Event', 'Mentoring', 'New Role', 'Workshop']

export function MetadataPage() {
  const [tags, setTags] = useState(initialTags)
  const [newTag, setNewTag] = useState('')

  const addTag = () => {
    const value = newTag.trim()
    if (!value) {
      toast.error('Enter a tag name before adding.')
      return
    }
    if (tags.some(tag => tag.toLowerCase() === value.toLowerCase())) {
      toast.error('That tag already exists.')
      return
    }
    setTags(current => [...current, value])
    setNewTag('')
  }

  return (
    <>
      <PageHeader title="Metadata & Tags" description={<>Manage gallery taxonomy mapped from <code>src/metadata/galleryTags.yml</code>.</>} />
      <LocalNotice>Taxonomy edits are session-local. Referenced tag impact checks will run server-side later.</LocalNotice>
      <section className="form-panel">
        <div className="panel-heading"><div><span>Taxonomy</span><h2>Career Unlock tags</h2></div><span>{tags.length} tags</span></div>
        <form className="inline-form" onSubmit={event => { event.preventDefault(); addTag() }}>
          <TextField label="New tag" required data-page-search value={newTag} onChange={setNewTag} placeholder="Add a unique label" />
          <Button type="submit"><Plus aria-hidden="true" /> Add tag</Button>
        </form>
        <div className="tag-editor-list">
          {tags.map(tag => <span className="editable-tag" key={tag}>{tag}<IconButton variant="bare" size="none" label={`Remove ${tag}`} onClick={() => setTags(current => current.filter(item => item !== tag))}><X aria-hidden="true" /></IconButton></span>)}
        </div>
      </section>
    </>
  )
}
