import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
          <label className="field"><span>Label{links.length > 1 ? '' : ' (optional)'}</span><input value={link.label} placeholder="Offer letter" onChange={event => update(index, 'label', event.target.value)} /></label>
          <label className="field"><span>Drive file ID / URL</span><input value={link.url} onChange={event => update(index, 'url', event.target.value)} /></label>
          <Button variant="ghost" size="icon-sm" title="Remove credential" aria-label={`Remove credential ${index + 1}`} onClick={() => onChange(links.filter((_, position) => position !== index))}><Trash2 aria-hidden="true" /></Button>
        </div>
      ))}
    </div>
  )
}
