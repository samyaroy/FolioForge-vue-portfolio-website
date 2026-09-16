import { Cloud, Database, Image, ShieldCheck } from 'lucide-react'
import { PageHeader } from '@/components/admin/PageHeader'

export function StoragePage() {
  return (
    <>
      <PageHeader title="Media Storage" description="Review the planned Cloudflare R2 object namespaces and connection state." />
      <div className="storage-grid">
        <article><Cloud aria-hidden="true" /><span><small>Bucket binding</small><strong>photo-dump</strong><p>Worker binding pending</p></span></article>
        <article><ShieldCheck aria-hidden="true" /><span><small>Draft objects</small><strong>Private by default</strong><p><code>drafts/&lt;owner&gt;/&lt;draft-id&gt;/</code></p></span></article>
        <article><Image aria-hidden="true" /><span><small>Published media</small><strong>Immutable outputs</strong><p><code>published/blog/</code> and <code>published/portfolio/</code></p></span></article>
        <article><Database aria-hidden="true" /><span><small>R2 Data Catalog</small><strong>Not required</strong><p>Iceberg analytics are outside this image workflow.</p></span></article>
      </div>
    </>
  )
}
