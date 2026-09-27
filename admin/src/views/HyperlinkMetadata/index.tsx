import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { AlertTriangle, ExternalLink, Pencil, Plus, Save, Trash2, X } from 'lucide-react'
import { DataTable } from '@/components/admin/DataTable'
import { columnsFor, type DataTableColumns } from '@/lib/dataTable'
import { LocalNotice } from '@/components/admin/LocalNotice'
import { MetricGrid } from '@/components/admin/MetricGrid'
import { PageHeader } from '@/components/admin/PageHeader'
import { SearchField } from '@/components/admin/SearchField'
import { Button, IconButton, SelectField, TextField } from '@/components/form'
import { HYPERLINK_COLLECTIONS, hyperlinkEntries, hyperlinkGroupEntries, hyperlinkIndex, serializeHyperlinkEntry, type HyperlinkEntry, type HyperlinkGroup } from '@/lib/hyperlinkMetadata'
import { createEntry, deleteEntry, fetchCollection, saveEntry } from '@/services/content'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const groups = ['Institute', 'Person'] as const

function groupLabel(group: HyperlinkGroup): string {
  return group === 'Person' ? 'People' : 'Institutes'
}

// Aliases are listed with a semicolon rather than a comma because several of
// them contain commas of their own — "International Centre for Theoretical
// Sciences, Bangalore" is one alias, not two.
const ALIAS_SEPARATOR = '; '

/**
 * Both groups are sequences in one file, so a single read gives the revision
 * and the contents of both. Returns data rather than setting state, so the
 * effect that calls it stays a plain fetch.
 */
async function readHyperlinks(signal: AbortSignal): Promise<{ entries: HyperlinkEntry[]; baseSha: string }> {
  const [institutes, people] = await Promise.all([
    fetchCollection(HYPERLINK_COLLECTIONS.Institute, signal),
    fetchCollection(HYPERLINK_COLLECTIONS.Person, signal),
  ])
  return {
    entries: [...hyperlinkGroupEntries('Institute', institutes.entries), ...hyperlinkGroupEntries('Person', people.entries)],
    baseSha: institutes.baseSha,
  }
}

const column = columnsFor<HyperlinkEntry>()

const columnsFor_ = (urlLabel: string, onEdit: (entry: HyperlinkEntry) => void, onDelete: (entry: HyperlinkEntry) => void, canDelete: boolean): DataTableColumns<HyperlinkEntry> => [
  column.accessor('name', {
    header: 'Name',
    meta: { width: '30%' },
    cell: ({ row }) => (
      <div className="post-title-cell">
        <strong>{row.original.name || 'Unnamed entry'}</strong>
        {row.original.issues.length > 0 && <span className="hyperlink-issue"><AlertTriangle aria-hidden="true" /> {row.original.issues.join(' · ')}</span>}
      </div>
    ),
  }),
  column.accessor(entry => entry.aliases.join(ALIAS_SEPARATOR), {
    id: 'aliases',
    header: 'Aliases',
    meta: { width: '54%' },
    cell: ({ row }) => row.original.aliases.length
      ? <span className="hyperlink-aliases">{row.original.aliases.join(ALIAS_SEPARATOR)}</span>
      : <span className="credential-link-empty">-</span>,
  }),
  column.accessor('url', {
    header: urlLabel,
    meta: { width: '7%' },
    cell: ({ row }) => row.original.url
      ? <div className="credential-link-cell"><a href={row.original.url} target="_blank" rel="noopener noreferrer" title={row.original.url} aria-label={`Open ${row.original.name}`}><ExternalLink aria-hidden="true" /></a></div>
      : <span className="credential-link-empty">-</span>,
  }),
  column.display({
    id: 'actions',
    meta: { width: '9%' },
    header: () => <span className="sr-only">Edit</span>,
    cell: ({ row }) => (
      <div className="hyperlink-row-actions">
        <IconButton variant="outline" title="Edit link" label={`Edit ${row.original.name || 'entry'}`} onClick={() => onEdit(row.original)}><Pencil aria-hidden="true" /></IconButton>
        <IconButton variant="outline" title={canDelete ? 'Delete link' : 'This file cannot be saved yet'} label={`Delete ${row.original.name || 'entry'}`} disabled={!canDelete} onClick={() => onDelete(row.original)}><Trash2 aria-hidden="true" /></IconButton>
      </div>
    ),
  }),
]
const groupOptions = groups.map(group => ({ value: group, label: group }))

function EntryDialog({ entry, onClose, onSave, saving }: { entry: HyperlinkEntry; onClose: () => void; onSave: (entry: HyperlinkEntry) => void; saving: boolean }) {
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
        <footer><Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button><Button onClick={save} disabled={saving}><Save aria-hidden="true" /> {saving ? 'Committing...' : 'Save to V1'}</Button></footer>
      </section>
    </div>
  )
}

export function HyperlinkMetadataPage() {
  // Starts from the bundled copy so the table is populated immediately, then is
  // replaced by what the publishing branch actually holds.
  const [entries, setEntries] = useState(hyperlinkEntries)
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<HyperlinkEntry | null>(null)
  // The two groups are separate sequences in the file and never mix, so the
  // page shows one at a time rather than stacking both tables.
  const [group, setGroup] = useState<HyperlinkGroup>('Institute')
  const [saving, setSaving] = useState(false)
  const [baseSha, setBaseSha] = useState('')
  const [reason, setReason] = useState('Checking whether this file can be saved...')

  const apply = (state: { entries: HyperlinkEntry[]; baseSha: string }) => {
    setEntries(state.entries)
    setBaseSha(state.baseSha)
    setReason('')
  }

  useEffect(() => {
    const controller = new AbortController()
    readHyperlinks(controller.signal)
      .then(apply)
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return
        setBaseSha('')
        setReason(error instanceof Error ? error.message : 'This file cannot be saved yet.')
      })
    return () => controller.abort()
  }, [])

  /** Re-read after a write, and hand back the revision the next one must quote. */
  const reload = async () => {
    const state = await readHyperlinks(new AbortController().signal)
    apply(state)
    return state.baseSha
  }

  const brokenCount = entries.filter(entry => entry.issues.length).length
  const visibleEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return entries
    return entries.filter(entry => [entry.name, entry.url, ...entry.aliases].join(' ').toLowerCase().includes(normalizedQuery))
  }, [entries, query])

  const groupEntries = visibleEntries.filter(entry => entry.group === group)

  const persist = async (next: HyperlinkEntry) => {
    const existing = entries.find(entry => entry.id === next.id)
    if (!baseSha) {
      setEntries(current => existing ? current.map(entry => entry.id === next.id ? next : entry) : [next, ...current])
      setEditing(null)
      toast.info('Changed in this session only — GitHub is not connected.')
      return
    }
    setSaving(true)
    try {
      const collection = HYPERLINK_COLLECTIONS[next.group]
      const record = serializeHyperlinkEntry(next)
      if (!existing) {
        await createEntry(collection, record, baseSha)
      } else if (existing.group === next.group) {
        await saveEntry(collection, hyperlinkIndex(next), record, baseSha)
      } else {
        // The type changed, so the entry moves between two sequences in the same
        // file. Add it to the new group first: a failure then leaves a duplicate
        // to tidy rather than an entry that exists nowhere.
        await createEntry(collection, record, baseSha)
        const moved = await reload()
        await deleteEntry(HYPERLINK_COLLECTIONS[existing.group], hyperlinkIndex(existing), moved)
      }
      await reload()
      setEditing(null)
      toast.success(existing ? 'Link updated — waiting to publish.' : 'Link added — waiting to publish.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save that link.')
    } finally {
      setSaving(false)
    }
  }

  const removeEntry = async (entry: HyperlinkEntry) => {
    if (!baseSha) { toast.error('This file cannot be saved yet.'); return }
    if (!window.confirm(`Delete "${entry.name || 'this entry'}"? Anything in your content referencing it stops resolving.`)) return
    setSaving(true)
    try {
      await deleteEntry(HYPERLINK_COLLECTIONS[entry.group], hyperlinkIndex(entry), baseSha)
      await reload()
      toast.success('Link deleted — waiting to publish.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not delete that link.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Hyperlink Metadata"
        description={<>Names, aliases and URLs SmartLink resolves from <code>src/metadata/hyperlinkMetadata.yml</code>.</>}
        actions={<Button onClick={() => setEditing({ id: `local-${Date.now()}`, group, name: '', aliases: [], url: '', issues: [] })}><Plus aria-hidden="true" /> New link</Button>}
      />
      <MetricGrid metrics={[
        { label: 'Links', value: entries.length, detail: 'Names SmartLink can resolve' },
        { label: 'Institutes', value: entries.filter(entry => entry.group === 'Institute').length, detail: 'Website entries' },
        { label: 'People', value: entries.filter(entry => entry.group === 'Person').length, detail: 'Profile entries' },
        { label: 'Needs a look', value: brokenCount, detail: brokenCount ? 'Entry will not resolve' : 'All entries resolve', healthy: brokenCount === 0 },
      ]} />
      <LocalNotice>
        {baseSha
          ? <>Edits wait until you publish. SmartLink resolves names and aliases through this file, so a deleted entry stops resolving wherever the content uses it.</>
          : reason}
      </LocalNotice>

      <div className="hyperlink-search">
        <SearchField value={query} onChange={setQuery} placeholder="Search names, aliases, or URLs" label="Search hyperlink metadata" />
        <span className="result-count">{visibleEntries.length} of {entries.length} links</span>
      </div>

      {/* The count on each tab is what the current search matches there, so a
          search that hits the other group says so rather than looking empty. */}
      <Tabs value={group} onValueChange={value => setGroup(value as HyperlinkGroup)} className="hyperlink-tabs">
        <TabsList>
          {groups.map(item => (
            <TabsTrigger key={item} value={item}>
              {groupLabel(item)} <small>{visibleEntries.filter(entry => entry.group === item).length}</small>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <section className="posts-panel" aria-labelledby={`hyperlinks-${group}`}>
        <div className="panel-heading">
          <div><span>{groupLabel(group)}</span><h2 id={`hyperlinks-${group}`}>{group === 'Person' ? 'People and profiles' : 'Institutes and organisations'}</h2></div>
          <span>{groupEntries.length} of {entries.filter(entry => entry.group === group).length}</span>
        </div>
        <DataTable
          columns={columnsFor_(group === 'Person' ? 'Link' : 'Website', setEditing, entry => void removeEntry(entry), Boolean(baseSha) && !saving)}
          data={groupEntries}
          pageSize={25}
          labelledBy={`hyperlinks-${group}`}
          caption={`${groupLabel(group)} SmartLink can resolve`}
          emptyTitle={`No ${group === 'Person' ? 'people' : 'institutes'} match this search`}
          emptyDetail="Try different wording."
        />
      </section>
      {editing && <EntryDialog key={editing.id} entry={editing} saving={saving} onClose={() => setEditing(null)} onSave={entry => void persist(entry)} />}
    </>
  )
}
