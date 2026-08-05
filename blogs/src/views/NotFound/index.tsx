import { Link } from 'react-router-dom'
import { usePageTitle } from '../../lib/usePageTitle'

export function NotFoundPage() {
  usePageTitle('Page not found')

  return (
    <section className="mx-auto max-w-xl py-16 text-center">
      <h1 className="text-[4rem] font-black tracking-[-0.033em] text-ink">404</h1>
      <p className="text-muted">
        That post doesn&apos;t exist (or hasn&apos;t been published yet).
      </p>
      <Link to="/">Back to all posts</Link>
    </section>
  )
}
