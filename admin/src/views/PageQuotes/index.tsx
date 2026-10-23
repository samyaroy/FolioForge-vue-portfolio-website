import { useEffect, useMemo, useRef, useState } from 'react'
import { Pencil, Plus, Save, Trash2, X } from 'lucide-react'
import { toast } from 'react-toastify'
import { DataTable } from '@/components/admin/DataTable'
import { SaveStatusHint } from '@/components/admin/InfoHint'
import { PageHeader } from '@/components/admin/PageHeader'
import { ExpandableSearchField } from '@/components/admin/SearchField'
import { Button, IconButton, SelectField, SwitchField, TextareaField, TextField } from '@/components/form'
import { getPortfolioEntries } from '@/data/portfolioEntries'
import { columnsFor, type DataTableColumns } from '@/lib/dataTable'
import { createEntry, deleteEntry, fetchCollection, saveEntry } from '@/services/content'
import { pageQuoteGroups, type PageQuoteGroup } from '../../../../src/config/pageQuotes.ts'
import { isEntryEnabled } from '../../../../src/config/entryStatus.ts'

type Quote = {
  id: string
  page: PageQuoteGroup
  index: number
  raw: Record<string, unknown>
}

const column = columnsFor<Quote>()
const pageLabel = (page: PageQuoteGroup) => page === 'default' ? 'Default' : pageQuoteGroups.find(group => group.id === page)?.label ?? page
const pageOptions = pageQuoteGroups.map(group => ({ value: group.id, label: pageLabel(group.id) }))
const text = (value: unknown) => typeof value === 'string' ? value : ''
const collection = (page: PageQuoteGroup) => `quotes/${page}`

function quotesFor(page: PageQuoteGroup, values: unknown[]): Quote[] {
  return values.map((value, index) => ({ id: `${page}-${index}`, page, index, raw: value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {} }))
}

async function readQuotes(signal: AbortSignal) {
  const states = await Promise.all(pageQuoteGroups.map(group => fetchCollection(collection(group.id), signal)))
  const baseSha = states[0].baseSha
  if (states.some(state => state.baseSha !== baseSha)) throw new Error('Quotes changed while loading. Reload to read the current version.')
  return { entries: states.flatMap((state, index) => quotesFor(pageQuoteGroups[index].id, state.entries)), baseSha }
}

function QuoteDialog({ entry, saving, onClose, onSave }: { entry?: Quote; saving: boolean; onClose: () => void; onSave: (page: PageQuoteGroup, raw: Record<string, unknown>) => void }) {
  const [page, setPage] = useState<PageQuoteGroup>(entry?.page ?? 'default')
  const [quote, setQuote] = useState(text(entry?.raw.text))
  const [author, setAuthor] = useState(text(entry?.raw.author))
  const [source, setSource] = useState(text(entry?.raw.source))
  const save = () => {
    if (!quote.trim()) { toast.error('Enter quote text before saving.'); return }
    onSave(page, { ...entry?.raw, text: quote, author, source })
  }
  return (
    <div className="entry-dialog-backdrop" role="presentation" onMouseDown={() => { if (!saving) onClose() }}>
      <section className="entry-dialog" role="dialog" aria-modal="true" aria-label={entry ? `Edit ${pageLabel(entry.page)} quote` : 'New quote'} onMouseDown={event => event.stopPropagation()}>
        <header>
          <div><span>Page Quotes</span><h2>{entry ? `Edit ${pageLabel(entry.page)} quote` : 'New quote'}</h2></div>
          <IconButton variant="bare" size="none" label="Close editor" disabled={saving} onClick={onClose}><X aria-hidden="true" /></IconButton>
        </header>
        <div className="entry-dialog-body">
          <SelectField label="Page" required value={page} options={pageOptions} disabled={Boolean(entry) || saving} onChange={value => setPage(value as PageQuoteGroup)} />
          <TextField label="Author" value={author} onChange={setAuthor} disabled={saving} />
          <TextareaField label="Quote text" required fieldClassName="field-wide" value={quote} onChange={setQuote} disabled={saving} rows={5} />
          <TextField label="Source" fieldClassName="field-wide" value={source} onChange={setSource} disabled={saving} />
        </div>
        <footer><Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button><Button onClick={save} disabled={saving}><Save aria-hidden="true" /> {saving ? 'Saving...' : 'Save'}</Button></footer>
      </section>
    </div>
  )
}

export function PageQuotesPage() {
  const [entries, setEntries] = useState(() => pageQuoteGroups.flatMap(group => quotesFor(group.id, getPortfolioEntries('quotes', group.id).map(entry => entry.raw))))
  const [query, setQuery] = useState('')
  const [editor, setEditor] = useState<{ entry?: Quote } | null>(null)
  const [baseSha, setBaseSha] = useState('')
  const [failure, setFailure] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const writing = useRef(false)

  useEffect(() => {
    const controller = new AbortController()
    readQuotes(controller.signal)
      .then(state => { setEntries(state.entries); setBaseSha(state.baseSha); setFailure('') })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setFailure(error instanceof Error ? error.message : 'Could not read page quotes.')
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [])

  const visibleEntries = useMemo(() => entries.filter(entry => [pageLabel(entry.page), text(entry.raw.text), text(entry.raw.author), text(entry.raw.source)].join(' ').toLowerCase().includes(query.trim().toLowerCase())), [entries, query])

  const change = async (action: 'create' | 'update' | 'delete', page: PageQuoteGroup, raw: Record<string, unknown>, entry?: Quote) => {
    if (writing.current || loading) return
    writing.current = true
    setSaving(true)
    try {
      if (!baseSha) {
        if (action === 'delete') throw new Error('This collection cannot be saved yet.')
        setEntries(current => action === 'update'
          ? current.map(item => item.id === entry?.id ? { ...item, raw } : item)
          : [...current, { id: `local-${Date.now()}`, page, index: current.filter(item => item.page === page).length, raw }])
        setEditor(null)
        toast.info('Saved in this session only. GitHub is not connected.')
        return
      }
      const pending = action === 'create'
        ? await createEntry(collection(page), raw, baseSha)
        : action === 'delete'
          ? await deleteEntry(collection(page), entry!.index, baseSha)
          : await saveEntry(collection(page), entry!.index, raw, baseSha)
      setEntries(current => action === 'create'
        ? [...current, { id: `local-${Date.now()}`, page, index: current.filter(item => item.page === page).length, raw }]
        : action === 'delete' ? current.filter(item => item.id !== entry?.id) : current.map(item => item.id === entry?.id ? { ...item, raw } : item))
      setEditor(null)
      // Deletion changes indices within a page, so read them again before another write.
      try {
        const state = await readQuotes(new AbortController().signal)
        setEntries(state.entries)
        setBaseSha(state.baseSha)
        setFailure('')
      } catch {
        setBaseSha('')
        setFailure('Saved, but quotes could not be refreshed. Reload before making another change.')
      }
      toast.success(`Saved. ${pending} file${pending === 1 ? '' : 's'} waiting to publish.`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save this quote.')
    } finally {
      writing.current = false
      setSaving(false)
    }
  }

  const disabled = loading || saving
  const columns: DataTableColumns<Quote> = [
    column.accessor(entry => pageLabel(entry.page), { id: 'page', header: 'Page', meta: { width: '18%' } }),
    column.accessor(entry => text(entry.raw.text), { id: 'quote', header: 'Quote', cell: ({ getValue }) => <span className="page-quote-text">{getValue()}</span> }),
    column.accessor(entry => text(entry.raw.author), { id: 'author', header: 'Author', meta: { width: '16%' } }),
    column.accessor(entry => text(entry.raw.source), { id: 'source', header: 'Source', meta: { width: '14%' }, cell: ({ getValue }) => getValue() || '-' }),
    column.display({ id: 'enabled', header: 'Enabled', meta: { width: '76px' }, cell: ({ row }) => <SwitchField aria-label={`Enable ${pageLabel(row.original.page)} quote ${row.original.index + 1}`} checked={isEntryEnabled(row.original.raw)} disabled={disabled} onChange={enabled => void change('update', row.original.page, { ...row.original.raw, enabled }, row.original)} /> }),
    column.display({ id: 'actions', header: () => <span className="sr-only">Actions</span>, meta: { width: '88px' }, cell: ({ row }) => <div className="hyperlink-row-actions"><IconButton variant="outline" label={`Edit ${pageLabel(row.original.page)} quote ${row.original.index + 1}`} disabled={disabled} onClick={() => setEditor({ entry: row.original })}><Pencil aria-hidden="true" /></IconButton><IconButton variant="outline" label={`Delete ${pageLabel(row.original.page)} quote ${row.original.index + 1}`} disabled={disabled || !baseSha} onClick={() => { if (window.confirm(`Delete this ${pageLabel(row.original.page)} quote?`)) void change('delete', row.original.page, row.original.raw, row.original) }}><Trash2 aria-hidden="true" /></IconButton></div> }),
  ]

  return (
    <>
      <PageHeader title="Page Quotes" description="Portfolio quotes" status={<SaveStatusHint saveable={Boolean(baseSha)} failure={failure}>Changes wait here until you publish.</SaveStatusHint>} />
      <section className="form-panel collection-panel page-quotes-panel" aria-labelledby="page-quotes-heading">
        <div className="panel-heading">
          <div><span>Collection</span><h2 id="page-quotes-heading">Quotes <small>{visibleEntries.length}/{entries.length}</small></h2></div>
          <div className="panel-heading-actions">
            <ExpandableSearchField value={query} onChange={setQuery} placeholder="Search quotes, pages or authors" label="Search page quotes" />
            <Button className="section-action-button" size="sm" disabled={disabled} onClick={() => setEditor({})}><Plus aria-hidden="true" /> New quote</Button>
          </div>
        </div>
        <DataTable key={query} columns={columns} data={visibleEntries} pageSize={0} caption="All page quotes, including the default quote" rowClassName={entry => isEntryEnabled(entry.raw) ? undefined : 'entry-disabled'} emptyTitle={query ? 'No matching quotes' : 'No quotes yet'} emptyDetail={query ? 'Try a different search.' : ''} />
      </section>
      {editor && <QuoteDialog entry={editor.entry} saving={saving} onClose={() => setEditor(null)} onSave={(page, raw) => void change(editor.entry ? 'update' : 'create', page, raw, editor.entry)} />}
    </>
  )
}
