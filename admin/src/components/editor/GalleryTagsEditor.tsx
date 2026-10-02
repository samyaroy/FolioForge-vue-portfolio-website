import { useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Plus, X } from 'lucide-react'
import { tagKey, type GalleryTag } from '@/lib/galleryTags'

type GalleryTagsEditorProps = {
  tags: string[]
  /** What galleryTags.yml defines, in the order the Gallery filter shows it. */
  options: readonly GalleryTag[]
  onChange: (tags: string[]) => void
}

type Suggestion = { id: string; label: string; custom: boolean }

/**
 * The entry's tags as chips, with the defined ones offered as you type. A tag
 * the file does not define is kept and marked, not quietly dropped: the card
 * still shows it, it just reaches no filter chip.
 */
export function GalleryTagsEditor({ tags, options, onChange }: GalleryTagsEditorProps) {
  const id = useId()
  const input = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const chosen = new Set(tags.map(tagKey))
  const byKey = new Map(options.map(option => [tagKey(option.id), option]))
  const needle = tagKey(query)

  // A defined tag can be typed by its id or by the label the filter shows.
  const exact = options.find(option => tagKey(option.id) === needle || tagKey(option.label) === needle)
  const suggestions: Suggestion[] = [
    ...options
      .filter(option => !chosen.has(tagKey(option.id)))
      .filter(option => !needle || tagKey(option.label).includes(needle) || tagKey(option.id).includes(needle))
      .map(option => ({ id: option.id, label: option.label, custom: false })),
    ...(needle && !exact && !chosen.has(needle) ? [{ id: query.trim(), label: `Add "${query.trim()}" as a new tag`, custom: true }] : []),
  ]
  const expanded = open && suggestions.length > 0
  const current = Math.min(active, suggestions.length - 1)

  const add = (tag: string) => {
    if (!tag.trim() || chosen.has(tagKey(tag))) return
    onChange([...tags, tag.trim()])
    setQuery('')
    setActive(0)
  }
  const remove = (tag: string) => onChange(tags.filter(item => item !== tag))

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
      if (suggestions.length) setActive((current + (event.key === 'ArrowDown' ? 1 : -1) + suggestions.length) % suggestions.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      if (expanded) add(suggestions[current].id)
      else if (needle) add(exact?.id ?? query)
    } else if (event.key === 'Escape' && expanded) {
      // Closes the list, not the dialog around it.
      event.stopPropagation()
      setOpen(false)
    } else if (event.key === 'Backspace' && !query && tags.length) {
      remove(tags[tags.length - 1])
    }
  }

  return (
    <div className="gallery-tags-editor">
      <span className="logo-selector-label" id={`${id}-label`}>Tags <small>{tags.length}</small></span>
      <div className="tag-input" onMouseDown={event => { if (event.target === event.currentTarget) { event.preventDefault(); input.current?.focus() } }}>
        {tags.map(tag => {
          const defined = byKey.get(tagKey(tag))
          return (
            <span className="tag-chip" data-loose={!defined || undefined} key={tag} title={defined ? (defined.label === tag ? undefined : `Saved as "${tag}"`) : 'Not in galleryTags.yml, so no filter chip reaches this entry'}>
              {defined?.label ?? tag}
              <button type="button" aria-label={`Remove tag ${defined?.label ?? tag}`} onClick={() => remove(tag)}><X aria-hidden="true" /></button>
            </span>
          )
        })}
        <input
          ref={input}
          role="combobox"
          aria-labelledby={`${id}-label`}
          aria-expanded={expanded}
          aria-controls={`${id}-options`}
          aria-autocomplete="list"
          aria-activedescendant={expanded ? `${id}-option-${current}` : undefined}
          value={query}
          placeholder={tags.length ? 'Add a tag' : 'Type or pick a tag'}
          onChange={event => { setQuery(event.target.value); setActive(0); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
        />
        {expanded && (
          <ul className="tag-suggestions" role="listbox" id={`${id}-options`} aria-labelledby={`${id}-label`}>
            {suggestions.map((suggestion, index) => (
              <li
                key={`${suggestion.custom ? 'new' : 'tag'}:${suggestion.id}`}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={index === current}
                data-custom={suggestion.custom || undefined}
                // Pressing down would blur the input and close the list first.
                onMouseDown={event => event.preventDefault()}
                onMouseEnter={() => setActive(index)}
                onClick={() => add(suggestion.id)}
              >
                {suggestion.custom ? <Plus aria-hidden="true" /> : null}
                <span>{suggestion.label}</span>
                {!suggestion.custom && suggestion.label !== suggestion.id && <small>{suggestion.id}</small>}
              </li>
            ))}
          </ul>
        )}
      </div>
      {tags.some(tag => !byKey.has(tagKey(tag))) && (
        <small className="tag-input-note">Amber tags are not in galleryTags.yml, so no filter chip reaches them.</small>
      )}
    </div>
  )
}
