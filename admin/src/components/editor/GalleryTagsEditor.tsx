import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button, IconButton, TextField } from '@/components/form'
import { tagKey, type GalleryTag } from '@/lib/galleryTags'

type GalleryTagsEditorProps = {
  tags: string[]
  /** What galleryTags.yml defines, in the order the Gallery filter shows it. */
  options: readonly GalleryTag[]
  onChange: (tags: string[]) => void
}

export function GalleryTagsEditor({ tags, options, onChange }: GalleryTagsEditorProps) {
  const [extra, setExtra] = useState('')
  const chosen = new Set(tags.map(tagKey))
  const defined = new Set(options.map(option => tagKey(option.id)))
  // Tags the file does not define are kept and named, not quietly dropped: the
  // card still shows them, they just reach no filter chip.
  const loose = tags.filter(tag => !defined.has(tagKey(tag)))

  const toggle = (id: string) => {
    onChange(chosen.has(tagKey(id)) ? tags.filter(tag => tagKey(tag) !== tagKey(id)) : [...tags, id])
  }

  const add = () => {
    const value = extra.trim()
    setExtra('')
    if (value && !chosen.has(tagKey(value))) onChange([...tags, value])
  }

  return (
    <div className="gallery-tags-editor">
      <span className="logo-selector-label">Tags <small>{tags.length}</small></span>
      <div className="gallery-tag-options">
        {options.map(option => (
          <button
            type="button"
            key={option.id}
            className="gallery-tag"
            aria-pressed={chosen.has(tagKey(option.id))}
            onClick={() => toggle(option.id)}
          >{option.label}</button>
        ))}
      </div>
      {loose.length > 0 && (
        <div className="gallery-tag-loose">
          <small>Not in galleryTags.yml, so these reach no filter chip</small>
          {loose.map(tag => (
            <span className="editable-tag" key={tag}>
              {tag}
              <IconButton variant="bare" size="none" label={`Remove tag ${tag}`} title="Remove tag" onClick={() => onChange(tags.filter(item => item !== tag))}><X aria-hidden="true" /></IconButton>
            </span>
          ))}
        </div>
      )}
      <div className="gallery-tag-add">
        <TextField aria-label="Add a tag of your own" value={extra} onChange={setExtra} placeholder="Add a tag of your own" />
        <Button variant="outline" size="sm" onClick={add}><Plus aria-hidden="true" /> Add</Button>
      </div>
    </div>
  )
}
