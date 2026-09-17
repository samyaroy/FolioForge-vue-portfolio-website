import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { AlertTriangle, ExternalLink, Pencil, Plus, Save, Trash2, X } from 'lucide-react'
import { LocalNotice } from '@/components/admin/LocalNotice'
import { MetricGrid } from '@/components/admin/MetricGrid'
import { PageHeader } from '@/components/admin/PageHeader'
import { SearchField } from '@/components/admin/SearchField'
import { Button, IconButton, SelectField, TextField } from '@/components/form'
import { hyperlinkEntries, type HyperlinkEntry, type HyperlinkGroup } from '@/lib/hyperlinkMetadata'

const groups = ['Institute', 'Person'] as const
const groupOptions = groups.map(group => ({ value: group, label: group }))

function EntryDialog({ entry, onClose, onSave }: { entry: HyperlinkEntry; onClose: () => void; onSave: (entry: HyperlinkEntry) => void }) {
  const [draft, setDraft] = useState(entry)
  const update = (patch: Partial<HyperlinkEntry>) => setDraft(current => ({ ...current, ...patch }))

  const save = () => {
    if (!draft.name.trim()) {
      toast.error('Enter a name before saving.')
      return
    }
    if (!draft.url.trim()) {
      toast.error('Enter a link before saving.')
      return
    }
    onSave({ ...draft, aliases: draft.aliases.map(alias => alias.trim()).filter(Boolean), issues: [] })
  }

  return (
    <div className="entry-dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="entry-dialog" role="dialog" aria-modal="true" aria-label={`Edit ${draft.name || 'link'}`} onMouseDown={event => event.stopPropagation()}>
        <header>
          <div><span>Hyperlink</span><h2>{draft.name || 'New link'}</h2></div>
          <IconButton variant="bare" size="none" label="Close editor" onClick={onClose}><X aria-hidden="true" /></IconButton>
        </header>
        <div className="entry-dialog-body">
          <SelectField label="Type" required value={draft.group} options={groupOptions} onChange={value => update({ group: value as HyperlinkGroup })} />
          <TextField label="Name" required value={draft.name} onChange={name => update({ name })} placeholder="Indian Statistical Institute" />
          <TextField label={draft.group === 'Person' ? 'Link' : 'Website'} required fieldClassName="field-wide" value={draft.url} onChange={url => update({ url })} placeholder="https://" />
          <div className="list-fields-editor" style={{ '--list-columns': 1 } as React.CSSProperties}>
            <div className="faculty-editor-heading">
              <span>Aliases <small>{draft.aliases.length}</small></span>
              <Button variant="outline" size="sm" onClick={() => update({ aliases: [...draft.aliases, ''] })}><Plus aria-hidden="true" /> Add alias</Button>
            </div>
            {draft.aliases.map((alias, index) => (
              <div className="list-fields-row" key={index}>
                <TextField
                  aria-label={`Alias ${index + 1}`}
                  value={alias}
                  placeholder="Any wording used in the content"
                  onChange={value => update({ aliases: draft.aliases.map((item, position) => position === index ? value : item) })}
                />
                <IconButton label={`Remove alias ${index + 1}`} title="Remove alias" onClick={() => update({ aliases: draft.aliases.filter((_, position) => position !== index) })}><Trash2 aria-hidden="true" /></IconButton>
              </div>
            ))}
          </div>
        </div>
        <footer><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save}><Save aria-hidden="true" /> Save local change</Button></footer>
      </section>
    </div>
  )
}

export function HyperlinkMetadataPage() {
  const [entries, setEntries] = useState(hyperlinkEntries)
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState<HyperlinkGroup | 'All'>('All')
  const [editing, setEditing] = useState<HyperlinkEntry | null>(null)

  const brokenCount = entries.filter(entry => entry.issues.length).length
  const visibleEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return entries.filter(entry => {
      if (group !== 'All' && entry.group !== group) return false
      if (!normalizedQuery) return true
      return [entry.name, entry.url, ...entry.aliases].join(' ').toLowerCase().includes(normalizedQuery)
    })
  }, [entries, query, group])

  const saveEntry = (next: HyperlinkEntry) => {
    setEntries(current => current.some(entry => entry.id === next.id)
      ? current.map(entry => entry.id === next.id ? next : entry)
      : [next, ...current])
    setEditing(null)
    toast.success('Link updated locally.')
  }

  return (
    <>
      <PageHeader
        title="Hyperlink Metadata"
        description={<>Names, aliases and URLs SmartLink resolves from <code>src/metadata/hyperlinkMetadata.yml</code>.</>}
        actions={<Button onClick={() => setEditing({ id: `local-${Date.now()}`, group: 'Institute', name: '', aliases: [], url: '', issues: [] })}><Plus aria-hidden="true" /> New link</Button>}
      />
      <MetricGrid metrics={[
        { label: 'Links', value: entries.length, detail: 'Names SmartLink can resolve' },
        { label: 'Institutes', value: entries.filter(entry => entry.group === 'Institute').length, detail: 'Website entries' },
        { label: 'People', value: entries.filter(entry => entry.group === 'Person').length, detail: 'Profile entries' },
        { label: 'Needs a look', value: brokenCount, detail: brokenCount ? 'Entry will not resolve' : 'All entries resolve', healthy: brokenCount === 0 },
      ]} />
      <LocalNotice>Edits stay in this session until the collection adapter can write YAML.</LocalNotice>

      <section className="posts-panel" aria-labelledby="hyperlinks-heading">
        <div className="panel-toolbar">
          <SearchField value={query} onChange={setQuery} placeholder="Search names, aliases, or URLs" label="Search hyperlink metadata" />
          <div className="filter-actions">
            {(['All', ...groups] as const).map(option => (
              <Button key={option} variant={group === option ? 'default' : 'outline'} size="sm" onClick={() => setGroup(option)}>{option}</Button>
            ))}
          </div>
        </div>
        <div className="table-wrap">
          <table className="credentials-table">
            <thead><tr>
              <th id="hyperlinks-heading">Name</th><th>Type</th><th>Aliases</th><th>Link</th><th><span className="sr-only">Edit</span></th>
            </tr></thead>
            <tbody>
              {visibleEntries.map(entry => (
                <tr key={entry.id}>
                  <td>
                    <div className="post-title-cell">
                      <strong>{entry.name || 'Unnamed entry'}</strong>
                      {entry.issues.length > 0 && <span className="hyperlink-issue"><AlertTriangle aria-hidden="true" /> {entry.issues.join(' · ')}</span>}
                    </div>
                  </td>
                  <td><span className="status-badge">{entry.group}</span></td>
                  <td>{entry.aliases.length ? <span className="hyperlink-aliases">{entry.aliases.join(', ')}</span> : <span className="credential-link-empty">-</span>}</td>
                  <td>
                    {entry.url
                      ? <div className="credential-link-cell"><a href={entry.url} target="_blank" rel="noopener noreferrer" title={entry.url} aria-label={`Open ${entry.name}`}><ExternalLink aria-hidden="true" /></a></div>
                      : <span className="credential-link-empty">-</span>}
                  </td>
                  <td><IconButton variant="outline" title="Edit link" label={`Edit ${entry.name || 'entry'}`} onClick={() => setEditing(entry)}><Pencil aria-hidden="true" /></IconButton></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visibleEntries.length && <div className="empty-state"><strong>No links match the current filters</strong><span>Try a different search or type.</span></div>}
        </div>
        <footer className="table-footer"><span>Showing {visibleEntries.length} of {entries.length} links</span><span>{brokenCount ? `${brokenCount} need a look` : 'All entries resolve'}</span></footer>
      </section>
      {editing && <EntryDialog key={editing.id} entry={editing} onClose={() => setEditing(null)} onSave={saveEntry} />}
    </>
  )
}
