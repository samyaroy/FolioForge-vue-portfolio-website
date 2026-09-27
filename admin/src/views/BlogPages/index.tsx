import { useMemo, useState } from 'react'
import { FilePenLine } from 'lucide-react'
import { PageHeader } from '@/components/admin/PageHeader'
import { SearchField } from '@/components/admin/SearchField'
import { Button } from '@/components/form'
import { blogPages } from '@/data/content'

export function BlogPagesPage() {
  const [query, setQuery] = useState('')
  const visiblePages = useMemo(() => blogPages.filter(page => `${page.title} ${page.source} ${page.description}`.toLowerCase().includes(query.toLowerCase())), [query])

  return (
    <>
      <PageHeader title="Blog Pages" description="Edit the structured copy used outside individual Markdown posts." />
      <section className="content-list-panel">
        <div className="panel-toolbar"><SearchField value={query} onChange={setQuery} placeholder="Search page settings" /><span className="result-count">{visiblePages.length} sources</span></div>
        <div className="settings-card-grid">
          {visiblePages.map(page => <article className="settings-card" key={page.source}><span className="collection-icon"><FilePenLine aria-hidden="true" /></span><div><h2>{page.title}</h2><code>{page.source}</code><p>{page.description}</p></div><Button variant="outline" size="sm">Open editor</Button></article>)}
        </div>
      </section>
    </>
  )
}
