import { ArrowUpRight, CheckCircle2, Layers3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MetricGrid } from '@/components/admin/MetricGrid'
import { PageHeader } from '@/components/admin/PageHeader'
import { portfolioAdminPath, portfolioPages } from '@/config/portfolio'

const sectionCount = portfolioPages.reduce((total, page) => total + page.sections.length, 0)

export function PortfolioOverviewPage() {
  return (
    <>
      <PageHeader title="Portfolio Overview" description="Manage content using the same page and subsection hierarchy as the Vue portfolio." />
      <MetricGrid metrics={[
        { label: 'Portfolio pages', value: portfolioPages.length, detail: 'Public routes mapped', healthy: true },
        { label: 'Page sections', value: sectionCount, detail: 'Tabs and sections mapped' },
        { label: 'Content sources', value: 24, detail: 'YAML files inventoried' },
        { label: 'Pending changes', value: 0, detail: 'Local session is clean' },
      ]} />
      <section className="collection-section">
        <div className="section-heading"><div><span>Page registry</span><h2>Portfolio pages</h2></div><span>{portfolioPages.length} routes mapped</span></div>
        <div className="page-registry-list">
          {portfolioPages.map(page => {
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
                  <span><Layers3 aria-hidden="true" />{page.sections.length}</span>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </>
  )
}
