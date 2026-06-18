import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="not-found">
      <h1>404</h1>
      <p>That post doesn&apos;t exist (or hasn&apos;t been published yet).</p>
      <Link to="/">← Back to all posts</Link>
    </section>
  )
}
