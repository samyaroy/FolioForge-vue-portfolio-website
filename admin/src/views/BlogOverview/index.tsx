import { ArrowUpRight, BookOpenText, CheckCircle2, Files, GalleryHorizontalEnd, Layers3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MetricGrid } from '@/components/admin/MetricGrid'
import { PageHeader } from '@/components/admin/PageHeader'
import { Button } from '@/components/form'
import { blogPages, portfolioAdminPath } from '@/config/portfolio'
import { publishingTarget } from '@/config/publishing'
import { blogPages as blogCopySources, posts } from '@/data/content'
import { getPortfolioEntries } from '@/data/portfolioEntries'

// Counted from the registry the editors themselves read, so the overview can
// never claim more rows than a collection actually holds.
const entryCounts = new Map(blogPages.map(page => [
  page.id,
  page.sections.reduce((total, section) => total + getPortfolioEntries(page.id, section.id).length, 0),
]))
const totalEntries = [...entryCounts.values()].reduce((total, count) => total + count, 0)

// The blog's three destinations that are not one of the collection pages above.
const destinations = [
  { label: 'Blog Posts', path: '/blog/posts', icon: BookOpenText, source: 'blogs/src/content/posts/', description: `${posts.length} Markdown files to write and edit.` },
  { label: 'Blog Gallery', path: '/blog/gallery', icon: GalleryHorizontalEnd, source: 'blogs/src/content/gallery/data.yml', description: 'Image records for the gallery collection.' },
  { label: 'Blog Pages', path: '/blog/pages', icon: Files, source: 'blogs/src/content/', description: `${blogCopySources.length} sources of shared copy: identity, navigation, descriptions and section text.` },
]

export function BlogOverviewPage() {
  return (
    <>
      <PageHeader
        title="Blog Overview"
        description={<>Markdown posts and structured collections published at <code>{publishingTarget.blogOrigin.replace('https://', '')}</code></>}
      />
      <MetricGrid metrics={[
        { label: 'Collection pages', value: blogPages.length, detail: 'Public routes mapped', healthy: true },
        { label: 'Markdown posts', value: posts.length, detail: 'Files ready to edit' },
        { label: 'Collection entries', value: totalEntries, detail: 'Rows across all collections' },
        { label: 'Shared copy', value: blogCopySources.length, detail: 'Page settings sources' },
      ]} />

      <section className="collection-section">
        <div className="section-heading"><div><span>Page registry</span><h2>Blog pages</h2></div><span>{blogPages.length} routes mapped</span></div>
        <div className="page-registry-list">
          {blogPages.map(page => {
            const Icon = page.icon
            return (
              <article className="page-registry-row" key={page.id}>
                <Link className="page-registry-heading" to={portfolioAdminPath(page)}>
                  <span className="collection-icon"><Icon aria-hidden="true" /></span>
                  <span><strong>{page.title}</strong><small>{page.publicPath}</small></span>
                  <span className="collection-meta"><CheckCircle2 aria-hidden="true" />Mapped</span>
                  <ArrowUpRight aria-hidden="true" />
                </Link>
                <div className="page-section-links">
                  {page.sections.map(section => <Link key={section.id} to={portfolioAdminPath(page, section)}>{section.title}</Link>)}
                  <span title={`${entryCounts.get(page.id)} entries`}><Layers3 aria-hidden="true" />{entryCounts.get(page.id)}</span>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="collection-section">
        <div className="section-heading"><div><span>Writing</span><h2>Posts and shared copy</h2></div></div>
        <div className="settings-card-grid three-up">
          {destinations.map(destination => {
            const Icon = destination.icon
            return (
              <article className="settings-card" key={destination.path}>
                <span className="collection-icon"><Icon aria-hidden="true" /></span>
                <div><h2>{destination.label}</h2><code>{destination.source}</code><p>{destination.description}</p></div>
                <Button asChild variant="outline" size="sm"><Link to={destination.path}>Open</Link></Button>
              </article>
            )
          })}
        </div>
      </section>
    </>
  )
}
