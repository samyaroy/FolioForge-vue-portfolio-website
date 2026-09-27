import { Plus, Trash2 } from 'lucide-react'
import { Button, IconButton, TextField } from '@/components/form'
import type { CredentialLinkDraft } from '@/lib/credentialLinks'

type CredentialLinksEditorProps = {
  links: CredentialLinkDraft[]
  onChange: (links: CredentialLinkDraft[]) => void
}

export function CredentialLinksEditor({ links, onChange }: CredentialLinksEditorProps) {
  const update = (index: number, key: keyof CredentialLinkDraft, value: string) => {
    onChange(links.map((link, position) => position === index ? { ...link, [key]: value } : link))
  }

  return (
    <div className="credential-links-editor">
      <div className="experience-projects-heading">
        <h3>Credentials <span>{links.length}</span></h3>
        <Button variant="outline" size="sm" onClick={() => onChange([...links, { label: '', url: '' }])}><Plus aria-hidden="true" /> Add credential</Button>
      </div>
      {links.map((link, index) => (
        <div className="credential-link" key={index}>
          <TextField label="Label" required={links.length > 1} value={link.label} placeholder="Offer letter" onChange={value => update(index, 'label', value)} />
          <TextField label="Drive file ID / URL" required value={link.url} onChange={value => update(index, 'url', value)} />
          <IconButton label={`Remove credential ${index + 1}`} title="Remove credential" onClick={() => onChange(links.filter((_, position) => position !== index))}><Trash2 aria-hidden="true" /></IconButton>
        </div>
      ))}
    </div>
  )
}
