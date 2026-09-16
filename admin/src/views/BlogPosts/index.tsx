import { useMemo, useState } from 'react'
import { ArrowUpRight, ChevronDown, Plus, SlidersHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ConnectionBanner } from '@/components/admin/ConnectionBanner'
import { MetricGrid } from '@/components/admin/MetricGrid'
import { PageHeader } from '@/components/admin/PageHeader'
import { SearchField } from '@/components/admin/SearchField'
import { Button } from '@/components/ui/button'
import { posts } from '@/data/content'

export function BlogPostsPage() {
  const [query, setQuery] = useState('')
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return posts
    return posts.filter(post => [post.title, post.description, post.file].join(' ').toLowerCase().includes(normalizedQuery))
  }, [query])

  const allVisibleSelected = filteredPosts.length > 0 && filteredPosts.every(post => selectedPosts.includes(post.file))

  const togglePost = (file: string) => {
    setSelectedPosts(current => current.includes(file) ? current.filter(item => item !== file) : [...current, file])
  }

  const toggleAll = () => {
    if (allVisibleSelected) {
      setSelectedPosts(current => current.filter(file => !filteredPosts.some(post => post.file === file)))
      return
    }
    setSelectedPosts(current => [...new Set([...current, ...filteredPosts.map(post => post.file)])])
  }

  return (
    <>
      <PageHeader
        title="Blog Posts"
        description={<>Manage Markdown entries in <code>blogs/src/content/posts/</code>.</>}
        actions={<Button asChild><Link to="/blog/posts/new"><Plus aria-hidden="true" /> New post</Link></Button>}
      />
      <MetricGrid metrics={[
        { label: 'Total posts', value: posts.length, detail: `${posts.length} tracked files` },
        { label: 'Published', value: posts.length, detail: 'Production content', healthy: true },
        { label: 'Drafts', value: 0, detail: 'Nothing pending' },
        { label: 'Media assets', value: '--', detail: 'R2 not connected' },
      ]} />

      <section className="posts-panel" aria-labelledby="posts-heading">
        <div className="panel-toolbar">
          <SearchField value={query} onChange={setQuery} placeholder="Search title, tag, or filename" label="Search posts" />
          <div className="filter-actions">
            <Button variant="outline" size="sm"><SlidersHorizontal aria-hidden="true" /> Status: All <ChevronDown aria-hidden="true" /></Button>
            <Button variant="outline" size="sm">Updated <ChevronDown aria-hidden="true" /></Button>
          </div>
        </div>
        <div className="quick-filters">
          <span>Quick filters</span>
          <button className="quick-filter-active" type="button">All posts</button>
          <button type="button">Published</button>
          <button type="button">Drafts</button>
          <button type="button">With cover</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr>
              <th className="checkbox-cell"><input type="checkbox" aria-label="Select all visible posts" checked={allVisibleSelected} onChange={toggleAll} /></th>
              <th id="posts-heading">Post title & excerpt</th><th>File</th><th>Status</th><th>Updated</th><th><span className="sr-only">Open</span></th>
            </tr></thead>
            <tbody>
              {filteredPosts.map(post => (
                <tr key={post.file}>
                  <td className="checkbox-cell"><input type="checkbox" aria-label={`Select ${post.title}`} checked={selectedPosts.includes(post.file)} onChange={() => togglePost(post.file)} /></td>
                  <td><div className="post-title-cell"><strong>{post.title}</strong><span>{post.description}</span><div className="mobile-post-meta"><span className="status-badge">{post.status}</span><span>{post.date}</span></div></div></td>
                  <td><code className="file-name">{post.file}</code></td>
                  <td><span className="status-badge"><span className="status-dot" />{post.status}</span></td>
                  <td className="date-cell">{post.date}</td>
                  <td><Link className="row-action" to={`/blog/posts/new?source=${post.file}`} aria-label={`Open ${post.title}`}><ArrowUpRight aria-hidden="true" /></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filteredPosts.length && <div className="empty-state"><strong>No matching posts</strong><span>Try a different title or filename.</span></div>}
        </div>
        <footer className="table-footer"><span>Showing {filteredPosts.length} of {posts.length} posts</span><span>{selectedPosts.length ? `${selectedPosts.length} selected` : 'Repository is the source of truth'}</span></footer>
      </section>
      <ConnectionBanner />
    </>
  )
}
