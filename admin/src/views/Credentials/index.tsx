import { useMemo, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { DataTable } from '@/components/admin/DataTable'
import { columnsFor, type DataTableColumns } from '@/lib/dataTable'
import { LocalNotice } from '@/components/admin/LocalNotice'
import { MetricGrid } from '@/components/admin/MetricGrid'
import { PageHeader } from '@/components/admin/PageHeader'
import { SearchField } from '@/components/admin/SearchField'
import { Button } from '@/components/form'
import { getCredentialDashboardRows, type CredentialDashboardRow } from '../../../../src/utils/credentialDashboard.ts'

// The same rows the site's Credentials Dashboard renders, from the same
// collector, so the two cannot drift.
const rows = getCredentialDashboardRows()

// `source` is not a column but stays searchable, so a YAML file name finds its
// rows, as on the site.
const searchFields = ['page', 'section', 'item', 'detail', 'source'] as const

const scopes = [
  { id: 'all', label: 'All' },
  { id: 'linked', label: 'Linked' },
  { id: 'empty', label: 'Empty' },
] as const

const column = columnsFor<CredentialDashboardRow>()

const columns: DataTableColumns<CredentialDashboardRow> = [
  column.accessor('page', {
    header: 'Page - Section',
    meta: { width: '15%' },
    cell: ({ row }) => <div className="post-title-cell"><strong>{row.original.page}</strong><span>{row.original.section}</span></div>,
  }),
  column.accessor('item', { header: 'Credential', meta: { width: '24%' } }),
  column.accessor('detail', { header: 'Detail', meta: { width: '54%' } }),
  column.accessor('hasLink', {
    header: 'Links',
    meta: { width: '7%' },
    cell: ({ row }) => row.original.links.length
      ? (
        <div className="credential-link-cell">
          {row.original.links.map(link => (
            <a
              key={`${row.original.id}:${link.label}:${link.url}`}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              title={link.label}
              aria-label={`Open ${link.label} for ${row.original.item}`}
            >
              <ExternalLink aria-hidden="true" />
            </a>
          ))}
        </div>
      )
      : <span className="credential-link-empty">-</span>,
  }),
]

export function CredentialsPage() {
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState<typeof scopes[number]['id']>('all')

  const linkedCount = rows.filter(row => row.hasLink).length
  const visibleRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return rows.filter(row => {
      if (scope === 'linked' && !row.hasLink) return false
      if (scope === 'empty' && row.hasLink) return false
      if (!normalizedQuery) return true
      return searchFields.some(field => String(row[field] ?? '').toLowerCase().includes(normalizedQuery))
    })
  }, [query, scope])

  return (
    <>
      <PageHeader
        title="Credentials Dashboard"
        description="Credential entries discovered from the portfolio YAML content."
      />
      <MetricGrid metrics={[
        { label: 'Total', value: rows.length, detail: 'Credential slots found' },
        { label: 'Linked', value: linkedCount, detail: 'Have a document', healthy: linkedCount === rows.length },
        { label: 'Empty', value: rows.length - linkedCount, detail: 'Nothing attached yet' },
      ]} />
      <LocalNotice>Rows are read from the repository YAML, the same source the site's dashboard uses.</LocalNotice>

      <section className="posts-panel" aria-labelledby="credentials-heading">
        <div className="panel-toolbar">
          <SearchField value={query} onChange={setQuery} placeholder="Search credentials, pages, sections" label="Search credentials" />
          <div className="filter-actions">
            {scopes.map(item => (
              <Button key={item.id} variant={scope === item.id ? 'default' : 'outline'} size="sm" onClick={() => setScope(item.id)}>{item.label}</Button>
            ))}
          </div>
        </div>
        <DataTable
          columns={columns}
          data={visibleRows}
          pageSize={20}
          labelledBy="credentials-heading"
          caption="Credential entries found in the portfolio content"
          emptyTitle="No credential rows match the current filters"
          emptyDetail="Try a different search or scope."
        />
      </section>
    </>
  )
}
