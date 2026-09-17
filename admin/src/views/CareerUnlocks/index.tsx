import { useMemo, useState } from 'react'
import { Pencil, Plus, Star } from 'lucide-react'
import { LocalNotice } from '@/components/admin/LocalNotice'
import { PageHeader } from '@/components/admin/PageHeader'
import { SearchField } from '@/components/admin/SearchField'
import { Button, IconButton } from '@/components/form'
import { VisibilityPane } from '@/components/admin/VisibilityPane'
import { careerUnlocks } from '@/data/content'

export function CareerUnlocksPage() {
  const [query, setQuery] = useState('')
  const [featured, setFeatured] = useState<Set<string>>(() => new Set(careerUnlocks.filter(item => item.featured).map(item => item.id)))
  const visibleItems = useMemo(() => careerUnlocks.filter(item => `${item.title} ${item.id} ${item.type}`.toLowerCase().includes(query.toLowerCase())), [query])

  const toggleFeatured = (id: string) => {
    setFeatured(current => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <>
      <PageHeader title="Career Unlocks" description={<>Edit entries mapped from <code>src/content/profile_info/gallery.yml</code>.</>} actions={<Button><Plus aria-hidden="true" /> New unlock</Button>} />
      <LocalNotice>Featured changes are interactive previews and are not written to YAML yet.</LocalNotice>
      <section className="content-list-panel">
        <div className="panel-toolbar"><SearchField value={query} onChange={setQuery} placeholder="Search title, ID, or type" label="Search career unlocks" /><span className="result-count">{visibleItems.length} shown</span></div>
        <div className="item-list">
          {visibleItems.map(item => (
            <article className="content-row" key={item.id}>
              <IconButton variant="bare" size="none" className={`feature-button ${featured.has(item.id) ? 'feature-button-active' : ''}`} label={`${featured.has(item.id) ? 'Unfeature' : 'Feature'} ${item.title}`} onClick={() => toggleFeatured(item.id)}><Star aria-hidden="true" /></IconButton>
              <div className="content-row-main"><strong>{item.title}</strong><code>{item.id}</code></div>
              <span className="type-badge">{item.type}</span><time>{item.date}</time>
              <IconButton variant="outline" title="Edit entry" label={`Edit ${item.title}`}><Pencil aria-hidden="true" /></IconButton>
            </article>
          ))}
        </div>
      </section>
      <div className="gallery-visibility"><VisibilityPane pageId="gallery" sectionId="career-unlocks" /></div>
    </>
  )
}
