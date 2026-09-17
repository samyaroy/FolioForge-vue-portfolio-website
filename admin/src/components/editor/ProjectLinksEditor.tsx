import { Plus, Trash2 } from 'lucide-react'
import { Button, IconButton, SelectField, TextField } from '@/components/form'
import type { ProjectLinkDraft } from '@/lib/projectLinks'
import { projectLinkCategories } from '../../../../src/config/projectLinkCategories.ts'

type ProjectLinksEditorProps = {
  links: ProjectLinkDraft[]
  onChange: (links: ProjectLinkDraft[]) => void
}

const categoryLabel = (category: string) =>
  projectLinkCategories[category as keyof typeof projectLinkCategories] ?? `${category} (not shown on the site)`

export function ProjectLinksEditor({ links, onChange }: ProjectLinksEditorProps) {
  const update = (index: number, key: keyof ProjectLinkDraft, value: string) => {
    onChange(links.map((link, position) => position === index ? { ...link, [key]: value } : link))
  }

  // One link per category, so a category another row already uses is not offered.
  const taken = new Set(links.map(link => link.category))
  const optionsFor = (category: string) => Object.keys(projectLinkCategories)
    .concat(category && !(category in projectLinkCategories) ? [category] : [])
    .filter(option => option === category || !taken.has(option))
    .map(option => ({ value: option, label: categoryLabel(option) }))
  const nextCategory = Object.keys(projectLinkCategories).find(option => !taken.has(option))

  return (
    <div className="credential-links-editor">
      <div className="experience-projects-heading">
        <h3>Links <span>{links.length}</span></h3>
        <Button variant="outline" size="sm" disabled={!nextCategory} onClick={() => onChange([...links, { category: nextCategory ?? '', url: '' }])}><Plus aria-hidden="true" /> Add link</Button>
      </div>
      {links.map((link, index) => (
        <div className="credential-link" key={index}>
          <SelectField label="Category" required value={link.category} options={optionsFor(link.category)} placeholder="Select category" onChange={value => update(index, 'category', value)} />
          <TextField label="URL" required value={link.url} placeholder="https://" onChange={value => update(index, 'url', value)} />
          <IconButton label={`Remove ${link.category || 'link'} ${index + 1}`} title="Remove link" onClick={() => onChange(links.filter((_, position) => position !== index))}><Trash2 aria-hidden="true" /></IconButton>
        </div>
      ))}
    </div>
  )
}
