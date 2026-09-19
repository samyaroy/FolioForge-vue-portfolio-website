import { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { LocalNotice } from '@/components/admin/LocalNotice'
import { PageHeader } from '@/components/admin/PageHeader'
import { SearchField } from '@/components/admin/SearchField'
import { Button, IconButton } from '@/components/form'
import { VisibilityPane } from '@/components/admin/VisibilityPane'
import { EntryEditorDialog } from '@/components/editor/EntryEditorDialog'
import { findPortfolioPage } from '@/config/portfolio'
import type { EntryPresentation } from '@/lib/entryPresentation'
import type { PortfolioEntry } from '@/data/portfolioEntries'
import { createEntry, deleteEntry, fetchCollection, saveEntry } from '@/services/content'

const COLLECTION = 'gallery/career-unlocks'
const section = findPortfolioPage('gallery')?.sections[0]

function text(value: unknown): string {
  return value === undefined || value === null ? '' : String(value)
}

// How the shared editor derives a heading for an entry it is given.
const PRESENTATION: EntryPresentation = { titlePaths: ['title'], subtitlePaths: ['type', 'date'], fallbackTitle: 'Untitled unlock' }

/** Read the raw gallery items into the shape the shared editor expects. */
function toEntries(items: unknown[]): PortfolioEntry[] {
  return items.map((item, index) => {
    const raw = item && typeof item === 'object' ? item as Record<string, unknown> : {}
    return {
      // The position in the file is the identity: it is what a write addresses.
      id: `gallery-${index}`,
      title: text(raw.title) || text(raw.id) || 'Untitled unlock',
      subtitle: [text(raw.type), text(raw.date)].filter(Boolean).join(' · '),
      raw,
      presentation: PRESENTATION,
    }
  })
}

export function CareerUnlocksPage() {
  const [entries, setEntries] = useState<PortfolioEntry[]>([])
  const [query, setQuery] = useState('')
  const [editor, setEditor] = useState<{ mode: 'new' } | { mode: 'edit'; entry: PortfolioEntry } | null>(null)
  const [saving, setSaving] = useState(false)
  const [baseSha, setBaseSha] = useState('')
  const [reason, setReason] = useState('Loading gallery entries from the publishing branch...')

  useEffect(() => {
    const controller = new AbortController()
    fetchCollection(COLLECTION, controller.signal)
      .then(state => { setEntries(toEntries(state.entries)); setBaseSha(state.baseSha); setReason('') })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return
        setReason(error instanceof Error ? error.message : 'This collection cannot be saved yet.')
      })
    return () => controller.abort()
  }, [])

  const reload = async () => {
    const state = await fetchCollection(COLLECTION, new AbortController().signal)
    setEntries(toEntries(state.entries))
    setBaseSha(state.baseSha)
    return state.baseSha
  }

  const visibleItems = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return entries
    return entries.filter(entry => `${entry.title} ${entry.subtitle} ${text(entry.raw.id)}`.toLowerCase().includes(needle))
  }, [entries, query])

  const indexOf = (entry: PortfolioEntry) => entries.findIndex(item => item.id === entry.id)

  /** Every write goes through here so the manifest stays in step with the file. */
  const write = async (run: () => Promise<string>, success: string) => {
    if (!baseSha) { toast.error('This collection cannot be saved yet.'); return }
    setSaving(true)
    try {
      const commit = await run()
      await reload()
      setEditor(null)
      toast.success(`${success}${commit ? ` (${commit.slice(0, 7)})` : ''}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save that change.')
    } finally {
      setSaving(false)
    }
  }

  const toggleFeatured = (entry: PortfolioEntry) => {
    const featured = entry.raw.featured !== true
    void write(() => saveEntry(COLLECTION, indexOf(entry), { ...entry.raw, featured }, baseSha), featured ? 'Featured.' : 'No longer featured.')
  }

  const persist = (next: PortfolioEntry) => {
    const editing = editor?.mode === 'edit'
    void write(
      () => editing ? saveEntry(COLLECTION, indexOf(next), next.raw, baseSha) : createEntry(COLLECTION, next.raw, baseSha),
      editing ? 'Updated on V1.' : 'Added to V1.',
    )
  }

  const remove = (entry: PortfolioEntry) => {
    if (!window.confirm(`Delete "${entry.title}"? Its images stay in R2; only the entry is removed.`)) return
    void write(() => deleteEntry(COLLECTION, indexOf(entry), baseSha), 'Deleted.')
  }

  return (
    <>
      <PageHeader
        title="Career Unlocks"
        description={<>Entries in <code>src/content/profile_info/gallery.yml</code>.</>}
        actions={<Button disabled={!baseSha || saving} onClick={() => setEditor({ mode: 'new' })}><Plus aria-hidden="true" /> New unlock</Button>}
      />
      <LocalNotice>
        {baseSha
          ? <>Saving commits <code>gallery.yml</code> and the generated <code>galleryImageManifest.yml</code> together, so the two never disagree.</>
          : reason}
      </LocalNotice>
      <section className="content-list-panel">
        <div className="panel-toolbar">
          <SearchField value={query} onChange={setQuery} placeholder="Search title, ID, or type" label="Search career unlocks" />
          <span className="result-count">{visibleItems.length} of {entries.length} shown</span>
        </div>
        <div className="item-list">
          {visibleItems.map(entry => (
            <article className="content-row" key={entry.id}>
              <IconButton
                variant="bare"
                size="none"
                className={`feature-button ${entry.raw.featured === true ? 'feature-button-active' : ''}`}
                label={`${entry.raw.featured === true ? 'Unfeature' : 'Feature'} ${entry.title}`}
                disabled={!baseSha || saving}
                onClick={() => toggleFeatured(entry)}
              ><Star aria-hidden="true" /></IconButton>
              <div className="content-row-main"><strong>{entry.title}</strong><code>{text(entry.raw.id)}</code></div>
              <span className="type-badge">{text(entry.raw.type)}</span><time>{text(entry.raw.date)}</time>
              <IconButton variant="outline" title="Edit entry" label={`Edit ${entry.title}`} disabled={saving} onClick={() => setEditor({ mode: 'edit', entry })}><Pencil aria-hidden="true" /></IconButton>
              <IconButton variant="outline" title={baseSha ? 'Delete entry' : 'Not saveable yet'} label={`Delete ${entry.title}`} disabled={!baseSha || saving} onClick={() => remove(entry)}><Trash2 aria-hidden="true" /></IconButton>
            </article>
          ))}
          {!visibleItems.length && <div className="simple-empty">{baseSha ? 'No entries match that search.' : 'Nothing loaded yet.'}</div>}
        </div>
      </section>
      <div className="gallery-visibility"><VisibilityPane pageId="gallery" sectionId="career-unlocks" /></div>
      {editor && section && (
        <EntryEditorDialog
          key={editor.mode === 'edit' ? editor.entry.id : 'new'}
          entry={editor.mode === 'edit' ? editor.entry : undefined}
          fieldGroups={section.fields}
          requiredFields={section.requiredFields}
          entryFields={section.entryFields}
          onClose={() => setEditor(null)}
          onSave={persist}
          saving={saving}
        />
      )}
    </>
  )
}
